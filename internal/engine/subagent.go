package engine

import (
	"context"
	"fmt"
	"strings"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/api"
	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/tools"
	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/types"
)

// InitSubAgentExecutor wires up the Agent tool to spawn real sub-engines.
// Call this once after creating the main QueryEngine.
func InitSubAgentExecutor(apiKey string, parentCfg types.SessionConfig) {
	tools.SetAgentExecutor(func(ctx context.Context, prompt, model, cwd string, onText func(string)) (string, types.Usage, error) {
		return runSubAgent(ctx, apiKey, parentCfg, prompt, model, cwd, onText)
	})
}

// runSubAgent creates a fresh QueryEngine and runs a single prompt through it.
// It blocks until the agentic loop finishes or the context is cancelled.
func runSubAgent(
	ctx context.Context,
	apiKey string,
	parentCfg types.SessionConfig,
	prompt, model, cwd string,
	onText func(string),
) (string, types.Usage, error) {

	// Build sub-agent config — inherit from parent, override model if specified
	cfg := parentCfg
	if model != "" {
		cfg.Model = model
	}
	cfg.MaxTurns = 50 // sub-agents get fewer turns
	cfg.PermissionMode = "bypassPermissions" // sub-agents run trusted

	// Create a fresh engine with its own message history
	subEngine := NewQueryEngine(apiKey, cfg)

	// Override CWD if specified
	if cwd != "" {
		subEngine.cwd = cwd
	}

	// Collect all output text
	var fullText strings.Builder

	subEngine.OnStreamText = func(text string) {
		fullText.WriteString(text)
		if onText != nil {
			onText(text)
		}
	}

	// Context cancellation — check before each API call
	origClient := subEngine.client
	subEngine.client = origClient // same client is fine, context checked in loop

	// Run the prompt through the sub-engine's agentic loop
	done := make(chan error, 1)
	go func() {
		done <- subEngine.SubmitMessage(prompt)
	}()

	// Wait for completion or cancellation
	select {
	case err := <-done:
		if err != nil {
			return fullText.String(), subEngine.usage, fmt.Errorf("sub-agent error: %w", err)
		}
		// Extract final text from assistant messages
		result := fullText.String()
		if result == "" {
			// Fall back to last assistant message
			result = extractLastAssistantText(subEngine.messages)
		}
		return result, subEngine.usage, nil

	case <-ctx.Done():
		return fullText.String(), subEngine.usage, ctx.Err()
	}
}

// extractLastAssistantText gets text from the last assistant message
func extractLastAssistantText(messages []types.Message) string {
	for i := len(messages) - 1; i >= 0; i-- {
		if messages[i].Role == types.RoleAssistant {
			var parts []string
			for _, block := range messages[i].Content {
				if block.Type == "text" && block.Text != "" {
					parts = append(parts, block.Text)
				}
			}
			if len(parts) > 0 {
				return strings.Join(parts, "\n")
			}
		}
	}
	return ""
}

// SpawnSubAgent is a convenience function for programmatic use
func SpawnSubAgent(apiKey string, cfg types.SessionConfig, prompt string) (string, error) {
	ctx := context.Background()
	text, _, err := runSubAgent(ctx, apiKey, cfg, prompt, "", "", nil)
	return text, err
}

// InitSubAgentFromEngine initializes the sub-agent system using an existing engine's config
func InitSubAgentFromEngine(e *QueryEngine) {
	apiKey := e.client.APIKey
	InitSubAgentExecutor(apiKey, e.cfg)
}

// getAPIKeyFromClient extracts the API key (exported via Client struct)
func getAPIKeyFromClient(c *api.Client) string {
	return c.APIKey
}
