package tools

import (
	"fmt"
	"os"
	"strings"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/types"
	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/utils"
)

// FileEditTool performs exact string replacements in files
type FileEditTool struct{}

func NewFileEditTool() *FileEditTool { return &FileEditTool{} }

func (t *FileEditTool) Name() string { return "Edit" }

func (t *FileEditTool) Description() string {
	return `Performs exact string replacements in files.

Usage:
- Provide old_string (text to find) and new_string (replacement text)
- old_string must be unique in the file unless replace_all is true
- Preserves exact indentation
- Use replace_all for renaming variables across the file`
}

func (t *FileEditTool) InputSchema() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"file_path": map[string]any{
				"type":        "string",
				"description": "Absolute path to the file to modify",
			},
			"old_string": map[string]any{
				"type":        "string",
				"description": "The exact text to find and replace",
			},
			"new_string": map[string]any{
				"type":        "string",
				"description": "The replacement text",
			},
			"replace_all": map[string]any{
				"type":        "boolean",
				"description": "Replace all occurrences (default false)",
				"default":     false,
			},
		},
		"required": []string{"file_path", "old_string", "new_string"},
	}
}

func (t *FileEditTool) IsReadOnly(_ map[string]any) bool { return false }

func (t *FileEditTool) Execute(input map[string]any, ctx *ToolContext) types.ToolResult {
	filePath, _ := input["file_path"].(string)
	oldString, _ := input["old_string"].(string)
	newString, _ := input["new_string"].(string)
	replaceAll, _ := input["replace_all"].(bool)

	if filePath == "" {
		return types.ToolResult{Content: "Error: file_path is required", IsError: true}
	}
	if oldString == "" {
		return types.ToolResult{Content: "Error: old_string is required", IsError: true}
	}
	if oldString == newString {
		return types.ToolResult{Content: "Error: old_string and new_string are identical", IsError: true}
	}

	filePath = utils.AbsPath(filePath)

	data, err := os.ReadFile(filePath)
	if err != nil {
		return types.ToolResult{Content: fmt.Sprintf("Error reading file: %v", err), IsError: true}
	}

	content := string(data)
	count := strings.Count(content, oldString)

	if count == 0 {
		return types.ToolResult{
			Content: fmt.Sprintf("Error: old_string not found in %s. Make sure you're using the exact text from the file.", filePath),
			IsError: true,
		}
	}

	if count > 1 && !replaceAll {
		return types.ToolResult{
			Content: fmt.Sprintf("Error: old_string found %d times in %s. Use replace_all=true to replace all, or provide more context to make the match unique.", count, filePath),
			IsError: true,
		}
	}

	var newContent string
	if replaceAll {
		newContent = strings.ReplaceAll(content, oldString, newString)
	} else {
		newContent = strings.Replace(content, oldString, newString, 1)
	}

	if err := os.WriteFile(filePath, []byte(newContent), 0644); err != nil {
		return types.ToolResult{Content: fmt.Sprintf("Error writing file: %v", err), IsError: true}
	}

	replacements := 1
	if replaceAll {
		replacements = count
	}

	return types.ToolResult{
		Content: fmt.Sprintf("Successfully replaced %d occurrence(s) in %s", replacements, filePath),
	}
}
