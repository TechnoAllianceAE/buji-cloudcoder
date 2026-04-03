package tools

import (
	"bufio"
	"fmt"
	"os"
	"strings"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/types"
)

// AskUserQuestionTool pauses execution to ask the user a question
type AskUserQuestionTool struct{}

func NewAskUserQuestionTool() *AskUserQuestionTool { return &AskUserQuestionTool{} }

func (t *AskUserQuestionTool) Name() string { return "AskUserQuestion" }

func (t *AskUserQuestionTool) Description() string {
	return `Pauses execution to ask the user a question and waits for their response.

Use this when you need clarification, confirmation, or additional information from the user before proceeding.
Only use this when you genuinely need input — don't ask questions you can answer yourself.`
}

func (t *AskUserQuestionTool) InputSchema() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"question": map[string]any{
				"type":        "string",
				"description": "The question to ask the user",
			},
		},
		"required": []string{"question"},
	}
}

func (t *AskUserQuestionTool) IsReadOnly(_ map[string]any) bool { return true }

func (t *AskUserQuestionTool) Execute(input map[string]any, ctx *ToolContext) types.ToolResult {
	question, _ := input["question"].(string)
	if question == "" {
		return types.ToolResult{Content: "Error: question is required", IsError: true}
	}

	fmt.Printf("\n❓ %s\n> ", question)
	reader := bufio.NewReader(os.Stdin)
	answer, err := reader.ReadString('\n')
	if err != nil {
		return types.ToolResult{Content: "Error reading user input", IsError: true}
	}

	answer = strings.TrimSpace(answer)
	if answer == "" {
		return types.ToolResult{Content: "(no response)"}
	}

	return types.ToolResult{Content: answer}
}
