package engine

import (
	"fmt"
	"strings"
	"sync"
)

// ModelPricing holds per-model token costs (USD per million tokens)
var ModelPricing = map[string]struct {
	InputPerM  float64
	OutputPerM float64
	CacheReadPerM  float64
	CacheWritePerM float64
}{
	"claude-opus-4-20250514":         {15.0, 75.0, 1.5, 18.75},
	"claude-opus-4-6":                {15.0, 75.0, 1.5, 18.75},
	"claude-sonnet-4-20250514":       {3.0, 15.0, 0.3, 3.75},
	"claude-sonnet-4-6":              {3.0, 15.0, 0.3, 3.75},
	"claude-3-5-sonnet-20241022":     {3.0, 15.0, 0.3, 3.75},
	"claude-3-5-haiku-20241022":      {0.8, 4.0, 0.08, 1.0},
	"claude-haiku-4-5-20251001":      {0.8, 4.0, 0.08, 1.0},
	"claude-3-opus-20240229":         {15.0, 75.0, 1.5, 18.75},
}

// CostTracker accumulates token usage and cost across a session
type CostTracker struct {
	mu         sync.Mutex
	totalCost  float64
	modelUsage map[string]*ModelUsage
}

// ModelUsage holds per-model token counts
type ModelUsage struct {
	InputTokens              int     `json:"input_tokens"`
	OutputTokens             int     `json:"output_tokens"`
	CacheReadInputTokens     int     `json:"cache_read_input_tokens"`
	CacheCreationInputTokens int     `json:"cache_creation_input_tokens"`
	CostUSD                  float64 `json:"cost_usd"`
}

// NewCostTracker creates a new cost tracker
func NewCostTracker() *CostTracker {
	return &CostTracker{
		modelUsage: make(map[string]*ModelUsage),
	}
}

// Add records a model response
func (ct *CostTracker) Add(model string, inputTokens, outputTokens, cacheRead, cacheWrite int) {
	ct.mu.Lock()
	defer ct.mu.Unlock()

	usage, ok := ct.modelUsage[model]
	if !ok {
		usage = &ModelUsage{}
		ct.modelUsage[model] = usage
	}

	usage.InputTokens += inputTokens
	usage.OutputTokens += outputTokens
	usage.CacheReadInputTokens += cacheRead
	usage.CacheCreationInputTokens += cacheWrite

	cost := calculateCost(model, inputTokens, outputTokens, cacheRead, cacheWrite)
	usage.CostUSD += cost
	ct.totalCost += cost
}

// GetTotalCost returns the total session cost in USD
func (ct *CostTracker) GetTotalCost() float64 {
	ct.mu.Lock()
	defer ct.mu.Unlock()
	return ct.totalCost
}

// GetTotalTokens returns aggregate input/output tokens
func (ct *CostTracker) GetTotalTokens() (input, output int) {
	ct.mu.Lock()
	defer ct.mu.Unlock()
	for _, u := range ct.modelUsage {
		input += u.InputTokens
		output += u.OutputTokens
	}
	return
}

// Format returns a human-readable cost summary
func (ct *CostTracker) Format() string {
	ct.mu.Lock()
	defer ct.mu.Unlock()

	var sb strings.Builder
	sb.WriteString("Session Cost Summary\n")
	sb.WriteString("────────────────────\n")

	totalInput := 0
	totalOutput := 0

	for model, usage := range ct.modelUsage {
		sb.WriteString(fmt.Sprintf("\n  %s\n", model))
		sb.WriteString(fmt.Sprintf("    Input:        %s tokens\n", formatNumber(usage.InputTokens)))
		sb.WriteString(fmt.Sprintf("    Output:       %s tokens\n", formatNumber(usage.OutputTokens)))
		if usage.CacheReadInputTokens > 0 {
			sb.WriteString(fmt.Sprintf("    Cache read:   %s tokens\n", formatNumber(usage.CacheReadInputTokens)))
		}
		if usage.CacheCreationInputTokens > 0 {
			sb.WriteString(fmt.Sprintf("    Cache write:  %s tokens\n", formatNumber(usage.CacheCreationInputTokens)))
		}
		sb.WriteString(fmt.Sprintf("    Cost:         $%.4f\n", usage.CostUSD))

		totalInput += usage.InputTokens
		totalOutput += usage.OutputTokens
	}

	sb.WriteString(fmt.Sprintf("\n  Total: %s in / %s out = $%.4f\n",
		formatNumber(totalInput), formatNumber(totalOutput), ct.totalCost))

	return sb.String()
}

func calculateCost(model string, input, output, cacheRead, cacheWrite int) float64 {
	pricing, ok := ModelPricing[model]
	if !ok {
		// Default to Sonnet pricing
		pricing = ModelPricing["claude-sonnet-4-20250514"]
	}

	cost := float64(input) * pricing.InputPerM / 1_000_000
	cost += float64(output) * pricing.OutputPerM / 1_000_000
	cost += float64(cacheRead) * pricing.CacheReadPerM / 1_000_000
	cost += float64(cacheWrite) * pricing.CacheWritePerM / 1_000_000
	return cost
}

func formatNumber(n int) string {
	if n >= 1_000_000 {
		return fmt.Sprintf("%.1fM", float64(n)/1_000_000)
	}
	if n >= 1_000 {
		return fmt.Sprintf("%.1fK", float64(n)/1_000)
	}
	return fmt.Sprintf("%d", n)
}
