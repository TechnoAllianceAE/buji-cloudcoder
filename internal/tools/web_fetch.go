package tools

import (
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/types"
)

// WebFetchTool fetches content from URLs
type WebFetchTool struct{}

func NewWebFetchTool() *WebFetchTool { return &WebFetchTool{} }

func (t *WebFetchTool) Name() string { return "WebFetch" }

func (t *WebFetchTool) Description() string {
	return `Fetches content from a URL and returns it as text.

- Converts HTML to readable text (strips tags, extracts content)
- Supports any HTTP/HTTPS URL
- Maximum content size: 100,000 characters
- Timeout: 30 seconds`
}

func (t *WebFetchTool) InputSchema() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"url": map[string]any{
				"type":        "string",
				"description": "The URL to fetch",
			},
			"prompt": map[string]any{
				"type":        "string",
				"description": "Optional prompt describing what to extract from the page",
			},
		},
		"required": []string{"url"},
	}
}

func (t *WebFetchTool) IsReadOnly(_ map[string]any) bool { return true }

func (t *WebFetchTool) Execute(input map[string]any, ctx *ToolContext) types.ToolResult {
	url, _ := input["url"].(string)
	if url == "" {
		return types.ToolResult{Content: "Error: url is required", IsError: true}
	}

	if !strings.HasPrefix(url, "http://") && !strings.HasPrefix(url, "https://") {
		url = "https://" + url
	}

	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return types.ToolResult{Content: fmt.Sprintf("Error creating request: %v", err), IsError: true}
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (compatible; BujiCloudCoder/1.0)")
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.7")

	resp, err := client.Do(req)
	if err != nil {
		return types.ToolResult{Content: fmt.Sprintf("Error fetching URL: %v", err), IsError: true}
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return types.ToolResult{
			Content: fmt.Sprintf("HTTP %d: %s", resp.StatusCode, resp.Status),
			IsError: true,
		}
	}

	body, err := io.ReadAll(io.LimitReader(resp.Body, 500_000))
	if err != nil {
		return types.ToolResult{Content: fmt.Sprintf("Error reading response: %v", err), IsError: true}
	}

	content := string(body)
	contentType := resp.Header.Get("Content-Type")

	// Convert HTML to text
	if strings.Contains(contentType, "text/html") || strings.Contains(contentType, "application/xhtml") {
		content = htmlToText(content)
	}

	// Truncate
	const maxChars = 100_000
	if len(content) > maxChars {
		content = content[:maxChars] + "\n\n... (content truncated)"
	}

	result := fmt.Sprintf("URL: %s\nStatus: %d\nContent-Type: %s\n\n%s", url, resp.StatusCode, contentType, content)
	return types.ToolResult{Content: result}
}

// htmlToText converts HTML to readable plain text
func htmlToText(html string) string {
	// Remove script and style blocks
	reScript := regexp.MustCompile(`(?is)<script[^>]*>.*?</script>`)
	html = reScript.ReplaceAllString(html, "")
	reStyle := regexp.MustCompile(`(?is)<style[^>]*>.*?</style>`)
	html = reStyle.ReplaceAllString(html, "")

	// Remove HTML comments
	reComments := regexp.MustCompile(`(?s)<!--.*?-->`)
	html = reComments.ReplaceAllString(html, "")

	// Replace block elements with newlines
	for _, tag := range []string{"div", "p", "br", "hr", "li", "tr", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre", "article", "section", "header", "footer", "nav", "main"} {
		re := regexp.MustCompile(fmt.Sprintf(`(?i)</?%s[^>]*>`, tag))
		html = re.ReplaceAllString(html, "\n")
	}

	// Strip remaining tags
	reTags := regexp.MustCompile(`<[^>]+>`)
	html = reTags.ReplaceAllString(html, "")

	// Decode common HTML entities
	replacer := strings.NewReplacer(
		"&amp;", "&", "&lt;", "<", "&gt;", ">",
		"&quot;", "\"", "&#39;", "'", "&apos;", "'",
		"&nbsp;", " ", "&mdash;", "—", "&ndash;", "–",
		"&hellip;", "…", "&copy;", "©", "&reg;", "®",
	)
	html = replacer.Replace(html)

	// Collapse whitespace
	reSpaces := regexp.MustCompile(`[ \t]+`)
	html = reSpaces.ReplaceAllString(html, " ")

	// Collapse multiple newlines
	reNewlines := regexp.MustCompile(`\n{3,}`)
	html = reNewlines.ReplaceAllString(html, "\n\n")

	return strings.TrimSpace(html)
}
