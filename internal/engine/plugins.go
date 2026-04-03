package engine

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/config"
)

// Plugin represents a loaded plugin
type Plugin struct {
	Name        string            `json:"name"`
	Version     string            `json:"version"`
	Description string            `json:"description"`
	Author      string            `json:"author"`
	Enabled     bool              `json:"enabled"`
	Path        string            `json:"-"`
	Commands    []PluginCommand   `json:"commands,omitempty"`
	Hooks       []PluginHook      `json:"hooks,omitempty"`
	MCPServers  map[string]any    `json:"mcpServers,omitempty"`
}

// PluginCommand is a command provided by a plugin
type PluginCommand struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Content     string `json:"content"`
}

// PluginHook is a hook registered by a plugin
type PluginHook struct {
	Event   string `json:"event"`
	Command string `json:"command"`
}

// PluginManager discovers and loads plugins
type PluginManager struct {
	plugins map[string]*Plugin
}

// NewPluginManager creates a plugin manager
func NewPluginManager() *PluginManager {
	pm := &PluginManager{
		plugins: make(map[string]*Plugin),
	}
	pm.loadAll()
	return pm
}

// GetPlugins returns all loaded plugins
func (pm *PluginManager) GetPlugins() map[string]*Plugin {
	return pm.plugins
}

// GetPlugin returns a plugin by name
func (pm *PluginManager) GetPlugin(name string) *Plugin {
	return pm.plugins[name]
}

// EnablePlugin enables a plugin
func (pm *PluginManager) EnablePlugin(name string) error {
	p, ok := pm.plugins[name]
	if !ok {
		return fmt.Errorf("plugin not found: %s", name)
	}
	p.Enabled = true
	return nil
}

// DisablePlugin disables a plugin
func (pm *PluginManager) DisablePlugin(name string) error {
	p, ok := pm.plugins[name]
	if !ok {
		return fmt.Errorf("plugin not found: %s", name)
	}
	p.Enabled = false
	return nil
}

// FormatPluginList returns a formatted list
func (pm *PluginManager) FormatPluginList() string {
	if len(pm.plugins) == 0 {
		return "No plugins installed.\n\nInstall plugins by placing them in ~/.bc2/plugins/"
	}
	var sb strings.Builder
	sb.WriteString("Installed Plugins:\n")
	for _, p := range pm.plugins {
		status := "disabled"
		if p.Enabled {
			status = "enabled"
		}
		sb.WriteString(fmt.Sprintf("  [%s] %s v%s — %s\n", status, p.Name, p.Version, p.Description))
	}
	return sb.String()
}

func (pm *PluginManager) loadAll() {
	// Load from ~/.bc2/plugins/
	userDir := filepath.Join(config.GetConfigDir(), "plugins")
	pm.loadFromDir(userDir)

	// Load from project .bc2/plugins/
	cwd, _ := os.Getwd()
	projectDir := filepath.Join(cwd, ".bc2", "plugins")
	pm.loadFromDir(projectDir)
}

func (pm *PluginManager) loadFromDir(dir string) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return
	}

	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}
		pluginDir := filepath.Join(dir, entry.Name())
		manifestPath := filepath.Join(pluginDir, "plugin.json")
		data, err := os.ReadFile(manifestPath)
		if err != nil {
			continue
		}

		var plugin Plugin
		if err := json.Unmarshal(data, &plugin); err != nil {
			continue
		}
		plugin.Path = pluginDir
		if plugin.Name == "" {
			plugin.Name = entry.Name()
		}
		plugin.Enabled = true

		// Load commands from commands/ directory
		cmdDir := filepath.Join(pluginDir, "commands")
		if cmdEntries, err := os.ReadDir(cmdDir); err == nil {
			for _, ce := range cmdEntries {
				if strings.HasSuffix(ce.Name(), ".md") {
					content, _ := os.ReadFile(filepath.Join(cmdDir, ce.Name()))
					plugin.Commands = append(plugin.Commands, PluginCommand{
						Name:    strings.TrimSuffix(ce.Name(), ".md"),
						Content: string(content),
					})
				}
			}
		}

		pm.plugins[plugin.Name] = &plugin
	}
}
