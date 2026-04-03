package engine

import (
	"context"
	"fmt"
	"strings"
	"sync"
	"time"
)

// BackgroundTask represents a task running in a goroutine
type BackgroundTask struct {
	ID        string
	Title     string
	Status    string // "running", "completed", "failed", "stopped"
	Output    strings.Builder
	StartedAt time.Time
	EndedAt   time.Time
	Cancel    context.CancelFunc
	mu        sync.Mutex
}

// BackgroundTaskManager manages background goroutine tasks
type BackgroundTaskManager struct {
	mu    sync.RWMutex
	tasks map[string]*BackgroundTask
	nextID int
}

// NewBackgroundTaskManager creates a new manager
func NewBackgroundTaskManager() *BackgroundTaskManager {
	return &BackgroundTaskManager{
		tasks: make(map[string]*BackgroundTask),
	}
}

// global instance
var bgTaskManager = NewBackgroundTaskManager()

// GetBackgroundTaskManager returns the global background task manager
func GetBackgroundTaskManager() *BackgroundTaskManager { return bgTaskManager }

// SpawnTask starts a background task
func (m *BackgroundTaskManager) SpawnTask(title string, fn func(ctx context.Context, output *strings.Builder) error) string {
	m.mu.Lock()
	m.nextID++
	id := fmt.Sprintf("bg_%d", m.nextID)
	ctx, cancel := context.WithCancel(context.Background())

	task := &BackgroundTask{
		ID:        id,
		Title:     title,
		Status:    "running",
		StartedAt: time.Now(),
		Cancel:    cancel,
	}
	m.tasks[id] = task
	m.mu.Unlock()

	go func() {
		err := fn(ctx, &task.Output)
		task.mu.Lock()
		defer task.mu.Unlock()
		task.EndedAt = time.Now()
		if err != nil {
			if ctx.Err() == context.Canceled {
				task.Status = "stopped"
			} else {
				task.Status = "failed"
				task.Output.WriteString(fmt.Sprintf("\nError: %v", err))
			}
		} else {
			task.Status = "completed"
		}
	}()

	return id
}

// GetTask returns a background task
func (m *BackgroundTaskManager) GetTask(id string) *BackgroundTask {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.tasks[id]
}

// StopTask cancels a running task
func (m *BackgroundTaskManager) StopTask(id string) error {
	m.mu.RLock()
	task, ok := m.tasks[id]
	m.mu.RUnlock()
	if !ok {
		return fmt.Errorf("task not found: %s", id)
	}
	if task.Status != "running" {
		return fmt.Errorf("task %s is not running (status: %s)", id, task.Status)
	}
	task.Cancel()
	return nil
}

// ListTasks returns all background tasks
func (m *BackgroundTaskManager) ListTasks() []*BackgroundTask {
	m.mu.RLock()
	defer m.mu.RUnlock()
	result := make([]*BackgroundTask, 0, len(m.tasks))
	for _, t := range m.tasks {
		result = append(result, t)
	}
	return result
}

// GetOutput returns the current output of a task
func (m *BackgroundTaskManager) GetOutput(id string) (string, error) {
	m.mu.RLock()
	task, ok := m.tasks[id]
	m.mu.RUnlock()
	if !ok {
		return "", fmt.Errorf("task not found: %s", id)
	}
	task.mu.Lock()
	defer task.mu.Unlock()
	return task.Output.String(), nil
}

// FormatTaskList returns a formatted list of background tasks
func (m *BackgroundTaskManager) FormatTaskList() string {
	tasks := m.ListTasks()
	if len(tasks) == 0 {
		return "No background tasks."
	}
	var sb strings.Builder
	sb.WriteString("Background Tasks:\n")
	for _, t := range tasks {
		icon := "~"
		switch t.Status {
		case "completed":
			icon = "+"
		case "failed":
			icon = "!"
		case "stopped":
			icon = "-"
		}
		duration := time.Since(t.StartedAt)
		if !t.EndedAt.IsZero() {
			duration = t.EndedAt.Sub(t.StartedAt)
		}
		sb.WriteString(fmt.Sprintf("  [%s] %s: %s (%s)\n", icon, t.ID, t.Title, duration.Round(time.Second)))
	}
	return sb.String()
}
