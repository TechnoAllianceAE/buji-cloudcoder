package repl

import (
	"fmt"
	"io"
	"os"
	"strings"
	"time"

	"github.com/chzyer/readline"
	"github.com/fatih/color"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/config"
	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/engine"
	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/tools"
	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/types"
)

// Colors
var (
	colorPrompt   = color.New(color.FgCyan, color.Bold)
	colorAssist   = color.New(color.FgWhite)
	colorThink    = color.New(color.FgHiBlack)
	colorTool     = color.New(color.FgYellow)
	colorToolName = color.New(color.FgYellow, color.Bold)
	colorError    = color.New(color.FgRed)
	colorSuccess  = color.New(color.FgGreen)
	colorInfo     = color.New(color.FgHiBlack)
	colorBold     = color.New(color.Bold)
	colorDim      = color.New(color.FgHiBlack)
)

// REPL is the interactive read-eval-print loop
type REPL struct {
	engine *engine.QueryEngine
	rl     *readline.Instance
	cfg    types.SessionConfig
}

// New creates a new REPL
func New(apiKey string, cfg types.SessionConfig) (*REPL, error) {
	rl, err := readline.NewEx(&readline.Config{
		Prompt:          colorPrompt.Sprint("> "),
		HistoryFile:     getHistoryFile(),
		InterruptPrompt: "^C",
		EOFPrompt:       "exit",
	})
	if err != nil {
		return nil, fmt.Errorf("init readline: %w", err)
	}

	eng := engine.NewQueryEngine(apiKey, cfg)

	r := &REPL{
		engine: eng,
		rl:     rl,
		cfg:    cfg,
	}

	r.setupCallbacks()
	return r, nil
}

func (r *REPL) setupCallbacks() {
	isFirstText := true

	r.engine.OnStreamText = func(text string) {
		if isFirstText {
			fmt.Println()
			isFirstText = false
		}
		colorAssist.Print(text)
	}

	r.engine.OnStreamThink = func(text string) {
		colorThink.Print(text)
	}

	r.engine.OnToolUse = func(name string, input map[string]any) {
		isFirstText = true
		fmt.Println()
		colorToolName.Printf("  %s", name)

		switch name {
		case "Bash":
			if cmd, ok := input["command"].(string); ok {
				colorTool.Printf(": %s", truncate(cmd, 100))
			}
		case "PowerShell":
			if cmd, ok := input["command"].(string); ok {
				colorTool.Printf(": %s", truncate(cmd, 100))
			}
		case "Read":
			if path, ok := input["file_path"].(string); ok {
				colorTool.Printf(": %s", path)
			}
		case "Write":
			if path, ok := input["file_path"].(string); ok {
				colorTool.Printf(": %s", path)
			}
		case "Edit":
			if path, ok := input["file_path"].(string); ok {
				colorTool.Printf(": %s", path)
			}
		case "Glob":
			if pat, ok := input["pattern"].(string); ok {
				colorTool.Printf(": %s", pat)
			}
		case "Grep":
			if pat, ok := input["pattern"].(string); ok {
				colorTool.Printf(": %s", pat)
			}
		case "WebFetch":
			if url, ok := input["url"].(string); ok {
				colorTool.Printf(": %s", truncate(url, 80))
			}
		case "WebSearch":
			if q, ok := input["query"].(string); ok {
				colorTool.Printf(": %s", truncate(q, 80))
			}
		case "NotebookEdit":
			if path, ok := input["file_path"].(string); ok {
				op, _ := input["operation"].(string)
				colorTool.Printf(": %s %s", op, path)
			}
		case "AskUserQuestion":
			// Don't show preview, the tool will prompt
		}
		fmt.Println()
	}

	r.engine.OnToolResult = func(name string, result types.ToolResult) {
		if result.IsError {
			colorError.Printf("  ✗ %s\n", truncate(result.Content, 200))
		} else {
			lines := strings.Split(result.Content, "\n")
			preview := result.Content
			if len(lines) > 5 {
				preview = strings.Join(lines[:5], "\n") + fmt.Sprintf("\n  ... (%d more lines)", len(lines)-5)
			}
			if len(preview) > 500 {
				preview = preview[:500] + "..."
			}
			colorInfo.Printf("  %s\n", preview)
		}
	}

	r.engine.OnTurnComplete = func(resp *types.APIResponse) {
		isFirstText = true
	}

	r.engine.OnError = func(err error) {
		colorError.Printf("\nError: %v\n", err)
	}

	r.engine.OnCompact = func(before, after int) {
		colorDim.Printf("\n  Context compacted: %d messages -> %d messages\n", before, after)
	}

	r.engine.AskPermission = func(toolName string, input map[string]any, description string) bool {
		colorTool.Printf("\n  ? Allow: %s\n", description)
		fmt.Print("  [Y/n]: ")

		line, err := r.rl.Readline()
		if err != nil {
			return false
		}
		line = strings.TrimSpace(strings.ToLower(line))
		return line == "" || line == "y" || line == "yes"
	}
}

// Run starts the REPL loop
func (r *REPL) Run() error {
	defer r.rl.Close()

	r.printWelcome()

	for {
		r.rl.SetPrompt(colorPrompt.Sprint("> "))
		line, err := r.rl.Readline()
		if err != nil {
			if err == readline.ErrInterrupt {
				continue
			}
			if err == io.EOF {
				fmt.Println("\nGoodbye!")
				return nil
			}
			return err
		}

		input := strings.TrimSpace(line)
		if input == "" {
			continue
		}

		// Handle local commands
		if strings.HasPrefix(input, "/") {
			if r.handleCommand(input) {
				continue
			}
		}

		// Handle shell escape
		if strings.HasPrefix(input, "!") {
			cmd := strings.TrimPrefix(input, "!")
			if err := r.engine.SubmitMessage(fmt.Sprintf("Run this command and show me the output: %s", cmd)); err != nil {
				colorError.Printf("Error: %v\n", err)
			}
			fmt.Println()
			_ = r.engine.SaveSession()
			continue
		}

		// Submit to bc2
		if err := r.engine.SubmitMessage(input); err != nil {
			colorError.Printf("\nError: %v\n", err)
		}
		fmt.Println()

		// Auto-save
		_ = r.engine.SaveSession()
	}
}

// handleCommand processes slash commands, returns true if handled
func (r *REPL) handleCommand(input string) bool {
	parts := strings.Fields(input)
	cmd := strings.ToLower(parts[0])

	switch cmd {
	case "/help":
		r.printHelp()
		return true

	case "/clear":
		r.engine.ClearMessages()
		colorSuccess.Println("Conversation cleared.")
		return true

	case "/model":
		if len(parts) > 1 {
			r.engine.SetModel(parts[1])
			colorSuccess.Printf("Model set to: %s\n", parts[1])
		} else {
			fmt.Printf("Current model: %s\n", r.engine.GetModel())
		}
		return true

	case "/cost":
		fmt.Println(r.engine.GetCostTracker().Format())
		return true

	case "/usage":
		usage := r.engine.GetUsage()
		fmt.Printf("Token usage:\n")
		fmt.Printf("  Input:  %d tokens\n", usage.InputTokens)
		fmt.Printf("  Output: %d tokens\n", usage.OutputTokens)
		if usage.CacheReadInputTokens > 0 {
			fmt.Printf("  Cache read:     %d tokens\n", usage.CacheReadInputTokens)
		}
		if usage.CacheCreationInputTokens > 0 {
			fmt.Printf("  Cache creation: %d tokens\n", usage.CacheCreationInputTokens)
		}
		return true

	case "/context":
		fmt.Println(r.engine.GetContextUsage())
		return true

	case "/compact":
		fmt.Println("Compacting conversation...")
		if err := r.engine.Compact(); err != nil {
			colorError.Printf("Compact failed: %v\n", err)
		} else {
			colorSuccess.Println("Conversation compacted successfully.")
		}
		return true

	case "/diff":
		fmt.Println(r.engine.GetDiff())
		return true

	case "/files":
		files := r.engine.GetModifiedFiles()
		if len(files) == 0 {
			fmt.Println("No files modified in this session.")
		} else {
			fmt.Println("Modified files:")
			for _, f := range files {
				fmt.Printf("  %s\n", f)
			}
		}
		return true

	case "/resume":
		r.handleResume()
		return true

	case "/session":
		fmt.Printf("Session ID: %s\n", r.engine.GetSessionID())
		fmt.Printf("Messages:   %d\n", len(r.engine.GetMessages()))
		fmt.Printf("Model:      %s\n", r.engine.GetModel())
		git := r.engine.GetGitInfo()
		if git.IsRepo {
			fmt.Printf("Git branch: %s\n", git.Branch)
		}
		return true

	case "/export":
		r.handleExport(parts)
		return true

	case "/doctor":
		results := engine.RunDiagnostics()
		fmt.Print(engine.FormatDiagnostics(results))
		return true

	case "/plan":
		colorSuccess.Println("Entering plan mode. Tool calls will be shown but not executed.")
		return false

	case "/skills":
		r.handleSkills()
		return true

	case "/plugins":
		pm := engine.NewPluginManager()
		fmt.Println(pm.FormatPluginList())
		return true

	case "/memory":
		r.handleMemory(parts)
		return true

	case "/config":
		r.handleConfig(parts)
		return true

	case "/permissions":
		fmt.Println("Permission mode: " + r.cfg.PermissionMode)
		fmt.Println("\nAvailable modes:")
		fmt.Println("  default          - Ask for non-read-only operations")
		fmt.Println("  bypassPermissions - Allow all operations")
		fmt.Println("  plan             - Dry-run mode (show but don't execute)")
		fmt.Println("  acceptEdits      - Auto-allow file edits")
		return true

	case "/mcp":
		fmt.Println("MCP servers are configured in ~/.bc2/settings.json under 'mcpServers'.")
		fmt.Println("Use ListMcpResources and ReadMcpResource tools to interact with servers.")
		return true

	case "/team":
		fmt.Println(tools.ListTeammates(nil))
		return true

	case "/tasks":
		bgMgr := engine.GetBackgroundTaskManager()
		fmt.Println(bgMgr.FormatTaskList())
		return true

	case "/login":
		r.handleLogin()
		return true

	case "/logout":
		svc := engine.NewOAuthService(engine.DefaultOAuthConfig())
		if err := svc.Logout(); err != nil {
			colorError.Printf("Logout failed: %v\n", err)
		} else {
			colorSuccess.Println("Logged out successfully.")
		}
		return true

	case "/providers":
		providers := r.engine.GetProviders().ListProviders()
		if len(providers) == 0 {
			fmt.Println("No providers registered.")
		} else {
			fmt.Println("Registered Providers:")
			for _, p := range providers {
				fmt.Printf("  - %s\n", p)
			}
			fmt.Println()
			fmt.Println("Use provider/model notation to switch:")
			fmt.Println("  /model openai/gpt-4o")
			fmt.Println("  /model ollama/llama3")
			fmt.Println("  /model openrouter/meta-llama/llama-3-70b")
			fmt.Println("  /model anthropic/claude-sonnet-4-20250514")
		}
		return true

	case "/version":
		fmt.Println("bc2 v0.2.0")
		return true

	case "/exit", "/quit":
		_ = r.engine.SaveSession()
		fmt.Println("Goodbye!")
		os.Exit(0)
		return true

	default:
		// Unknown command — send it as a prompt (it might be a skill name)
		return false
	}
}

func (r *REPL) handleResume() {
	store := r.engine.GetSessionStore()
	sessions, err := store.List(20)
	if err != nil {
		colorError.Printf("Error listing sessions: %v\n", err)
		return
	}

	if len(sessions) == 0 {
		fmt.Println("No previous sessions found.")
		return
	}

	fmt.Println("\nRecent sessions:")
	for i, s := range sessions {
		title := s.Title
		if title == "" {
			title = store.GetSessionPreview(s.ID, 60)
		}
		age := ""
		if !s.UpdatedAt.IsZero() {
			age = fmt.Sprintf(" (%s ago)", formatDuration(s.UpdatedAt))
		}
		colorDim.Printf("  %2d. ", i+1)
		fmt.Printf("%s%s\n", truncate(title, 70), age)
	}

	fmt.Print("\nEnter number to resume (or press Enter to cancel): ")
	line, err := r.rl.Readline()
	if err != nil || strings.TrimSpace(line) == "" {
		return
	}

	idx := 0
	_, _ = fmt.Sscanf(strings.TrimSpace(line), "%d", &idx)
	if idx < 1 || idx > len(sessions) {
		colorError.Println("Invalid selection.")
		return
	}

	session := sessions[idx-1]
	msgs, meta, err := store.Load(session.ID)
	if err != nil {
		colorError.Printf("Error loading session: %v\n", err)
		return
	}

	r.engine.SetMessages(msgs)
	if meta != nil && meta.Model != "" {
		r.engine.SetModel(meta.Model)
	}

	colorSuccess.Printf("Resumed session: %s (%d messages)\n", session.ID[:8], len(msgs))
}

func (r *REPL) handleExport(parts []string) {
	format := "text"
	if len(parts) > 1 {
		format = parts[1]
	}

	messages := r.engine.GetMessages()
	if len(messages) == 0 {
		fmt.Println("No messages to export.")
		return
	}

	var sb strings.Builder
	for _, msg := range messages {
		role := strings.ToUpper(msg.Role[:1]) + msg.Role[1:]
		for _, block := range msg.Content {
			switch block.Type {
			case "text":
				if format == "markdown" {
					sb.WriteString(fmt.Sprintf("### %s\n\n%s\n\n", role, block.Text))
				} else {
					sb.WriteString(fmt.Sprintf("[%s]: %s\n\n", role, block.Text))
				}
			case "tool_use":
				sb.WriteString(fmt.Sprintf("[%s]: Used tool: %s\n\n", role, block.Name))
			case "tool_result":
				if s, ok := block.Content.(string); ok {
					content := s
					if len(content) > 500 {
						content = content[:500] + "..."
					}
					sb.WriteString(fmt.Sprintf("[Tool Result]: %s\n\n", content))
				}
			}
		}
	}

	exportPath := fmt.Sprintf("conversation-%s.%s", r.engine.GetSessionID()[:8], format)
	if format == "markdown" {
		exportPath = fmt.Sprintf("conversation-%s.md", r.engine.GetSessionID()[:8])
	}
	if err := os.WriteFile(exportPath, []byte(sb.String()), 0644); err != nil {
		colorError.Printf("Error exporting: %v\n", err)
		return
	}
	colorSuccess.Printf("Exported to: %s\n", exportPath)
}

func (r *REPL) handleSkills() {
	sl := engine.NewSkillLoader()
	skills := sl.GetSkills()
	if len(skills) == 0 {
		fmt.Println("No skills found. Add skills to ~/.bc2/skills/ or .bc2/skills/")
		return
	}
	fmt.Println("Available Skills:")
	for name, skill := range skills {
		desc := skill.Description
		if desc == "" {
			desc = "(no description)"
		}
		fmt.Printf("  /%s — %s [%s]\n", name, desc, skill.Source)
	}
}

func (r *REPL) handleMemory(parts []string) {
	mem := engine.NewMemoryStore(config.GetCWD())
	if len(parts) > 1 && parts[1] == "list" {
		memories, err := mem.Load()
		if err != nil {
			colorError.Printf("Error: %v\n", err)
			return
		}
		if len(memories) == 0 {
			fmt.Println("No memories stored.")
			return
		}
		fmt.Println("Memories:")
		for _, m := range memories {
			fmt.Printf("  [%s] %s — %s\n", m.Type, m.Name, m.Description)
		}
		return
	}
	// Show index
	idx := mem.GetIndex()
	if idx == "" {
		fmt.Println("No memories. Memories are automatically created during conversations.")
	} else {
		fmt.Println("Memory Index:")
		fmt.Println(idx)
	}
}

func (r *REPL) handleConfig(parts []string) {
	sh := engine.NewSettingsHierarchy(config.GetCWD())
	if len(parts) > 2 {
		// /config set key value
		if parts[1] == "set" {
			key := parts[2]
			val := strings.Join(parts[3:], " ")
			sh.Set(key, val)
			_ = sh.SaveUser()
			colorSuccess.Printf("Set %s = %s\n", key, val)
			return
		}
		// /config get key
		if parts[1] == "get" {
			val, ok := sh.Get(parts[2])
			if ok {
				fmt.Printf("%s = %v\n", parts[2], val)
			} else {
				fmt.Printf("%s: not set\n", parts[2])
			}
			return
		}
	}
	// Show all settings
	merged := sh.GetAllMerged()
	if len(merged) == 0 {
		fmt.Println("No settings configured.")
		fmt.Println("Usage: /config set <key> <value>")
		return
	}
	fmt.Println("Settings:")
	for k, v := range merged {
		fmt.Printf("  %s = %v\n", k, v)
	}
}

func (r *REPL) handleLogin() {
	svc := engine.NewOAuthService(engine.DefaultOAuthConfig())
	tokens, err := svc.Login()
	if err != nil {
		colorError.Printf("Login failed: %v\n", err)
		return
	}
	colorSuccess.Printf("Login successful! Token expires: %s\n", tokens.ExpiresAt.Format(time.RFC3339))
}

func (r *REPL) printWelcome() {
	colorBold.Println("+-----------------------------------------+")
	colorBold.Println("|         BujiCloudCoder (bc2)            |")
	colorBold.Println("|              by TA                      |")
	colorBold.Println("+-----------------------------------------+")
	fmt.Println()
	colorInfo.Printf("  Model: %s\n", r.cfg.Model)
	colorInfo.Printf("  CWD:   %s\n", config.GetCWD())
	git := r.engine.GetGitInfo()
	if git.IsRepo {
		colorInfo.Printf("  Git:   %s\n", git.Branch)
	}
	fmt.Println()
	colorInfo.Println("  Type /help for commands, /exit to quit")
	fmt.Println()
}

func (r *REPL) printHelp() {
	fmt.Println()
	colorBold.Println("Commands:")
	fmt.Println("  /help          Show this help message")
	fmt.Println("  /model [name]  Get or set the model")
	fmt.Println("  /cost          Show session cost breakdown")
	fmt.Println("  /usage         Show token usage")
	fmt.Println("  /context       Show context window usage")
	fmt.Println("  /compact       Compress conversation history")
	fmt.Println("  /diff          Show diffs of modified files")
	fmt.Println("  /files         List files modified this session")
	fmt.Println("  /resume        Resume a previous session")
	fmt.Println("  /session       Show current session info")
	fmt.Println("  /export [fmt]  Export conversation (text/markdown)")
	fmt.Println("  /doctor        Run system diagnostics")
	fmt.Println("  /plan          Enter plan mode (dry-run)")
	fmt.Println("  /skills        List available skills")
	fmt.Println("  /plugins       List installed plugins")
	fmt.Println("  /memory [list] Show memory index or list")
	fmt.Println("  /config        View/set configuration")
	fmt.Println("  /mcp           MCP server info")
	fmt.Println("  /team          List teammates")
	fmt.Println("  /tasks         List background tasks")
	fmt.Println("  /providers     List registered LLM providers")
	fmt.Println("  /permissions   Show permission settings")
	fmt.Println("  /login         OAuth login")
	fmt.Println("  /logout        Clear saved credentials")
	fmt.Println("  /version       Show version")
	fmt.Println("  /clear         Clear conversation history")
	fmt.Println("  /exit          Exit the program")
	fmt.Println()
	fmt.Println("  !<command>     Run a shell command via bc2")
	fmt.Println()
}

func getHistoryFile() string {
	return config.GetConfigDir() + "/bc2-history"
}

func truncate(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	return s[:maxLen-3] + "..."
}

func formatDuration(t time.Time) string {
	d := time.Since(t)
	switch {
	case d < time.Minute:
		return "just now"
	case d < time.Hour:
		return fmt.Sprintf("%dm", int(d.Minutes()))
	case d < 24*time.Hour:
		return fmt.Sprintf("%dh", int(d.Hours()))
	default:
		return fmt.Sprintf("%dd", int(d.Hours()/24))
	}
}
