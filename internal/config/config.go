package config

import (
	"encoding/json"
	"os"
	"path/filepath"
	"runtime"
	"sync"
)

// Config holds the global configuration
type Config struct {
	// API settings (legacy single-provider)
	APIKey    string `json:"api_key,omitempty"`
	BaseURL   string `json:"base_url,omitempty"`
	Model     string `json:"model,omitempty"`
	MaxTokens int    `json:"max_tokens,omitempty"`

	// Multi-provider API keys
	APIKeys APIKeysConfig `json:"api_keys,omitempty"`

	// Feature toggles
	AutoCompact    bool `json:"auto_compact,omitempty"`
	EnableThinking bool `json:"enable_thinking,omitempty"`
	ThinkingBudget int  `json:"thinking_budget,omitempty"`

	// UI settings
	Theme      string `json:"theme,omitempty"`
	Verbose    bool   `json:"verbose,omitempty"`
	EditorMode string `json:"editor_mode,omitempty"`

	// Permission settings
	PermissionMode string   `json:"permission_mode,omitempty"`
	AllowedTools   []string `json:"allowed_tools,omitempty"`
	DeniedTools    []string `json:"denied_tools,omitempty"`

	// Session
	SessionDir     string `json:"session_dir,omitempty"`
	RequestTimeout int    `json:"request_timeout,omitempty"` // seconds
}

// APIKeysConfig holds per-provider API keys
type APIKeysConfig struct {
	Anthropic   string `json:"anthropic,omitempty"`
	OpenAI      string `json:"openai,omitempty"`
	OpenRouter  string `json:"openrouter,omitempty"`
	Groq        string `json:"groq,omitempty"`
	Together    string `json:"together,omitempty"`
	Cerebras    string `json:"cerebras,omitempty"`
	XAI         string `json:"xai,omitempty"`
	Gemini      string `json:"gemini,omitempty"`
	DeepSeek    string `json:"deepseek,omitempty"`
	OllamaURL   string `json:"ollama,omitempty"`   // URL, not key (e.g., http://localhost:11434)
	LlamaCppURL string `json:"llamacpp,omitempty"` // URL, not key
}

var (
	globalConfig *Config
	configOnce   sync.Once
)

// GetConfigDir returns the config directory path
func GetConfigDir() string {
	home, _ := os.UserHomeDir()
	return filepath.Join(home, ".bc2")
}

// GetSessionsDir returns the sessions directory path
func GetSessionsDir() string {
	return filepath.Join(GetConfigDir(), "sessions")
}

// Load reads config from disk and environment
func Load() *Config {
	configOnce.Do(func() {
		globalConfig = &Config{
			MaxTokens:      16384,
			Model:          "claude-sonnet-4-20250514",
			PermissionMode: "default",
		}

		// Read config file
		configPath := filepath.Join(GetConfigDir(), "settings.json")
		data, err := os.ReadFile(configPath)
		if err == nil {
			_ = json.Unmarshal(data, globalConfig)
		}

		// Environment overrides for API keys
		envOverride := func(target *string, envKey string) {
			if val := os.Getenv(envKey); val != "" {
				*target = val
			}
		}

		// Legacy single key
		envOverride(&globalConfig.APIKey, "ANTHROPIC_API_KEY")
		envOverride(&globalConfig.BaseURL, "ANTHROPIC_BASE_URL")
		envOverride(&globalConfig.Model, "ANTHROPIC_DEFAULT_MODEL")

		// Per-provider keys from env
		envOverride(&globalConfig.APIKeys.Anthropic, "ANTHROPIC_API_KEY")
		envOverride(&globalConfig.APIKeys.OpenAI, "OPENAI_API_KEY")
		envOverride(&globalConfig.APIKeys.OpenRouter, "OPENROUTER_API_KEY")
		envOverride(&globalConfig.APIKeys.Groq, "GROQ_API_KEY")
		envOverride(&globalConfig.APIKeys.Together, "TOGETHER_API_KEY")
		envOverride(&globalConfig.APIKeys.Cerebras, "CEREBRAS_API_KEY")
		envOverride(&globalConfig.APIKeys.XAI, "XAI_API_KEY")
		envOverride(&globalConfig.APIKeys.Gemini, "GOOGLE_AI_API_KEY")
		envOverride(&globalConfig.APIKeys.DeepSeek, "DEEPSEEK_API_KEY")
		envOverride(&globalConfig.APIKeys.OllamaURL, "OLLAMA_URL")
		envOverride(&globalConfig.APIKeys.LlamaCppURL, "LLAMACPP_URL")

		// Sync legacy api_key into per-provider if it looks like an Anthropic key
		if globalConfig.APIKey != "" && globalConfig.APIKeys.Anthropic == "" {
			globalConfig.APIKeys.Anthropic = globalConfig.APIKey
		}
	})
	return globalConfig
}

// GetShell returns the default shell for the platform
func GetShell() string {
	if runtime.GOOS == "windows" {
		if shell := os.Getenv("SHELL"); shell != "" {
			return shell
		}
		if _, err := os.Stat("C:\\Program Files\\Git\\bin\\bash.exe"); err == nil {
			return "C:\\Program Files\\Git\\bin\\bash.exe"
		}
		return "cmd.exe"
	}
	if shell := os.Getenv("SHELL"); shell != "" {
		return shell
	}
	return "/bin/bash"
}

// GetCWD returns the current working directory
func GetCWD() string {
	cwd, err := os.Getwd()
	if err != nil {
		return "."
	}
	return cwd
}

// IsGitRepo checks if the current directory is inside a git repository
func IsGitRepo() bool {
	dir := GetCWD()
	for {
		if _, err := os.Stat(filepath.Join(dir, ".git")); err == nil {
			return true
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			return false
		}
		dir = parent
	}
}
