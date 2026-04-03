package tools

import (
	"bytes"
	"context"
	"fmt"
	"os/exec"
	"runtime"
	"strings"
	"time"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/types"
)

// PowerShellTool executes PowerShell commands on Windows
type PowerShellTool struct{}

func NewPowerShellTool() *PowerShellTool { return &PowerShellTool{} }

func (t *PowerShellTool) Name() string { return "PowerShell" }

func (t *PowerShellTool) Description() string {
	return `Executes PowerShell commands. Only available on Windows.

Use this for Windows-specific operations that require PowerShell cmdlets.
For cross-platform commands, prefer the Bash tool.`
}

func (t *PowerShellTool) InputSchema() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"command": map[string]any{
				"type":        "string",
				"description": "The PowerShell command to execute",
			},
			"timeout": map[string]any{
				"type":        "number",
				"description": "Timeout in milliseconds (default 120000)",
			},
		},
		"required": []string{"command"},
	}
}

func (t *PowerShellTool) IsReadOnly(input map[string]any) bool {
	cmd, _ := input["command"].(string)
	lower := strings.ToLower(strings.TrimSpace(cmd))
	readOnlyPrefixes := []string{"get-", "test-", "select-", "where-", "measure-", "format-",
		"out-string", "write-output", "write-host", "$env:", "dir", "ls", "cat", "type"}
	for _, prefix := range readOnlyPrefixes {
		if strings.HasPrefix(lower, prefix) {
			return true
		}
	}
	return false
}

func (t *PowerShellTool) Execute(input map[string]any, ctx *ToolContext) types.ToolResult {
	if runtime.GOOS != "windows" {
		return types.ToolResult{Content: "Error: PowerShell tool is only available on Windows", IsError: true}
	}

	command, _ := input["command"].(string)
	if command == "" {
		return types.ToolResult{Content: "Error: command is required", IsError: true}
	}

	timeoutMs := 120000.0
	if v, ok := input["timeout"].(float64); ok && v > 0 {
		timeoutMs = v
		if timeoutMs > 600000 {
			timeoutMs = 600000
		}
	}

	timeout := time.Duration(timeoutMs) * time.Millisecond
	ctxTimeout, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	// Try pwsh (PowerShell Core) first, fall back to powershell
	shell := "pwsh"
	if _, err := exec.LookPath("pwsh"); err != nil {
		shell = "powershell"
	}

	cmd := exec.CommandContext(ctxTimeout, shell, "-NoProfile", "-NonInteractive", "-Command", command)
	cmd.Dir = ctx.CWD

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()

	var result strings.Builder
	if stdout.Len() > 0 {
		result.WriteString(stdout.String())
	}
	if stderr.Len() > 0 {
		if result.Len() > 0 {
			result.WriteString("\n")
		}
		result.WriteString(stderr.String())
	}

	if err != nil {
		if ctxTimeout.Err() == context.DeadlineExceeded {
			return types.ToolResult{
				Content: fmt.Sprintf("Command timed out after %v\n%s", timeout, result.String()),
				IsError: true,
			}
		}
		output := result.String()
		if output == "" {
			output = err.Error()
		}
		return types.ToolResult{Content: fmt.Sprintf("PowerShell error:\n%s", output), IsError: true}
	}

	output := result.String()
	if output == "" {
		output = "(no output)"
	}

	const maxOutput = 100000
	if len(output) > maxOutput {
		output = output[:maxOutput] + "\n\n... (output truncated)"
	}

	return types.ToolResult{Content: output}
}
