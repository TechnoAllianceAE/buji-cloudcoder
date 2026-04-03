package engine

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/config"
)

// HookType constants
const (
	HookPreToolUse     = "PreToolUse"
	HookPostToolUse    = "PostToolUse"
	HookSessionStart   = "SessionStart"
	HookSessionEnd     = "SessionEnd"
	HookPromptSubmit   = "PromptSubmit"
)

// HookConfig defines a hook from settings
type HookConfig struct {
	Matcher  HookMatcher `json:"matcher"`
	Hooks    []HookEntry `json:"hooks"`
}

// HookMatcher determines when a hook fires
type HookMatcher struct {
	Event    string `json:"event"`    // PreToolUse, PostToolUse, etc.
	ToolName string `json:"toolName"` // Optional: specific tool
}

// HookEntry is a single hook action
type HookEntry struct {
	Type    string `json:"type"`    // "command"
	Command string `json:"command"` // Shell command to execute
	Timeout int    `json:"timeout"` // Timeout in ms
}

// HookResult is the outcome of running a hook
type HookResult struct {
	ExitCode int
	Stdout   string
	Stderr   string
	Blocked  bool
	Message  string
}

// HookManager runs hooks based on events
type HookManager struct {
	hooks []HookConfig
}

// NewHookManager creates a hook manager from settings
func NewHookManager() *HookManager {
	hm := &HookManager{}
	hm.loadFromSettings()
	return hm
}

func (hm *HookManager) loadFromSettings() {
	settingsPath := filepath.Join(config.GetConfigDir(), "settings.json")
	data, err := os.ReadFile(settingsPath)
	if err != nil {
		return
	}

	var settings struct {
		Hooks []HookConfig `json:"hooks"`
	}
	if err := json.Unmarshal(data, &settings); err != nil {
		return
	}

	hm.hooks = settings.Hooks

	// Also check project settings
	projectSettings := filepath.Join(".bc2", "settings.json")
	data, err = os.ReadFile(projectSettings)
	if err != nil {
		return
	}

	var projSettings struct {
		Hooks []HookConfig `json:"hooks"`
	}
	if err := json.Unmarshal(data, &projSettings); err != nil {
		return
	}

	hm.hooks = append(hm.hooks, projSettings.Hooks...)
}

// RunHooks executes all matching hooks for an event
func (hm *HookManager) RunHooks(event, toolName string, input map[string]any) []HookResult {
	var results []HookResult

	for _, hc := range hm.hooks {
		if !hm.matches(hc.Matcher, event, toolName) {
			continue
		}

		for _, hook := range hc.Hooks {
			result := hm.executeHook(hook, event, toolName, input)
			results = append(results, result)

			// If hook blocks (non-zero exit), stop
			if result.Blocked {
				return results
			}
		}
	}

	return results
}

func (hm *HookManager) matches(matcher HookMatcher, event, toolName string) bool {
	if matcher.Event != event {
		return false
	}
	if matcher.ToolName != "" && matcher.ToolName != toolName {
		return false
	}
	return true
}

func (hm *HookManager) executeHook(hook HookEntry, event, toolName string, input map[string]any) HookResult {
	if hook.Type != "command" || hook.Command == "" {
		return HookResult{}
	}

	// Set up environment with hook context
	env := os.Environ()
	env = append(env, fmt.Sprintf("BC2_HOOK_EVENT=%s", event))
	if toolName != "" {
		env = append(env, fmt.Sprintf("BC2_TOOL_NAME=%s", toolName))
	}

	// Pass input as JSON via stdin
	inputJSON, _ := json.Marshal(input)

	cmd := exec.Command("bash", "-c", hook.Command)
	cmd.Env = env
	cmd.Stdin = bytes.NewReader(inputJSON)

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()

	result := HookResult{
		Stdout: strings.TrimSpace(stdout.String()),
		Stderr: strings.TrimSpace(stderr.String()),
	}

	if err != nil {
		if ee, ok := err.(*exec.ExitError); ok {
			result.ExitCode = ee.ExitCode()
			if result.ExitCode == 2 {
				result.Blocked = true
				result.Message = result.Stderr
				if result.Message == "" {
					result.Message = "Blocked by hook"
				}
			}
		}
	}

	return result
}
