package engine

import (
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
	engine   *QueryEngine
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

// NewBridgeServer creates a bridge server for IDE integration
func NewBridgeServer(engine *QueryEngine) *BridgeServer {
	return &BridgeServer{engine: engine}
}

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

	// Health check
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})

	// Submit prompt
	mux.HandleFunc("/prompt", func(w http.ResponseWriter, r *http.Request) {
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

		var result strings.Builder
		origCallback := bs.engine.OnStreamText
		bs.engine.OnStreamText = func(text string) {
			result.WriteString(text)
			if origCallback != nil {
				origCallback(text)
			}
		}

		err := bs.engine.SubmitMessage(req.Prompt)
		bs.engine.OnStreamText = origCallback

		resp := map[string]any{
			"result": result.String(),
		}
		if err != nil {
			resp["error"] = err.Error()
		}
		json.NewEncoder(w).Encode(resp)
	})

	// Get session info
	mux.HandleFunc("/session", func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(map[string]any{
			"sessionId": bs.engine.GetSessionID(),
			"model":     bs.engine.GetModel(),
			"messages":  len(bs.engine.GetMessages()),
			"usage":     bs.engine.GetUsage(),
			"cost":      bs.engine.GetCostTracker().GetTotalCost(),
		})
	})

	// Permission callback endpoint
	mux.HandleFunc("/permission", func(w http.ResponseWriter, r *http.Request) {
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
	})

	go http.Serve(listener, mux)
	return nil
}

// Stop shuts down the bridge server
func (bs *BridgeServer) Stop() {
	if bs.listener != nil {
		bs.listener.Close()
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
