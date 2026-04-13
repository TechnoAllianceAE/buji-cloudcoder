package engine

import (
	"testing"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/types"
)

func TestShouldCompact(t *testing.T) {
	tests := []struct {
		name        string
		enabled     bool
		threshold   float64
		window      int
		inputTokens int
		want        bool
	}{
		{"disabled", false, 75.0, 200000, 200000, false},
		{"below threshold", true, 75.0, 200000, 100000, false},
		{"at threshold", true, 75.0, 200000, 150000, true},
		{"above threshold", true, 75.0, 200000, 180000, true},
		{"zero tokens", true, 75.0, 200000, 0, false},
		{"custom threshold 50%", true, 50.0, 200000, 100000, true},
		{"custom threshold 50% below", true, 50.0, 200000, 99999, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			cc := CompactConfig{
				Enabled:          tt.enabled,
				ThresholdPercent: tt.threshold,
				ContextWindow:    tt.window,
			}
			got := cc.ShouldCompact(tt.inputTokens)
			if got != tt.want {
				t.Errorf("ShouldCompact(%d) = %v, want %v", tt.inputTokens, got, tt.want)
			}
		})
	}
}

func TestDefaultCompactConfig(t *testing.T) {
	cc := DefaultCompactConfig()
	if !cc.Enabled {
		t.Error("default config should be enabled")
	}
	if cc.ThresholdPercent != 75.0 {
		t.Errorf("ThresholdPercent = %f, want 75.0", cc.ThresholdPercent)
	}
	if cc.ContextWindow != 200_000 {
		t.Errorf("ContextWindow = %d, want 200000", cc.ContextWindow)
	}
}

func TestMicroCompact_TruncatesLargeToolResults(t *testing.T) {
	largeContent := make([]byte, 20000)
	for i := range largeContent {
		largeContent[i] = 'x'
	}

	messages := []types.Message{
		{
			Role: types.RoleUser,
			Content: []types.ContentBlock{
				{Type: "tool_result", Content: string(largeContent)},
			},
		},
	}

	result := MicroCompact(messages)
	if len(result) != 1 {
		t.Fatalf("expected 1 message, got %d", len(result))
	}

	content, ok := result[0].Content[0].Content.(string)
	if !ok {
		t.Fatal("expected string content")
	}
	// Should be truncated to 10000 + truncation message
	if len(content) > 10100 {
		t.Errorf("content should be truncated, got length %d", len(content))
	}
}

func TestMicroCompact_TruncatesLargeText(t *testing.T) {
	largeText := make([]byte, 60000)
	for i := range largeText {
		largeText[i] = 'y'
	}

	messages := []types.Message{
		{
			Role: types.RoleAssistant,
			Content: []types.ContentBlock{
				{Type: "text", Text: string(largeText)},
			},
		},
	}

	result := MicroCompact(messages)
	if len(result[0].Content[0].Text) > 50100 {
		t.Errorf("text should be truncated, got length %d", len(result[0].Content[0].Text))
	}
}

func TestMicroCompact_PreservesSmallMessages(t *testing.T) {
	messages := []types.Message{
		{
			Role: types.RoleUser,
			Content: []types.ContentBlock{
				{Type: "text", Text: "hello"},
			},
		},
		{
			Role: types.RoleAssistant,
			Content: []types.ContentBlock{
				{Type: "text", Text: "hi there"},
			},
		},
	}

	result := MicroCompact(messages)
	if len(result) != 2 {
		t.Fatalf("expected 2 messages, got %d", len(result))
	}
	if result[0].Content[0].Text != "hello" {
		t.Errorf("first message changed: %q", result[0].Content[0].Text)
	}
	if result[1].Content[0].Text != "hi there" {
		t.Errorf("second message changed: %q", result[1].Content[0].Text)
	}
}

func TestMicroCompact_DoesNotMutateOriginal(t *testing.T) {
	original := "original content"
	messages := []types.Message{
		{
			Role: types.RoleUser,
			Content: []types.ContentBlock{
				{Type: "text", Text: original},
			},
		},
	}

	_ = MicroCompact(messages)
	if messages[0].Content[0].Text != original {
		t.Error("MicroCompact mutated the original messages")
	}
}

func TestBuildCompactPrompt(t *testing.T) {
	messages := []types.Message{
		{
			Role: types.RoleUser,
			Content: []types.ContentBlock{
				{Type: "text", Text: "Fix the bug in main.go"},
			},
		},
		{
			Role: types.RoleAssistant,
			Content: []types.ContentBlock{
				{Type: "text", Text: "I'll look at main.go"},
				{Type: "tool_use", Name: "Read"},
			},
		},
		{
			Role: types.RoleUser,
			Content: []types.ContentBlock{
				{Type: "tool_result", Content: "file contents here"},
			},
		},
	}

	prompt := buildCompactPrompt(messages)
	if prompt == "" {
		t.Error("prompt should not be empty")
	}
	if !containsStr(prompt, "Fix the bug") {
		t.Error("prompt should contain user message")
	}
	if !containsStr(prompt, "Read") {
		t.Error("prompt should contain tool use")
	}
}

func TestBuildCompactPrompt_TruncatesLongMessages(t *testing.T) {
	longText := make([]byte, 5000)
	for i := range longText {
		longText[i] = 'a'
	}

	messages := []types.Message{
		{
			Role: types.RoleUser,
			Content: []types.ContentBlock{
				{Type: "text", Text: string(longText)},
			},
		},
	}

	prompt := buildCompactPrompt(messages)
	// Text blocks over 2000 chars get truncated in buildCompactPrompt
	if containsStr(prompt, string(longText)) {
		t.Error("long text should be truncated in compact prompt")
	}
}

func containsStr(s, sub string) bool {
	return len(s) >= len(sub) && searchStr(s, sub)
}

func searchStr(s, sub string) bool {
	for i := 0; i <= len(s)-len(sub); i++ {
		if s[i:i+len(sub)] == sub {
			return true
		}
	}
	return false
}
