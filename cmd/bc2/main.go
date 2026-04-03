package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"strings"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/api"
	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/config"
	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/engine"
	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/repl"
	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/types"
)

const version = "0.2.0"

func main() {
	// Flags
	var (
		showVersion    bool
		showDoctor     bool
		model          string
		prompt         string
		maxTokens      int
		permMode       string
		enableThinking bool
		thinkingBudget int
		outputJSON     bool
		systemPrompt   string
		jsonSchema     string
	)

	flag.BoolVar(&showVersion, "version", false, "Show version")
	flag.BoolVar(&showDoctor, "doctor", false, "Run diagnostics")
	flag.StringVar(&model, "model", "", "Model to use (default: claude-sonnet-4-20250514)")
	flag.StringVar(&prompt, "p", "", "Send a single prompt (non-interactive mode)")
	flag.IntVar(&maxTokens, "max-tokens", 0, "Maximum output tokens")
	flag.StringVar(&permMode, "permissions", "", "Permission mode: default, bypassPermissions, plan")
	flag.BoolVar(&enableThinking, "thinking", false, "Enable extended thinking")
	flag.IntVar(&thinkingBudget, "thinking-budget", 10000, "Thinking token budget")
	flag.BoolVar(&outputJSON, "json", false, "Output final result as JSON (non-interactive)")
	flag.StringVar(&systemPrompt, "system", "", "Custom system prompt")
	flag.StringVar(&jsonSchema, "schema", "", "JSON schema for structured output (file path or inline JSON)")

	flag.Usage = func() {
		fmt.Fprintf(os.Stderr, "BujiCloudCoder (bc2) v%s — by TA\n\n", version)
		fmt.Fprintf(os.Stderr, "Usage:\n")
		fmt.Fprintf(os.Stderr, "  bc2                       Interactive REPL mode\n")
		fmt.Fprintf(os.Stderr, "  bc2 -p \"prompt\"            Non-interactive single prompt\n")
		fmt.Fprintf(os.Stderr, "  echo \"prompt\" | bc2        Pipe input mode\n")
		fmt.Fprintf(os.Stderr, "  bc2 -doctor                Run system diagnostics\n")
		fmt.Fprintf(os.Stderr, "\nFlags:\n")
		flag.PrintDefaults()
	}

	flag.Parse()

	if showVersion {
		fmt.Printf("bc2 v%s\n", version)
		return
	}

	if showDoctor {
		results := engine.RunDiagnostics()
		fmt.Print(engine.FormatDiagnostics(results))
		return
	}

	// Detect provider and get API key
	providerCfg := api.DetectProvider()
	apiKey := getAPIKey(providerCfg)
	if apiKey == "" && providerCfg.Provider == api.ProviderAnthropic {
		fmt.Fprintln(os.Stderr, "Error: ANTHROPIC_API_KEY environment variable is required")
		fmt.Fprintln(os.Stderr, "Set it with: export ANTHROPIC_API_KEY=your-key-here")
		fmt.Fprintln(os.Stderr, "\nOr use an alternate provider:")
		fmt.Fprintln(os.Stderr, "  CLAUDE_CODE_USE_BEDROCK=true   (AWS Bedrock)")
		fmt.Fprintln(os.Stderr, "  CLAUDE_CODE_USE_VERTEX=true    (Google Vertex)")
		fmt.Fprintln(os.Stderr, "  CLAUDE_CODE_USE_FOUNDRY=true   (Azure Foundry)")
		fmt.Fprintln(os.Stderr, "  CLAUDE_CODE_USE_OPENAI=true    (OpenAI compatible)")
		os.Exit(1)
	}

	// Build session config
	cfg := types.DefaultSessionConfig()
	if model != "" {
		cfg.Model = model
	}
	if maxTokens > 0 {
		cfg.MaxTokens = maxTokens
	}
	if permMode != "" {
		cfg.PermissionMode = permMode
	}
	if enableThinking {
		cfg.EnableThinking = true
		cfg.ThinkingBudget = thinkingBudget
	}
	if systemPrompt != "" {
		cfg.SystemPrompt = systemPrompt
	}
	if jsonSchema != "" {
		schema := parseJSONSchema(jsonSchema)
		if schema != nil {
			cfg.JSONSchema = schema
		}
	}

	// Check for remaining args as prompt
	if prompt == "" && flag.NArg() > 0 {
		prompt = strings.Join(flag.Args(), " ")
	}

	// Check for piped input
	if prompt == "" {
		stat, _ := os.Stdin.Stat()
		if (stat.Mode() & os.ModeCharDevice) == 0 {
			data := make([]byte, 1024*1024)
			n, _ := os.Stdin.Read(data)
			if n > 0 {
				prompt = string(data[:n])
			}
		}
	}

	// Non-interactive mode
	if prompt != "" {
		runOneShot(apiKey, cfg, prompt, outputJSON)
		return
	}

	// Interactive REPL mode
	r, err := repl.New(apiKey, cfg)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}

	if err := r.Run(); err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
}

func getAPIKey(providerCfg api.ProviderConfig) string {
	if providerCfg.APIKey != "" {
		return providerCfg.APIKey
	}
	if key := os.Getenv("ANTHROPIC_API_KEY"); key != "" {
		return key
	}
	cfg := config.Load()
	if cfg.APIKey != "" {
		return cfg.APIKey
	}
	// Try OAuth tokens saved by /login (auto-refreshes if expired)
	if tokens, err := engine.LoadAndRefreshIfNeeded(); err == nil && tokens.AccessToken != "" {
		return tokens.AccessToken
	}
	return ""
}

func runOneShot(apiKey string, cfg types.SessionConfig, prompt string, outputJSON bool) {
	eng := engine.NewQueryEngine(apiKey, cfg)

	var fullText strings.Builder

	eng.OnStreamText = func(text string) {
		fullText.WriteString(text)
		if !outputJSON {
			fmt.Print(text)
		}
	}

	eng.OnToolUse = func(name string, input map[string]any) {
		if !outputJSON {
			fmt.Fprintf(os.Stderr, "\n  %s", name)
			switch name {
			case "Bash":
				if cmd, ok := input["command"].(string); ok {
					fmt.Fprintf(os.Stderr, ": %s", cmd)
				}
			case "Read", "Write", "Edit":
				if p, ok := input["file_path"].(string); ok {
					fmt.Fprintf(os.Stderr, ": %s", p)
				}
			}
			fmt.Fprintln(os.Stderr)
		}
	}

	eng.OnError = func(err error) {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
	}

	if err := eng.SubmitMessage(prompt); err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}

	if outputJSON {
		cost := eng.GetCostTracker()
		result := map[string]any{
			"result":    fullText.String(),
			"usage":     eng.GetUsage(),
			"cost_usd":  cost.GetTotalCost(),
			"sessionId": eng.GetSessionID(),
			"model":     cfg.Model,
		}
		enc := json.NewEncoder(os.Stdout)
		enc.SetIndent("", "  ")
		_ = enc.Encode(result)
	} else {
		fmt.Println()
	}

	_ = eng.SaveSession()
}

// parseJSONSchema reads a JSON schema from a file path or inline JSON string
func parseJSONSchema(input string) map[string]any {
	var schema map[string]any

	// Try as inline JSON first
	if err := json.Unmarshal([]byte(input), &schema); err == nil {
		return schema
	}

	// Try as file path
	data, err := os.ReadFile(input)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Warning: could not parse schema: %v\n", err)
		return nil
	}
	if err := json.Unmarshal(data, &schema); err != nil {
		fmt.Fprintf(os.Stderr, "Warning: invalid JSON in schema file: %v\n", err)
		return nil
	}
	return schema
}
