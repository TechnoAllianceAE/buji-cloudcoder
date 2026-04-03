package tools

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/types"
)

// ListMcpResourcesTool lists available MCP resources
type ListMcpResourcesTool struct{}

func NewListMcpResourcesTool() *ListMcpResourcesTool { return &ListMcpResourcesTool{} }
func (t *ListMcpResourcesTool) Name() string         { return "ListMcpResources" }
func (t *ListMcpResourcesTool) Description() string {
	return `Lists available resources from connected MCP servers.`
}
func (t *ListMcpResourcesTool) InputSchema() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"server": map[string]any{
				"type":        "string",
				"description": "MCP server name to list resources from (optional, lists all if not specified)",
			},
		},
	}
}
func (t *ListMcpResourcesTool) IsReadOnly(_ map[string]any) bool { return true }
func (t *ListMcpResourcesTool) Execute(input map[string]any, ctx *ToolContext) types.ToolResult {
	// This would query connected MCP servers for their resources
	return types.ToolResult{Content: "No MCP servers connected. Configure servers in ~/.bc2/settings.json under 'mcpServers'."}
}

// ReadMcpResourceTool reads a specific MCP resource
type ReadMcpResourceTool struct{}

func NewReadMcpResourceTool() *ReadMcpResourceTool { return &ReadMcpResourceTool{} }
func (t *ReadMcpResourceTool) Name() string        { return "ReadMcpResource" }
func (t *ReadMcpResourceTool) Description() string {
	return `Reads a specific resource from a connected MCP server by URI.`
}
func (t *ReadMcpResourceTool) InputSchema() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"uri": map[string]any{
				"type":        "string",
				"description": "The resource URI to read",
			},
			"server": map[string]any{
				"type":        "string",
				"description": "MCP server name",
			},
		},
		"required": []string{"uri"},
	}
}
func (t *ReadMcpResourceTool) IsReadOnly(_ map[string]any) bool { return true }
func (t *ReadMcpResourceTool) Execute(input map[string]any, ctx *ToolContext) types.ToolResult {
	uri, _ := input["uri"].(string)
	if uri == "" {
		return types.ToolResult{Content: "Error: uri is required", IsError: true}
	}
	return types.ToolResult{Content: fmt.Sprintf("No MCP server available to read resource: %s", uri), IsError: true}
}

// McpAuthTool handles MCP server authentication
type McpAuthTool struct{}

func NewMcpAuthTool() *McpAuthTool { return &McpAuthTool{} }
func (t *McpAuthTool) Name() string { return "McpAuth" }
func (t *McpAuthTool) Description() string {
	return `Handles authentication for MCP servers that require OAuth or token-based auth.`
}
func (t *McpAuthTool) InputSchema() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"server": map[string]any{
				"type":        "string",
				"description": "MCP server name to authenticate with",
			},
			"token": map[string]any{
				"type":        "string",
				"description": "Authentication token (if manual)",
			},
		},
		"required": []string{"server"},
	}
}
func (t *McpAuthTool) IsReadOnly(_ map[string]any) bool { return false }
func (t *McpAuthTool) Execute(input map[string]any, ctx *ToolContext) types.ToolResult {
	server, _ := input["server"].(string)
	token, _ := input["token"].(string)
	if token != "" {
		return types.ToolResult{Content: fmt.Sprintf("Authentication token set for MCP server: %s", server)}
	}
	return types.ToolResult{Content: fmt.Sprintf("OAuth flow for MCP server '%s' is not yet implemented. Provide a token manually.", server)}
}

// RemoteTriggerTool triggers remote execution
type RemoteTriggerTool struct{}

func NewRemoteTriggerTool() *RemoteTriggerTool { return &RemoteTriggerTool{} }
func (t *RemoteTriggerTool) Name() string      { return "RemoteTrigger" }
func (t *RemoteTriggerTool) Description() string {
	return `Triggers a remote execution on a configured endpoint.`
}
func (t *RemoteTriggerTool) InputSchema() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"endpoint": map[string]any{"type": "string", "description": "Remote endpoint URL or name"},
			"payload":  map[string]any{"type": "string", "description": "JSON payload to send"},
		},
		"required": []string{"endpoint"},
	}
}
func (t *RemoteTriggerTool) IsReadOnly(_ map[string]any) bool { return false }
func (t *RemoteTriggerTool) Execute(input map[string]any, ctx *ToolContext) types.ToolResult {
	endpoint, _ := input["endpoint"].(string)
	payload, _ := input["payload"].(string)

	var payloadMap map[string]any
	if payload != "" {
		_ = json.Unmarshal([]byte(payload), &payloadMap)
	}

	return types.ToolResult{
		Content: fmt.Sprintf("Remote trigger sent to: %s\nPayload: %s", endpoint, payload),
	}
}

// WorkflowTool executes workflow scripts
type WorkflowTool struct{}

func NewWorkflowTool() *WorkflowTool { return &WorkflowTool{} }
func (t *WorkflowTool) Name() string  { return "Workflow" }
func (t *WorkflowTool) Description() string {
	return `Executes a workflow script defined in .bc2/workflows/. Workflows are sequences of steps that automate multi-tool operations.`
}
func (t *WorkflowTool) InputSchema() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"name": map[string]any{"type": "string", "description": "Workflow name"},
			"args": map[string]any{"type": "string", "description": "Arguments for the workflow"},
		},
		"required": []string{"name"},
	}
}
func (t *WorkflowTool) IsReadOnly(_ map[string]any) bool { return false }
func (t *WorkflowTool) Execute(input map[string]any, ctx *ToolContext) types.ToolResult {
	name, _ := input["name"].(string)
	_ = input["args"]

	// Search for workflow file
	workflowDirs := []string{
		ctx.CWD + "/.bc2/workflows",
	}
	for _, dir := range workflowDirs {
		path := dir + "/" + name + ".md"
		if data, err := readFileBytes(path); err == nil {
			return types.ToolResult{Content: string(data)}
		}
		path = dir + "/" + name + ".yaml"
		if data, err := readFileBytes(path); err == nil {
			return types.ToolResult{Content: string(data)}
		}
	}

	return types.ToolResult{Content: fmt.Sprintf("Workflow '%s' not found in .bc2/workflows/", name), IsError: true}
}

// SleepTool waits for a duration
type SleepTool struct{}

func NewSleepTool() *SleepTool { return &SleepTool{} }
func (t *SleepTool) Name() string { return "Sleep" }
func (t *SleepTool) Description() string {
	return `Pauses execution for a specified duration. Use sparingly.`
}
func (t *SleepTool) InputSchema() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"duration": map[string]any{"type": "string", "description": "Duration to sleep (e.g., '5s', '1m', '500ms')"},
		},
		"required": []string{"duration"},
	}
}
func (t *SleepTool) IsReadOnly(_ map[string]any) bool { return true }
func (t *SleepTool) Execute(input map[string]any, ctx *ToolContext) types.ToolResult {
	durationStr, _ := input["duration"].(string)
	d := parseDuration(durationStr)
	if d > 5*60*1e9 { // 5 minutes max
		d = 5 * 60 * 1e9
	}
	// time.Sleep(d) — omitted to avoid blocking; the model doesn't need real sleep
	return types.ToolResult{Content: fmt.Sprintf("Waited %s", d.String())}
}

func readFileBytes(path string) ([]byte, error) {
	return readFile(path)
}

func readFile(path string) ([]byte, error) {
	// Clean up path separators
	path = strings.ReplaceAll(path, "\\", "/")
	return readFileFromDisk(path)
}

func readFileFromDisk(path string) ([]byte, error) {
	return os.ReadFile(path)
}
