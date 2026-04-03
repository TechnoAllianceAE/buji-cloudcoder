package engine

import (
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
)

// GitInfo holds information about the current git repository
type GitInfo struct {
	IsRepo     bool
	Root       string
	Branch     string
	HasChanges bool
	RemoteURL  string
}

// DetectGit gathers git repository information
func DetectGit(cwd string) GitInfo {
	info := GitInfo{}

	// Check if inside a git repo
	root, err := gitCommand(cwd, "rev-parse", "--show-toplevel")
	if err != nil {
		return info
	}
	info.IsRepo = true
	info.Root = strings.TrimSpace(root)

	// Get current branch
	branch, err := gitCommand(cwd, "rev-parse", "--abbrev-ref", "HEAD")
	if err == nil {
		info.Branch = strings.TrimSpace(branch)
	}

	// Check for uncommitted changes
	status, err := gitCommand(cwd, "status", "--porcelain")
	if err == nil {
		info.HasChanges = strings.TrimSpace(status) != ""
	}

	// Get remote URL
	remote, err := gitCommand(cwd, "remote", "get-url", "origin")
	if err == nil {
		info.RemoteURL = strings.TrimSpace(remote)
	}

	return info
}

// GetGitDiff returns the diff for a specific file
func GetGitDiff(cwd, filePath string) string {
	// Try staged diff first
	diff, err := gitCommand(cwd, "diff", "--cached", "--", filePath)
	if err == nil && strings.TrimSpace(diff) != "" {
		return diff
	}

	// Try unstaged diff
	diff, err = gitCommand(cwd, "diff", "--", filePath)
	if err == nil {
		return diff
	}

	return ""
}

// GetGitLog returns recent commits
func GetGitLog(cwd string, count int) string {
	log, err := gitCommand(cwd, "log", "--oneline", "-n", strconv.Itoa(count))
	if err != nil {
		return ""
	}
	return strings.TrimSpace(log)
}

// GetGitBranches returns local branches
func GetGitBranches(cwd string) []string {
	output, err := gitCommand(cwd, "branch", "--format=%(refname:short)")
	if err != nil {
		return nil
	}
	lines := strings.Split(strings.TrimSpace(output), "\n")
	var branches []string
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line != "" {
			branches = append(branches, line)
		}
	}
	return branches
}

// IsPathInGitRepo checks if a path is inside a git repo
func IsPathInGitRepo(path string) bool {
	dir := filepath.Dir(path)
	_, err := gitCommand(dir, "rev-parse", "--git-dir")
	return err == nil
}

func gitCommand(cwd string, args ...string) (string, error) {
	cmd := exec.Command("git", args...)
	cmd.Dir = cwd
	out, err := cmd.Output()
	return string(out), err
}

