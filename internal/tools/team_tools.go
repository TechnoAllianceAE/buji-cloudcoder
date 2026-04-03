package tools

import (
	"fmt"
	"strings"
	"sync"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/types"
)

// Teammate represents an active teammate agent
type Teammate struct {
	ID          string
	Name        string
	Role        string
	Model       string
	TokenBudget int
	TokensUsed  int
	Status      string // "active", "idle", "stopped"
}

// TeamManager manages teammate agents
type TeamManager struct {
	mu        sync.RWMutex
	teammates map[string]*Teammate
	nextID    int
}

var globalTeamManager = &TeamManager{
	teammates: make(map[string]*Teammate),
}

// --- SendMessage Tool ---

type SendMessageTool struct{}

func NewSendMessageTool() *SendMessageTool { return &SendMessageTool{} }
func (t *SendMessageTool) Name() string    { return "SendMessage" }
func (t *SendMessageTool) Description() string {
	return `Sends a message to another agent or teammate. Use this to communicate with active agents, delegate tasks, or request information from specialized teammates.`
}
func (t *SendMessageTool) InputSchema() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"to": map[string]any{
				"type":        "string",
				"description": "Name or ID of the agent to send the message to",
			},
			"message": map[string]any{
				"type":        "string",
				"description": "The message content",
			},
		},
		"required": []string{"to", "message"},
	}
}
func (t *SendMessageTool) IsReadOnly(_ map[string]any) bool { return false }
func (t *SendMessageTool) Execute(input map[string]any, ctx *ToolContext) types.ToolResult {
	to, _ := input["to"].(string)
	message, _ := input["message"].(string)
	if to == "" || message == "" {
		return types.ToolResult{Content: "Error: 'to' and 'message' are required", IsError: true}
	}

	globalTeamManager.mu.RLock()
	var target *Teammate
	for _, tm := range globalTeamManager.teammates {
		if tm.Name == to || tm.ID == to {
			target = tm
			break
		}
	}
	globalTeamManager.mu.RUnlock()

	if target == nil {
		return types.ToolResult{Content: fmt.Sprintf("Agent '%s' not found. Use TeamCreate to create teammates first.", to), IsError: true}
	}

	// In a full implementation, this would route the message to the agent's
	// conversation context. For now, acknowledge the send.
	return types.ToolResult{
		Content: fmt.Sprintf("Message sent to %s (%s):\n%s", target.Name, target.ID, message),
	}
}

// --- TeamCreate Tool ---

type TeamCreateTool struct{}

func NewTeamCreateTool() *TeamCreateTool { return &TeamCreateTool{} }
func (t *TeamCreateTool) Name() string   { return "TeamCreate" }
func (t *TeamCreateTool) Description() string {
	return `Creates a new teammate agent with a specific role and token budget. Teammates can work on tasks independently and communicate via SendMessage.`
}
func (t *TeamCreateTool) InputSchema() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"name": map[string]any{
				"type":        "string",
				"description": "Name for the teammate",
			},
			"role": map[string]any{
				"type":        "string",
				"description": "Role description (e.g., 'frontend developer', 'test writer')",
			},
			"model": map[string]any{
				"type":        "string",
				"enum":        []string{"sonnet", "opus", "haiku"},
				"description": "Model to use (default: sonnet)",
			},
			"token_budget": map[string]any{
				"type":        "number",
				"description": "Maximum tokens this teammate can use",
			},
		},
		"required": []string{"name", "role"},
	}
}
func (t *TeamCreateTool) IsReadOnly(_ map[string]any) bool { return false }
func (t *TeamCreateTool) Execute(input map[string]any, ctx *ToolContext) types.ToolResult {
	name, _ := input["name"].(string)
	role, _ := input["role"].(string)
	model, _ := input["model"].(string)
	budget := 100000
	if v, ok := input["token_budget"].(float64); ok && v > 0 {
		budget = int(v)
	}
	if model == "" {
		model = "sonnet"
	}

	globalTeamManager.mu.Lock()
	globalTeamManager.nextID++
	id := fmt.Sprintf("team_%d", globalTeamManager.nextID)
	tm := &Teammate{
		ID:          id,
		Name:        name,
		Role:        role,
		Model:       model,
		TokenBudget: budget,
		Status:      "active",
	}
	globalTeamManager.teammates[id] = tm
	globalTeamManager.mu.Unlock()

	return types.ToolResult{
		Content: fmt.Sprintf("Created teammate: %s (%s)\nRole: %s\nModel: %s\nBudget: %d tokens", name, id, role, model, budget),
	}
}

// --- TeamDelete Tool ---

type TeamDeleteTool struct{}

func NewTeamDeleteTool() *TeamDeleteTool { return &TeamDeleteTool{} }
func (t *TeamDeleteTool) Name() string   { return "TeamDelete" }
func (t *TeamDeleteTool) Description() string {
	return `Removes a teammate agent from the team.`
}
func (t *TeamDeleteTool) InputSchema() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"name": map[string]any{
				"type":        "string",
				"description": "Name or ID of the teammate to remove",
			},
		},
		"required": []string{"name"},
	}
}
func (t *TeamDeleteTool) IsReadOnly(_ map[string]any) bool { return false }
func (t *TeamDeleteTool) Execute(input map[string]any, ctx *ToolContext) types.ToolResult {
	name, _ := input["name"].(string)

	globalTeamManager.mu.Lock()
	defer globalTeamManager.mu.Unlock()

	for id, tm := range globalTeamManager.teammates {
		if tm.Name == name || tm.ID == name {
			delete(globalTeamManager.teammates, id)
			return types.ToolResult{Content: fmt.Sprintf("Removed teammate: %s (%s)", tm.Name, id)}
		}
	}
	return types.ToolResult{Content: fmt.Sprintf("Teammate '%s' not found", name), IsError: true}
}

// ListTeammates returns formatted list of all teammates
func ListTeammates() string {
	globalTeamManager.mu.RLock()
	defer globalTeamManager.mu.RUnlock()

	if len(globalTeamManager.teammates) == 0 {
		return "No teammates. Use TeamCreate to add teammates."
	}

	var sb strings.Builder
	sb.WriteString("Team:\n")
	for _, tm := range globalTeamManager.teammates {
		sb.WriteString(fmt.Sprintf("  [%s] %s — %s (model: %s, budget: %d/%d tokens)\n",
			tm.Status, tm.Name, tm.Role, tm.Model, tm.TokensUsed, tm.TokenBudget))
	}
	return sb.String()
}
