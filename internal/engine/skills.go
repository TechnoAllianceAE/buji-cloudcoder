package engine

import (
	"os"
	"path/filepath"
	"strings"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/config"
)

// Skill represents a loaded skill
type Skill struct {
	Name        string
	Description string
	Content     string
	WhenToUse   string
	AllowedTools []string
	FilePath    string
	Source      string // "user", "project", "bundled"
}

// SkillLoader discovers and loads skills
type SkillLoader struct {
	skills map[string]*Skill
}

// NewSkillLoader creates a skill loader
func NewSkillLoader() *SkillLoader {
	sl := &SkillLoader{
		skills: make(map[string]*Skill),
	}
	sl.loadAll()
	return sl
}

// GetSkills returns all loaded skills
func (sl *SkillLoader) GetSkills() map[string]*Skill {
	return sl.skills
}

// GetSkill returns a skill by name
func (sl *SkillLoader) GetSkill(name string) *Skill {
	return sl.skills[name]
}

func (sl *SkillLoader) loadAll() {
	// Load from ~/.bc2/skills/
	userSkillsDir := filepath.Join(config.GetConfigDir(), "skills")
	sl.loadFromDir(userSkillsDir, "user")

	// Load from project .bc2/skills/
	cwd, _ := os.Getwd()
	projectSkillsDir := filepath.Join(cwd, ".bc2", "skills")
	sl.loadFromDir(projectSkillsDir, "project")
}

func (sl *SkillLoader) loadFromDir(dir, source string) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return
	}

	for _, entry := range entries {
		if entry.IsDir() {
			// Check for SKILL.md inside directory
			skillFile := filepath.Join(dir, entry.Name(), "SKILL.md")
			if data, err := os.ReadFile(skillFile); err == nil {
				skill := parseSkillFile(string(data), skillFile, source)
				if skill.Name == "" {
					skill.Name = entry.Name()
				}
				sl.skills[skill.Name] = skill
			}
		} else if strings.HasSuffix(entry.Name(), ".md") {
			path := filepath.Join(dir, entry.Name())
			data, err := os.ReadFile(path)
			if err != nil {
				continue
			}
			skill := parseSkillFile(string(data), path, source)
			if skill.Name == "" {
				skill.Name = strings.TrimSuffix(entry.Name(), ".md")
			}
			sl.skills[skill.Name] = skill
		}
	}
}

func parseSkillFile(content, path, source string) *Skill {
	skill := &Skill{
		FilePath: path,
		Source:   source,
	}

	// Parse YAML frontmatter
	if strings.HasPrefix(content, "---\n") {
		parts := strings.SplitN(content[4:], "\n---\n", 2)
		if len(parts) == 2 {
			for _, line := range strings.Split(parts[0], "\n") {
				kv := strings.SplitN(line, ": ", 2)
				if len(kv) != 2 {
					continue
				}
				key := strings.TrimSpace(kv[0])
				val := strings.TrimSpace(kv[1])
				switch key {
				case "name":
					skill.Name = val
				case "description":
					skill.Description = val
				case "when-to-use":
					skill.WhenToUse = val
				case "allowed-tools":
					skill.AllowedTools = strings.Split(val, ",")
					for i := range skill.AllowedTools {
						skill.AllowedTools[i] = strings.TrimSpace(skill.AllowedTools[i])
					}
				}
			}
			skill.Content = strings.TrimSpace(parts[1])
		} else {
			skill.Content = content
		}
	} else {
		skill.Content = content
	}

	return skill
}
