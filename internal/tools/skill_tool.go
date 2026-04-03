package tools

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/types"
)

// SkillTool invokes a skill by name
type SkillTool struct{}

func NewSkillTool() *SkillTool { return &SkillTool{} }
func (t *SkillTool) Name() string { return "Skill" }
func (t *SkillTool) Description() string {
	return `Invokes a skill (custom command) by name. Skills are loaded from .bc2/skills/ directories and provide specialized prompts and workflows.`
}
func (t *SkillTool) InputSchema() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"skill": map[string]any{
				"type":        "string",
				"description": "The skill name to invoke",
			},
			"args": map[string]any{
				"type":        "string",
				"description": "Optional arguments for the skill",
			},
		},
		"required": []string{"skill"},
	}
}
func (t *SkillTool) IsReadOnly(_ map[string]any) bool { return true }
func (t *SkillTool) Execute(input map[string]any, ctx *ToolContext) types.ToolResult {
	skillName, _ := input["skill"].(string)
	args, _ := input["args"].(string)

	if skillName == "" {
		return types.ToolResult{Content: "Error: skill name is required", IsError: true}
	}

	// Search for skill in known directories
	skillDirs := []string{
		filepath.Join(ctx.CWD, ".bc2", "skills"),
	}
	if home, err := os.UserHomeDir(); err == nil {
		skillDirs = append(skillDirs, filepath.Join(home, ".bc2", "skills"))
	}

	for _, dir := range skillDirs {
		// Check for SKILL.md in directory
		skillDir := filepath.Join(dir, skillName, "SKILL.md")
		if data, err := os.ReadFile(skillDir); err == nil {
			content := substituteArgs(string(data), args)
			return types.ToolResult{Content: content}
		}
		// Check for skill.md file
		skillFile := filepath.Join(dir, skillName+".md")
		if data, err := os.ReadFile(skillFile); err == nil {
			content := substituteArgs(string(data), args)
			return types.ToolResult{Content: content}
		}
	}

	return types.ToolResult{
		Content: fmt.Sprintf("Skill '%s' not found. Check .bc2/skills/ directories.", skillName),
		IsError: true,
	}
}

// substituteArgs replaces $1, $2, etc. with arguments
func substituteArgs(content, args string) string {
	if args == "" {
		return content
	}
	parts := strings.Fields(args)
	for i, part := range parts {
		placeholder := fmt.Sprintf("$%d", i+1)
		content = strings.ReplaceAll(content, placeholder, part)
	}
	// Replace $ARGS with full args string
	content = strings.ReplaceAll(content, "$ARGS", args)
	return content
}
