package tools

import (
	"bufio"
	"bytes"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/types"
	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/utils"
)

// GrepTool searches file contents with regex — uses ripgrep when available
type GrepTool struct {
	rgPath string // path to rg binary, empty if not found
}

func NewGrepTool() *GrepTool {
	t := &GrepTool{}
	if path, err := exec.LookPath("rg"); err == nil {
		t.rgPath = path
	}
	return t
}

func (t *GrepTool) Name() string { return "Grep" }

func (t *GrepTool) Description() string {
	backend := "pure Go regex"
	if t.rgPath != "" {
		backend = "ripgrep (rg)"
	}
	return fmt.Sprintf(`Searches file contents using regular expressions. Backend: %s.

- Supports full regex syntax
- Filter by glob pattern or file type
- Output modes: "content" (matching lines), "files_with_matches" (file paths), "count" (match counts)
- Default output mode is "files_with_matches"
- Default head_limit is 250 lines`, backend)
}

func (t *GrepTool) InputSchema() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"pattern": map[string]any{
				"type":        "string",
				"description": "Regex pattern to search for",
			},
			"path": map[string]any{
				"type":        "string",
				"description": "File or directory to search in (defaults to cwd)",
			},
			"glob": map[string]any{
				"type":        "string",
				"description": "Glob pattern to filter files (e.g., '*.go', '*.{ts,tsx}')",
			},
			"output_mode": map[string]any{
				"type":        "string",
				"description": "Output mode: content, files_with_matches, or count",
				"enum":        []string{"content", "files_with_matches", "count"},
			},
			"-i": map[string]any{
				"type":        "boolean",
				"description": "Case insensitive search",
			},
			"-n": map[string]any{
				"type":        "boolean",
				"description": "Show line numbers (default true for content mode)",
			},
			"-C": map[string]any{
				"type":        "number",
				"description": "Context lines before and after match",
			},
			"head_limit": map[string]any{
				"type":        "number",
				"description": "Maximum results to return (default 250)",
			},
			"type": map[string]any{
				"type":        "string",
				"description": "File type to search (rg --type). E.g., 'go', 'py', 'js'",
			},
			"multiline": map[string]any{
				"type":        "boolean",
				"description": "Enable multiline matching",
			},
		},
		"required": []string{"pattern"},
	}
}

func (t *GrepTool) IsReadOnly(_ map[string]any) bool { return true }

func (t *GrepTool) Execute(input map[string]any, ctx *ToolContext) types.ToolResult {
	pattern, _ := input["pattern"].(string)
	searchPath, _ := input["path"].(string)
	globFilter, _ := input["glob"].(string)
	outputMode, _ := input["output_mode"].(string)
	caseInsensitive, _ := input["-i"].(bool)
	fileType, _ := input["type"].(string)
	multiline, _ := input["multiline"].(bool)
	contextLines := 0
	if v, ok := input["-C"].(float64); ok {
		contextLines = int(v)
	}
	headLimit := 250
	if v, ok := input["head_limit"].(float64); ok && v > 0 {
		headLimit = int(v)
	}

	if pattern == "" {
		return types.ToolResult{Content: "Error: pattern is required", IsError: true}
	}
	if outputMode == "" {
		outputMode = "files_with_matches"
	}
	if searchPath == "" {
		searchPath = ctx.CWD
	} else {
		searchPath = utils.AbsPath(searchPath)
	}

	// Use ripgrep if available
	if t.rgPath != "" {
		return t.executeWithRipgrep(pattern, searchPath, globFilter, outputMode, fileType,
			caseInsensitive, multiline, contextLines, headLimit)
	}

	// Fallback to pure Go implementation
	return t.executeWithGoRegex(pattern, searchPath, globFilter, outputMode,
		caseInsensitive, contextLines, headLimit)
}

// executeWithRipgrep runs rg for fast searching
func (t *GrepTool) executeWithRipgrep(pattern, searchPath, globFilter, outputMode, fileType string,
	caseInsensitive, multiline bool, contextLines, headLimit int) types.ToolResult {

	args := []string{
		"--no-heading",
		"--color=never",
		"--max-count=1000", // safety limit per file
	}

	// Output mode
	switch outputMode {
	case "files_with_matches":
		args = append(args, "-l")
	case "count":
		args = append(args, "-c")
	default: // "content"
		args = append(args, "-n") // line numbers
	}

	if caseInsensitive {
		args = append(args, "-i")
	}
	if multiline {
		args = append(args, "-U", "--multiline-dotall")
	}
	if contextLines > 0 {
		args = append(args, fmt.Sprintf("-C%d", contextLines))
	}
	if globFilter != "" {
		args = append(args, "--glob", globFilter)
	}
	if fileType != "" {
		args = append(args, "--type", fileType)
	}

	args = append(args, "--", pattern, searchPath)

	cmd := exec.Command(t.rgPath, args...)
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()

	// rg returns exit code 1 for "no matches" — that's not an error
	if err != nil {
		if exitErr, ok := err.(*exec.ExitError); ok {
			if exitErr.ExitCode() == 1 {
				return types.ToolResult{Content: "No matches found for pattern: " + pattern}
			}
			if exitErr.ExitCode() == 2 {
				return types.ToolResult{
					Content: fmt.Sprintf("Grep error: %s", stderr.String()),
					IsError: true,
				}
			}
		}
		return types.ToolResult{
			Content: fmt.Sprintf("Grep error: %v\n%s", err, stderr.String()),
			IsError: true,
		}
	}

	output := stdout.String()
	if output == "" {
		return types.ToolResult{Content: "No matches found for pattern: " + pattern}
	}

	// Apply head_limit
	lines := strings.Split(output, "\n")
	if len(lines) > headLimit {
		lines = lines[:headLimit]
		output = strings.Join(lines, "\n") + fmt.Sprintf("\n\n(results truncated at %d lines)", headLimit)
	}

	return types.ToolResult{Content: output}
}

// executeWithGoRegex is the pure Go fallback when rg is not available
func (t *GrepTool) executeWithGoRegex(pattern, searchPath, globFilter, outputMode string,
	caseInsensitive bool, contextLines, headLimit int) types.ToolResult {

	flags := ""
	if caseInsensitive {
		flags = "(?i)"
	}
	re, err := regexp.Compile(flags + pattern)
	if err != nil {
		return types.ToolResult{Content: fmt.Sprintf("Error: invalid regex: %v", err), IsError: true}
	}

	// Collect files to search
	var files []string
	info, err := os.Stat(searchPath)
	if err != nil {
		return types.ToolResult{Content: fmt.Sprintf("Error: %v", err), IsError: true}
	}

	if !info.IsDir() {
		files = []string{searchPath}
	} else {
		files = collectFiles(searchPath, globFilter)
	}

	var results []string
	totalMatches := 0
	resultCount := 0

	for _, file := range files {
		if resultCount >= headLimit {
			break
		}

		matches := searchFile(file, re, contextLines)
		if len(matches) == 0 {
			continue
		}

		totalMatches += len(matches)

		relPath, _ := filepath.Rel(searchPath, file)
		if relPath == "" {
			relPath = file
		}

		switch outputMode {
		case "files_with_matches":
			results = append(results, relPath)
			resultCount++
		case "count":
			results = append(results, fmt.Sprintf("%s:%d", relPath, len(matches)))
			resultCount++
		case "content":
			for _, m := range matches {
				if resultCount >= headLimit {
					break
				}
				results = append(results, fmt.Sprintf("%s:%s", relPath, m))
				resultCount++
			}
		}
	}

	if len(results) == 0 {
		return types.ToolResult{Content: "No matches found for pattern: " + pattern}
	}

	result := strings.Join(results, "\n")
	if resultCount >= headLimit {
		result += fmt.Sprintf("\n\n(results truncated at %d entries)", headLimit)
	}

	return types.ToolResult{Content: result}
}

// collectFiles walks a directory and returns files matching an optional glob
func collectFiles(root, globFilter string) []string {
	skipDirs := map[string]bool{
		".git": true, "node_modules": true, ".svn": true, ".hg": true,
		"__pycache__": true, ".tox": true, ".mypy_cache": true,
	}

	var files []string
	_ = filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil
		}
		if info.IsDir() {
			if skipDirs[filepath.Base(path)] {
				return filepath.SkipDir
			}
			return nil
		}

		// Skip binary files by extension
		ext := strings.ToLower(filepath.Ext(path))
		binaryExts := map[string]bool{
			".exe": true, ".dll": true, ".so": true, ".dylib": true,
			".zip": true, ".tar": true, ".gz": true, ".bz2": true,
			".png": true, ".jpg": true, ".jpeg": true, ".gif": true,
			".pdf": true, ".wasm": true, ".o": true, ".a": true,
		}
		if binaryExts[ext] {
			return nil
		}

		if globFilter != "" {
			rel, _ := filepath.Rel(root, path)
			rel = filepath.ToSlash(rel)
			matched, _ := filepath.Match(globFilter, filepath.Base(rel))
			if !matched {
				return nil
			}
		}

		files = append(files, path)
		return nil
	})
	return files
}

// searchFile searches a single file and returns matching lines
func searchFile(path string, re *regexp.Regexp, contextLines int) []string {
	f, err := os.Open(path)
	if err != nil {
		return nil
	}
	defer f.Close()

	var allLines []string
	var matchIndices []int

	scanner := bufio.NewScanner(f)
	scanner.Buffer(make([]byte, 1024*1024), 1024*1024)
	lineNum := 0
	for scanner.Scan() {
		line := scanner.Text()
		allLines = append(allLines, line)
		if re.MatchString(line) {
			matchIndices = append(matchIndices, lineNum)
		}
		lineNum++
	}

	if len(matchIndices) == 0 {
		return nil
	}

	if contextLines == 0 {
		var results []string
		for _, idx := range matchIndices {
			results = append(results, fmt.Sprintf("%d:%s", idx+1, allLines[idx]))
		}
		return results
	}

	// With context lines
	shown := make(map[int]bool)
	for _, idx := range matchIndices {
		start := idx - contextLines
		if start < 0 {
			start = 0
		}
		end := idx + contextLines + 1
		if end > len(allLines) {
			end = len(allLines)
		}
		for i := start; i < end; i++ {
			shown[i] = true
		}
	}

	var results []string
	prevShown := -2
	matchSet := make(map[int]bool)
	for _, idx := range matchIndices {
		matchSet[idx] = true
	}

	for i := 0; i < len(allLines); i++ {
		if !shown[i] {
			continue
		}
		if i > prevShown+1 && prevShown >= 0 {
			results = append(results, "--")
		}
		prefix := " "
		if matchSet[i] {
			prefix = ">"
		}
		results = append(results, fmt.Sprintf("%s%d:%s", prefix, i+1, allLines[i]))
		prevShown = i
	}

	return results
}
