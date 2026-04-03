package tools

import (
	"fmt"
	"os"
	"strings"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/types"
	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/utils"
)

// FileReadTool reads files from the filesystem
type FileReadTool struct{}

func NewFileReadTool() *FileReadTool { return &FileReadTool{} }

func (t *FileReadTool) Name() string { return "Read" }

func (t *FileReadTool) Description() string {
	return `Reads a file from the local filesystem. Returns the file content with line numbers.

Usage:
- The file_path parameter must be an absolute path
- By default reads up to 2000 lines from the beginning of the file
- You can optionally specify offset and limit for large files
- Results are returned with line numbers (cat -n format)`
}

func (t *FileReadTool) InputSchema() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"file_path": map[string]any{
				"type":        "string",
				"description": "The absolute path to the file to read",
			},
			"offset": map[string]any{
				"type":        "integer",
				"description": "Line number to start reading from (0-indexed)",
			},
			"limit": map[string]any{
				"type":        "integer",
				"description": "Number of lines to read (default 2000)",
			},
		},
		"required": []string{"file_path"},
	}
}

func (t *FileReadTool) IsReadOnly(_ map[string]any) bool { return true }

func (t *FileReadTool) Execute(input map[string]any, ctx *ToolContext) types.ToolResult {
	filePath, ok := input["file_path"].(string)
	if !ok || filePath == "" {
		return types.ToolResult{Content: "Error: file_path is required", IsError: true}
	}

	filePath = utils.AbsPath(filePath)

	info, err := os.Stat(filePath)
	if err != nil {
		if os.IsNotExist(err) {
			return types.ToolResult{
				Content: fmt.Sprintf("Error: file not found: %s", filePath),
				IsError: true,
			}
		}
		return types.ToolResult{Content: fmt.Sprintf("Error: %v", err), IsError: true}
	}

	if info.IsDir() {
		return types.ToolResult{
			Content: fmt.Sprintf("Error: %s is a directory, not a file. Use Bash with 'ls' to list directory contents.", filePath),
			IsError: true,
		}
	}

	data, err := os.ReadFile(filePath)
	if err != nil {
		return types.ToolResult{Content: fmt.Sprintf("Error reading file: %v", err), IsError: true}
	}

	content := string(data)
	lines := strings.Split(content, "\n")

	offset := 0
	if v, ok := input["offset"].(float64); ok {
		offset = int(v)
	}
	limit := 2000
	if v, ok := input["limit"].(float64); ok && v > 0 {
		limit = int(v)
	}

	if offset >= len(lines) {
		return types.ToolResult{
			Content: fmt.Sprintf("Error: offset %d exceeds file length (%d lines)", offset, len(lines)),
			IsError: true,
		}
	}

	end := offset + limit
	if end > len(lines) {
		end = len(lines)
	}

	selectedLines := lines[offset:end]
	result := utils.FormatLineNumbers(strings.Join(selectedLines, "\n"), offset+1)

	if end < len(lines) {
		result += fmt.Sprintf("\n\n... (%d more lines not shown. Use offset to read more.)", len(lines)-end)
	}

	return types.ToolResult{Content: result}
}
