package tools

import (
	"fmt"
	"strings"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/types"
)

// ToolSearchTool searches available tools by keyword
type ToolSearchTool struct {
	registry *Registry
}

func NewToolSearchTool() *ToolSearchTool { return &ToolSearchTool{} }

func (t *ToolSearchTool) SetRegistry(r *Registry) { t.registry = r }
func (t *ToolSearchTool) Name() string             { return "ToolSearch" }
func (t *ToolSearchTool) Description() string {
	return `Searches available tools by keyword. Use this to discover which tools are available for a particular task.`
}
func (t *ToolSearchTool) InputSchema() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"query": map[string]any{
				"type":        "string",
				"description": "Keyword to search tools by name or description",
			},
			"max_results": map[string]any{
				"type":        "number",
				"description": "Maximum results to return (default 5)",
			},
		},
		"required": []string{"query"},
	}
}
func (t *ToolSearchTool) IsReadOnly(_ map[string]any) bool { return true }

func (t *ToolSearchTool) Execute(input map[string]any, ctx *ToolContext) types.ToolResult {
	query, _ := input["query"].(string)
	maxResults := 5
	if v, ok := input["max_results"].(float64); ok && v > 0 {
		maxResults = int(v)
	}

	if query == "" {
		return types.ToolResult{Content: "Error: query is required", IsError: true}
	}

	if t.registry == nil {
		return types.ToolResult{Content: "Error: tool registry not available", IsError: true}
	}

	queryLower := strings.ToLower(query)
	var matches []string

	for _, tool := range t.registry.GetAll() {
		name := strings.ToLower(tool.Name())
		desc := strings.ToLower(tool.Description())

		if strings.Contains(name, queryLower) || strings.Contains(desc, queryLower) {
			matches = append(matches, fmt.Sprintf("- **%s**: %s",
				tool.Name(),
				truncateStr(tool.Description(), 150)))
		}

		if len(matches) >= maxResults {
			break
		}
	}

	if len(matches) == 0 {
		return types.ToolResult{Content: fmt.Sprintf("No tools found matching '%s'", query)}
	}

	return types.ToolResult{Content: fmt.Sprintf("Tools matching '%s':\n\n%s", query, strings.Join(matches, "\n"))}
}

func truncateStr(s string, max int) string {
	// Get first line only
	if idx := strings.Index(s, "\n"); idx > 0 {
		s = s[:idx]
	}
	if len(s) > max {
		return s[:max-3] + "..."
	}
	return s
}
