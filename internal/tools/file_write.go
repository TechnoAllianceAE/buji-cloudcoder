package tools

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/types"
	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/utils"
)

// FileWriteTool writes content to a file
type FileWriteTool struct{}

func NewFileWriteTool() *FileWriteTool { return &FileWriteTool{} }

func (t *FileWriteTool) Name() string { return "Write" }

func (t *FileWriteTool) Description() string {
	return `Writes content to a file on the filesystem.

Usage:
- This tool will overwrite any existing file at the given path
- Creates parent directories if they don't exist
- file_path must be an absolute path
- Prefer Edit for modifying existing files (only sends the diff)
- Use this for creating new files or complete rewrites`
}

func (t *FileWriteTool) InputSchema() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"file_path": map[string]any{
				"type":        "string",
				"description": "Absolute path to the file to write",
			},
			"content": map[string]any{
				"type":        "string",
				"description": "The content to write to the file",
			},
		},
		"required": []string{"file_path", "content"},
	}
}

func (t *FileWriteTool) IsReadOnly(_ map[string]any) bool { return false }

func (t *FileWriteTool) Execute(input map[string]any, ctx *ToolContext) types.ToolResult {
	filePath, _ := input["file_path"].(string)
	content, _ := input["content"].(string)

	if filePath == "" {
		return types.ToolResult{Content: "Error: file_path is required", IsError: true}
	}

	filePath = utils.AbsPath(filePath)

	// Create parent directories
	dir := filepath.Dir(filePath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return types.ToolResult{Content: fmt.Sprintf("Error creating directories: %v", err), IsError: true}
	}

	existed := utils.FileExists(filePath)

	if err := os.WriteFile(filePath, []byte(content), 0644); err != nil {
		return types.ToolResult{Content: fmt.Sprintf("Error writing file: %v", err), IsError: true}
	}

	action := "Created"
	if existed {
		action = "Updated"
	}

	return types.ToolResult{
		Content: fmt.Sprintf("%s file: %s", action, filePath),
	}
}
