package engine

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"
)

// FileHistory tracks file modifications for undo capability
type FileHistory struct {
	mu        sync.Mutex
	snapshots map[string][]FileSnapshot // path -> ordered snapshots
	baseDir   string                     // Directory to store snapshots
}

// FileSnapshot is a point-in-time copy of a file
type FileSnapshot struct {
	Path      string    `json:"path"`
	Content   []byte    `json:"-"`
	Timestamp time.Time `json:"timestamp"`
	ToolUseID string    `json:"tool_use_id"`
	ToolName  string    `json:"tool_name"`
}

// NewFileHistory creates a file history tracker
func NewFileHistory(sessionDir string) *FileHistory {
	baseDir := filepath.Join(sessionDir, "file_history")
	_ = os.MkdirAll(baseDir, 0755)
	return &FileHistory{
		snapshots: make(map[string][]FileSnapshot),
		baseDir:   baseDir,
	}
}

// Snapshot saves the current state of a file before modification
func (fh *FileHistory) Snapshot(filePath, toolUseID, toolName string) error {
	fh.mu.Lock()
	defer fh.mu.Unlock()

	// Read current content (may not exist yet)
	content, err := os.ReadFile(filePath)
	if err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("read file for snapshot: %w", err)
	}

	snap := FileSnapshot{
		Path:      filePath,
		Content:   content,
		Timestamp: time.Now(),
		ToolUseID: toolUseID,
		ToolName:  toolName,
	}

	fh.snapshots[filePath] = append(fh.snapshots[filePath], snap)

	// Persist snapshot to disk
	snapDir := filepath.Join(fh.baseDir, sanitizePath(filePath))
	_ = os.MkdirAll(snapDir, 0755)
	snapFile := filepath.Join(snapDir, fmt.Sprintf("%d.snap", snap.Timestamp.UnixNano()))
	if content != nil {
		_ = os.WriteFile(snapFile, content, 0644)
	}

	return nil
}

// Rewind restores a file to a previous state
func (fh *FileHistory) Rewind(filePath string, steps int) error {
	fh.mu.Lock()
	defer fh.mu.Unlock()

	snaps, ok := fh.snapshots[filePath]
	if !ok || len(snaps) == 0 {
		return fmt.Errorf("no history for file: %s", filePath)
	}

	idx := len(snaps) - steps
	if idx < 0 {
		idx = 0
	}

	snap := snaps[idx]
	if snap.Content == nil {
		// File didn't exist at this point - remove it
		return os.Remove(filePath)
	}

	return os.WriteFile(filePath, snap.Content, 0644)
}

// GetHistory returns the modification history for a file
func (fh *FileHistory) GetHistory(filePath string) []FileSnapshot {
	fh.mu.Lock()
	defer fh.mu.Unlock()

	snaps := fh.snapshots[filePath]
	result := make([]FileSnapshot, len(snaps))
	copy(result, snaps)
	return result
}

// GetAllModifiedFiles returns all files that have been modified
func (fh *FileHistory) GetAllModifiedFiles() []string {
	fh.mu.Lock()
	defer fh.mu.Unlock()

	files := make([]string, 0, len(fh.snapshots))
	for path := range fh.snapshots {
		files = append(files, path)
	}
	sort.Strings(files)
	return files
}

// sanitizePath makes a file path safe for use as directory name
func sanitizePath(path string) string {
	// Replace path separators and special chars
	safe := strings.NewReplacer(
		"/", "_",
		"\\", "_",
		":", "_",
		" ", "_",
	).Replace(path)
	if len(safe) > 200 {
		safe = safe[:200]
	}
	return safe
}
