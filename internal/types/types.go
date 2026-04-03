package types

import "time"

// Message roles
const (
	RoleUser      = "user"
	RoleAssistant = "assistant"
	RoleSystem    = "system"
)

// ContentBlock represents a content block in a message
type ContentBlock struct {
	Type      string `json:"type"`                 // "text", "tool_use", "tool_result", "thinking", "image"
	Text      string `json:"text,omitempty"`        // For text blocks
	ID        string `json:"id,omitempty"`          // For tool_use blocks
	Name      string `json:"name,omitempty"`        // For tool_use blocks
	Input     any    `json:"input,omitempty"`       // For tool_use blocks
	ToolUseID string `json:"tool_use_id,omitempty"` // For tool_result blocks
	Content   any    `json:"content,omitempty"`     // For tool_result blocks (string or []ContentBlock)
	IsError   bool   `json:"is_error,omitempty"`    // For tool_result blocks
	Thinking  string `json:"thinking,omitempty"`    // For thinking blocks
}

// Message represents an API message
type Message struct {
	Role    string         `json:"role"`
	Content []ContentBlock `json:"content"`
}

// InternalMessage wraps a Message with metadata for internal tracking
type InternalMessage struct {
	Message
	UUID      string    `json:"uuid"`
	Timestamp time.Time `json:"timestamp"`
	Type      string    `json:"type"` // "user", "assistant", "system"
}

// StreamEvent represents a streaming event from the API
type StreamEvent struct {
	Type  string `json:"type"`
	Index int    `json:"index,omitempty"`
	Delta *Delta `json:"delta,omitempty"`

	// message_start
	Message *APIResponse `json:"message,omitempty"`

	// content_block_start
	ContentBlock *ContentBlock `json:"content_block,omitempty"`

	// message_delta
	Usage *Usage `json:"usage,omitempty"`
}

// Delta represents incremental content
type Delta struct {
	Type         string `json:"type,omitempty"`
	Text         string `json:"text,omitempty"`
	PartialJSON  string `json:"partial_json,omitempty"`
	Thinking     string `json:"thinking,omitempty"`
	StopReason   string `json:"stop_reason,omitempty"`
	StopSequence string `json:"stop_sequence,omitempty"`
}

// APIResponse represents the full API response
type APIResponse struct {
	ID           string         `json:"id"`
	Type         string         `json:"type"`
	Role         string         `json:"role"`
	Content      []ContentBlock `json:"content"`
	Model        string         `json:"model"`
	StopReason   string         `json:"stop_reason"`
	StopSequence string         `json:"stop_sequence,omitempty"`
	Usage        Usage          `json:"usage"`
}

// Usage tracks token usage
type Usage struct {
	InputTokens              int `json:"input_tokens"`
	OutputTokens             int `json:"output_tokens"`
	CacheCreationInputTokens int `json:"cache_creation_input_tokens,omitempty"`
	CacheReadInputTokens     int `json:"cache_read_input_tokens,omitempty"`
}

// ToolDefinition is the schema sent to the API
type ToolDefinition struct {
	Name        string         `json:"name"`
	Description string         `json:"description"`
	InputSchema map[string]any `json:"input_schema"`
}

// ToolResult is returned by tool execution
type ToolResult struct {
	Content string // Text content
	IsError bool   // Whether this is an error result
}

// StopReason constants
const (
	StopReasonEndTurn       = "end_turn"
	StopReasonToolUse       = "tool_use"
	StopReasonMaxTokens     = "max_tokens"
	StopReasonStopSequence  = "stop_sequence"
)

// SessionConfig holds session-level configuration
type SessionConfig struct {
	Model              string
	MaxTokens          int
	SystemPrompt       string
	Temperature        *float64
	EnableThinking     bool
	ThinkingBudget     int
	MaxTurns           int
	PermissionMode     string
	// Structured output
	JSONSchema         map[string]any // If set, enforce structured JSON output
}

// DefaultSessionConfig returns sensible defaults
func DefaultSessionConfig() SessionConfig {
	return SessionConfig{
		Model:          "claude-sonnet-4-20250514",
		MaxTokens:      16384,
		MaxTurns:       100,
		PermissionMode: "default",
	}
}
