package engine

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"time"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/config"
)

// OAuthTokens holds OAuth token data
type OAuthTokens struct {
	AccessToken  string    `json:"access_token"`
	RefreshToken string    `json:"refresh_token"`
	ExpiresAt    time.Time `json:"expires_at"`
	TokenType    string    `json:"token_type"`
}

// OAuthConfig holds OAuth flow configuration
type OAuthConfig struct {
	AuthURL     string
	TokenURL    string
	ClientID    string
	RedirectURI string
	Scopes      []string
}

// DefaultOAuthConfig returns the default OAuth config
func DefaultOAuthConfig() OAuthConfig {
	return OAuthConfig{
		AuthURL:     "https://console.anthropic.com/oauth/authorize",
		TokenURL:    "https://console.anthropic.com/oauth/token",
		ClientID:    "bc2-cli",
		RedirectURI: "http://localhost:0/callback",
		Scopes:      []string{"user:read", "api:write"},
	}
}

// OAuthService handles the OAuth flow
type OAuthService struct {
	config OAuthConfig
}

// NewOAuthService creates an OAuth service
func NewOAuthService(cfg OAuthConfig) *OAuthService {
	return &OAuthService{config: cfg}
}

// Login performs the OAuth authorization code flow with PKCE
func (o *OAuthService) Login() (*OAuthTokens, error) {
	// Generate PKCE verifier and challenge
	verifier := generateCodeVerifier()
	challenge := generateCodeChallenge(verifier)
	state := generateState()

	// Start local server for callback
	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		return nil, fmt.Errorf("start callback server: %w", err)
	}
	port := listener.Addr().(*net.TCPAddr).Port
	redirectURI := fmt.Sprintf("http://localhost:%d/callback", port)

	// Build auth URL
	params := url.Values{
		"response_type":         {"code"},
		"client_id":             {o.config.ClientID},
		"redirect_uri":          {redirectURI},
		"scope":                 {strings.Join(o.config.Scopes, " ")},
		"state":                 {state},
		"code_challenge":        {challenge},
		"code_challenge_method": {"S256"},
	}
	authURL := o.config.AuthURL + "?" + params.Encode()

	// Open browser
	fmt.Printf("\nOpening browser for authentication...\n")
	fmt.Printf("If the browser doesn't open, visit:\n%s\n\n", authURL)
	openBrowser(authURL)

	// Wait for callback
	codeCh := make(chan string, 1)
	errCh := make(chan error, 1)

	mux := http.NewServeMux()
	mux.HandleFunc("/callback", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Query().Get("state") != state {
			errCh <- fmt.Errorf("state mismatch")
			http.Error(w, "State mismatch", http.StatusBadRequest)
			return
		}
		if errMsg := r.URL.Query().Get("error"); errMsg != "" {
			errCh <- fmt.Errorf("OAuth error: %s", errMsg)
			http.Error(w, errMsg, http.StatusBadRequest)
			return
		}
		code := r.URL.Query().Get("code")
		if code == "" {
			errCh <- fmt.Errorf("no code in callback")
			http.Error(w, "No code", http.StatusBadRequest)
			return
		}
		w.Header().Set("Content-Type", "text/html")
		fmt.Fprint(w, "<html><body><h1>Authentication successful!</h1><p>You can close this tab.</p></body></html>")
		codeCh <- code
	})

	server := &http.Server{Handler: mux}
	go func() {
		_ = server.Serve(listener)
	}()

	// Wait for code or timeout
	var code string
	select {
	case code = <-codeCh:
	case err := <-errCh:
		_ = server.Shutdown(context.Background())
		return nil, err
	case <-time.After(5 * time.Minute):
		_ = server.Shutdown(context.Background())
		return nil, fmt.Errorf("authentication timed out")
	}

	_ = server.Shutdown(context.Background())

	// Exchange code for tokens
	tokens, err := o.exchangeCode(code, verifier, redirectURI)
	if err != nil {
		return nil, err
	}

	// Save tokens
	if err := saveTokens(tokens); err != nil {
		return tokens, fmt.Errorf("save tokens: %w", err)
	}

	return tokens, nil
}

// Logout clears saved tokens
func (o *OAuthService) Logout() error {
	tokenPath := filepath.Join(config.GetConfigDir(), "oauth-tokens.json")
	return os.Remove(tokenPath)
}

// LoadTokens reads saved tokens from disk
func LoadTokens() (*OAuthTokens, error) {
	tokenPath := filepath.Join(config.GetConfigDir(), "oauth-tokens.json")
	data, err := os.ReadFile(tokenPath)
	if err != nil {
		return nil, err
	}
	var tokens OAuthTokens
	if err := json.Unmarshal(data, &tokens); err != nil {
		return nil, err
	}
	return &tokens, nil
}

// RefreshTokens uses the refresh token to obtain a new access token
func (o *OAuthService) RefreshTokens(refreshToken string) (*OAuthTokens, error) {
	data := url.Values{
		"grant_type":    {"refresh_token"},
		"refresh_token": {refreshToken},
		"client_id":     {o.config.ClientID},
	}

	resp, err := http.PostForm(o.config.TokenURL, data)
	if err != nil {
		return nil, fmt.Errorf("refresh request: %w", err)
	}
	defer resp.Body.Close()

	var result struct {
		AccessToken  string `json:"access_token"`
		RefreshToken string `json:"refresh_token"`
		ExpiresIn    int    `json:"expires_in"`
		TokenType    string `json:"token_type"`
		Error        string `json:"error"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("parse refresh response: %w", err)
	}
	if result.Error != "" {
		return nil, fmt.Errorf("refresh error: %s", result.Error)
	}

	newRefresh := result.RefreshToken
	if newRefresh == "" {
		newRefresh = refreshToken // keep old refresh token if server didn't rotate
	}

	tokens := &OAuthTokens{
		AccessToken:  result.AccessToken,
		RefreshToken: newRefresh,
		ExpiresAt:    time.Now().Add(time.Duration(result.ExpiresIn) * time.Second),
		TokenType:    result.TokenType,
	}

	// Persist the new tokens
	if err := saveTokens(tokens); err != nil {
		return tokens, fmt.Errorf("save refreshed tokens: %w", err)
	}

	return tokens, nil
}

// LoadAndRefreshIfNeeded loads tokens and refreshes if expired
func LoadAndRefreshIfNeeded() (*OAuthTokens, error) {
	tokens, err := LoadTokens()
	if err != nil {
		return nil, err
	}

	// If token is still valid (with 5 min buffer), use it
	if time.Now().Add(5 * time.Minute).Before(tokens.ExpiresAt) {
		return tokens, nil
	}

	// Token expired or expiring soon — refresh
	if tokens.RefreshToken == "" {
		return nil, fmt.Errorf("access token expired and no refresh token available — run /login again")
	}

	svc := NewOAuthService(DefaultOAuthConfig())
	return svc.RefreshTokens(tokens.RefreshToken)
}

func (o *OAuthService) exchangeCode(code, verifier, redirectURI string) (*OAuthTokens, error) {
	data := url.Values{
		"grant_type":    {"authorization_code"},
		"code":          {code},
		"redirect_uri":  {redirectURI},
		"client_id":     {o.config.ClientID},
		"code_verifier": {verifier},
	}

	resp, err := http.PostForm(o.config.TokenURL, data)
	if err != nil {
		return nil, fmt.Errorf("token exchange: %w", err)
	}
	defer resp.Body.Close()

	var result struct {
		AccessToken  string `json:"access_token"`
		RefreshToken string `json:"refresh_token"`
		ExpiresIn    int    `json:"expires_in"`
		TokenType    string `json:"token_type"`
		Error        string `json:"error"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("parse token response: %w", err)
	}
	if result.Error != "" {
		return nil, fmt.Errorf("token error: %s", result.Error)
	}

	return &OAuthTokens{
		AccessToken:  result.AccessToken,
		RefreshToken: result.RefreshToken,
		ExpiresAt:    time.Now().Add(time.Duration(result.ExpiresIn) * time.Second),
		TokenType:    result.TokenType,
	}, nil
}

func saveTokens(tokens *OAuthTokens) error {
	dir := config.GetConfigDir()
	_ = os.MkdirAll(dir, 0700)
	data, _ := json.MarshalIndent(tokens, "", "  ")
	return os.WriteFile(filepath.Join(dir, "oauth-tokens.json"), data, 0600)
}

func generateCodeVerifier() string {
	b := make([]byte, 32)
	_, _ = rand.Read(b)
	return base64.RawURLEncoding.EncodeToString(b)
}

func generateCodeChallenge(verifier string) string {
	h := sha256.Sum256([]byte(verifier))
	return base64.RawURLEncoding.EncodeToString(h[:])
}

func generateState() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

func openBrowser(url string) {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "darwin":
		cmd = exec.Command("open", url)
	case "linux":
		cmd = exec.Command("xdg-open", url)
	case "windows":
		cmd = exec.Command("rundll32", "url.dll,FileProtocolHandler", url)
	}
	if cmd != nil {
		_ = cmd.Start()
	}
}
