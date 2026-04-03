package tools

import (
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/types"
)

// CronJob represents a scheduled job
type CronJob struct {
	ID       string
	Name     string
	Schedule string // cron expression or interval
	Command  string
	Enabled  bool
	LastRun  time.Time
	NextRun  time.Time
}

// CronManager manages scheduled jobs
type CronManager struct {
	mu   sync.RWMutex
	jobs map[string]*CronJob
	nextID int
}

var globalCronManager = &CronManager{
	jobs: make(map[string]*CronJob),
}

// --- CronCreate ---

type CronCreateTool struct{}

func NewCronCreateTool() *CronCreateTool { return &CronCreateTool{} }
func (t *CronCreateTool) Name() string   { return "CronCreate" }
func (t *CronCreateTool) Description() string {
	return `Creates a scheduled cron job that runs a command on an interval.`
}
func (t *CronCreateTool) InputSchema() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"name":     map[string]any{"type": "string", "description": "Name for the cron job"},
			"schedule": map[string]any{"type": "string", "description": "Schedule (e.g., '5m', '1h', '*/5 * * * *')"},
			"command":  map[string]any{"type": "string", "description": "Command to execute"},
		},
		"required": []string{"name", "schedule", "command"},
	}
}
func (t *CronCreateTool) IsReadOnly(_ map[string]any) bool { return false }
func (t *CronCreateTool) Execute(input map[string]any, ctx *ToolContext) types.ToolResult {
	name, _ := input["name"].(string)
	schedule, _ := input["schedule"].(string)
	command, _ := input["command"].(string)

	globalCronManager.mu.Lock()
	globalCronManager.nextID++
	id := fmt.Sprintf("cron_%d", globalCronManager.nextID)
	job := &CronJob{
		ID:       id,
		Name:     name,
		Schedule: schedule,
		Command:  command,
		Enabled:  true,
		NextRun:  time.Now().Add(parseDuration(schedule)),
	}
	globalCronManager.jobs[id] = job
	globalCronManager.mu.Unlock()

	return types.ToolResult{Content: fmt.Sprintf("Created cron job %s: %s\nSchedule: %s\nCommand: %s", id, name, schedule, command)}
}

// --- CronDelete ---

type CronDeleteTool struct{}

func NewCronDeleteTool() *CronDeleteTool { return &CronDeleteTool{} }
func (t *CronDeleteTool) Name() string   { return "CronDelete" }
func (t *CronDeleteTool) Description() string {
	return `Deletes a scheduled cron job.`
}
func (t *CronDeleteTool) InputSchema() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"job_id": map[string]any{"type": "string", "description": "The cron job ID to delete"},
		},
		"required": []string{"job_id"},
	}
}
func (t *CronDeleteTool) IsReadOnly(_ map[string]any) bool { return false }
func (t *CronDeleteTool) Execute(input map[string]any, ctx *ToolContext) types.ToolResult {
	id, _ := input["job_id"].(string)
	globalCronManager.mu.Lock()
	defer globalCronManager.mu.Unlock()
	if _, ok := globalCronManager.jobs[id]; !ok {
		return types.ToolResult{Content: fmt.Sprintf("Cron job not found: %s", id), IsError: true}
	}
	delete(globalCronManager.jobs, id)
	return types.ToolResult{Content: fmt.Sprintf("Deleted cron job: %s", id)}
}

// --- CronList ---

type CronListTool struct{}

func NewCronListTool() *CronListTool { return &CronListTool{} }
func (t *CronListTool) Name() string { return "CronList" }
func (t *CronListTool) Description() string {
	return `Lists all scheduled cron jobs.`
}
func (t *CronListTool) InputSchema() map[string]any {
	return map[string]any{"type": "object", "properties": map[string]any{}}
}
func (t *CronListTool) IsReadOnly(_ map[string]any) bool { return true }
func (t *CronListTool) Execute(input map[string]any, ctx *ToolContext) types.ToolResult {
	globalCronManager.mu.RLock()
	defer globalCronManager.mu.RUnlock()
	if len(globalCronManager.jobs) == 0 {
		return types.ToolResult{Content: "No cron jobs scheduled."}
	}
	var sb strings.Builder
	sb.WriteString("Scheduled Jobs:\n")
	for _, job := range globalCronManager.jobs {
		status := "enabled"
		if !job.Enabled {
			status = "disabled"
		}
		sb.WriteString(fmt.Sprintf("  %s: %s [%s] schedule=%s cmd=%s\n", job.ID, job.Name, status, job.Schedule, job.Command))
	}
	return types.ToolResult{Content: sb.String()}
}

func parseDuration(s string) time.Duration {
	d, err := time.ParseDuration(s)
	if err != nil {
		return 10 * time.Minute // default
	}
	return d
}
