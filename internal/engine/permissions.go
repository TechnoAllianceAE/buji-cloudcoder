package engine

import (
	"path/filepath"
	"strings"
)

// PermissionMode constants
const (
	PermDefault    = "default"
	PermBypass     = "bypassPermissions"
	PermPlan       = "plan"
	PermDontAsk    = "dontAsk"
	PermAcceptEdit = "acceptEdits"
	PermAuto       = "auto"
)

// PermissionRule represents a permission rule from settings
type PermissionRule struct {
	Source   string // "userSettings", "projectSettings", "cliArg", "session"
	Behavior string // "allow", "deny", "ask"
	ToolName string
	Pattern  string // Optional gitignore-style pattern
}

// PermissionChecker evaluates tool permissions
type PermissionChecker struct {
	Mode       string
	AllowRules []PermissionRule
	DenyRules  []PermissionRule

	// DangerousPatterns are paths that always require confirmation
	DangerousPatterns []string
}

// NewPermissionChecker creates a permission checker with defaults
func NewPermissionChecker(mode string) *PermissionChecker {
	return &PermissionChecker{
		Mode: mode,
		DangerousPatterns: []string{
			"**/.env",
			"**/.env.*",
			"**/credentials*",
			"**/secrets*",
			"**/*.pem",
			"**/*.key",
			"**/id_rsa*",
			"**/.ssh/*",
			"**/settings.json",
			"**/settings.local.json",
		},
	}
}

// CheckResult is the result of a permission check
type CheckResult struct {
	Behavior string // "allow", "deny", "ask"
	Reason   string
}

// Check evaluates whether a tool use is permitted
func (pc *PermissionChecker) Check(toolName string, input map[string]any, isReadOnly bool) CheckResult {
	// Bypass mode: allow everything
	if pc.Mode == PermBypass {
		return CheckResult{Behavior: "allow"}
	}

	// DontAsk mode: deny everything that isn't read-only
	if pc.Mode == PermDontAsk {
		if isReadOnly {
			return CheckResult{Behavior: "allow"}
		}
		return CheckResult{Behavior: "deny", Reason: "permission mode is dontAsk"}
	}

	// Plan mode: always ask (dry-run)
	if pc.Mode == PermPlan {
		return CheckResult{Behavior: "ask", Reason: "plan mode - confirm before executing"}
	}

	// Check deny rules first
	for _, rule := range pc.DenyRules {
		if matchesRule(rule, toolName, input) {
			return CheckResult{Behavior: "deny", Reason: "denied by rule: " + rule.Pattern}
		}
	}

	// Check allow rules
	for _, rule := range pc.AllowRules {
		if matchesRule(rule, toolName, input) {
			return CheckResult{Behavior: "allow"}
		}
	}

	// Read-only tools are always allowed
	if isReadOnly {
		return CheckResult{Behavior: "allow"}
	}

	// Check dangerous file patterns (before mode-specific logic)
	if filePath := extractFilePath(input); filePath != "" {
		if pc.isDangerousPath(filePath) {
			return CheckResult{Behavior: "ask", Reason: "potentially sensitive file: " + filePath}
		}
	}

	// Check dangerous bash commands (before mode-specific logic)
	if toolName == "Bash" || toolName == "PowerShell" {
		if cmd, ok := input["command"].(string); ok {
			if isDangerousCommand(cmd) {
				return CheckResult{Behavior: "ask", Reason: "potentially destructive command"}
			}
		}
	}

	// AcceptEdits mode: allow file edits, ask for everything else
	if pc.Mode == PermAcceptEdit {
		if toolName == "Edit" || toolName == "Write" || toolName == "NotebookEdit" {
			return CheckResult{Behavior: "allow"}
		}
		return CheckResult{Behavior: "ask", Reason: "requires permission (acceptEdits mode only auto-allows file edits)"}
	}

	// Default mode: ask for non-read-only operations
	if pc.Mode == PermDefault {
		return CheckResult{Behavior: "ask", Reason: "requires permission"}
	}

	return CheckResult{Behavior: "allow"}
}

// matchesRule checks if a rule applies to a tool/input combination
func matchesRule(rule PermissionRule, toolName string, input map[string]any) bool {
	if rule.ToolName != "" && rule.ToolName != toolName {
		return false
	}
	if rule.Pattern == "" {
		return true
	}

	// Check pattern against file paths
	filePath := extractFilePath(input)
	if filePath == "" {
		// Check pattern against command
		if cmd, ok := input["command"].(string); ok {
			return matchPattern(rule.Pattern, cmd)
		}
		return false
	}

	return matchPattern(rule.Pattern, filePath)
}

// extractFilePath extracts a file path from tool input
func extractFilePath(input map[string]any) string {
	if p, ok := input["file_path"].(string); ok {
		return p
	}
	if p, ok := input["path"].(string); ok {
		return p
	}
	return ""
}

// matchPattern matches a gitignore-style pattern against a string
func matchPattern(pattern, value string) bool {
	// Simple implementation: filepath.Match with some extensions
	matched, _ := filepath.Match(pattern, filepath.Base(value))
	if matched {
		return true
	}
	matched, _ = filepath.Match(pattern, value)
	return matched
}

// isDangerousPath checks if a path targets sensitive files
func (pc *PermissionChecker) isDangerousPath(path string) bool {
	base := filepath.Base(path)
	dir := filepath.Dir(path)

	for _, pattern := range pc.DangerousPatterns {
		cleanPattern := strings.TrimPrefix(pattern, "**/")

		// Check if pattern targets a directory (e.g., ".ssh/*")
		if strings.Contains(cleanPattern, "/") {
			parts := strings.SplitN(cleanPattern, "/", 2)
			dirPattern := parts[0]
			// Check if any path component matches the directory pattern
			if strings.Contains(dir, dirPattern) {
				return true
			}
			continue
		}

		// Basename matching
		if matched, _ := filepath.Match(cleanPattern, base); matched {
			return true
		}
	}
	return false
}

// isDangerousCommand checks for destructive shell commands
func isDangerousCommand(cmd string) bool {
	lower := strings.ToLower(strings.TrimSpace(cmd))

	dangerous := []string{
		"rm -rf", "rm -r", "rmdir",
		"git push --force", "git push -f",
		"git reset --hard",
		"git checkout .",
		"git clean -f",
		"git branch -d",  // lowercase covers -D too after ToLower
		"drop table", "drop database",
		"truncate table",
		"kill -9",
		"pkill",
		"shutdown",
		"reboot",
		"format ",
		"mkfs",
		"dd if=",
		"> /dev/",
		"chmod 777",
	}

	// Pipe-based dangerous patterns (curl/wget piped to shell)
	pipePatterns := []string{
		"curl", "wget",
	}
	pipeTargets := []string{
		"| sh", "| bash", "|sh", "|bash",
		"| /bin/sh", "| /bin/bash",
	}

	for _, d := range dangerous {
		if strings.Contains(lower, d) {
			return true
		}
	}

	// Check pipe-to-shell patterns
	for _, src := range pipePatterns {
		if strings.Contains(lower, src) {
			for _, target := range pipeTargets {
				if strings.Contains(lower, target) {
					return true
				}
			}
		}
	}

	return false
}
