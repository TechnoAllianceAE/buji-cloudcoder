package tools

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/types"
)

// AgentExecutor is the function signature for spawning a sub-agent.
// It is injected by the engine at startup to avoid import cycles.
// It runs a full query loop with its own message history and returns the final text.
type AgentExecutor func(ctx context.Context, prompt, model, cwd string, onText func(string)) (string, types.Usage, error)

// globalAgentExecutor is set by the engine during initialization
var (
	globalAgentExecutor AgentExecutor
	agentExecutorMu     sync.RWMutex
)

// SetAgentExecutor injects the sub-agent spawning function from the engine
func SetAgentExecutor(fn AgentExecutor) {
	agentExecutorMu.Lock()
	defer agentExecutorMu.Unlock()
	globalAgentExecutor = fn
}

// AgentResult holds the outcome of a sub-agent run
type AgentResult struct {
	ID       string
	Status   string // "running", "completed", "failed"
	Output   string
	Usage    types.Usage
	Duration time.Duration
}

// agentResults stores background agent results
var (
	agentResults   = make(map[string]*AgentResult)
	agentResultsMu sync.RWMutex
	agentNextID    int
)

// AgentTool spawns sub-agents with their own QueryEngine goroutine
type AgentTool struct{}

func NewAgentTool() *AgentTool { return &AgentTool{} }
func (t *AgentTool) Name() string { return "Agent" }

func (t *AgentTool) Description() string {
	return `Launch a sub-agent to handle complex, multi-step tasks autonomously.

Each agent gets its own conversation context, message history, and tool access.
The agent runs a full query loop independently and returns its result.

Use agents for:
- Complex research requiring multiple file reads/searches
- Independent work that can run in parallel
- Tasks that need isolation from the main conversation

Set run_in_background=true to run asynchronously (returns immediately with an ID).

Always include a short description (3-5 words) summarizing the task.`
}

func (t *AgentTool) InputSchema() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"description": map[string]any{
				"type":        "string",
				"description": "Short (3-5 word) description of the task",
			},
			"prompt": map[string]any{
				"type":        "string",
				"description": "Full task prompt for the agent",
			},
			"subagent_type": map[string]any{
				"type":        "string",
				"description": "Type of agent: general-purpose, Explore, Plan",
			},
			"model": map[string]any{
				"type":        "string",
				"enum":        []string{"sonnet", "opus", "haiku"},
				"description": "Model override for this agent",
			},
			"run_in_background": map[string]any{
				"type":        "boolean",
				"description": "Run agent in background (returns ID immediately)",
			},
		},
		"required": []string{"description", "prompt"},
	}
}

func (t *AgentTool) IsReadOnly(_ map[string]any) bool { return false }

func (t *AgentTool) Execute(input map[string]any, ctx *ToolContext) types.ToolResult {
	description, _ := input["description"].(string)
	prompt, _ := input["prompt"].(string)
	modelOverride, _ := input["model"].(string)
	runInBackground, _ := input["run_in_background"].(bool)

	if description == "" || prompt == "" {
		return types.ToolResult{Content: "Error: description and prompt are required", IsError: true}
	}

	// Resolve model
	model := resolveModelAlias(modelOverride)

	agentExecutorMu.RLock()
	executor := globalAgentExecutor
	agentExecutorMu.RUnlock()

	if executor == nil {
		return types.ToolResult{
			Content: "Error: agent executor not initialized. The engine must call tools.SetAgentExecutor() at startup.",
			IsError: true,
		}
	}

	// Generate agent ID
	agentResultsMu.Lock()
	agentNextID++
	agentID := fmt.Sprintf("agent_%d", agentNextID)
	agentResultsMu.Unlock()

	if runInBackground {
		// Async: launch goroutine, return ID immediately
		result := &AgentResult{ID: agentID, Status: "running"}
		agentResultsMu.Lock()
		agentResults[agentID] = result
		agentResultsMu.Unlock()

		go func() {
			start := time.Now()
			bgCtx := context.Background()
			var output strings.Builder

			text, usage, err := executor(bgCtx, prompt, model, ctx.CWD, func(t string) {
				output.WriteString(t)
			})

			agentResultsMu.Lock()
			defer agentResultsMu.Unlock()
			result.Duration = time.Since(start)
			result.Usage = usage
			if err != nil {
				result.Status = "failed"
				result.Output = fmt.Sprintf("Error: %v\n\nPartial output:\n%s", err, output.String())
			} else {
				result.Status = "completed"
				result.Output = text
			}
		}()

		return types.ToolResult{
			Content: fmt.Sprintf("Agent '%s' launched in background.\nID: %s\nModel: %s\n\nUse TaskOutput with task_id=%s to check results.", description, agentID, model, agentID),
		}
	}

	// Synchronous: block until agent completes
	start := time.Now()
	agentCtx, cancel := context.WithTimeout(context.Background(), 10*time.Minute)
	defer cancel()

	var output strings.Builder
	text, usage, err := executor(agentCtx, prompt, model, ctx.CWD, func(t string) {
		output.WriteString(t)
	})

	duration := time.Since(start)

	if err != nil {
		return types.ToolResult{
			Content: fmt.Sprintf("Agent '%s' failed after %s: %v\n\nPartial output:\n%s",
				description, duration.Round(time.Millisecond), err, output.String()),
			IsError: true,
		}
	}

	// Format result
	var sb strings.Builder
	sb.WriteString(fmt.Sprintf("Agent '%s' completed in %s\n", description, duration.Round(time.Millisecond)))
	sb.WriteString(fmt.Sprintf("Tokens: %d in / %d out\n\n", usage.InputTokens, usage.OutputTokens))
	sb.WriteString(text)

	return types.ToolResult{Content: sb.String()}
}

// GetAgentResult retrieves a background agent's result
func GetAgentResult(id string) *AgentResult {
	agentResultsMu.RLock()
	defer agentResultsMu.RUnlock()
	return agentResults[id]
}

// FormatAgentResults lists all agent results
func FormatAgentResults() string {
	agentResultsMu.RLock()
	defer agentResultsMu.RUnlock()

	if len(agentResults) == 0 {
		return "No agents have been spawned."
	}

	var sb strings.Builder
	sb.WriteString("Agent Results:\n")
	for _, r := range agentResults {
		sb.WriteString(fmt.Sprintf("  [%s] %s", r.Status, r.ID))
		if r.Duration > 0 {
			sb.WriteString(fmt.Sprintf(" (%s)", r.Duration.Round(time.Millisecond)))
		}
		sb.WriteString("\n")
	}
	return sb.String()
}

func resolveModelAlias(alias string) string {
	switch alias {
	case "sonnet":
		return "claude-sonnet-4-20250514"
	case "opus":
		return "claude-opus-4-20250514"
	case "haiku":
		return "claude-haiku-4-5-20251001"
	case "":
		return "" // use parent's model
	default:
		return alias // treat as full model ID
	}
}

// marshalJSON is a helper to serialize agent results
func marshalJSON(v any) string {
	data, _ := json.MarshalIndent(v, "", "  ")
	return string(data)
}
