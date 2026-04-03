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

// BashTool executes shell commands
type BashTool struct{}

func NewBashTool() *BashTool { return &BashTool{} }

func (t *BashTool) Name() string { return "Bash" }

func (t *BashTool) Description() string {
	return `Executes a shell command and returns its output (stdout and stderr combined).

Use this tool to run system commands, build projects, run tests, manage git, and perform other terminal operations.

Important:
- Commands run in the current working directory
- Use absolute paths when possible
- Avoid interactive commands (no vim, nano, etc.)
- For file operations, prefer the dedicated Read/Edit/Write/Glob/Grep tools
- Timeout defaults to 120 seconds`
}

func (t *BashTool) InputSchema() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"command": map[string]any{
				"type":        "string",
				"description": "The shell command to execute",
			},
			"description": map[string]any{
				"type":        "string",
				"description": "Brief description of what this command does",
			},
			"timeout": map[string]any{
				"type":        "number",
				"description": "Timeout in milliseconds (default 120000, max 600000)",
			},
		},
		"required": []string{"command"},
	}
}

func (t *BashTool) IsReadOnly(input map[string]any) bool {
	cmd, _ := input["command"].(string)
	readOnlyPrefixes := []string{"ls", "cat", "head", "tail", "echo", "pwd", "which", "whoami",
		"date", "uname", "env", "printenv", "git status", "git log", "git diff", "git branch",
		"git show", "git remote", "go version", "node --version", "python --version"}
	lower := strings.ToLower(strings.TrimSpace(cmd))
	for _, prefix := range readOnlyPrefixes {
		if strings.HasPrefix(lower, prefix) {
			return true
		}
	}
	return false
}

func (t *BashTool) Execute(input map[string]any, ctx *ToolContext) types.ToolResult {
	command, ok := input["command"].(string)
	if !ok || command == "" {
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

	var cmd *exec.Cmd
	if runtime.GOOS == "windows" {
		// Use bash if available (Git Bash), otherwise cmd
		cmd = exec.CommandContext(ctxTimeout, "bash", "-c", command)
	} else {
		cmd = exec.CommandContext(ctxTimeout, "bash", "-c", command)
	}
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
		exitErr := ""
		if ee, ok := err.(*exec.ExitError); ok {
			exitErr = fmt.Sprintf(" (exit code %d)", ee.ExitCode())
		}
		output := result.String()
		if output == "" {
			output = err.Error()
		}
		return types.ToolResult{
			Content: fmt.Sprintf("Command failed%s:\n%s", exitErr, output),
			IsError: true,
		}
	}

	output := result.String()
	if output == "" {
		output = "(no output)"
	}

	// Truncate very large output
	const maxOutput = 100000
	if len(output) > maxOutput {
		output = output[:maxOutput] + "\n\n... (output truncated)"
	}

	return types.ToolResult{Content: output}
}
