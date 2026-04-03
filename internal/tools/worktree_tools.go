package tools

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/types"
)

// EnterWorktreeTool creates an isolated git worktree
type EnterWorktreeTool struct{}

func NewEnterWorktreeTool() *EnterWorktreeTool { return &EnterWorktreeTool{} }
func (t *EnterWorktreeTool) Name() string      { return "EnterWorktree" }
func (t *EnterWorktreeTool) Description() string {
	return `Creates an isolated git worktree for the current repository. This allows working on changes without affecting the main working directory. The worktree is automatically cleaned up when you exit.`
}
func (t *EnterWorktreeTool) InputSchema() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"branch": map[string]any{
				"type":        "string",
				"description": "Branch name for the worktree (auto-generated if not provided)",
			},
		},
	}
}
func (t *EnterWorktreeTool) IsReadOnly(_ map[string]any) bool { return false }
func (t *EnterWorktreeTool) Execute(input map[string]any, ctx *ToolContext) types.ToolResult {
	branch, _ := input["branch"].(string)

	// Check if we're in a git repo
	gitRoot, err := exec.Command("git", "-C", ctx.CWD, "rev-parse", "--show-toplevel").Output()
	if err != nil {
		return types.ToolResult{Content: "Error: not in a git repository", IsError: true}
	}
	root := strings.TrimSpace(string(gitRoot))

	if branch == "" {
		branch = fmt.Sprintf("bc2-worktree-%d", os.Getpid())
	}

	// Create worktree directory
	worktreePath := filepath.Join(filepath.Dir(root), ".bc2-worktrees", branch)
	if err := os.MkdirAll(filepath.Dir(worktreePath), 0755); err != nil {
		return types.ToolResult{Content: fmt.Sprintf("Error creating worktree dir: %v", err), IsError: true}
	}

	// Create the worktree
	cmd := exec.Command("git", "-C", root, "worktree", "add", "-b", branch, worktreePath)
	output, err := cmd.CombinedOutput()
	if err != nil {
		// Try without -b (branch already exists)
		cmd = exec.Command("git", "-C", root, "worktree", "add", worktreePath, branch)
		output, err = cmd.CombinedOutput()
		if err != nil {
			return types.ToolResult{
				Content: fmt.Sprintf("Error creating worktree: %v\n%s", err, string(output)),
				IsError: true,
			}
		}
	}

	// Update the tool context CWD
	ctx.CWD = worktreePath

	return types.ToolResult{
		Content: fmt.Sprintf("Created worktree at: %s\nBranch: %s\nWorking directory changed to worktree.", worktreePath, branch),
	}
}

// ExitWorktreeTool exits and optionally cleans up a worktree
type ExitWorktreeTool struct{}

func NewExitWorktreeTool() *ExitWorktreeTool { return &ExitWorktreeTool{} }
func (t *ExitWorktreeTool) Name() string     { return "ExitWorktree" }
func (t *ExitWorktreeTool) Description() string {
	return `Exits the current git worktree and returns to the original working directory. Optionally removes the worktree if no changes were made.`
}
func (t *ExitWorktreeTool) InputSchema() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"cleanup": map[string]any{
				"type":        "boolean",
				"description": "Remove the worktree after exiting (default: true if no changes)",
			},
		},
	}
}
func (t *ExitWorktreeTool) IsReadOnly(_ map[string]any) bool { return false }
func (t *ExitWorktreeTool) Execute(input map[string]any, ctx *ToolContext) types.ToolResult {
	cleanup := true
	if v, ok := input["cleanup"].(bool); ok {
		cleanup = v
	}

	worktreePath := ctx.CWD

	// Find the main repo
	gitRoot, err := exec.Command("git", "-C", worktreePath, "rev-parse", "--show-toplevel").Output()
	if err != nil {
		return types.ToolResult{Content: "Error: not in a git worktree", IsError: true}
	}
	_ = strings.TrimSpace(string(gitRoot))

	// Check for uncommitted changes
	status, _ := exec.Command("git", "-C", worktreePath, "status", "--porcelain").Output()
	hasChanges := strings.TrimSpace(string(status)) != ""

	if hasChanges && cleanup {
		return types.ToolResult{
			Content: fmt.Sprintf("Worktree has uncommitted changes. Commit or discard changes before cleanup.\nPath: %s", worktreePath),
		}
	}

	if cleanup && !hasChanges {
		// Find original repo to run worktree remove
		commonDir, _ := exec.Command("git", "-C", worktreePath, "rev-parse", "--git-common-dir").Output()
		mainGitDir := strings.TrimSpace(string(commonDir))
		if mainGitDir != "" {
			mainRepo := filepath.Dir(mainGitDir)
			_ = exec.Command("git", "-C", mainRepo, "worktree", "remove", worktreePath).Run()
		}
		return types.ToolResult{Content: "Worktree removed and returned to original directory."}
	}

	return types.ToolResult{
		Content: fmt.Sprintf("Exited worktree. Worktree preserved at: %s", worktreePath),
	}
}
