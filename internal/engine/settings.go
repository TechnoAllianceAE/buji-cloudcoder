package engine

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sync"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/config"
)

// SettingsHierarchy implements the settings priority chain:
// managed (policy) > user > project > env > defaults
type SettingsHierarchy struct {
	mu       sync.RWMutex
	managed  map[string]any // Organization/policy settings (highest priority)
	user     map[string]any // User settings (~/.bc2/settings.json)
	project  map[string]any // Project settings (.bc2/settings.json)
	local    map[string]any // Local project settings (.bc2/settings.local.json)
	merged   map[string]any // Computed merged result
	dirty    bool
}

// NewSettingsHierarchy loads all settings layers
func NewSettingsHierarchy(projectDir string) *SettingsHierarchy {
	sh := &SettingsHierarchy{
		managed: make(map[string]any),
		user:    make(map[string]any),
		project: make(map[string]any),
		local:   make(map[string]any),
		merged:  make(map[string]any),
		dirty:   true,
	}

	// Load user settings
	userPath := filepath.Join(config.GetConfigDir(), "settings.json")
	sh.user = loadJSON(userPath)

	// Load project settings
	if projectDir != "" {
		projPath := filepath.Join(projectDir, ".bc2", "settings.json")
		sh.project = loadJSON(projPath)

		localPath := filepath.Join(projectDir, ".bc2", "settings.local.json")
		sh.local = loadJSON(localPath)
	}

	// Load managed settings (if they exist)
	managedPath := filepath.Join(config.GetConfigDir(), "managed-settings.json")
	sh.managed = loadJSON(managedPath)

	sh.recompute()
	return sh
}

// Get returns a setting value by key, traversing the hierarchy
func (sh *SettingsHierarchy) Get(key string) (any, bool) {
	sh.mu.RLock()
	defer sh.mu.RUnlock()
	val, ok := sh.merged[key]
	return val, ok
}

// GetString returns a string setting
func (sh *SettingsHierarchy) GetString(key, defaultVal string) string {
	val, ok := sh.Get(key)
	if !ok {
		return defaultVal
	}
	if s, ok := val.(string); ok {
		return s
	}
	return defaultVal
}

// GetBool returns a boolean setting
func (sh *SettingsHierarchy) GetBool(key string, defaultVal bool) bool {
	val, ok := sh.Get(key)
	if !ok {
		return defaultVal
	}
	if b, ok := val.(bool); ok {
		return b
	}
	return defaultVal
}

// GetStringSlice returns a string slice setting
func (sh *SettingsHierarchy) GetStringSlice(key string) []string {
	val, ok := sh.Get(key)
	if !ok {
		return nil
	}
	if arr, ok := val.([]any); ok {
		var result []string
		for _, v := range arr {
			if s, ok := v.(string); ok {
				result = append(result, s)
			}
		}
		return result
	}
	return nil
}

// Set updates a setting at the user level
func (sh *SettingsHierarchy) Set(key string, value any) {
	sh.mu.Lock()
	defer sh.mu.Unlock()
	sh.user[key] = value
	sh.dirty = true
	sh.recompute()
}

// SetProject updates a setting at the project level
func (sh *SettingsHierarchy) SetProject(key string, value any) {
	sh.mu.Lock()
	defer sh.mu.Unlock()
	sh.project[key] = value
	sh.dirty = true
	sh.recompute()
}

// SaveUser persists user settings to disk
func (sh *SettingsHierarchy) SaveUser() error {
	sh.mu.RLock()
	defer sh.mu.RUnlock()
	path := filepath.Join(config.GetConfigDir(), "settings.json")
	return saveJSON(path, sh.user)
}

// SaveProject persists project settings to disk
func (sh *SettingsHierarchy) SaveProject(projectDir string) error {
	sh.mu.RLock()
	defer sh.mu.RUnlock()
	dir := filepath.Join(projectDir, ".bc2")
	_ = os.MkdirAll(dir, 0755)
	return saveJSON(filepath.Join(dir, "settings.json"), sh.project)
}

// GetAllMerged returns the full merged settings
func (sh *SettingsHierarchy) GetAllMerged() map[string]any {
	sh.mu.RLock()
	defer sh.mu.RUnlock()
	result := make(map[string]any, len(sh.merged))
	for k, v := range sh.merged {
		result[k] = v
	}
	return result
}

func (sh *SettingsHierarchy) recompute() {
	sh.merged = make(map[string]any)
	// Lowest priority first
	for k, v := range sh.project {
		sh.merged[k] = v
	}
	for k, v := range sh.local {
		sh.merged[k] = v
	}
	for k, v := range sh.user {
		sh.merged[k] = v
	}
	// Managed has highest priority
	for k, v := range sh.managed {
		sh.merged[k] = v
	}
	sh.dirty = false
}

func loadJSON(path string) map[string]any {
	data, err := os.ReadFile(path)
	if err != nil {
		return make(map[string]any)
	}
	var result map[string]any
	if err := json.Unmarshal(data, &result); err != nil {
		return make(map[string]any)
	}
	return result
}

func saveJSON(path string, data map[string]any) error {
	dir := filepath.Dir(path)
	_ = os.MkdirAll(dir, 0755)
	content, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(path, content, 0644)
}
