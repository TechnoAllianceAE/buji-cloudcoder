package api

import (
	"context"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/types"
)

// AnthropicProvider implements LLMProvider for the Anthropic Messages API
type AnthropicProvider struct {
	client *Client
}

// NewAnthropicProvider creates an Anthropic provider
func NewAnthropicProvider(apiKey, baseURL string) *AnthropicProvider {
	if baseURL == "" {
		baseURL = DefaultBaseURL
	}
	return &AnthropicProvider{
		client: NewClient(apiKey, baseURL),
	}
}

func (p *AnthropicProvider) Name() string { return "anthropic" }

func (p *AnthropicProvider) StreamCompletion(ctx context.Context, req ProviderRequest, callback StreamCallback) (*types.APIResponse, error) {
	// Convert ProviderRequest to Anthropic MessagesRequest
	apiReq := MessagesRequest{
		Model:     req.Model,
		MaxTokens: req.MaxTokens,
		Messages:  req.Messages,
		System:    req.System,
		Tools:     req.Tools,
		Stream:    true,
	}
	if req.Temperature != nil {
		apiReq.Temperature = req.Temperature
	}

	return p.client.CreateMessageStream(apiReq, callback)
}

// GetClient returns the underlying client (for legacy code paths)
func (p *AnthropicProvider) GetClient() *Client {
	return p.client
}
