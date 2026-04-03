package tools

import (
	"fmt"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/types"
)

// TaskOutputTool reads the output from a task
type TaskOutputTool struct{}

func NewTaskOutputTool() *TaskOutputTool { return &TaskOutputTool{} }
func (t *TaskOutputTool) Name() string   { return "TaskOutput" }
func (t *TaskOutputTool) Description() string {
	return `Reads the output from a running or completed task. Use this to check the results of background tasks.`
}
func (t *TaskOutputTool) InputSchema() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"task_id": map[string]any{"type": "string", "description": "The task ID to read output from"},
		},
		"required": []string{"task_id"},
	}
}
func (t *TaskOutputTool) IsReadOnly(_ map[string]any) bool { return true }
func (t *TaskOutputTool) Execute(input map[string]any, ctx *ToolContext) types.ToolResult {
	id, _ := input["task_id"].(string)
	task := globalTaskManager.Get(id)
	if task == nil {
		return types.ToolResult{Content: fmt.Sprintf("Task not found: %s", id), IsError: true}
	}
	output := task.Output
	if output == "" {
		output = fmt.Sprintf("Task %s (%s) has no output yet. Status: %s", task.ID, task.Title, task.Status)
	}
	return types.ToolResult{Content: output}
}
