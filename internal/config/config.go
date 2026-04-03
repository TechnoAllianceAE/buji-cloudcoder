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
	// API settings
	APIKey    string `json:"api_key,omitempty"`
	BaseURL   string `json:"base_url,omitempty"`
	Model     string `json:"model,omitempty"`
	MaxTokens int    `json:"max_tokens,omitempty"`

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
	SessionDir string `json:"session_dir,omitempty"`
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

		// Environment overrides
		if key := os.Getenv("ANTHROPIC_API_KEY"); key != "" {
			globalConfig.APIKey = key
		}
		if baseURL := os.Getenv("ANTHROPIC_BASE_URL"); baseURL != "" {
			globalConfig.BaseURL = baseURL
		}
		if model := os.Getenv("ANTHROPIC_DEFAULT_MODEL"); model != "" {
			globalConfig.Model = model
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
		// Check for bash (Git Bash, WSL, etc.)
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
