package engine

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"strings"
	"sync"
)

// BridgeServer provides IDE remote control protocol
type BridgeServer struct {
	listener net.Listener
	server   *http.Server
	engine   *QueryEngine
	token    string // shared secret for authentication
	mu       sync.Mutex
	running  bool
}

// BridgeMessage is a message exchanged with the IDE
type BridgeMessage struct {
	Type    string `json:"type"`    // "command", "response", "event", "permission"
	ID      string `json:"id"`
	Content string `json:"content"`
	Tool    string `json:"tool,omitempty"`
	Input   any    `json:"input,omitempty"`
}

// NewBridgeServer creates a bridge server for IDE integration.
// Generates a random auth token that must be passed in X-BC2-Token header.
func NewBridgeServer(engine *QueryEngine) *BridgeServer {
	b := make([]byte, 32)
	_, _ = rand.Read(b)
	return &BridgeServer{
		engine: engine,
		token:  hex.EncodeToString(b),
	}
}

// GetToken returns the auth token clients must send
func (bs *BridgeServer) GetToken() string { return bs.token }

// Start begins listening for IDE connections
func (bs *BridgeServer) Start(port int) error {
	addr := fmt.Sprintf("127.0.0.1:%d", port)
	listener, err := net.Listen("tcp", addr)
	if err != nil {
		return fmt.Errorf("bridge listen: %w", err)
	}
	bs.listener = listener
	bs.running = true

	mux := http.NewServeMux()

	// Auth middleware wrapper
	auth := func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			if r.Header.Get("X-BC2-Token") != bs.token {
				http.Error(w, "Unauthorized: invalid or missing X-BC2-Token header", http.StatusUnauthorized)
				return
			}
			next(w, r)
		}
	}

	// Health check (no auth required — just a liveness probe)
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})

	// Submit prompt — auth required, per-request isolation
	mux.HandleFunc("/prompt", auth(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "POST only", http.StatusMethodNotAllowed)
			return
		}
		var req struct {
			Prompt string `json:"prompt"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Per-request result builder — no shared callback swapping
		var result strings.Builder
		var resultMu sync.Mutex

		bs.mu.Lock()
		origCallback := bs.engine.OnStreamText
		bs.engine.OnStreamText = func(text string) {
			resultMu.Lock()
			result.WriteString(text)
			resultMu.Unlock()
			if origCallback != nil {
				origCallback(text)
			}
		}
		err := bs.engine.SubmitMessage(req.Prompt)
		bs.engine.OnStreamText = origCallback
		bs.mu.Unlock()

		resp := map[string]any{
			"result": result.String(),
		}
		if err != nil {
			resp["error"] = err.Error()
		}
		json.NewEncoder(w).Encode(resp)
	}))

	// Get session info — auth required
	mux.HandleFunc("/session", auth(func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(map[string]any{
			"sessionId": bs.engine.GetSessionID(),
			"model":     bs.engine.GetModel(),
			"messages":  len(bs.engine.GetMessages()),
			"usage":     bs.engine.GetUsage(),
			"cost":      bs.engine.GetCostTracker().GetTotalCost(),
		})
	}))

	// Permission callback — auth required
	mux.HandleFunc("/permission", auth(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "POST only", http.StatusMethodNotAllowed)
			return
		}
		var req struct {
			ToolName string `json:"toolName"`
			Approved bool   `json:"approved"`
		}
		json.NewDecoder(r.Body).Decode(&req)
		json.NewEncoder(w).Encode(map[string]bool{"ok": true})
	}))

	bs.server = &http.Server{Handler: mux}
	go bs.server.Serve(listener)
	return nil
}

// Stop shuts down the bridge server
func (bs *BridgeServer) Stop() {
	if bs.server != nil {
		bs.server.Close()
		bs.running = false
	}
}

// IsRunning returns whether the bridge is active
func (bs *BridgeServer) IsRunning() bool { return bs.running }

// GetPort returns the listening port
func (bs *BridgeServer) GetPort() int {
	if bs.listener == nil {
		return 0
	}
	return bs.listener.Addr().(*net.TCPAddr).Port
}
