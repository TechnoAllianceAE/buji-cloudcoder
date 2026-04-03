package api

import (
	"fmt"
	"os"
	"strings"
)

// Provider identifies the API backend
type Provider string

const (
	ProviderAnthropic Provider = "anthropic"
	ProviderBedrock   Provider = "bedrock"
	ProviderVertex    Provider = "vertex"
	ProviderFoundry   Provider = "foundry"
	ProviderOpenAI    Provider = "openai"
)

// ProviderConfig holds provider-specific configuration
type ProviderConfig struct {
	Provider Provider
	BaseURL  string
	APIKey   string
	Region   string
	Project  string

	// Bedrock-specific
	AWSAccessKeyID     string
	AWSSecretAccessKey string
	AWSSessionToken    string

	// Vertex-specific
	VertexProject string
	VertexRegion  string

	// Foundry-specific
	FoundryResource string
}

// DetectProvider determines the API provider from environment variables
func DetectProvider() ProviderConfig {
	cfg := ProviderConfig{Provider: ProviderAnthropic}

	if isEnvTrue("CLAUDE_CODE_USE_BEDROCK") {
		cfg.Provider = ProviderBedrock
		cfg.Region = getEnvOr("AWS_REGION", "us-east-1")
		cfg.AWSAccessKeyID = os.Getenv("AWS_ACCESS_KEY_ID")
		cfg.AWSSecretAccessKey = os.Getenv("AWS_SECRET_ACCESS_KEY")
		cfg.AWSSessionToken = os.Getenv("AWS_SESSION_TOKEN")
		return cfg
	}

	if isEnvTrue("CLAUDE_CODE_USE_VERTEX") {
		cfg.Provider = ProviderVertex
		cfg.VertexProject = os.Getenv("ANTHROPIC_VERTEX_PROJECT_ID")
		cfg.VertexRegion = getEnvOr("CLOUD_ML_REGION", "us-east5")
		return cfg
	}

	if isEnvTrue("CLAUDE_CODE_USE_FOUNDRY") {
		cfg.Provider = ProviderFoundry
		cfg.APIKey = os.Getenv("ANTHROPIC_FOUNDRY_API_KEY")
		cfg.FoundryResource = os.Getenv("ANTHROPIC_FOUNDRY_RESOURCE")
		return cfg
	}

	if isEnvTrue("CLAUDE_CODE_USE_OPENAI") {
		cfg.Provider = ProviderOpenAI
		cfg.APIKey = os.Getenv("OPENAI_API_KEY")
		cfg.BaseURL = getEnvOr("OPENAI_BASE_URL", "https://api.openai.com/v1")
		return cfg
	}

	// Default: direct API
	cfg.APIKey = os.Getenv("ANTHROPIC_API_KEY")
	cfg.BaseURL = getEnvOr("ANTHROPIC_BASE_URL", DefaultBaseURL)
	return cfg
}

// NewClientFromProvider creates an API client based on the detected provider
func NewClientFromProvider(providerCfg ProviderConfig) *Client {
	switch providerCfg.Provider {
	case ProviderBedrock:
		return NewBedrockClient(providerCfg)
	case ProviderVertex:
		return NewVertexClient(providerCfg)
	case ProviderFoundry:
		return NewFoundryClient(providerCfg)
	case ProviderOpenAI:
		return NewOpenAIClient(providerCfg)
	default:
		return NewClient(providerCfg.APIKey, providerCfg.BaseURL)
	}
}

// NewBedrockClient creates a client for AWS Bedrock
func NewBedrockClient(cfg ProviderConfig) *Client {
	// Bedrock uses a different URL pattern and auth
	baseURL := fmt.Sprintf("https://bedrock-runtime.%s.amazonaws.com", cfg.Region)
	client := NewClient("", baseURL)
	// Bedrock auth would need AWS Signature V4 signing
	// For now, use the standard client with Bedrock endpoint
	return client
}

// NewVertexClient creates a client for Google Vertex AI
func NewVertexClient(cfg ProviderConfig) *Client {
	baseURL := fmt.Sprintf("https://%s-aiplatform.googleapis.com/v1/projects/%s/locations/%s/publishers/anthropic/models",
		cfg.VertexRegion, cfg.VertexProject, cfg.VertexRegion)
	return NewClient("", baseURL)
}

// NewFoundryClient creates a client for Azure Foundry
func NewFoundryClient(cfg ProviderConfig) *Client {
	baseURL := fmt.Sprintf("https://%s.azure.com", cfg.FoundryResource)
	return NewClient(cfg.APIKey, baseURL)
}

// NewOpenAIClient creates a client for OpenAI-compatible APIs
func NewOpenAIClient(cfg ProviderConfig) *Client {
	client := NewClient(cfg.APIKey, cfg.BaseURL)
	// OpenAI uses "Authorization: Bearer <key>" instead of "X-API-Key"
	return client
}

// MapModelToProvider converts a model ID to provider-specific format
func MapModelToProvider(model string, provider Provider) string {
	switch provider {
	case ProviderBedrock:
		// Bedrock uses ARN format
		if !strings.HasPrefix(model, "anthropic.") {
			return "anthropic." + model
		}
		return model
	case ProviderVertex:
		// Vertex uses the model ID directly
		return model
	case ProviderOpenAI:
		// Map models to OpenAI equivalents if needed
		return model
	default:
		return model
	}
}

func isEnvTrue(key string) bool {
	val := strings.ToLower(os.Getenv(key))
	return val == "true" || val == "1" || val == "yes"
}

func getEnvOr(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}
