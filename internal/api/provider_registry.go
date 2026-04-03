package api

import (
	"context"
	"fmt"
	"strings"
	"sync"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/types"
)

// LLMProvider is the interface all providers must implement
type LLMProvider interface {
	// Name returns the provider identifier (e.g., "anthropic", "openai", "ollama")
	Name() string

	// StreamCompletion sends a request and returns streamed events via callback
	StreamCompletion(ctx context.Context, req ProviderRequest, callback StreamCallback) (*types.APIResponse, error)
}

// ProviderRequest is the unified request format across all providers
type ProviderRequest struct {
	Model       string
	Messages    []types.Message
	System      string
	Tools       []types.ToolDefinition
	MaxTokens   int
	Temperature *float64
	Stream      bool
}

// ProviderRegistry holds all registered LLM providers
type ProviderRegistry struct {
	mu        sync.RWMutex
	providers map[string]LLMProvider
	fallback  string // default provider name
}

// NewProviderRegistry creates an empty registry
func NewProviderRegistry() *ProviderRegistry {
	return &ProviderRegistry{
		providers: make(map[string]LLMProvider),
	}
}

// Register adds a provider to the registry
func (r *ProviderRegistry) Register(p LLMProvider) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.providers[p.Name()] = p
}

// SetFallback sets the default provider used when no prefix is given
func (r *ProviderRegistry) SetFallback(name string) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.fallback = name
}

// Get returns a provider by name
func (r *ProviderRegistry) Get(name string) (LLMProvider, bool) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	p, ok := r.providers[name]
	return p, ok
}

// GetFallback returns the default provider
func (r *ProviderRegistry) GetFallback() (LLMProvider, bool) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	if r.fallback == "" {
		return nil, false
	}
	p, ok := r.providers[r.fallback]
	return p, ok
}

// ListProviders returns all registered provider names
func (r *ProviderRegistry) ListProviders() []string {
	r.mu.RLock()
	defer r.mu.RUnlock()
	names := make([]string, 0, len(r.providers))
	for name := range r.providers {
		names = append(names, name)
	}
	return names
}

// Resolve takes a "provider/model" string and returns the provider + bare model ID.
// If no prefix, uses the fallback provider.
// Examples:
//   "anthropic/claude-sonnet-4-20250514" -> (anthropicProvider, "claude-sonnet-4-20250514")
//   "ollama/llama3"                      -> (ollamaProvider, "llama3")
//   "openrouter/meta-llama/llama-3-70b"  -> (openrouterProvider, "meta-llama/llama-3-70b")
//   "claude-sonnet-4-20250514"           -> (fallbackProvider, "claude-sonnet-4-20250514")
func (r *ProviderRegistry) Resolve(modelSpec string) (LLMProvider, string, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	// Try to extract provider prefix
	parts := strings.SplitN(modelSpec, "/", 2)
	if len(parts) == 2 {
		providerName := parts[0]
		modelID := parts[1]

		// Check if the prefix is a known provider
		if p, ok := r.providers[providerName]; ok {
			return p, modelID, nil
		}

		// For OpenRouter-style nested paths (e.g., "openrouter/meta-llama/llama-3-70b")
		// the first segment might not be a provider — try the full string as model with fallback
	}

	// No recognized prefix — use fallback provider with full string as model
	if r.fallback != "" {
		if p, ok := r.providers[r.fallback]; ok {
			return p, modelSpec, nil
		}
	}

	// Last resort: try first registered provider
	for _, p := range r.providers {
		return p, modelSpec, nil
	}

	return nil, "", fmt.Errorf("no providers registered and no fallback set")
}

// StreamToModel resolves the model spec and streams a completion
func (r *ProviderRegistry) StreamToModel(ctx context.Context, modelSpec string, req ProviderRequest, callback StreamCallback) (*types.APIResponse, error) {
	provider, bareModel, err := r.Resolve(modelSpec)
	if err != nil {
		return nil, err
	}
	req.Model = bareModel
	return provider.StreamCompletion(ctx, req, callback)
}
