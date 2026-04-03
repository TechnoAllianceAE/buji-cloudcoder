package engine

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"
	"time"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/api"
	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/config"
	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/tools"
	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/types"
	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/utils"
)

// QueryEngine manages the conversation loop
type QueryEngine struct {
	client      *api.Client
	cfg         types.SessionConfig
	registry    *tools.Registry
	messages    []types.Message
	usage       types.Usage
	sessionID   string
	cwd         string
	costTracker *CostTracker
	permissions *PermissionChecker
	sessions    *SessionStore
	fileHistory *FileHistory
	gitInfo     GitInfo
	compact     CompactConfig

	// Callbacks
	OnStreamText   func(text string)
	OnStreamThink  func(text string)
	OnToolUse      func(name string, input map[string]any)
	OnToolResult   func(name string, result types.ToolResult)
	OnTurnComplete func(response *types.APIResponse)
	OnError        func(err error)
	OnCompact      func(beforeTokens, afterTokens int)

	// Permission callback: return true to allow, false to deny
	AskPermission func(toolName string, input map[string]any, description string) bool
}

// NewQueryEngine creates a new query engine
func NewQueryEngine(apiKey string, cfg types.SessionConfig) *QueryEngine {
	appCfg := config.Load()
	baseURL := appCfg.BaseURL
	sessionID := utils.GenerateUUID()
	cwd := config.GetCWD()

	sessDir := filepath.Join(config.GetSessionsDir(), sessionID)

	return &QueryEngine{
		client:      api.NewClient(apiKey, baseURL),
		cfg:         cfg,
		registry:    tools.NewRegistry(),
		messages:    nil,
		sessionID:   sessionID,
		cwd:         cwd,
		costTracker: NewCostTracker(),
		permissions: NewPermissionChecker(cfg.PermissionMode),
		sessions:    NewSessionStore(),
		fileHistory: NewFileHistory(sessDir),
		gitInfo:     DetectGit(cwd),
		compact:     DefaultCompactConfig(),
	}
}

// GetSessionID returns the session ID
func (e *QueryEngine) GetSessionID() string { return e.sessionID }

// GetMessages returns the conversation messages
func (e *QueryEngine) GetMessages() []types.Message { return e.messages }

// GetUsage returns the accumulated usage
func (e *QueryEngine) GetUsage() types.Usage { return e.usage }

// GetCostTracker returns the cost tracker
func (e *QueryEngine) GetCostTracker() *CostTracker { return e.costTracker }

// GetGitInfo returns git repo information
func (e *QueryEngine) GetGitInfo() GitInfo { return e.gitInfo }

// SetModel changes the model
func (e *QueryEngine) SetModel(model string) { e.cfg.Model = model }

// GetModel returns the current model
func (e *QueryEngine) GetModel() string { return e.cfg.Model }

// ClearMessages clears the conversation history
func (e *QueryEngine) ClearMessages() { e.messages = nil }

// SetMessages replaces conversation history (for session resume)
func (e *QueryEngine) SetMessages(msgs []types.Message) { e.messages = msgs }

// GetSessionStore returns the session store
func (e *QueryEngine) GetSessionStore() *SessionStore { return e.sessions }

// buildSystemPrompt constructs the system prompt
func (e *QueryEngine) buildSystemPrompt() string {
	if e.cfg.SystemPrompt != "" {
		return e.cfg.SystemPrompt
	}

	var sb strings.Builder

	sb.WriteString(`You are BujiCloudCoder (bc2), a CLI-based AI coding assistant built by TA. You help users with software engineering tasks including writing code, debugging, refactoring, and explaining code.

# Tools
You have access to tools for interacting with the filesystem, running commands, and searching code. Use the appropriate tool for each task:
- Bash: Execute shell commands
- Read: Read file contents with line numbers
- Edit: Make exact string replacements in files
- Write: Create or overwrite files
- Glob: Find files by pattern
- Grep: Search file contents with regex
- WebFetch: Fetch content from URLs
- WebSearch: Search the web
- NotebookEdit: Edit Jupyter notebook cells
- AskUserQuestion: Ask the user for clarification
- PowerShell: Execute PowerShell commands (Windows)

# Guidelines
- Read files before modifying them
- Use absolute paths
- Prefer Edit over Write for existing files
- Keep responses concise and direct
- Don't add unnecessary comments or docstrings
- Focus on what was asked, don't add extra features
- Be careful not to introduce security vulnerabilities
- Don't use Bash for file operations when dedicated tools exist

`)

	// Environment info
	sb.WriteString("# Environment\n")
	sb.WriteString(fmt.Sprintf("- Working directory: %s\n", e.cwd))
	sb.WriteString(fmt.Sprintf("- Platform: %s/%s\n", runtime.GOOS, runtime.GOARCH))
	sb.WriteString(fmt.Sprintf("- Shell: %s\n", config.GetShell()))

	if e.gitInfo.IsRepo {
		sb.WriteString("- Git repository: yes\n")
		if e.gitInfo.Branch != "" {
			sb.WriteString(fmt.Sprintf("- Git branch: %s\n", e.gitInfo.Branch))
		}
	}

	// Date
	sb.WriteString(fmt.Sprintf("- Current date: %s\n", time.Now().Format("2006-01-02")))
	sb.WriteString(fmt.Sprintf("- Model: %s\n", e.cfg.Model))

	// Load project instructions from BC2.md or CLAUDE.md (backwards compat)
	for _, mdName := range []string{"BC2.md", "CLAUDE.md"} {
		mdPath := filepath.Join(e.cwd, mdName)
		if data, err := os.ReadFile(mdPath); err == nil {
			sb.WriteString(fmt.Sprintf("\n# Project Instructions (%s)\n", mdName))
			sb.WriteString(string(data))
			sb.WriteString("\n")
			break
		}
	}

	// Also check parent directories
	dir := filepath.Dir(e.cwd)
	for i := 0; i < 5; i++ {
		found := false
		for _, mdName := range []string{"BC2.md", "CLAUDE.md"} {
			parentMD := filepath.Join(dir, mdName)
			if data, err := os.ReadFile(parentMD); err == nil {
				sb.WriteString(fmt.Sprintf("\n# Parent Project Instructions (%s)\n", parentMD))
				sb.WriteString(string(data))
				sb.WriteString("\n")
				found = true
				break
			}
		}
		if found {
			break
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			break
		}
		dir = parent
	}

	return sb.String()
}

// SubmitMessage sends a user message and processes the full agentic loop
func (e *QueryEngine) SubmitMessage(prompt string) error {
	// Add user message
	userMsg := types.Message{
		Role: types.RoleUser,
		Content: []types.ContentBlock{
			{Type: "text", Text: prompt},
		},
	}
	e.messages = append(e.messages, userMsg)

	// Run the agentic loop
	return e.runLoop()
}

// runLoop executes the agentic loop: API call -> tool execution -> repeat
func (e *QueryEngine) runLoop() error {
	toolCtx := &tools.ToolContext{
		CWD:            e.cwd,
		PermissionMode: e.cfg.PermissionMode,
		CanUseTool: func(toolName string, input map[string]any) (bool, string) {
			tool, ok := e.registry.Get(toolName)
			if !ok {
				return false, "unknown tool"
			}

			isReadOnly := tool.IsReadOnly(input)

			// Use permission checker
			result := e.permissions.Check(toolName, input, isReadOnly)

			switch result.Behavior {
			case "allow":
				return true, ""
			case "deny":
				return false, result.Reason
			case "ask":
				if e.AskPermission != nil {
					desc := formatToolDescription(toolName, input)
					if e.AskPermission(toolName, input, desc) {
						return true, ""
					}
					return false, "user denied permission"
				}
				return true, "" // No permission callback, allow
			}
			return true, ""
		},
	}

	retryCfg := api.DefaultRetryConfig()

	for turn := 0; turn < e.cfg.MaxTurns; turn++ {
		// Check for auto-compact
		if e.compact.ShouldCompact(e.usage.InputTokens) {
			compacted, err := CompactMessages(e.client, e.messages, e.cfg.Model)
			if err == nil {
				beforeLen := len(e.messages)
				e.messages = compacted
				if e.OnCompact != nil {
					e.OnCompact(beforeLen, len(compacted))
				}
			}
		}

		// Build API request
		req := api.MessagesRequest{
			Model:     e.cfg.Model,
			MaxTokens: e.cfg.MaxTokens,
			Messages:  e.messages,
			System:    e.buildSystemPrompt(),
			Tools:     e.registry.GetToolDefinitions(),
		}

		if e.cfg.Temperature != nil {
			req.Temperature = e.cfg.Temperature
		}

		if e.cfg.EnableThinking {
			budget := e.cfg.ThinkingBudget
			if budget == 0 {
				budget = 10000
			}
			req.Thinking = &api.ThinkingConfig{
				Type:         "enabled",
				BudgetTokens: budget,
			}
		}

		// Stream the response with retry
		resp, err := e.client.CreateMessageStreamWithRetry(req, func(event types.StreamEvent) error {
			switch event.Type {
			case "content_block_delta":
				if event.Delta != nil {
					if event.Delta.Text != "" && e.OnStreamText != nil {
						e.OnStreamText(event.Delta.Text)
					}
					if event.Delta.Thinking != "" && e.OnStreamThink != nil {
						e.OnStreamThink(event.Delta.Thinking)
					}
				}
			}
			return nil
		}, retryCfg)

		if err != nil {
			if e.OnError != nil {
				e.OnError(err)
			}
			return fmt.Errorf("API error: %w", err)
		}

		// Track cost
		e.usage.InputTokens += resp.Usage.InputTokens
		e.usage.OutputTokens += resp.Usage.OutputTokens
		e.usage.CacheReadInputTokens += resp.Usage.CacheReadInputTokens
		e.usage.CacheCreationInputTokens += resp.Usage.CacheCreationInputTokens
		e.costTracker.Add(e.cfg.Model,
			resp.Usage.InputTokens, resp.Usage.OutputTokens,
			resp.Usage.CacheReadInputTokens, resp.Usage.CacheCreationInputTokens,
		)

		// Add assistant message to history
		assistantMsg := types.Message{
			Role:    types.RoleAssistant,
			Content: resp.Content,
		}
		e.messages = append(e.messages, assistantMsg)

		if e.OnTurnComplete != nil {
			e.OnTurnComplete(resp)
		}

		// Check stop conditions
		if resp.StopReason == types.StopReasonEndTurn || resp.StopReason == types.StopReasonStopSequence {
			return nil
		}

		// Handle max_tokens (context recovery)
		if resp.StopReason == types.StopReasonMaxTokens {
			// Try micro-compact and retry
			e.messages = MicroCompact(e.messages)
			continue
		}

		// Extract and execute tool uses
		var toolResults []types.ContentBlock
		for _, block := range resp.Content {
			if block.Type != "tool_use" {
				continue
			}

			toolName := block.Name
			toolInput := parseToolInput(block.Input)

			if e.OnToolUse != nil {
				e.OnToolUse(toolName, toolInput)
			}

			// Snapshot file before modification
			if !isReadOnlyTool(toolName) {
				if fp := extractFilePathFromInput(toolInput); fp != "" {
					_ = e.fileHistory.Snapshot(fp, block.ID, toolName)
				}
			}

			result := e.registry.ExecuteTool(toolName, toolInput, toolCtx)

			if e.OnToolResult != nil {
				e.OnToolResult(toolName, result)
			}

			toolResults = append(toolResults, types.ContentBlock{
				Type:      "tool_result",
				ToolUseID: block.ID,
				Content:   result.Content,
				IsError:   result.IsError,
			})
		}

		if len(toolResults) == 0 {
			return nil
		}

		// Add tool results as user message
		toolMsg := types.Message{
			Role:    types.RoleUser,
			Content: toolResults,
		}
		e.messages = append(e.messages, toolMsg)
	}

	return fmt.Errorf("max turns (%d) exceeded", e.cfg.MaxTurns)
}

// parseToolInput converts the raw tool input to a map
func parseToolInput(raw any) map[string]any {
	switch v := raw.(type) {
	case map[string]any:
		return v
	default:
		data, err := json.Marshal(raw)
		if err != nil {
			return map[string]any{}
		}
		var result map[string]any
		if err := json.Unmarshal(data, &result); err != nil {
			return map[string]any{}
		}
		return result
	}
}

// formatToolDescription creates a human-readable description of a tool call
func formatToolDescription(name string, input map[string]any) string {
	switch name {
	case "Bash":
		cmd, _ := input["command"].(string)
		return fmt.Sprintf("Run command: %s", cmd)
	case "PowerShell":
		cmd, _ := input["command"].(string)
		return fmt.Sprintf("Run PowerShell: %s", cmd)
	case "Read":
		path, _ := input["file_path"].(string)
		return fmt.Sprintf("Read file: %s", path)
	case "Write":
		path, _ := input["file_path"].(string)
		return fmt.Sprintf("Write file: %s", path)
	case "Edit":
		path, _ := input["file_path"].(string)
		return fmt.Sprintf("Edit file: %s", path)
	case "NotebookEdit":
		path, _ := input["file_path"].(string)
		op, _ := input["operation"].(string)
		return fmt.Sprintf("Notebook %s: %s", op, path)
	case "Glob":
		pat, _ := input["pattern"].(string)
		return fmt.Sprintf("Find files: %s", pat)
	case "Grep":
		pat, _ := input["pattern"].(string)
		return fmt.Sprintf("Search content: %s", pat)
	case "WebFetch":
		url, _ := input["url"].(string)
		return fmt.Sprintf("Fetch URL: %s", url)
	case "WebSearch":
		q, _ := input["query"].(string)
		return fmt.Sprintf("Web search: %s", q)
	default:
		return fmt.Sprintf("Use tool: %s", name)
	}
}

func isReadOnlyTool(name string) bool {
	switch name {
	case "Read", "Glob", "Grep", "WebFetch", "WebSearch", "AskUserQuestion":
		return true
	}
	return false
}

func extractFilePathFromInput(input map[string]any) string {
	if p, ok := input["file_path"].(string); ok {
		return p
	}
	return ""
}

// SaveSession saves the current session to disk
func (e *QueryEngine) SaveSession() error {
	meta := SessionMeta{
		ID:        e.sessionID,
		Model:     e.cfg.Model,
		CWD:       e.cwd,
		CreatedAt: time.Now(),
		CostUSD:   e.costTracker.GetTotalCost(),
	}

	// Generate title from first user message
	for _, msg := range e.messages {
		if msg.Role == types.RoleUser {
			for _, block := range msg.Content {
				if block.Type == "text" {
					title := block.Text
					if len(title) > 80 {
						title = title[:80] + "..."
					}
					meta.Title = strings.ReplaceAll(title, "\n", " ")
					break
				}
			}
			break
		}
	}

	return e.sessions.Save(e.sessionID, e.messages, meta)
}

// SaveTranscript saves the conversation to a file (legacy)
func (e *QueryEngine) SaveTranscript() error {
	return e.SaveSession()
}

// Compact triggers manual conversation compaction
func (e *QueryEngine) Compact() error {
	compacted, err := CompactMessages(e.client, e.messages, e.cfg.Model)
	if err != nil {
		return err
	}
	e.messages = compacted
	return nil
}

// GetContextUsage returns context window usage info
func (e *QueryEngine) GetContextUsage() string {
	var sb strings.Builder
	sb.WriteString("Context Window Usage\n")
	sb.WriteString("────────────────────\n")
	sb.WriteString(fmt.Sprintf("  Messages:     %d\n", len(e.messages)))
	sb.WriteString(fmt.Sprintf("  Input tokens:  %s\n", formatNumber(e.usage.InputTokens)))
	sb.WriteString(fmt.Sprintf("  Output tokens: %s\n", formatNumber(e.usage.OutputTokens)))

	pct := float64(e.usage.InputTokens) / float64(e.compact.ContextWindow) * 100
	sb.WriteString(fmt.Sprintf("  Context used:  %.1f%%\n", pct))

	if pct > 75 {
		sb.WriteString("  ⚠ Context window is getting full. Consider using /compact.\n")
	}

	return sb.String()
}

// GetModifiedFiles returns files modified during this session
func (e *QueryEngine) GetModifiedFiles() []string {
	return e.fileHistory.GetAllModifiedFiles()
}

// RewindFile undoes changes to a file
func (e *QueryEngine) RewindFile(path string, steps int) error {
	return e.fileHistory.Rewind(path, steps)
}

// GetDiff returns the git diff for the session's modified files
func (e *QueryEngine) GetDiff() string {
	files := e.fileHistory.GetAllModifiedFiles()
	if len(files) == 0 {
		return "No files modified in this session."
	}

	var sb strings.Builder
	for _, f := range files {
		diff := GetGitDiff(e.cwd, f)
		if diff != "" {
			sb.WriteString(fmt.Sprintf("--- %s ---\n%s\n", f, diff))
		}
	}

	if sb.Len() == 0 {
		sb.WriteString("Modified files:\n")
		for _, f := range files {
			sb.WriteString(fmt.Sprintf("  %s\n", f))
		}
	}

	return sb.String()
}

// itoa converts int to string (replacing the broken one in git.go)
func itoaFmt(n int) string {
	return strconv.Itoa(n)
}
