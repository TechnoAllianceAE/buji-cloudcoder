package tools

import (
	"fmt"
	"strings"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/types"
)

// AgentTool spawns sub-agents for complex tasks
type AgentTool struct{}

func NewAgentTool() *AgentTool { return &AgentTool{} }
func (t *AgentTool) Name() string { return "Agent" }

func (t *AgentTool) Description() string {
	return `Launch a sub-agent to handle complex, multi-step tasks autonomously.

The Agent tool spawns a separate conversation context that can independently research,
plan, and execute tasks. Each agent has its own message history and tool access.

Use agents for:
- Complex research tasks requiring multiple file reads/searches
- Independent work that can run in parallel
- Tasks that need isolation from the main conversation

Specify a subagent_type for specialized behavior:
- "general-purpose": Default agent for any task
- "Explore": Fast codebase exploration and search

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
				"description": "Type of agent: general-purpose, Explore",
			},
			"model": map[string]any{
				"type":        "string",
				"enum":        []string{"sonnet", "opus", "haiku"},
				"description": "Model override for this agent",
			},
			"run_in_background": map[string]any{
				"type":        "boolean",
				"description": "Run agent in background",
			},
		},
		"required": []string{"description", "prompt"},
	}
}

func (t *AgentTool) IsReadOnly(_ map[string]any) bool { return false }

func (t *AgentTool) Execute(input map[string]any, ctx *ToolContext) types.ToolResult {
	description, _ := input["description"].(string)
	prompt, _ := input["prompt"].(string)
	agentType, _ := input["subagent_type"].(string)
	modelOverride, _ := input["model"].(string)

	if description == "" || prompt == "" {
		return types.ToolResult{Content: "Error: description and prompt are required", IsError: true}
	}

	if agentType == "" {
		agentType = "general-purpose"
	}

	// Resolve model
	model := ""
	switch modelOverride {
	case "sonnet":
		model = "claude-sonnet-4-20250514"
	case "opus":
		model = "claude-opus-4-20250514"
	case "haiku":
		model = "claude-haiku-4-5-20251001"
	}

	// For now, agents execute inline (synchronous sub-conversation)
	// A full implementation would spawn a goroutine with its own QueryEngine

	var sb strings.Builder
	sb.WriteString(fmt.Sprintf("Agent started: %s\n", description))
	sb.WriteString(fmt.Sprintf("Type: %s\n", agentType))
	if model != "" {
		sb.WriteString(fmt.Sprintf("Model: %s\n", model))
	}
	sb.WriteString(fmt.Sprintf("Prompt: %s\n", prompt))
	sb.WriteString("\n[Agent execution is a placeholder — full sub-agent spawning requires the QueryEngine to be passed to tools. This will be implemented in Phase 2.]\n")

	return types.ToolResult{Content: sb.String()}
}
