package engine

import (
	"fmt"
	"strings"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/api"
	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/types"
)

// CompactConfig holds auto-compact settings
type CompactConfig struct {
	Enabled          bool
	ThresholdPercent float64 // Trigger at this % of context window (default 75%)
	ContextWindow    int     // Model context window size
}

// DefaultCompactConfig returns defaults
func DefaultCompactConfig() CompactConfig {
	return CompactConfig{
		Enabled:          true,
		ThresholdPercent: 75.0,
		ContextWindow:    200_000,
	}
}

// ShouldCompact checks if compaction should trigger based on token count
func (cc CompactConfig) ShouldCompact(inputTokens int) bool {
	if !cc.Enabled {
		return false
	}
	threshold := int(float64(cc.ContextWindow) * cc.ThresholdPercent / 100)
	return inputTokens >= threshold
}

// CompactMessages compresses conversation history by summarizing it
func CompactMessages(client *api.Client, messages []types.Message, model string) ([]types.Message, error) {
	if len(messages) < 4 {
		return messages, nil // Nothing to compact
	}

	// Build a summary request
	summaryPrompt := buildCompactPrompt(messages)

	req := api.MessagesRequest{
		Model:     model,
		MaxTokens: 4096,
		Messages: []types.Message{
			{
				Role: types.RoleUser,
				Content: []types.ContentBlock{
					{Type: "text", Text: summaryPrompt},
				},
			},
		},
		System: "You are a conversation summarizer. Summarize the following conversation concisely, preserving all key decisions, code changes, file paths, and important context. Be specific about what was done and what remains.",
	}

	var summaryText strings.Builder
	resp, err := client.CreateMessageStream(req, func(event types.StreamEvent) error {
		if event.Type == "content_block_delta" && event.Delta != nil && event.Delta.Text != "" {
			summaryText.WriteString(event.Delta.Text)
		}
		return nil
	})
	if err != nil {
		return messages, fmt.Errorf("compact failed: %w", err)
	}
	_ = resp

	summary := summaryText.String()
	if summary == "" {
		return messages, fmt.Errorf("compact produced empty summary")
	}

	// Build compacted messages: summary + recent messages
	keepRecent := 4
	if keepRecent > len(messages) {
		keepRecent = len(messages)
	}

	compacted := []types.Message{
		{
			Role: types.RoleUser,
			Content: []types.ContentBlock{
				{Type: "text", Text: fmt.Sprintf("[Previous conversation summary]\n\n%s\n\n[End of summary — conversation continues below]", summary)},
			},
		},
		{
			Role: types.RoleAssistant,
			Content: []types.ContentBlock{
				{Type: "text", Text: "I understand the context from the previous conversation. Let me continue from where we left off."},
			},
		},
	}

	// Append recent messages
	recentStart := len(messages) - keepRecent
	compacted = append(compacted, messages[recentStart:]...)

	return compacted, nil
}

// buildCompactPrompt formats messages for summarization
func buildCompactPrompt(messages []types.Message) string {
	var sb strings.Builder
	sb.WriteString("Summarize the following conversation between a user and an AI coding assistant. Preserve:\n")
	sb.WriteString("- All file paths and code changes made\n")
	sb.WriteString("- Key decisions and their reasoning\n")
	sb.WriteString("- Current state of the work\n")
	sb.WriteString("- Any unfinished tasks or next steps\n\n")
	sb.WriteString("Conversation:\n\n")

	for _, msg := range messages {
		role := strings.ToUpper(msg.Role[:1]) + msg.Role[1:]
		for _, block := range msg.Content {
			switch block.Type {
			case "text":
				text := block.Text
				if len(text) > 2000 {
					text = text[:2000] + "... (truncated)"
				}
				sb.WriteString(fmt.Sprintf("%s: %s\n\n", role, text))
			case "tool_use":
				sb.WriteString(fmt.Sprintf("%s: [Used tool: %s]\n\n", role, block.Name))
			case "tool_result":
				content := ""
				if s, ok := block.Content.(string); ok {
					content = s
					if len(content) > 500 {
						content = content[:500] + "... (truncated)"
					}
				}
				sb.WriteString(fmt.Sprintf("%s: [Tool result: %s]\n\n", role, content))
			}
		}
	}

	return sb.String()
}

// MicroCompact performs lightweight token reduction without an API call
func MicroCompact(messages []types.Message) []types.Message {
	result := make([]types.Message, len(messages))
	for i, msg := range messages {
		result[i] = types.Message{
			Role:    msg.Role,
			Content: make([]types.ContentBlock, 0, len(msg.Content)),
		}
		for _, block := range msg.Content {
			newBlock := block
			switch block.Type {
			case "tool_result":
				// Truncate large tool results
				if s, ok := block.Content.(string); ok && len(s) > 10000 {
					newBlock.Content = s[:10000] + "\n\n... (truncated for context management)"
				}
			case "text":
				// Remove excessive whitespace
				if len(block.Text) > 50000 {
					newBlock.Text = block.Text[:50000] + "\n\n... (truncated for context management)"
				}
			}
			result[i].Content = append(result[i].Content, newBlock)
		}
	}
	return result
}
