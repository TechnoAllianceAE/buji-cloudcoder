package engine

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/config"
	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/types"
)

// SessionMeta holds metadata for a saved session
type SessionMeta struct {
	ID        string    `json:"id"`
	Title     string    `json:"title"`
	Model     string    `json:"model"`
	CWD       string    `json:"cwd"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Messages  int       `json:"messages"`
	CostUSD   float64   `json:"cost_usd"`
}

// SessionStore manages session persistence
type SessionStore struct {
	baseDir string
}

// NewSessionStore creates a session store
func NewSessionStore() *SessionStore {
	return &SessionStore{
		baseDir: config.GetSessionsDir(),
	}
}

// Save persists messages and metadata for a session
func (s *SessionStore) Save(sessionID string, messages []types.Message, meta SessionMeta) error {
	dir := filepath.Join(s.baseDir, sessionID)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("create session dir: %w", err)
	}

	// Save transcript
	transcriptPath := filepath.Join(dir, "transcript.jsonl")
	f, err := os.Create(transcriptPath)
	if err != nil {
		return fmt.Errorf("create transcript: %w", err)
	}
	defer f.Close()

	encoder := json.NewEncoder(f)
	for _, msg := range messages {
		if err := encoder.Encode(msg); err != nil {
			return fmt.Errorf("encode message: %w", err)
		}
	}

	// Save metadata
	meta.UpdatedAt = time.Now()
	meta.Messages = len(messages)
	metaPath := filepath.Join(dir, "meta.json")
	metaData, _ := json.MarshalIndent(meta, "", "  ")
	if err := os.WriteFile(metaPath, metaData, 0644); err != nil {
		return fmt.Errorf("write meta: %w", err)
	}

	return nil
}

// Load restores messages from a saved session
func (s *SessionStore) Load(sessionID string) ([]types.Message, *SessionMeta, error) {
	dir := filepath.Join(s.baseDir, sessionID)

	// Load transcript
	transcriptPath := filepath.Join(dir, "transcript.jsonl")
	f, err := os.Open(transcriptPath)
	if err != nil {
		return nil, nil, fmt.Errorf("open transcript: %w", err)
	}
	defer f.Close()

	var messages []types.Message
	decoder := json.NewDecoder(f)
	for decoder.More() {
		var msg types.Message
		if err := decoder.Decode(&msg); err != nil {
			break // Stop on parse errors
		}
		messages = append(messages, msg)
	}

	// Load metadata
	var meta SessionMeta
	metaPath := filepath.Join(dir, "meta.json")
	if data, err := os.ReadFile(metaPath); err == nil {
		_ = json.Unmarshal(data, &meta)
	} else {
		meta.ID = sessionID
	}

	return messages, &meta, nil
}

// List returns all saved sessions sorted by most recent
func (s *SessionStore) List(limit int) ([]SessionMeta, error) {
	entries, err := os.ReadDir(s.baseDir)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, nil
		}
		return nil, err
	}

	var sessions []SessionMeta
	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}

		metaPath := filepath.Join(s.baseDir, entry.Name(), "meta.json")
		data, err := os.ReadFile(metaPath)
		if err != nil {
			// Try to construct from directory info
			info, _ := entry.Info()
			sessions = append(sessions, SessionMeta{
				ID:        entry.Name(),
				UpdatedAt: info.ModTime(),
			})
			continue
		}

		var meta SessionMeta
		if err := json.Unmarshal(data, &meta); err != nil {
			continue
		}
		if meta.ID == "" {
			meta.ID = entry.Name()
		}
		sessions = append(sessions, meta)
	}

	// Sort by most recent
	sort.Slice(sessions, func(i, j int) bool {
		return sessions[i].UpdatedAt.After(sessions[j].UpdatedAt)
	})

	if limit > 0 && len(sessions) > limit {
		sessions = sessions[:limit]
	}

	return sessions, nil
}

// Delete removes a session
func (s *SessionStore) Delete(sessionID string) error {
	dir := filepath.Join(s.baseDir, sessionID)
	return os.RemoveAll(dir)
}

// GetSessionPreview returns a short preview of a session's conversation
func (s *SessionStore) GetSessionPreview(sessionID string, maxLen int) string {
	messages, _, err := s.Load(sessionID)
	if err != nil || len(messages) == 0 {
		return "(empty session)"
	}

	// Find first user message
	for _, msg := range messages {
		if msg.Role == types.RoleUser {
			for _, block := range msg.Content {
				if block.Type == "text" && block.Text != "" {
					text := block.Text
					if len(text) > maxLen {
						text = text[:maxLen] + "..."
					}
					return strings.ReplaceAll(text, "\n", " ")
				}
			}
		}
	}
	return "(no user messages)"
}
