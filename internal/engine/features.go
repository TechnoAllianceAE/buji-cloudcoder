package engine

import (
	"os"
	"strings"
)

// FeatureFlag represents a compile-time or runtime feature flag
type FeatureFlag struct {
	Name        string
	Description string
	Enabled     bool
	Category    string // "agent", "ui", "tool", "rollout"
}

// FeatureFlags holds all feature flags
var FeatureFlags = map[string]*FeatureFlag{
	// Agent & Memory
	"AGENT_MEMORY_SNAPSHOT":  {Name: "AGENT_MEMORY_SNAPSHOT", Description: "Custom agent memory snapshots", Category: "agent"},
	"AGENT_TRIGGERS":         {Name: "AGENT_TRIGGERS", Description: "Local cron/trigger tools", Category: "agent"},
	"AGENT_TRIGGERS_REMOTE":  {Name: "AGENT_TRIGGERS_REMOTE", Description: "Remote trigger tool", Category: "agent"},
	"BUILTIN_EXPLORE_PLAN_AGENTS": {Name: "BUILTIN_EXPLORE_PLAN_AGENTS", Description: "Built-in agent presets", Category: "agent"},
	"EXTRACT_MEMORIES":       {Name: "EXTRACT_MEMORIES", Description: "Post-query memory extraction", Category: "agent"},
	"VERIFICATION_AGENT":     {Name: "VERIFICATION_AGENT", Description: "Verification guidance", Category: "agent"},
	"TEAMMEM":                {Name: "TEAMMEM", Description: "Team memory files & watchers", Category: "agent"},

	// UI & Interaction
	"AWAY_SUMMARY":           {Name: "AWAY_SUMMARY", Description: "Away-from-keyboard summary", Category: "ui"},
	"HISTORY_PICKER":         {Name: "HISTORY_PICKER", Description: "Interactive history picker", Category: "ui"},
	"KAIROS_BRIEF":           {Name: "KAIROS_BRIEF", Description: "Brief-only transcript mode", Category: "ui"},
	"MESSAGE_ACTIONS":        {Name: "MESSAGE_ACTIONS", Description: "Message action entrypoints", Category: "ui"},
	"QUICK_SEARCH":           {Name: "QUICK_SEARCH", Description: "Prompt quick-search", Category: "ui"},
	"TOKEN_BUDGET":           {Name: "TOKEN_BUDGET", Description: "Token budget tracking", Category: "ui"},
	"ULTRAPLAN":              {Name: "ULTRAPLAN", Description: "Extended planning", Category: "ui"},
	"ULTRATHINK":             {Name: "ULTRATHINK", Description: "Extra thinking depth", Category: "ui"},
	"VOICE_MODE":             {Name: "VOICE_MODE", Description: "Voice toggling & dictation", Category: "ui"},

	// Tools & Permissions
	"BASH_CLASSIFIER":        {Name: "BASH_CLASSIFIER", Description: "Classifier-assisted bash decisions", Category: "tool"},
	"BRIDGE_MODE":            {Name: "BRIDGE_MODE", Description: "Remote Control bridge", Category: "tool"},
	"POWERSHELL_AUTO_MODE":   {Name: "POWERSHELL_AUTO_MODE", Description: "PowerShell auto-mode", Category: "tool"},
	"TREE_SITTER_BASH":       {Name: "TREE_SITTER_BASH", Description: "Tree-sitter bash parser", Category: "tool"},

	// Compaction & Context
	"CACHED_MICROCOMPACT":    {Name: "CACHED_MICROCOMPACT", Description: "Cached compaction", Category: "tool"},
	"COMPACTION_REMINDERS":   {Name: "COMPACTION_REMINDERS", Description: "Compaction UI copy", Category: "tool"},
	"PROMPT_CACHE_BREAK_DETECTION": {Name: "PROMPT_CACHE_BREAK_DETECTION", Description: "Cache break detection", Category: "tool"},
}

// Feature checks if a feature flag is enabled
func Feature(name string) bool {
	// Check environment variable override
	envKey := "BC2_FEATURE_" + strings.ToUpper(name)
	if val := os.Getenv(envKey); val != "" {
		return val == "true" || val == "1"
	}

	flag, ok := FeatureFlags[name]
	if !ok {
		return false
	}
	return flag.Enabled
}

// EnableFeature enables a feature flag at runtime
func EnableFeature(name string) {
	if flag, ok := FeatureFlags[name]; ok {
		flag.Enabled = true
	}
}

// DisableFeature disables a feature flag at runtime
func DisableFeature(name string) {
	if flag, ok := FeatureFlags[name]; ok {
		flag.Enabled = false
	}
}

// ListFeatures returns all feature flags
func ListFeatures() []*FeatureFlag {
	result := make([]*FeatureFlag, 0, len(FeatureFlags))
	for _, f := range FeatureFlags {
		result = append(result, f)
	}
	return result
}

// EnableAllFeatures turns on all feature flags
func EnableAllFeatures() {
	for _, f := range FeatureFlags {
		f.Enabled = true
	}
}
