package engine

import (
	"encoding/json"
	"os"
	"path/filepath"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/config"
)

// KeyBinding represents a custom key binding
type KeyBinding struct {
	Key         string `json:"key"`         // Key combination (e.g., "ctrl+k", "alt+enter")
	Command     string `json:"command"`     // Command to execute (e.g., "/compact", "/clear")
	Description string `json:"description"` // Human-readable description
	When        string `json:"when"`        // Context condition (e.g., "inputFocused")
}

// KeyBindingManager manages custom key bindings
type KeyBindingManager struct {
	bindings []KeyBinding
	mode     string // "default", "vim", "emacs"
}

// NewKeyBindingManager creates a keybinding manager
func NewKeyBindingManager() *KeyBindingManager {
	km := &KeyBindingManager{
		mode: "default",
	}
	km.loadDefaults()
	km.loadFromFile()
	return km
}

// GetBindings returns all key bindings
func (km *KeyBindingManager) GetBindings() []KeyBinding {
	return km.bindings
}

// GetMode returns the current editor mode
func (km *KeyBindingManager) GetMode() string {
	return km.mode
}

// SetMode changes the editor mode
func (km *KeyBindingManager) SetMode(mode string) {
	km.mode = mode
}

// FindBinding looks up a command for a key combination
func (km *KeyBindingManager) FindBinding(key string) *KeyBinding {
	for _, b := range km.bindings {
		if b.Key == key {
			return &b
		}
	}
	return nil
}

// AddBinding adds or updates a key binding
func (km *KeyBindingManager) AddBinding(binding KeyBinding) {
	// Update existing or append
	for i, b := range km.bindings {
		if b.Key == binding.Key {
			km.bindings[i] = binding
			return
		}
	}
	km.bindings = append(km.bindings, binding)
}

// Save persists keybindings to disk
func (km *KeyBindingManager) Save() error {
	path := filepath.Join(config.GetConfigDir(), "keybindings.json")
	data, err := json.MarshalIndent(km.bindings, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(path, data, 0644)
}

func (km *KeyBindingManager) loadDefaults() {
	km.bindings = []KeyBinding{
		{Key: "ctrl+c", Command: "interrupt", Description: "Interrupt current operation"},
		{Key: "ctrl+d", Command: "/exit", Description: "Exit bc2"},
		{Key: "ctrl+l", Command: "/clear", Description: "Clear screen"},
		{Key: "ctrl+r", Command: "history-search", Description: "Search command history"},
		{Key: "up", Command: "history-prev", Description: "Previous history entry"},
		{Key: "down", Command: "history-next", Description: "Next history entry"},
	}
}

func (km *KeyBindingManager) loadFromFile() {
	path := filepath.Join(config.GetConfigDir(), "keybindings.json")
	data, err := os.ReadFile(path)
	if err != nil {
		return
	}
	var custom []KeyBinding
	if err := json.Unmarshal(data, &custom); err != nil {
		return
	}
	// Merge custom bindings (overwrite defaults)
	for _, c := range custom {
		km.AddBinding(c)
	}
}
