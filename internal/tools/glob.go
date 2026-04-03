package tools

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/types"
	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/utils"
)

// GlobTool finds files matching a glob pattern
type GlobTool struct{}

func NewGlobTool() *GlobTool { return &GlobTool{} }

func (t *GlobTool) Name() string { return "Glob" }

func (t *GlobTool) Description() string {
	return `Fast file pattern matching tool that works with any codebase size.

- Supports glob patterns like "**/*.js" or "src/**/*.ts"
- Returns matching file paths sorted by modification time
- Use this when you need to find files by name patterns`
}

func (t *GlobTool) InputSchema() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"pattern": map[string]any{
				"type":        "string",
				"description": "Glob pattern to match files against (e.g., '**/*.go', 'src/**/*.ts')",
			},
			"path": map[string]any{
				"type":        "string",
				"description": "Directory to search in (defaults to cwd)",
			},
		},
		"required": []string{"pattern"},
	}
}

func (t *GlobTool) IsReadOnly(_ map[string]any) bool { return true }

func (t *GlobTool) Execute(input map[string]any, ctx *ToolContext) types.ToolResult {
	pattern, _ := input["pattern"].(string)
	searchPath, _ := input["path"].(string)

	if pattern == "" {
		return types.ToolResult{Content: "Error: pattern is required", IsError: true}
	}

	if searchPath == "" {
		searchPath = ctx.CWD
	} else {
		searchPath = utils.AbsPath(searchPath)
	}

	matches, err := globWalk(searchPath, pattern)
	if err != nil {
		return types.ToolResult{Content: fmt.Sprintf("Error: %v", err), IsError: true}
	}

	const maxResults = 200
	truncated := false
	if len(matches) > maxResults {
		matches = matches[:maxResults]
		truncated = true
	}

	if len(matches) == 0 {
		return types.ToolResult{Content: "No files found matching pattern: " + pattern}
	}

	// Make paths relative to search path
	relMatches := make([]string, len(matches))
	for i, m := range matches {
		rel, err := filepath.Rel(searchPath, m)
		if err != nil {
			relMatches[i] = m
		} else {
			relMatches[i] = rel
		}
	}

	result := strings.Join(relMatches, "\n")
	if truncated {
		result += fmt.Sprintf("\n\n(showing first %d of more results)", maxResults)
	}
	result += fmt.Sprintf("\n\n%d file(s) found", len(relMatches))

	return types.ToolResult{Content: result}
}

// globWalk walks the directory tree and returns files matching the pattern
func globWalk(root, pattern string) ([]string, error) {
	// Skip common non-useful directories
	skipDirs := map[string]bool{
		".git": true, "node_modules": true, ".svn": true, ".hg": true,
		"__pycache__": true, ".tox": true, ".mypy_cache": true,
		"vendor": false, // don't skip vendor by default
	}

	var matches []string

	type fileInfo struct {
		path    string
		modTime int64
	}
	var files []fileInfo

	err := filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil // Skip errors
		}

		if info.IsDir() {
			base := filepath.Base(path)
			if skipDirs[base] {
				return filepath.SkipDir
			}
			return nil
		}

		// Get relative path for matching
		rel, err := filepath.Rel(root, path)
		if err != nil {
			return nil
		}

		// Convert to forward slashes for consistent matching
		rel = filepath.ToSlash(rel)

		matched, err := filepath.Match(pattern, rel)
		if err != nil {
			// Try matching just the basename
			matched, _ = filepath.Match(pattern, filepath.Base(rel))
		}

		// Also try doublestar matching for ** patterns
		if !matched && strings.Contains(pattern, "**") {
			matched = doubleStarMatch(pattern, rel)
		}

		// Simple single-star matching at any depth
		if !matched && !strings.Contains(pattern, "/") && !strings.Contains(pattern, "**") {
			matched, _ = filepath.Match(pattern, filepath.Base(rel))
		}

		if matched {
			files = append(files, fileInfo{path: path, modTime: info.ModTime().UnixNano()})
		}
		return nil
	})

	if err != nil {
		return nil, err
	}

	// Sort by modification time (newest first)
	sort.Slice(files, func(i, j int) bool {
		return files[i].modTime > files[j].modTime
	})

	for _, f := range files {
		matches = append(matches, f.path)
	}

	return matches, nil
}

// doubleStarMatch handles ** glob patterns
func doubleStarMatch(pattern, path string) bool {
	// Simple ** handling: ** matches any number of path segments
	parts := strings.Split(pattern, "**")
	if len(parts) != 2 {
		return false
	}

	prefix := strings.TrimRight(parts[0], "/")
	suffix := strings.TrimLeft(parts[1], "/")

	if prefix != "" && !strings.HasPrefix(path, prefix+"/") && path != prefix {
		return false
	}

	if suffix == "" {
		return true
	}

	// Check if any suffix of the path matches the suffix pattern
	pathParts := strings.Split(path, "/")
	for i := range pathParts {
		remaining := strings.Join(pathParts[i:], "/")
		if matched, _ := filepath.Match(suffix, remaining); matched {
			return true
		}
		// Try matching just the filename
		if matched, _ := filepath.Match(suffix, pathParts[len(pathParts)-1]); matched {
			return true
		}
	}
	return false
}
