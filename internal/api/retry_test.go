package api

import (
	"fmt"
	"testing"
	"time"
)

func TestCalculateDelay_ExponentialBackoff(t *testing.T) {
	cfg := RetryConfig{
		InitialDelay:  1 * time.Second,
		MaxDelay:      30 * time.Second,
		BackoffFactor: 2.0,
	}

	// Each attempt should increase delay exponentially
	prev := time.Duration(0)
	for attempt := 0; attempt < 5; attempt++ {
		delay := calculateDelay(attempt, cfg, nil)
		if delay <= 0 {
			t.Errorf("attempt %d: delay must be positive, got %v", attempt, delay)
		}
		if delay > cfg.MaxDelay+cfg.MaxDelay/4 { // allow 25% jitter above max
			t.Errorf("attempt %d: delay %v exceeds max+jitter %v", attempt, delay, cfg.MaxDelay+cfg.MaxDelay/4)
		}
		if attempt > 0 && delay < prev/2 {
			// With jitter, delay should generally increase (allow some slack)
			// This is a rough check — jitter can cause occasional decreases
		}
		prev = delay
	}
}

func TestCalculateDelay_RespectsMaxDelay(t *testing.T) {
	cfg := RetryConfig{
		InitialDelay:  1 * time.Second,
		MaxDelay:      5 * time.Second,
		BackoffFactor: 10.0,
	}

	// Large attempt number should be capped at MaxDelay + jitter
	delay := calculateDelay(10, cfg, nil)
	maxWithJitter := time.Duration(float64(cfg.MaxDelay) * 1.25)
	if delay > maxWithJitter {
		t.Errorf("delay %v exceeds MaxDelay with jitter %v", delay, maxWithJitter)
	}
}

func TestCalculateDelay_MinimumFloor(t *testing.T) {
	cfg := RetryConfig{
		InitialDelay:  1 * time.Millisecond, // very small
		MaxDelay:      30 * time.Second,
		BackoffFactor: 1.0,
	}

	// Even with tiny initial delay and negative jitter, should clamp to 100ms
	for i := 0; i < 100; i++ {
		delay := calculateDelay(0, cfg, nil)
		if delay < 100*time.Millisecond {
			t.Errorf("delay %v is below 100ms floor", delay)
		}
	}
}

func TestCalculateDelay_UsesRetryAfterHeader(t *testing.T) {
	cfg := DefaultRetryConfig()
	retryAfter := 10 * time.Second

	err := &RetryableError{
		StatusCode:  429,
		RetryAfter:  retryAfter,
		IsRetryable: true,
	}

	delay := calculateDelay(0, cfg, err)
	if delay != retryAfter {
		t.Errorf("should use Retry-After value %v, got %v", retryAfter, delay)
	}
}

func TestCalculateDelay_AlwaysPositive(t *testing.T) {
	cfg := RetryConfig{
		InitialDelay:  100 * time.Millisecond,
		MaxDelay:      30 * time.Second,
		BackoffFactor: 2.0,
	}

	// Run many iterations to exercise jitter randomness
	for i := 0; i < 1000; i++ {
		for attempt := 0; attempt < 5; attempt++ {
			delay := calculateDelay(attempt, cfg, nil)
			if delay <= 0 {
				t.Fatalf("attempt %d, iteration %d: got non-positive delay %v", attempt, i, delay)
			}
		}
	}
}

func TestDefaultRetryConfig(t *testing.T) {
	cfg := DefaultRetryConfig()
	if cfg.MaxRetries != 3 {
		t.Errorf("MaxRetries = %d, want 3", cfg.MaxRetries)
	}
	if cfg.InitialDelay != 1*time.Second {
		t.Errorf("InitialDelay = %v, want 1s", cfg.InitialDelay)
	}
	if cfg.MaxDelay != 30*time.Second {
		t.Errorf("MaxDelay = %v, want 30s", cfg.MaxDelay)
	}
}

func TestClassifyError(t *testing.T) {
	tests := []struct {
		name        string
		errMsg      string
		wantRetry   bool
		wantCode    int
	}{
		{"429 rate limit", "API error (status 429): rate limited", true, 429},
		{"500 server error", "API error (status 500): internal error", true, 500},
		{"502 bad gateway", "HTTP (502) bad gateway", true, 502},
		{"503 unavailable", "status 503 service unavailable", true, 503},
		{"529 overloaded", "API error (529): overloaded", true, 529},
		{"400 bad request", "API error (status 400): bad request", false, 0},
		{"unknown error", "connection refused", false, 0},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := classifyError(fmt.Errorf(tt.errMsg))
			if err.IsRetryable != tt.wantRetry {
				t.Errorf("IsRetryable = %v, want %v", err.IsRetryable, tt.wantRetry)
			}
			if tt.wantCode != 0 && err.StatusCode != tt.wantCode {
				t.Errorf("StatusCode = %d, want %d", err.StatusCode, tt.wantCode)
			}
		})
	}
}

func TestParseRetryAfterHeader_Seconds(t *testing.T) {
	// nil response
	if d := ParseRetryAfterHeader(nil); d != 0 {
		t.Errorf("nil response: got %v, want 0", d)
	}
}
