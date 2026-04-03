package tools

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"os/exec"
	"strings"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/types"
)

// LSPTool provides Language Server Protocol integration
type LSPTool struct{}

func NewLSPTool() *LSPTool { return &LSPTool{} }
func (t *LSPTool) Name() string { return "LSP" }
func (t *LSPTool) Description() string {
	return `Interacts with a Language Server Protocol server for code intelligence features like go-to-definition, find references, diagnostics, and completions.`
}
func (t *LSPTool) InputSchema() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"action": map[string]any{
				"type":        "string",
				"enum":        []string{"definition", "references", "hover", "diagnostics", "completions"},
				"description": "LSP action to perform",
			},
			"file": map[string]any{
				"type":        "string",
				"description": "File path",
			},
			"line": map[string]any{
				"type":        "integer",
				"description": "Line number (0-indexed)",
			},
			"character": map[string]any{
				"type":        "integer",
				"description": "Character position (0-indexed)",
			},
			"language": map[string]any{
				"type":        "string",
				"description": "Language ID (e.g., 'go', 'typescript', 'python')",
			},
		},
		"required": []string{"action", "file"},
	}
}
func (t *LSPTool) IsReadOnly(_ map[string]any) bool { return true }

func (t *LSPTool) Execute(input map[string]any, ctx *ToolContext) types.ToolResult {
	action, _ := input["action"].(string)
	file, _ := input["file"].(string)
	line := 0
	if v, ok := input["line"].(float64); ok {
		line = int(v)
	}
	char := 0
	if v, ok := input["character"].(float64); ok {
		char = int(v)
	}
	language, _ := input["language"].(string)

	if language == "" {
		language = detectLanguage(file)
	}

	lspCmd := getLSPCommand(language)
	if lspCmd == "" {
		return types.ToolResult{
			Content: fmt.Sprintf("No LSP server found for language: %s", language),
			IsError: true,
		}
	}

	// Build LSP JSON-RPC request
	request := buildLSPRequest(action, file, line, char)

	cmd := exec.Command(lspCmd)
	cmd.Dir = ctx.CWD
	cmd.Stdin = strings.NewReader(request)
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		return types.ToolResult{
			Content: fmt.Sprintf("LSP error: %v\n%s", err, stderr.String()),
			IsError: true,
		}
	}

	return types.ToolResult{Content: stdout.String()}
}

func detectLanguage(file string) string {
	ext := ""
	if idx := strings.LastIndex(file, "."); idx >= 0 {
		ext = file[idx:]
	}
	switch ext {
	case ".go":
		return "go"
	case ".ts", ".tsx":
		return "typescript"
	case ".js", ".jsx":
		return "javascript"
	case ".py":
		return "python"
	case ".rs":
		return "rust"
	case ".java":
		return "java"
	case ".c", ".h":
		return "c"
	case ".cpp", ".cc", ".hpp":
		return "cpp"
	default:
		return ""
	}
}

func getLSPCommand(language string) string {
	commands := map[string]string{
		"go":         "gopls",
		"typescript": "typescript-language-server",
		"javascript": "typescript-language-server",
		"python":     "pylsp",
		"rust":       "rust-analyzer",
		"java":       "jdtls",
		"c":          "clangd",
		"cpp":        "clangd",
	}
	cmd, ok := commands[language]
	if !ok {
		return ""
	}
	if _, err := exec.LookPath(cmd); err != nil {
		return ""
	}
	return cmd
}

func buildLSPRequest(action, file string, line, char int) string {
	_ = io.Discard // suppress unused import
	method := ""
	switch action {
	case "definition":
		method = "textDocument/definition"
	case "references":
		method = "textDocument/references"
	case "hover":
		method = "textDocument/hover"
	case "diagnostics":
		method = "textDocument/diagnostic"
	case "completions":
		method = "textDocument/completion"
	}

	req := map[string]any{
		"jsonrpc": "2.0",
		"id":      1,
		"method":  method,
		"params": map[string]any{
			"textDocument": map[string]any{"uri": "file://" + file},
			"position":     map[string]any{"line": line, "character": char},
		},
	}
	data, _ := json.Marshal(req)
	content := string(data)
	return fmt.Sprintf("Content-Length: %d\r\n\r\n%s", len(content), content)
}
