package tools

import (
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/types"
)

// TaskStatus constants
const (
	TaskPending   = "pending"
	TaskRunning   = "in_progress"
	TaskCompleted = "completed"
	TaskFailed    = "failed"
	TaskStopped   = "stopped"
)

// Task represents a managed task
type Task struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	Output      string    `json:"output,omitempty"`
}

// TaskManager holds all tasks in a session
type TaskManager struct {
	mu    sync.RWMutex
	tasks map[string]*Task
	order []string
	nextID int
}

// Global task manager (shared across tools)
var globalTaskManager = &TaskManager{
	tasks: make(map[string]*Task),
}

// GetTaskManager returns the global task manager
func GetTaskManager() *TaskManager { return globalTaskManager }

func (tm *TaskManager) Create(title, description, status string) *Task {
	tm.mu.Lock()
	defer tm.mu.Unlock()

	tm.nextID++
	id := fmt.Sprintf("task_%d", tm.nextID)
	if status == "" {
		status = TaskPending
	}

	t := &Task{
		ID:          id,
		Title:       title,
		Description: description,
		Status:      status,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	tm.tasks[id] = t
	tm.order = append(tm.order, id)
	return t
}

func (tm *TaskManager) Get(id string) *Task {
	tm.mu.RLock()
	defer tm.mu.RUnlock()
	return tm.tasks[id]
}

func (tm *TaskManager) Update(id, status string) error {
	tm.mu.Lock()
	defer tm.mu.Unlock()
	t, ok := tm.tasks[id]
	if !ok {
		return fmt.Errorf("task not found: %s", id)
	}
	t.Status = status
	t.UpdatedAt = time.Now()
	return nil
}

func (tm *TaskManager) Stop(id string) error {
	return tm.Update(id, TaskStopped)
}

func (tm *TaskManager) List() []*Task {
	tm.mu.RLock()
	defer tm.mu.RUnlock()
	result := make([]*Task, 0, len(tm.order))
	for _, id := range tm.order {
		result = append(result, tm.tasks[id])
	}
	return result
}

// --- TaskCreate Tool ---

type TaskCreateTool struct{}

func NewTaskCreateTool() *TaskCreateTool { return &TaskCreateTool{} }
func (t *TaskCreateTool) Name() string   { return "TaskCreate" }
func (t *TaskCreateTool) Description() string {
	return `Creates a new task to track work progress. Use this to break down complex work into discrete steps.`
}
func (t *TaskCreateTool) InputSchema() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"title":       map[string]any{"type": "string", "description": "Short task title"},
			"description": map[string]any{"type": "string", "description": "Detailed task description"},
			"status": map[string]any{
				"type": "string",
				"enum": []string{"pending", "in_progress", "completed"},
				"description": "Initial status (default: pending)",
			},
		},
		"required": []string{"title"},
	}
}
func (t *TaskCreateTool) IsReadOnly(_ map[string]any) bool { return false }
func (t *TaskCreateTool) Execute(input map[string]any, ctx *ToolContext) types.ToolResult {
	title, _ := input["title"].(string)
	desc, _ := input["description"].(string)
	status, _ := input["status"].(string)
	if title == "" {
		return types.ToolResult{Content: "Error: title is required", IsError: true}
	}
	task := globalTaskManager.Create(title, desc, status)
	return types.ToolResult{Content: fmt.Sprintf("Created task %s: %s [%s]", task.ID, task.Title, task.Status)}
}

// --- TaskGet Tool ---

type TaskGetTool struct{}

func NewTaskGetTool() *TaskGetTool { return &TaskGetTool{} }
func (t *TaskGetTool) Name() string { return "TaskGet" }
func (t *TaskGetTool) Description() string {
	return `Gets the details and status of a specific task by ID.`
}
func (t *TaskGetTool) InputSchema() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"task_id": map[string]any{"type": "string", "description": "The task ID"},
		},
		"required": []string{"task_id"},
	}
}
func (t *TaskGetTool) IsReadOnly(_ map[string]any) bool { return true }
func (t *TaskGetTool) Execute(input map[string]any, ctx *ToolContext) types.ToolResult {
	id, _ := input["task_id"].(string)
	task := globalTaskManager.Get(id)
	if task == nil {
		return types.ToolResult{Content: fmt.Sprintf("Task not found: %s", id), IsError: true}
	}
	return types.ToolResult{Content: fmt.Sprintf("Task %s: %s\nStatus: %s\nDescription: %s\nCreated: %s\nUpdated: %s",
		task.ID, task.Title, task.Status, task.Description,
		task.CreatedAt.Format(time.RFC3339), task.UpdatedAt.Format(time.RFC3339))}
}

// --- TaskUpdate Tool ---

type TaskUpdateTool struct{}

func NewTaskUpdateTool() *TaskUpdateTool { return &TaskUpdateTool{} }
func (t *TaskUpdateTool) Name() string   { return "TaskUpdate" }
func (t *TaskUpdateTool) Description() string {
	return `Updates the status of a task. Set to in_progress when starting, completed when done.`
}
func (t *TaskUpdateTool) InputSchema() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"task_id": map[string]any{"type": "string", "description": "The task ID"},
			"status": map[string]any{
				"type": "string",
				"enum": []string{"pending", "in_progress", "completed", "failed", "stopped"},
				"description": "New status",
			},
		},
		"required": []string{"task_id", "status"},
	}
}
func (t *TaskUpdateTool) IsReadOnly(_ map[string]any) bool { return false }
func (t *TaskUpdateTool) Execute(input map[string]any, ctx *ToolContext) types.ToolResult {
	id, _ := input["task_id"].(string)
	status, _ := input["status"].(string)
	if err := globalTaskManager.Update(id, status); err != nil {
		return types.ToolResult{Content: err.Error(), IsError: true}
	}
	return types.ToolResult{Content: fmt.Sprintf("Task %s updated to: %s", id, status)}
}

// --- TaskList Tool ---

type TaskListTool struct{}

func NewTaskListTool() *TaskListTool { return &TaskListTool{} }
func (t *TaskListTool) Name() string { return "TaskList" }
func (t *TaskListTool) Description() string {
	return `Lists all tasks and their statuses.`
}
func (t *TaskListTool) InputSchema() map[string]any {
	return map[string]any{"type": "object", "properties": map[string]any{}}
}
func (t *TaskListTool) IsReadOnly(_ map[string]any) bool { return true }
func (t *TaskListTool) Execute(input map[string]any, ctx *ToolContext) types.ToolResult {
	tasks := globalTaskManager.List()
	if len(tasks) == 0 {
		return types.ToolResult{Content: "No tasks created yet."}
	}
	var sb strings.Builder
	for _, task := range tasks {
		icon := "[ ]"
		switch task.Status {
		case TaskCompleted:
			icon = "[x]"
		case TaskRunning:
			icon = "[~]"
		case TaskFailed:
			icon = "[!]"
		case TaskStopped:
			icon = "[-]"
		}
		sb.WriteString(fmt.Sprintf("%s %s: %s (%s)\n", icon, task.ID, task.Title, task.Status))
	}
	return types.ToolResult{Content: sb.String()}
}

// --- TaskStop Tool ---

type TaskStopTool struct{}

func NewTaskStopTool() *TaskStopTool { return &TaskStopTool{} }
func (t *TaskStopTool) Name() string { return "TaskStop" }
func (t *TaskStopTool) Description() string {
	return `Stops/cancels a running task.`
}
func (t *TaskStopTool) InputSchema() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"task_id": map[string]any{"type": "string", "description": "The task ID to stop"},
		},
		"required": []string{"task_id"},
	}
}
func (t *TaskStopTool) IsReadOnly(_ map[string]any) bool { return false }
func (t *TaskStopTool) Execute(input map[string]any, ctx *ToolContext) types.ToolResult {
	id, _ := input["task_id"].(string)
	if err := globalTaskManager.Stop(id); err != nil {
		return types.ToolResult{Content: err.Error(), IsError: true}
	}
	return types.ToolResult{Content: fmt.Sprintf("Task %s stopped.", id)}
}
