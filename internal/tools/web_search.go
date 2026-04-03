package tools

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/types"
)

// WebSearchTool searches the web
type WebSearchTool struct{}

func NewWebSearchTool() *WebSearchTool { return &WebSearchTool{} }

func (t *WebSearchTool) Name() string { return "WebSearch" }

func (t *WebSearchTool) Description() string {
	return `Searches the web and returns results.

Requires one of:
- BRAVE_API_KEY env var (Brave Search API)
- SEARXNG_URL env var (self-hosted SearXNG instance)

Returns titles, URLs, and snippets for matching results.`
}

func (t *WebSearchTool) InputSchema() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"query": map[string]any{
				"type":        "string",
				"description": "The search query",
			},
			"allowed_domains": map[string]any{
				"type":        "array",
				"items":       map[string]any{"type": "string"},
				"description": "Only return results from these domains",
			},
			"blocked_domains": map[string]any{
				"type":        "array",
				"items":       map[string]any{"type": "string"},
				"description": "Exclude results from these domains",
			},
		},
		"required": []string{"query"},
	}
}

func (t *WebSearchTool) IsReadOnly(_ map[string]any) bool { return true }

func (t *WebSearchTool) Execute(input map[string]any, ctx *ToolContext) types.ToolResult {
	query, _ := input["query"].(string)
	if query == "" {
		return types.ToolResult{Content: "Error: query is required", IsError: true}
	}

	// Try Brave Search first
	if apiKey := os.Getenv("BRAVE_API_KEY"); apiKey != "" {
		return searchBrave(query, apiKey)
	}

	// Try SearXNG
	if searxURL := os.Getenv("SEARXNG_URL"); searxURL != "" {
		return searchSearXNG(query, searxURL)
	}

	return types.ToolResult{
		Content: "Error: No search provider configured. Set BRAVE_API_KEY or SEARXNG_URL environment variable.",
		IsError: true,
	}
}

func searchBrave(query, apiKey string) types.ToolResult {
	u := fmt.Sprintf("https://api.search.brave.com/res/v1/web/search?q=%s&count=10", url.QueryEscape(query))

	req, _ := http.NewRequest("GET", u, nil)
	req.Header.Set("Accept", "application/json")
	req.Header.Set("X-Subscription-Token", apiKey)

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return types.ToolResult{Content: fmt.Sprintf("Search error: %v", err), IsError: true}
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != 200 {
		return types.ToolResult{Content: fmt.Sprintf("Brave API error (%d): %s", resp.StatusCode, string(body)), IsError: true}
	}

	var result struct {
		Web struct {
			Results []struct {
				Title       string `json:"title"`
				URL         string `json:"url"`
				Description string `json:"description"`
			} `json:"results"`
		} `json:"web"`
	}
	if err := json.Unmarshal(body, &result); err != nil {
		return types.ToolResult{Content: fmt.Sprintf("Error parsing results: %v", err), IsError: true}
	}

	var sb strings.Builder
	sb.WriteString(fmt.Sprintf("Search results for: %s\n\n", query))
	for i, r := range result.Web.Results {
		sb.WriteString(fmt.Sprintf("%d. %s\n   %s\n   %s\n\n", i+1, r.Title, r.URL, r.Description))
	}

	if len(result.Web.Results) == 0 {
		sb.WriteString("No results found.")
	}

	return types.ToolResult{Content: sb.String()}
}

func searchSearXNG(query, baseURL string) types.ToolResult {
	u := fmt.Sprintf("%s/search?q=%s&format=json&categories=general", strings.TrimRight(baseURL, "/"), url.QueryEscape(query))

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Get(u)
	if err != nil {
		return types.ToolResult{Content: fmt.Sprintf("Search error: %v", err), IsError: true}
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != 200 {
		return types.ToolResult{Content: fmt.Sprintf("SearXNG error (%d): %s", resp.StatusCode, string(body)), IsError: true}
	}

	var result struct {
		Results []struct {
			Title   string `json:"title"`
			URL     string `json:"url"`
			Content string `json:"content"`
		} `json:"results"`
	}
	if err := json.Unmarshal(body, &result); err != nil {
		return types.ToolResult{Content: fmt.Sprintf("Error parsing results: %v", err), IsError: true}
	}

	var sb strings.Builder
	sb.WriteString(fmt.Sprintf("Search results for: %s\n\n", query))
	limit := 10
	if len(result.Results) < limit {
		limit = len(result.Results)
	}
	for i := 0; i < limit; i++ {
		r := result.Results[i]
		sb.WriteString(fmt.Sprintf("%d. %s\n   %s\n   %s\n\n", i+1, r.Title, r.URL, r.Content))
	}

	if len(result.Results) == 0 {
		sb.WriteString("No results found.")
	}

	return types.ToolResult{Content: sb.String()}
}
