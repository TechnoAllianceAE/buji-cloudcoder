package api

import (
	"fmt"
	"math"
	"math/rand"
	"net/http"
	"strconv"
	"time"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/types"
)

// RetryConfig configures retry behavior
type RetryConfig struct {
	MaxRetries     int
	InitialDelay   time.Duration
	MaxDelay       time.Duration
	BackoffFactor  float64
	FallbackModel  string // Model to fall back to on 529 (overloaded)
}

// DefaultRetryConfig returns sensible defaults
func DefaultRetryConfig() RetryConfig {
	return RetryConfig{
		MaxRetries:    3,
		InitialDelay:  1 * time.Second,
		MaxDelay:      30 * time.Second,
		BackoffFactor: 2.0,
	}
}

// RetryableError wraps an error with retry metadata
type RetryableError struct {
	StatusCode  int
	Message     string
	RetryAfter  time.Duration
	IsRetryable bool
}

func (e *RetryableError) Error() string {
	return fmt.Sprintf("API error (status %d): %s", e.StatusCode, e.Message)
}

// CreateMessageStreamWithRetry wraps CreateMessageStream with retry logic
func (c *Client) CreateMessageStreamWithRetry(req MessagesRequest, callback StreamCallback, cfg RetryConfig) (*types.APIResponse, error) {
	var lastErr error

	for attempt := 0; attempt <= cfg.MaxRetries; attempt++ {
		resp, err := c.CreateMessageStream(req, callback)
		if err == nil {
			return resp, nil
		}

		retryErr, ok := err.(*RetryableError)
		if !ok {
			// Check if it's a known retryable status from error message
			retryErr = classifyError(err)
		}

		if retryErr != nil && !retryErr.IsRetryable {
			return nil, err
		}

		lastErr = err

		if attempt >= cfg.MaxRetries {
			break
		}

		// Handle 529 (overloaded) with model fallback
		if retryErr != nil && retryErr.StatusCode == 529 && cfg.FallbackModel != "" {
			req.Model = cfg.FallbackModel
		}

		// Calculate delay
		delay := calculateDelay(attempt, cfg, retryErr)
		time.Sleep(delay)
	}

	return nil, fmt.Errorf("max retries (%d) exceeded: %w", cfg.MaxRetries, lastErr)
}

func calculateDelay(attempt int, cfg RetryConfig, err *RetryableError) time.Duration {
	// Use Retry-After header if provided
	if err != nil && err.RetryAfter > 0 {
		return err.RetryAfter
	}

	// Exponential backoff with jitter
	delay := float64(cfg.InitialDelay) * math.Pow(cfg.BackoffFactor, float64(attempt))
	if delay > float64(cfg.MaxDelay) {
		delay = float64(cfg.MaxDelay)
	}

	// Add jitter (±25%)
	jitter := delay * 0.25 * (rand.Float64()*2 - 1)
	delay += jitter

	return time.Duration(delay)
}

func classifyError(err error) *RetryableError {
	msg := err.Error()

	// Extract status code from error message
	statusCodes := map[int]bool{
		429: true, // Rate limited
		500: true, // Internal server error
		502: true, // Bad gateway
		503: true, // Service unavailable
		529: true, // Overloaded
	}

	for code := range statusCodes {
		if containsStatus(msg, code) {
			return &RetryableError{
				StatusCode:  code,
				Message:     msg,
				IsRetryable: true,
			}
		}
	}

	// Not retryable
	return &RetryableError{
		StatusCode:  0,
		Message:     msg,
		IsRetryable: false,
	}
}

func containsStatus(msg string, code int) bool {
	codeStr := strconv.Itoa(code)
	return len(msg) > 0 && (false ||
		contains(msg, fmt.Sprintf("status %s", codeStr)) ||
		contains(msg, fmt.Sprintf("status %d", code)) ||
		contains(msg, fmt.Sprintf("(%s)", codeStr)) ||
		contains(msg, fmt.Sprintf("(%d)", code)))
}

func contains(s, substr string) bool {
	return len(s) >= len(substr) && searchString(s, substr)
}

func searchString(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}

// ParseRetryAfterHeader parses the Retry-After header from an HTTP response
func ParseRetryAfterHeader(resp *http.Response) time.Duration {
	if resp == nil {
		return 0
	}
	val := resp.Header.Get("Retry-After")
	if val == "" {
		return 0
	}

	// Try parsing as seconds
	if seconds, err := strconv.Atoi(val); err == nil {
		return time.Duration(seconds) * time.Second
	}

	// Try parsing as HTTP date
	if t, err := http.ParseTime(val); err == nil {
		return time.Until(t)
	}

	return 0
}
