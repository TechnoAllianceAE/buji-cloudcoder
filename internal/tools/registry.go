package tools

import (
	"fmt"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/types"
)

// Tool is the interface all tools must implement
type Tool interface {
	Name() string
	Description() string
	InputSchema() map[string]any
	Execute(input map[string]any, ctx *ToolContext) types.ToolResult
	IsReadOnly(input map[string]any) bool
}

// ToolContext provides context for tool execution
type ToolContext struct {
	CWD            string
	PermissionMode string
	// CanUseTool callback - returns (allowed bool, reason string)
	CanUseTool func(toolName string, input map[string]any) (bool, string)

	// Session-scoped managers (set by QueryEngine, avoids global singletons)
	TaskManager *TaskManager
	TeamManager *TeamManager
}

// Registry holds all registered tools
type Registry struct {
	tools map[string]Tool
	order []string
}

// NewRegistry creates a new tool registry with all built-in tools
func NewRegistry() *Registry {
	r := &Registry{
		tools: make(map[string]Tool),
	}

	// Register built-in tools
	builtins := []Tool{
		NewBashTool(),
		NewFileReadTool(),
		NewFileEditTool(),
		NewFileWriteTool(),
		NewGlobTool(),
		NewGrepTool(),
		NewWebFetchTool(),
		NewWebSearchTool(),
		NewNotebookEditTool(),
		NewAskUserQuestionTool(),
		NewPowerShellTool(),
		NewAgentTool(),
		NewTaskCreateTool(),
		NewTaskGetTool(),
		NewTaskUpdateTool(),
		NewTaskListTool(),
		NewTaskStopTool(),
		NewTaskOutputTool(),
		NewEnterPlanModeTool(),
		NewExitPlanModeTool(),
		NewEnterWorktreeTool(),
		NewExitWorktreeTool(),
		NewTodoWriteTool(),
		NewToolSearchTool(),
		NewBriefTool(),
		NewSkillTool(),
		NewSendMessageTool(),
		NewTeamCreateTool(),
		NewTeamDeleteTool(),
		NewCronCreateTool(),
		NewCronDeleteTool(),
		NewCronListTool(),
		NewListMcpResourcesTool(),
		NewReadMcpResourceTool(),
		NewMcpAuthTool(),
		NewRemoteTriggerTool(),
		NewWorkflowTool(),
		NewSleepTool(),
		NewLSPTool(),
	}

	for _, t := range builtins {
		r.Register(t)
	}

	return r
}

// Register adds a tool to the registry
func (r *Registry) Register(t Tool) {
	r.tools[t.Name()] = t
	r.order = append(r.order, t.Name())
}

// Get returns a tool by name
func (r *Registry) Get(name string) (Tool, bool) {
	t, ok := r.tools[name]
	return t, ok
}

// GetAll returns all tools in registration order
func (r *Registry) GetAll() []Tool {
	result := make([]Tool, 0, len(r.order))
	for _, name := range r.order {
		result = append(result, r.tools[name])
	}
	return result
}

// GetToolDefinitions returns API-compatible tool definitions
func (r *Registry) GetToolDefinitions() []types.ToolDefinition {
	defs := make([]types.ToolDefinition, 0, len(r.order))
	for _, name := range r.order {
		t := r.tools[name]
		defs = append(defs, types.ToolDefinition{
			Name:        t.Name(),
			Description: t.Description(),
			InputSchema: t.InputSchema(),
		})
	}
	return defs
}

// ExecuteTool executes a tool by name with the given input
func (r *Registry) ExecuteTool(name string, input map[string]any, ctx *ToolContext) types.ToolResult {
	t, ok := r.tools[name]
	if !ok {
		return types.ToolResult{
			Content: fmt.Sprintf("Unknown tool: %s", name),
			IsError: true,
		}
	}

	// Permission check
	if ctx.CanUseTool != nil {
		allowed, reason := ctx.CanUseTool(name, input)
		if !allowed {
			return types.ToolResult{
				Content: fmt.Sprintf("Permission denied: %s", reason),
				IsError: true,
			}
		}
	}

	return t.Execute(input, ctx)
}
