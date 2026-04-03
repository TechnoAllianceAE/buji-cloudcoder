package api

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/types"
)

// OpenAICompatProvider works with any OpenAI-compatible API:
// OpenAI, OpenRouter, Groq, Cerebras, Together, Ollama, LM Studio, vLLM, etc.
type OpenAICompatProvider struct {
	name       string
	apiKey     string
	baseURL    string
	httpClient *http.Client
	headers    map[string]string // extra headers (e.g., OpenRouter site info)
}

// OpenAICompatConfig configures an OpenAI-compatible provider
type OpenAICompatConfig struct {
	Name       string
	APIKey     string
	BaseURL    string
	Timeout    time.Duration
	Headers    map[string]string
}

// NewOpenAICompatProvider creates a provider for any OpenAI-compatible API
func NewOpenAICompatProvider(cfg OpenAICompatConfig) *OpenAICompatProvider {
	timeout := cfg.Timeout
	if timeout == 0 {
		timeout = 120 * time.Second
	}
	return &OpenAICompatProvider{
		name:       cfg.Name,
		apiKey:     cfg.APIKey,
		baseURL:    strings.TrimRight(cfg.BaseURL, "/"),
		httpClient: &http.Client{Timeout: timeout},
		headers:    cfg.Headers,
	}
}

func (p *OpenAICompatProvider) Name() string { return p.name }

// --- OpenAI request/response types ---

type openAIRequest struct {
	Model       string            `json:"model"`
	Messages    []openAIMessage   `json:"messages"`
	Tools       []openAITool      `json:"tools,omitempty"`
	MaxTokens   int               `json:"max_tokens,omitempty"`
	Temperature *float64          `json:"temperature,omitempty"`
	Stream      bool              `json:"stream"`
}

type openAIMessage struct {
	Role       string          `json:"role"`
	Content    any             `json:"content"`           // string or []contentPart
	ToolCalls  []openAIToolCall `json:"tool_calls,omitempty"`
	ToolCallID string          `json:"tool_call_id,omitempty"`
}

type openAITool struct {
	Type     string         `json:"type"` // "function"
	Function openAIFunction `json:"function"`
}

type openAIFunction struct {
	Name        string         `json:"name"`
	Description string         `json:"description"`
	Parameters  map[string]any `json:"parameters"`
}

type openAIToolCall struct {
	Index    int    `json:"index"`
	ID       string `json:"id"`
	Type     string `json:"type"` // "function"
	Function struct {
		Name      string `json:"name"`
		Arguments string `json:"arguments"`
	} `json:"function"`
}

type openAIStreamChunk struct {
	ID      string `json:"id"`
	Object  string `json:"object"`
	Model   string `json:"model"`
	Choices []struct {
		Index int `json:"index"`
		Delta struct {
			Role      string          `json:"role,omitempty"`
			Content   string          `json:"content,omitempty"`
			ToolCalls []openAIToolCall `json:"tool_calls,omitempty"`
		} `json:"delta"`
		FinishReason *string `json:"finish_reason"`
	} `json:"choices"`
	Usage *struct {
		PromptTokens     int `json:"prompt_tokens"`
		CompletionTokens int `json:"completion_tokens"`
		TotalTokens      int `json:"total_tokens"`
	} `json:"usage,omitempty"`
}

func (p *OpenAICompatProvider) StreamCompletion(ctx context.Context, req ProviderRequest, callback StreamCallback) (*types.APIResponse, error) {
	// Convert messages to OpenAI format
	oaiMessages := convertToOpenAIMessages(req.Messages, req.System)
	oaiTools := convertToOpenAITools(req.Tools)

	oaiReq := openAIRequest{
		Model:       req.Model,
		Messages:    oaiMessages,
		Tools:       oaiTools,
		MaxTokens:   req.MaxTokens,
		Temperature: req.Temperature,
		Stream:      true,
	}

	body, err := json.Marshal(oaiReq)
	if err != nil {
		return nil, fmt.Errorf("marshal request: %w", err)
	}

	endpoint := p.baseURL + "/chat/completions"
	httpReq, err := http.NewRequestWithContext(ctx, "POST", endpoint, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("create request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")
	if p.apiKey != "" {
		httpReq.Header.Set("Authorization", "Bearer "+p.apiKey)
	}
	for k, v := range p.headers {
		httpReq.Header.Set(k, v)
	}

	resp, err := p.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		errBody, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("API error (status %d): %s", resp.StatusCode, string(errBody))
	}

	return p.processOpenAIStream(resp.Body, callback)
}

func (p *OpenAICompatProvider) processOpenAIStream(reader io.Reader, callback StreamCallback) (*types.APIResponse, error) {
	scanner := bufio.NewScanner(reader)
	scanner.Buffer(make([]byte, 1024*1024), 1024*1024)

	finalResp := &types.APIResponse{
		Role: "assistant",
	}

	// Accumulate content and tool calls
	var textContent strings.Builder
	toolCalls := make(map[int]*openAIToolCall) // index -> accumulated tool call

	for scanner.Scan() {
		line := scanner.Text()
		if !strings.HasPrefix(line, "data: ") {
			continue
		}
		data := strings.TrimPrefix(line, "data: ")
		if data == "[DONE]" {
			break
		}

		var chunk openAIStreamChunk
		if err := json.Unmarshal([]byte(data), &chunk); err != nil {
			continue
		}

		if len(chunk.Choices) == 0 {
			// Usage-only chunk (some providers send this at the end)
			if chunk.Usage != nil {
				finalResp.Usage.InputTokens = chunk.Usage.PromptTokens
				finalResp.Usage.OutputTokens = chunk.Usage.CompletionTokens
			}
			continue
		}

		choice := chunk.Choices[0]

		// Text content
		if choice.Delta.Content != "" {
			textContent.WriteString(choice.Delta.Content)
			// Emit as Anthropic-style stream event for the callback
			_ = callback(types.StreamEvent{
				Type: "content_block_delta",
				Delta: &types.Delta{
					Type: "text_delta",
					Text: choice.Delta.Content,
				},
			})
		}

		// Tool calls (streamed incrementally)
		for _, tc := range choice.Delta.ToolCalls {
			idx := tc.Index
			existing, ok := toolCalls[idx]
			if !ok {
				existing = &openAIToolCall{
					ID:   tc.ID,
					Type: tc.Type,
				}
				existing.Function.Name = tc.Function.Name
				toolCalls[idx] = existing
			}
			if tc.ID != "" {
				existing.ID = tc.ID
			}
			if tc.Function.Name != "" {
				existing.Function.Name = tc.Function.Name
			}
			existing.Function.Arguments += tc.Function.Arguments
		}

		// Finish reason
		if choice.FinishReason != nil {
			switch *choice.FinishReason {
			case "stop":
				finalResp.StopReason = types.StopReasonEndTurn
			case "tool_calls":
				finalResp.StopReason = types.StopReasonToolUse
			case "length":
				finalResp.StopReason = types.StopReasonMaxTokens
			}
		}

		// Usage
		if chunk.Usage != nil {
			finalResp.Usage.InputTokens = chunk.Usage.PromptTokens
			finalResp.Usage.OutputTokens = chunk.Usage.CompletionTokens
		}
	}

	// Build content blocks in Anthropic format
	if textContent.Len() > 0 {
		finalResp.Content = append(finalResp.Content, types.ContentBlock{
			Type: "text",
			Text: textContent.String(),
		})
	}

	// Convert tool calls to Anthropic tool_use blocks
	for _, tc := range toolCalls {
		var input any
		if tc.Function.Arguments != "" {
			_ = json.Unmarshal([]byte(tc.Function.Arguments), &input)
		}
		if input == nil {
			input = map[string]any{}
		}

		finalResp.Content = append(finalResp.Content, types.ContentBlock{
			Type:  "tool_use",
			ID:    tc.ID,
			Name:  tc.Function.Name,
			Input: input,
		})
	}

	if finalResp.StopReason == "" {
		if len(toolCalls) > 0 {
			finalResp.StopReason = types.StopReasonToolUse
		} else {
			finalResp.StopReason = types.StopReasonEndTurn
		}
	}

	return finalResp, scanner.Err()
}

// --- Message conversion helpers ---

func convertToOpenAIMessages(msgs []types.Message, systemPrompt string) []openAIMessage {
	var result []openAIMessage

	// System message first
	if systemPrompt != "" {
		result = append(result, openAIMessage{
			Role:    "system",
			Content: systemPrompt,
		})
	}

	for _, msg := range msgs {
		switch msg.Role {
		case "user":
			oaiMsg := openAIMessage{Role: "user"}
			// Collect text and tool results
			var textParts []string
			var toolResults []openAIMessage

			for _, block := range msg.Content {
				switch block.Type {
				case "text":
					textParts = append(textParts, block.Text)
				case "tool_result":
					content := ""
					if s, ok := block.Content.(string); ok {
						content = s
					}
					toolResults = append(toolResults, openAIMessage{
						Role:       "tool",
						Content:    content,
						ToolCallID: block.ToolUseID,
					})
				}
			}

			if len(toolResults) > 0 {
				// Tool results go as separate "tool" role messages
				result = append(result, toolResults...)
			} else {
				oaiMsg.Content = strings.Join(textParts, "\n")
				result = append(result, oaiMsg)
			}

		case "assistant":
			oaiMsg := openAIMessage{Role: "assistant"}
			var textParts []string
			var toolCalls []openAIToolCall

			for _, block := range msg.Content {
				switch block.Type {
				case "text":
					textParts = append(textParts, block.Text)
				case "tool_use":
					argsJSON, _ := json.Marshal(block.Input)
					toolCalls = append(toolCalls, openAIToolCall{
						ID:   block.ID,
						Type: "function",
						Function: struct {
							Name      string `json:"name"`
							Arguments string `json:"arguments"`
						}{
							Name:      block.Name,
							Arguments: string(argsJSON),
						},
					})
				}
			}

			oaiMsg.Content = strings.Join(textParts, "\n")
			if len(toolCalls) > 0 {
				oaiMsg.ToolCalls = toolCalls
			}
			result = append(result, oaiMsg)
		}
	}

	return result
}

func convertToOpenAITools(tools []types.ToolDefinition) []openAITool {
	if len(tools) == 0 {
		return nil
	}
	result := make([]openAITool, len(tools))
	for i, t := range tools {
		result[i] = openAITool{
			Type: "function",
			Function: openAIFunction{
				Name:        t.Name,
				Description: t.Description,
				Parameters:  t.InputSchema,
			},
		}
	}
	return result
}

// --- Predefined provider constructors ---

// NewOpenAIProvider creates an OpenAI provider
func NewOpenAIProvider(apiKey string) *OpenAICompatProvider {
	return NewOpenAICompatProvider(OpenAICompatConfig{
		Name:    "openai",
		APIKey:  apiKey,
		BaseURL: "https://api.openai.com/v1",
	})
}

// NewOpenRouterProvider creates an OpenRouter provider
func NewOpenRouterProvider(apiKey string) *OpenAICompatProvider {
	return NewOpenAICompatProvider(OpenAICompatConfig{
		Name:    "openrouter",
		APIKey:  apiKey,
		BaseURL: "https://openrouter.ai/api/v1",
		Headers: map[string]string{
			"HTTP-Referer": "https://github.com/TechnoAllianceAE/buji-cloudcoder",
			"X-Title":      "BujiCloudCoder",
		},
	})
}

// NewGroqProvider creates a Groq provider
func NewGroqProvider(apiKey string) *OpenAICompatProvider {
	return NewOpenAICompatProvider(OpenAICompatConfig{
		Name:    "groq",
		APIKey:  apiKey,
		BaseURL: "https://api.groq.com/openai/v1",
	})
}

// NewTogetherProvider creates a Together AI provider
func NewTogetherProvider(apiKey string) *OpenAICompatProvider {
	return NewOpenAICompatProvider(OpenAICompatConfig{
		Name:    "together",
		APIKey:  apiKey,
		BaseURL: "https://api.together.xyz/v1",
	})
}

// NewCerebrasProvider creates a Cerebras provider
func NewCerebrasProvider(apiKey string) *OpenAICompatProvider {
	return NewOpenAICompatProvider(OpenAICompatConfig{
		Name:    "cerebras",
		APIKey:  apiKey,
		BaseURL: "https://api.cerebras.ai/v1",
	})
}

// NewXAIProvider creates an xAI (Grok) provider
func NewXAIProvider(apiKey string) *OpenAICompatProvider {
	return NewOpenAICompatProvider(OpenAICompatConfig{
		Name:    "xai",
		APIKey:  apiKey,
		BaseURL: "https://api.x.ai/v1",
	})
}

// NewOllamaProvider creates an Ollama provider
func NewOllamaProvider(baseURL string) *OpenAICompatProvider {
	if baseURL == "" {
		baseURL = "http://localhost:11434"
	}
	return NewOpenAICompatProvider(OpenAICompatConfig{
		Name:    "ollama",
		BaseURL: baseURL + "/v1",
		Timeout: 300 * time.Second, // local models can be slow
	})
}

// NewLlamaCppProvider creates a llama.cpp provider
func NewLlamaCppProvider(baseURL string) *OpenAICompatProvider {
	if baseURL == "" {
		baseURL = "http://localhost:8080"
	}
	return NewOpenAICompatProvider(OpenAICompatConfig{
		Name:    "llamacpp",
		BaseURL: baseURL + "/v1",
		Timeout: 300 * time.Second,
	})
}

// NewGeminiProvider creates a Google Gemini provider (via OpenAI-compatible endpoint)
func NewGeminiProvider(apiKey string) *OpenAICompatProvider {
	return NewOpenAICompatProvider(OpenAICompatConfig{
		Name:    "gemini",
		APIKey:  apiKey,
		BaseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
	})
}

// NewDeepSeekProvider creates a DeepSeek provider
func NewDeepSeekProvider(apiKey string) *OpenAICompatProvider {
	return NewOpenAICompatProvider(OpenAICompatConfig{
		Name:    "deepseek",
		APIKey:  apiKey,
		BaseURL: "https://api.deepseek.com/v1",
	})
}
