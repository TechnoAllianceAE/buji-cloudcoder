package tools

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/types"
	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/utils"
)

// TodoWriteTool manages todo/checklist items
type TodoWriteTool struct{}

func NewTodoWriteTool() *TodoWriteTool { return &TodoWriteTool{} }
func (t *TodoWriteTool) Name() string  { return "TodoWrite" }
func (t *TodoWriteTool) Description() string {
	return `Creates or updates a todo list stored in the project. Todo items are saved as a JSON file at .bc2/todos.json.`
}
func (t *TodoWriteTool) InputSchema() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"todos": map[string]any{
				"type": "array",
				"items": map[string]any{
					"type": "object",
					"properties": map[string]any{
						"id":      map[string]any{"type": "string"},
						"title":   map[string]any{"type": "string"},
						"status":  map[string]any{"type": "string", "enum": []string{"pending", "in_progress", "done"}},
						"content": map[string]any{"type": "string"},
					},
					"required": []string{"id", "title", "status"},
				},
				"description": "Array of todo items to write",
			},
		},
		"required": []string{"todos"},
	}
}
func (t *TodoWriteTool) IsReadOnly(_ map[string]any) bool { return false }

func (t *TodoWriteTool) Execute(input map[string]any, ctx *ToolContext) types.ToolResult {
	todosRaw, ok := input["todos"]
	if !ok {
		return types.ToolResult{Content: "Error: todos array is required", IsError: true}
	}

	// Serialize and write
	todoDir := filepath.Join(ctx.CWD, ".bc2")
	_ = utils.EnsureDir(todoDir)

	data, err := json.MarshalIndent(todosRaw, "", "  ")
	if err != nil {
		return types.ToolResult{Content: fmt.Sprintf("Error serializing todos: %v", err), IsError: true}
	}

	todoFile := filepath.Join(todoDir, "todos.json")
	if err := os.WriteFile(todoFile, data, 0644); err != nil {
		return types.ToolResult{Content: fmt.Sprintf("Error writing todos: %v", err), IsError: true}
	}

	return types.ToolResult{Content: fmt.Sprintf("Todos saved to %s", todoFile)}
}
