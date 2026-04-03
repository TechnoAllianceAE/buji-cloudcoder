package engine

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/config"
)

// MemoryStore manages persistent memories across sessions
type MemoryStore struct {
	baseDir string
}

// NewMemoryStore creates a memory store
func NewMemoryStore(projectDir string) *MemoryStore {
	dir := filepath.Join(config.GetConfigDir(), "projects")
	if projectDir != "" {
		// Hash project path to create project-specific memory dir
		dir = filepath.Join(dir, sanitizeProjectPath(projectDir), "memory")
	} else {
		dir = filepath.Join(dir, "default", "memory")
	}
	_ = os.MkdirAll(dir, 0755)
	return &MemoryStore{baseDir: dir}
}

// MemoryEntry represents a single memory file
type MemoryEntry struct {
	Name        string
	Description string
	Type        string // user, feedback, project, reference
	Content     string
	FilePath    string
}

// Save writes a memory entry to disk
func (ms *MemoryStore) Save(entry MemoryEntry) error {
	filename := sanitizeFilename(entry.Name) + ".md"
	path := filepath.Join(ms.baseDir, filename)

	var sb strings.Builder
	sb.WriteString("---\n")
	sb.WriteString(fmt.Sprintf("name: %s\n", entry.Name))
	sb.WriteString(fmt.Sprintf("description: %s\n", entry.Description))
	sb.WriteString(fmt.Sprintf("type: %s\n", entry.Type))
	sb.WriteString("---\n\n")
	sb.WriteString(entry.Content)

	if err := os.WriteFile(path, []byte(sb.String()), 0644); err != nil {
		return fmt.Errorf("write memory: %w", err)
	}

	// Update MEMORY.md index
	return ms.updateIndex(entry.Name, filename, entry.Description)
}

// Load reads all memory entries
func (ms *MemoryStore) Load() ([]MemoryEntry, error) {
	entries, err := os.ReadDir(ms.baseDir)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, nil
		}
		return nil, err
	}

	var memories []MemoryEntry
	for _, e := range entries {
		if e.IsDir() || e.Name() == "MEMORY.md" {
			continue
		}
		if !strings.HasSuffix(e.Name(), ".md") {
			continue
		}

		path := filepath.Join(ms.baseDir, e.Name())
		data, err := os.ReadFile(path)
		if err != nil {
			continue
		}

		entry := parseMemoryFile(string(data), path)
		memories = append(memories, entry)
	}

	return memories, nil
}

// Delete removes a memory entry
func (ms *MemoryStore) Delete(name string) error {
	filename := sanitizeFilename(name) + ".md"
	path := filepath.Join(ms.baseDir, filename)
	return os.Remove(path)
}

// GetIndex returns the MEMORY.md index content
func (ms *MemoryStore) GetIndex() string {
	path := filepath.Join(ms.baseDir, "MEMORY.md")
	data, err := os.ReadFile(path)
	if err != nil {
		return ""
	}
	return string(data)
}

// GetMemoryPrompt returns memory content formatted for the system prompt
func (ms *MemoryStore) GetMemoryPrompt() string {
	memories, err := ms.Load()
	if err != nil || len(memories) == 0 {
		return ""
	}

	var sb strings.Builder
	sb.WriteString("\n# Memories\n\n")
	for _, m := range memories {
		sb.WriteString(fmt.Sprintf("## %s (%s)\n%s\n\n", m.Name, m.Type, m.Content))
	}
	return sb.String()
}

func (ms *MemoryStore) updateIndex(name, filename, description string) error {
	indexPath := filepath.Join(ms.baseDir, "MEMORY.md")
	existing, _ := os.ReadFile(indexPath)

	line := fmt.Sprintf("- [%s](%s) — %s", name, filename, description)

	content := string(existing)
	// Check if entry already exists
	if strings.Contains(content, filename) {
		// Update existing entry
		lines := strings.Split(content, "\n")
		var updated []string
		for _, l := range lines {
			if strings.Contains(l, filename) {
				updated = append(updated, line)
			} else {
				updated = append(updated, l)
			}
		}
		content = strings.Join(updated, "\n")
	} else {
		if content != "" && !strings.HasSuffix(content, "\n") {
			content += "\n"
		}
		content += line + "\n"
	}

	return os.WriteFile(indexPath, []byte(content), 0644)
}

func parseMemoryFile(content, path string) MemoryEntry {
	entry := MemoryEntry{FilePath: path}

	// Parse YAML frontmatter
	if strings.HasPrefix(content, "---\n") {
		parts := strings.SplitN(content[4:], "\n---\n", 2)
		if len(parts) == 2 {
			// Parse frontmatter
			for _, line := range strings.Split(parts[0], "\n") {
				if kv := strings.SplitN(line, ": ", 2); len(kv) == 2 {
					switch kv[0] {
					case "name":
						entry.Name = kv[1]
					case "description":
						entry.Description = kv[1]
					case "type":
						entry.Type = kv[1]
					}
				}
			}
			entry.Content = strings.TrimSpace(parts[1])
		} else {
			entry.Content = content
		}
	} else {
		entry.Content = content
	}

	if entry.Name == "" {
		entry.Name = filepath.Base(path)
	}

	return entry
}

func sanitizeFilename(name string) string {
	r := strings.NewReplacer(" ", "_", "/", "_", "\\", "_", ":", "_", ".", "_")
	s := r.Replace(strings.ToLower(name))
	if len(s) > 100 {
		s = s[:100]
	}
	return s
}

func sanitizeProjectPath(path string) string {
	r := strings.NewReplacer("/", "-", "\\", "-", ":", "-", " ", "-")
	s := r.Replace(path)
	if len(s) > 150 {
		s = s[:150]
	}
	return s
}
