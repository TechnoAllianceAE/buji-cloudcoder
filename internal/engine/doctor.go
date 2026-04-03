package engine

import (
	"fmt"
	"os"
	"os/exec"
	"runtime"
	"strings"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/config"
)

// DiagnosticResult holds one diagnostic check result
type DiagnosticResult struct {
	Name    string
	Status  string // "ok", "warn", "error"
	Message string
}

// RunDiagnostics performs system health checks
func RunDiagnostics() []DiagnosticResult {
	var results []DiagnosticResult

	// 1. API key check
	results = append(results, checkAPIKey())

	// 2. Shell check
	results = append(results, checkShell())

	// 3. Git check
	results = append(results, checkGit())

	// 4. Config directory
	results = append(results, checkConfigDir())

	// 5. Platform info
	results = append(results, DiagnosticResult{
		Name:    "Platform",
		Status:  "ok",
		Message: fmt.Sprintf("%s/%s, Go %s", runtime.GOOS, runtime.GOARCH, runtime.Version()),
	})

	// 6. Environment
	results = append(results, checkEnvironment())

	// 7. Network (basic)
	results = append(results, checkNetwork())

	// 8. Disk space
	results = append(results, checkDiskSpace())

	return results
}

// FormatDiagnostics formats results for display
func FormatDiagnostics(results []DiagnosticResult) string {
	var sb strings.Builder
	sb.WriteString("System Diagnostics\n")
	sb.WriteString("══════════════════\n\n")

	for _, r := range results {
		icon := "✓"
		switch r.Status {
		case "warn":
			icon = "⚠"
		case "error":
			icon = "✗"
		}
		sb.WriteString(fmt.Sprintf("  %s %-20s %s\n", icon, r.Name, r.Message))
	}

	return sb.String()
}

func checkAPIKey() DiagnosticResult {
	key := os.Getenv("ANTHROPIC_API_KEY")
	if key == "" {
		cfg := config.Load()
		key = cfg.APIKey
	}

	if key == "" {
		return DiagnosticResult{
			Name:    "API Key",
			Status:  "error",
			Message: "ANTHROPIC_API_KEY not set",
		}
	}

	if len(key) < 20 {
		return DiagnosticResult{
			Name:    "API Key",
			Status:  "warn",
			Message: "API key looks too short",
		}
	}

	return DiagnosticResult{
		Name:    "API Key",
		Status:  "ok",
		Message: fmt.Sprintf("Set (%s...%s)", key[:4], key[len(key)-4:]),
	}
}

func checkShell() DiagnosticResult {
	shell := config.GetShell()
	if _, err := exec.LookPath(shell); err != nil {
		return DiagnosticResult{
			Name:    "Shell",
			Status:  "error",
			Message: fmt.Sprintf("Shell not found: %s", shell),
		}
	}
	return DiagnosticResult{
		Name:    "Shell",
		Status:  "ok",
		Message: shell,
	}
}

func checkGit() DiagnosticResult {
	path, err := exec.LookPath("git")
	if err != nil {
		return DiagnosticResult{
			Name:    "Git",
			Status:  "warn",
			Message: "git not found in PATH",
		}
	}

	out, err := exec.Command("git", "--version").Output()
	if err != nil {
		return DiagnosticResult{
			Name:    "Git",
			Status:  "warn",
			Message: fmt.Sprintf("Found at %s but version check failed", path),
		}
	}

	return DiagnosticResult{
		Name:    "Git",
		Status:  "ok",
		Message: strings.TrimSpace(string(out)),
	}
}

func checkConfigDir() DiagnosticResult {
	dir := config.GetConfigDir()
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		return DiagnosticResult{
			Name:    "Config Dir",
			Status:  "warn",
			Message: fmt.Sprintf("Not found: %s (will be created on first use)", dir),
		}
	}
	return DiagnosticResult{
		Name:    "Config Dir",
		Status:  "ok",
		Message: dir,
	}
}

func checkEnvironment() DiagnosticResult {
	var flags []string

	if isEnvTruthy("CLAUDE_CODE_USE_BEDROCK") {
		flags = append(flags, "Bedrock")
	}
	if isEnvTruthy("CLAUDE_CODE_USE_VERTEX") {
		flags = append(flags, "Vertex")
	}
	if isEnvTruthy("CLAUDE_CODE_USE_FOUNDRY") {
		flags = append(flags, "Foundry")
	}
	if isEnvTruthy("CLAUDE_CODE_USE_OPENAI") {
		flags = append(flags, "OpenAI")
	}

	if model := os.Getenv("ANTHROPIC_DEFAULT_MODEL"); model != "" {
		flags = append(flags, fmt.Sprintf("model=%s", model))
	}

	if len(flags) == 0 {
		return DiagnosticResult{
			Name:    "Environment",
			Status:  "ok",
			Message: "Default (Direct API)",
		}
	}

	return DiagnosticResult{
		Name:    "Environment",
		Status:  "ok",
		Message: strings.Join(flags, ", "),
	}
}

func checkNetwork() DiagnosticResult {
	// Simple DNS check
	cmd := exec.Command("ping", "-c", "1", "-W", "2", "api.anthropic.com")
	if runtime.GOOS == "windows" {
		cmd = exec.Command("ping", "-n", "1", "-w", "2000", "api.anthropic.com")
	}

	if err := cmd.Run(); err != nil {
		return DiagnosticResult{
			Name:    "Network",
			Status:  "warn",
			Message: "Cannot reach api.anthropic.com",
		}
	}

	return DiagnosticResult{
		Name:    "Network",
		Status:  "ok",
		Message: "api.anthropic.com reachable",
	}
}

func checkDiskSpace() DiagnosticResult {
	// Simple check - just verify we can write to config dir
	dir := config.GetConfigDir()
	testFile := dir + "/.health-check"
	if err := os.WriteFile(testFile, []byte("ok"), 0644); err != nil {
		return DiagnosticResult{
			Name:    "Disk",
			Status:  "warn",
			Message: "Cannot write to config directory",
		}
	}
	os.Remove(testFile)

	return DiagnosticResult{
		Name:    "Disk",
		Status:  "ok",
		Message: "Writable",
	}
}

func isEnvTruthy(key string) bool {
	val := strings.ToLower(os.Getenv(key))
	return val == "true" || val == "1" || val == "yes"
}
