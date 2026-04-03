package api

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/types"
)

const (
	DefaultBaseURL    = "https://api.anthropic.com"
	DefaultAPIVersion = "2023-06-01"
	MessagesEndpoint  = "/v1/messages"
)

// Client is the API client for Anthropic-compatible endpoints
type Client struct {
	APIKey     string
	BaseURL    string
	APIVersion string
	HTTPClient *http.Client
}

// NewClient creates a new API client
func NewClient(apiKey, baseURL string) *Client {
	if baseURL == "" {
		baseURL = DefaultBaseURL
	}
	return &Client{
		APIKey:     apiKey,
		BaseURL:    strings.TrimRight(baseURL, "/"),
		APIVersion: DefaultAPIVersion,
		HTTPClient: http.DefaultClient,
	}
}

// MessagesRequest is the request body for the messages API
type MessagesRequest struct {
	Model       string                 `json:"model"`
	MaxTokens   int                    `json:"max_tokens"`
	Messages    []types.Message        `json:"messages"`
	System      any                    `json:"system,omitempty"`      // string or []SystemBlock
	Tools       []types.ToolDefinition `json:"tools,omitempty"`
	ToolChoice  any                    `json:"tool_choice,omitempty"` // "auto", "any", or {"type":"tool","name":"..."}
	Stream      bool                   `json:"stream"`
	Temperature *float64               `json:"temperature,omitempty"`
	Thinking    *ThinkingConfig        `json:"thinking,omitempty"`
	Metadata    map[string]string      `json:"metadata,omitempty"`

	// Structured output — forces model to return valid JSON matching the schema
	// Uses a hidden tool "_structured_output" to enforce the schema via tool_use
	structuredSchema map[string]any `json:"-"`
}

// SetStructuredOutput configures the request to enforce JSON output matching a schema.
// This works by injecting a hidden tool whose input_schema is the desired output schema,
// and setting tool_choice to force the model to call it.
func (r *MessagesRequest) SetStructuredOutput(schema map[string]any) {
	r.structuredSchema = schema

	// Add the structured output enforcement tool
	r.Tools = append(r.Tools, types.ToolDefinition{
		Name:        "_structured_output",
		Description: "Return a structured JSON response matching the required schema. You MUST call this tool with your response.",
		InputSchema: schema,
	})

	// Force the model to use this tool
	r.ToolChoice = map[string]any{
		"type": "tool",
		"name": "_structured_output",
	}
}

// IsStructuredOutput returns whether this request uses structured output
func (r *MessagesRequest) IsStructuredOutput() bool {
	return r.structuredSchema != nil
}

// ExtractStructuredOutput pulls the JSON result from a structured output response
func ExtractStructuredOutput(resp *types.APIResponse) (map[string]any, error) {
	for _, block := range resp.Content {
		if block.Type == "tool_use" && block.Name == "_structured_output" {
			if m, ok := block.Input.(map[string]any); ok {
				return m, nil
			}
			// Try JSON round-trip
			data, err := json.Marshal(block.Input)
			if err != nil {
				return nil, fmt.Errorf("marshal structured output: %w", err)
			}
			var result map[string]any
			if err := json.Unmarshal(data, &result); err != nil {
				return nil, fmt.Errorf("unmarshal structured output: %w", err)
			}
			return result, nil
		}
	}
	return nil, fmt.Errorf("no structured output found in response")
}

// ThinkingConfig for extended thinking
type ThinkingConfig struct {
	Type         string `json:"type"`
	BudgetTokens int    `json:"budget_tokens,omitempty"`
}

// SystemBlock is a system prompt block
type SystemBlock struct {
	Type         string        `json:"type"`
	Text         string        `json:"text,omitempty"`
	CacheControl *CacheControl `json:"cache_control,omitempty"`
}

// CacheControl for prompt caching
type CacheControl struct {
	Type string `json:"type"` // "ephemeral"
}

// StreamCallback is called for each streamed event
type StreamCallback func(event types.StreamEvent) error

// CreateMessageStream sends a streaming messages request
func (c *Client) CreateMessageStream(req MessagesRequest, callback StreamCallback) (*types.APIResponse, error) {
	req.Stream = true

	body, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("marshal request: %w", err)
	}

	httpReq, err := http.NewRequest("POST", c.BaseURL+MessagesEndpoint, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("create request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("X-API-Key", c.APIKey)
	httpReq.Header.Set("anthropic-version", c.APIVersion)
	httpReq.Header.Set("anthropic-beta", "prompt-caching-2024-07-31")
	httpReq.Header.Set("User-Agent", "bc2/1.0")

	resp, err := c.HTTPClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("API error (status %d): %s", resp.StatusCode, string(body))
	}

	return c.processSSEStream(resp.Body, callback)
}

// processSSEStream reads server-sent events and calls the callback
func (c *Client) processSSEStream(reader io.Reader, callback StreamCallback) (*types.APIResponse, error) {
	scanner := bufio.NewScanner(reader)
	scanner.Buffer(make([]byte, 1024*1024), 1024*1024) // 1MB buffer

	var finalResponse *types.APIResponse
	var currentBlocks []types.ContentBlock

	for scanner.Scan() {
		line := scanner.Text()

		if !strings.HasPrefix(line, "data: ") {
			continue
		}

		data := strings.TrimPrefix(line, "data: ")
		if data == "[DONE]" {
			break
		}

		var event types.StreamEvent
		if err := json.Unmarshal([]byte(data), &event); err != nil {
			continue // Skip malformed events
		}

		switch event.Type {
		case "message_start":
			if event.Message != nil {
				finalResponse = event.Message
				currentBlocks = nil
			}

		case "content_block_start":
			if event.ContentBlock != nil {
				currentBlocks = append(currentBlocks, *event.ContentBlock)
			}

		case "content_block_delta":
			if event.Delta != nil && event.Index < len(currentBlocks) {
				block := &currentBlocks[event.Index]
				switch event.Delta.Type {
				case "text_delta":
					block.Text += event.Delta.Text
				case "input_json_delta":
					if s, ok := block.Input.(string); ok {
						block.Input = s + event.Delta.PartialJSON
					} else {
						block.Input = event.Delta.PartialJSON
					}
				case "thinking_delta":
					block.Thinking += event.Delta.Thinking
				}
			}

		case "content_block_stop":
			// Finalize tool_use input JSON
			if event.Index < len(currentBlocks) {
				block := &currentBlocks[event.Index]
				if block.Type == "tool_use" {
					if jsonStr, ok := block.Input.(string); ok {
						var parsed any
						if err := json.Unmarshal([]byte(jsonStr), &parsed); err == nil {
							block.Input = parsed
						}
					}
				}
			}

		case "message_delta":
			if event.Delta != nil && finalResponse != nil {
				finalResponse.StopReason = event.Delta.StopReason
			}
			if event.Usage != nil && finalResponse != nil {
				finalResponse.Usage.OutputTokens = event.Usage.OutputTokens
			}

		case "message_stop":
			// Message complete
		}

		if err := callback(event); err != nil {
			return finalResponse, err
		}
	}

	if finalResponse != nil {
		finalResponse.Content = currentBlocks
	}

	return finalResponse, scanner.Err()
}

// CreateMessage sends a non-streaming messages request
func (c *Client) CreateMessage(req MessagesRequest) (*types.APIResponse, error) {
	req.Stream = false

	body, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("marshal request: %w", err)
	}

	httpReq, err := http.NewRequest("POST", c.BaseURL+MessagesEndpoint, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("create request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("X-API-Key", c.APIKey)
	httpReq.Header.Set("anthropic-version", c.APIVersion)
	httpReq.Header.Set("User-Agent", "bc2/1.0")

	resp, err := c.HTTPClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		errBody, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("API error (status %d): %s", resp.StatusCode, string(errBody))
	}

	var result types.APIResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("decode response: %w", err)
	}
	return &result, nil
}
