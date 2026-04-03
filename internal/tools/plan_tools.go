package tools

import (
	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/types"
)

// --- EnterPlanMode Tool ---

type EnterPlanModeTool struct{}

func NewEnterPlanModeTool() *EnterPlanModeTool { return &EnterPlanModeTool{} }
func (t *EnterPlanModeTool) Name() string      { return "EnterPlanMode" }
func (t *EnterPlanModeTool) Description() string {
	return `Enters plan mode where tools are shown but not executed. Use this to create implementation plans before executing them.`
}
func (t *EnterPlanModeTool) InputSchema() map[string]any {
	return map[string]any{"type": "object", "properties": map[string]any{}}
}
func (t *EnterPlanModeTool) IsReadOnly(_ map[string]any) bool { return true }
func (t *EnterPlanModeTool) Execute(input map[string]any, ctx *ToolContext) types.ToolResult {
	ctx.PermissionMode = "plan"
	return types.ToolResult{Content: "Entered plan mode. Tool calls will be shown but not executed. Use ExitPlanMode to return to normal execution."}
}

// --- ExitPlanMode Tool ---

type ExitPlanModeTool struct{}

func NewExitPlanModeTool() *ExitPlanModeTool { return &ExitPlanModeTool{} }
func (t *ExitPlanModeTool) Name() string     { return "ExitPlanMode" }
func (t *ExitPlanModeTool) Description() string {
	return `Exits plan mode and returns to normal tool execution.`
}
func (t *ExitPlanModeTool) InputSchema() map[string]any {
	return map[string]any{"type": "object", "properties": map[string]any{}}
}
func (t *ExitPlanModeTool) IsReadOnly(_ map[string]any) bool { return true }
func (t *ExitPlanModeTool) Execute(input map[string]any, ctx *ToolContext) types.ToolResult {
	ctx.PermissionMode = "default"
	return types.ToolResult{Content: "Exited plan mode. Tools will now execute normally."}
}
