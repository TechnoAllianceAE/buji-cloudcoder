package engine

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/config"
	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/types"
)

// TransportType identifies how we communicate with the MCP server
type TransportType string

const (
	TransportStdio TransportType = "stdio"
	TransportHTTP  TransportType = "http"
	TransportSSE   TransportType = "sse"
)

// MCPServerConfig defines an MCP server from settings
type MCPServerConfig struct {
	Command   string            `json:"command"`          // For stdio transport
	Args      []string          `json:"args"`             // For stdio transport
	Env       map[string]string `json:"env,omitempty"`
	Enabled   *bool             `json:"enabled,omitempty"`
	URL       string            `json:"url,omitempty"`    // For HTTP/SSE transport
	Transport string            `json:"transport,omitempty"` // "stdio", "http", "sse" (default: auto-detect)
	Headers   map[string]string `json:"headers,omitempty"`   // Custom headers for HTTP
	APIKey    string            `json:"apiKey,omitempty"`    // Bearer token for HTTP auth
}

// mcpTransport is the interface for MCP communication
type mcpTransport interface {
	send(method string, params any) (json.RawMessage, error)
	close()
}

// MCPClient manages a connection to an MCP server
type MCPClient struct {
	name      string
	transport mcpTransport
	mu        sync.Mutex
	tools     []types.ToolDefinition
	resources []MCPResource
}

// MCPResource represents a discovered MCP resource
type MCPResource struct {
	URI         string `json:"uri"`
	Name        string `json:"name"`
	Description string `json:"description,omitempty"`
	MimeType    string `json:"mimeType,omitempty"`
}

// MCPManager manages all MCP server connections
type MCPManager struct {
	clients map[string]*MCPClient
}

// NewMCPManager creates and initializes MCP connections from config
func NewMCPManager() *MCPManager {
	mgr := &MCPManager{
		clients: make(map[string]*MCPClient),
	}
	mgr.loadFromSettings()
	return mgr
}

func (mgr *MCPManager) loadFromSettings() {
	// Load from ~/.bc2/settings.json
	settingsPath := filepath.Join(config.GetConfigDir(), "settings.json")
	mgr.loadFromFile(settingsPath)

	// Load from project .bc2/settings.json
	mgr.loadFromFile(filepath.Join(".bc2", "settings.json"))
}

func (mgr *MCPManager) loadFromFile(path string) {
	data, err := os.ReadFile(path)
	if err != nil {
		return
	}

	var settings struct {
		MCPServers map[string]MCPServerConfig `json:"mcpServers"`
	}
	if err := json.Unmarshal(data, &settings); err != nil {
		return
	}

	for name, cfg := range settings.MCPServers {
		if cfg.Enabled != nil && !*cfg.Enabled {
			continue
		}
		_ = mgr.Connect(name, cfg)
	}
}

// Connect starts an MCP server connection using the appropriate transport
func (mgr *MCPManager) Connect(name string, cfg MCPServerConfig) error {
	transport := detectTransport(cfg)

	var t mcpTransport
	var err error

	switch transport {
	case TransportHTTP, TransportSSE:
		t, err = newHTTPTransport(cfg)
	case TransportStdio:
		t, err = newStdioTransport(cfg)
	default:
		return fmt.Errorf("unknown transport: %s", transport)
	}

	if err != nil {
		return fmt.Errorf("connect MCP %s (%s): %w", name, transport, err)
	}

	client := &MCPClient{
		name:      name,
		transport: t,
	}

	// Initialize MCP protocol
	if err := client.initialize(); err != nil {
		t.close()
		return fmt.Errorf("initialize MCP %s: %w", name, err)
	}

	mgr.clients[name] = client
	return nil
}

// GetTools returns all tools from all MCP servers
func (mgr *MCPManager) GetTools() []types.ToolDefinition {
	var allTools []types.ToolDefinition
	for _, client := range mgr.clients {
		allTools = append(allTools, client.tools...)
	}
	return allTools
}

// CallTool invokes a tool on the appropriate MCP server
func (mgr *MCPManager) CallTool(serverName, toolName string, input map[string]any) (string, error) {
	client, ok := mgr.clients[serverName]
	if !ok {
		return "", fmt.Errorf("MCP server not found: %s", serverName)
	}
	return client.callTool(toolName, input)
}

// ListResources returns resources from a server
func (mgr *MCPManager) ListResources(serverName string) ([]MCPResource, error) {
	client, ok := mgr.clients[serverName]
	if !ok {
		return nil, fmt.Errorf("MCP server not found: %s", serverName)
	}
	return client.resources, nil
}

// ReadResource reads a resource by URI
func (mgr *MCPManager) ReadResource(serverName, uri string) (string, error) {
	client, ok := mgr.clients[serverName]
	if !ok {
		return "", fmt.Errorf("MCP server not found: %s", serverName)
	}
	return client.readResource(uri)
}

// Close shuts down all MCP servers
func (mgr *MCPManager) Close() {
	for _, client := range mgr.clients {
		client.transport.close()
	}
}

// --- MCPClient protocol methods ---

func (c *MCPClient) initialize() error {
	_, err := c.transport.send("initialize", map[string]any{
		"protocolVersion": "2024-11-05",
		"capabilities":    map[string]any{},
		"clientInfo":      map[string]any{"name": "bc2", "version": "1.0.0"},
	})
	if err != nil {
		return err
	}

	// Discover tools
	if err := c.discoverTools(); err != nil {
		return err
	}

	// Discover resources (optional, don't fail if unsupported)
	_ = c.discoverResources()

	return nil
}

func (c *MCPClient) discoverTools() error {
	result, err := c.transport.send("tools/list", nil)
	if err != nil {
		return err
	}

	var toolList struct {
		Tools []struct {
			Name        string         `json:"name"`
			Description string         `json:"description"`
			InputSchema map[string]any `json:"inputSchema"`
		} `json:"tools"`
	}
	if err := json.Unmarshal(result, &toolList); err != nil {
		return err
	}

	for _, t := range toolList.Tools {
		c.tools = append(c.tools, types.ToolDefinition{
			Name:        fmt.Sprintf("mcp_%s_%s", c.name, t.Name),
			Description: fmt.Sprintf("[MCP:%s] %s", c.name, t.Description),
			InputSchema: t.InputSchema,
		})
	}
	return nil
}

func (c *MCPClient) discoverResources() error {
	result, err := c.transport.send("resources/list", nil)
	if err != nil {
		return err // Not all servers support resources
	}

	var resourceList struct {
		Resources []MCPResource `json:"resources"`
	}
	if err := json.Unmarshal(result, &resourceList); err != nil {
		return err
	}
	c.resources = resourceList.Resources
	return nil
}

func (c *MCPClient) callTool(toolName string, input map[string]any) (string, error) {
	result, err := c.transport.send("tools/call", map[string]any{
		"name":      toolName,
		"arguments": input,
	})
	if err != nil {
		return "", err
	}

	var callResult struct {
		Content []struct {
			Type string `json:"type"`
			Text string `json:"text"`
		} `json:"content"`
	}
	if err := json.Unmarshal(result, &callResult); err != nil {
		return string(result), nil
	}

	var parts []string
	for _, c := range callResult.Content {
		if c.Type == "text" {
			parts = append(parts, c.Text)
		}
	}
	return strings.Join(parts, "\n"), nil
}

func (c *MCPClient) readResource(uri string) (string, error) {
	result, err := c.transport.send("resources/read", map[string]any{
		"uri": uri,
	})
	if err != nil {
		return "", err
	}

	var readResult struct {
		Contents []struct {
			URI      string `json:"uri"`
			MimeType string `json:"mimeType"`
			Text     string `json:"text"`
		} `json:"contents"`
	}
	if err := json.Unmarshal(result, &readResult); err != nil {
		return string(result), nil
	}

	var parts []string
	for _, c := range readResult.Contents {
		parts = append(parts, c.Text)
	}
	return strings.Join(parts, "\n"), nil
}

// --- Transport: stdio ---

type stdioTransport struct {
	cmd      *exec.Cmd
	stdin    io.WriteCloser
	mu       sync.Mutex
	nextID   int
	pending  map[int]chan jsonrpcResponse // response dispatcher
	pendMu   sync.Mutex
	closed   bool
}

func newStdioTransport(cfg MCPServerConfig) (*stdioTransport, error) {
	if cfg.Command == "" {
		return nil, fmt.Errorf("stdio transport requires 'command'")
	}

	cmd := exec.Command(cfg.Command, cfg.Args...)
	cmd.Env = os.Environ()
	for k, v := range cfg.Env {
		cmd.Env = append(cmd.Env, fmt.Sprintf("%s=%s", k, v))
	}

	stdin, err := cmd.StdinPipe()
	if err != nil {
		return nil, err
	}
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return nil, err
	}

	if err := cmd.Start(); err != nil {
		return nil, fmt.Errorf("start process: %w", err)
	}

	t := &stdioTransport{
		cmd:     cmd,
		stdin:   stdin,
		pending: make(map[int]chan jsonrpcResponse),
	}

	// Start dedicated reader goroutine that dispatches responses by ID
	// and discards server-initiated notifications (no ID / ID=0)
	go t.readLoop(bufio.NewReaderSize(stdout, 1024*1024))

	return t, nil
}

// readLoop continuously reads from stdout and routes responses to waiting callers
func (t *stdioTransport) readLoop(reader *bufio.Reader) {
	for {
		line, err := reader.ReadBytes('\n')
		if err != nil {
			// EOF or pipe closed — signal all pending requests
			t.pendMu.Lock()
			t.closed = true
			for id, ch := range t.pending {
				ch <- jsonrpcResponse{Error: &jsonrpcError{Code: -1, Message: "transport closed"}}
				delete(t.pending, id)
			}
			t.pendMu.Unlock()
			return
		}

		var resp jsonrpcResponse
		if err := json.Unmarshal(line, &resp); err != nil {
			continue // skip malformed lines
		}

		// Notifications have no ID (or ID=0) — discard them
		if resp.ID == 0 {
			continue
		}

		// Route response to the waiting caller
		t.pendMu.Lock()
		ch, ok := t.pending[resp.ID]
		if ok {
			ch <- resp
			delete(t.pending, resp.ID)
		}
		t.pendMu.Unlock()
	}
}

func (t *stdioTransport) send(method string, params any) (json.RawMessage, error) {
	t.mu.Lock()
	t.nextID++
	id := t.nextID
	t.mu.Unlock()

	req := jsonrpcRequest{
		JSONRPC: "2.0",
		ID:      id,
		Method:  method,
		Params:  params,
	}

	// Register response channel before sending (avoid race)
	ch := make(chan jsonrpcResponse, 1)
	t.pendMu.Lock()
	if t.closed {
		t.pendMu.Unlock()
		return nil, fmt.Errorf("transport closed")
	}
	t.pending[id] = ch
	t.pendMu.Unlock()

	data, err := json.Marshal(req)
	if err != nil {
		t.pendMu.Lock()
		delete(t.pending, id)
		t.pendMu.Unlock()
		return nil, err
	}
	data = append(data, '\n')

	t.mu.Lock()
	_, err = t.stdin.Write(data)
	t.mu.Unlock()
	if err != nil {
		t.pendMu.Lock()
		delete(t.pending, id)
		t.pendMu.Unlock()
		return nil, fmt.Errorf("write: %w", err)
	}

	// Wait for response (with timeout)
	select {
	case resp := <-ch:
		if resp.Error != nil {
			return nil, fmt.Errorf("MCP error (%d): %s", resp.Error.Code, resp.Error.Message)
		}
		return resp.Result, nil
	case <-time.After(30 * time.Second):
		t.pendMu.Lock()
		delete(t.pending, id)
		t.pendMu.Unlock()
		return nil, fmt.Errorf("MCP request %d timed out", id)
	}
}

func (t *stdioTransport) close() {
	_ = t.stdin.Close()
	if t.cmd.Process != nil {
		_ = t.cmd.Process.Kill()
	}
}

// --- Transport: HTTP (Streamable HTTP / SSE) ---

type httpTransport struct {
	baseURL    string
	headers    map[string]string
	httpClient *http.Client
	sessionID  string // MCP session ID from server
	nextID     int
	mu         sync.Mutex
}

func newHTTPTransport(cfg MCPServerConfig) (*httpTransport, error) {
	if cfg.URL == "" {
		return nil, fmt.Errorf("HTTP transport requires 'url'")
	}

	headers := make(map[string]string)
	for k, v := range cfg.Headers {
		headers[k] = v
	}
	if cfg.APIKey != "" {
		headers["Authorization"] = "Bearer " + cfg.APIKey
	}

	return &httpTransport{
		baseURL: strings.TrimRight(cfg.URL, "/"),
		headers: headers,
		httpClient: &http.Client{
			Timeout: 60 * time.Second,
		},
	}, nil
}

func (t *httpTransport) send(method string, params any) (json.RawMessage, error) {
	t.mu.Lock()
	t.nextID++
	id := t.nextID
	t.mu.Unlock()

	req := jsonrpcRequest{
		JSONRPC: "2.0",
		ID:      id,
		Method:  method,
		Params:  params,
	}

	body, err := json.Marshal(req)
	if err != nil {
		return nil, err
	}

	// POST to the MCP endpoint
	endpoint := t.baseURL
	if !strings.HasSuffix(endpoint, "/mcp") && !strings.HasSuffix(endpoint, "/rpc") {
		endpoint += "/mcp"
	}

	httpReq, err := http.NewRequest("POST", endpoint, bytes.NewReader(body))
	if err != nil {
		return nil, err
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Accept", "application/json, text/event-stream")
	for k, v := range t.headers {
		httpReq.Header.Set(k, v)
	}
	if t.sessionID != "" {
		httpReq.Header.Set("Mcp-Session-Id", t.sessionID)
	}

	resp, err := t.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("HTTP request: %w", err)
	}
	defer resp.Body.Close()

	// Capture session ID if returned
	if sid := resp.Header.Get("Mcp-Session-Id"); sid != "" {
		t.mu.Lock()
		t.sessionID = sid
		t.mu.Unlock()
	}

	contentType := resp.Header.Get("Content-Type")

	// Handle SSE response (text/event-stream)
	if strings.Contains(contentType, "text/event-stream") {
		return t.parseSSEResponse(resp.Body, id)
	}

	// Handle direct JSON response
	if resp.StatusCode != 200 {
		errBody, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("HTTP %d: %s", resp.StatusCode, string(errBody))
	}

	var jsonResp jsonrpcResponse
	if err := json.NewDecoder(resp.Body).Decode(&jsonResp); err != nil {
		return nil, fmt.Errorf("decode response: %w", err)
	}
	if jsonResp.Error != nil {
		return nil, fmt.Errorf("MCP error (%d): %s", jsonResp.Error.Code, jsonResp.Error.Message)
	}
	return jsonResp.Result, nil
}

// parseSSEResponse reads an SSE stream and extracts the JSON-RPC response
func (t *httpTransport) parseSSEResponse(reader io.Reader, expectedID int) (json.RawMessage, error) {
	scanner := bufio.NewScanner(reader)
	scanner.Buffer(make([]byte, 1024*1024), 1024*1024)

	for scanner.Scan() {
		line := scanner.Text()

		if !strings.HasPrefix(line, "data: ") {
			continue
		}

		data := strings.TrimPrefix(line, "data: ")
		if data == "" {
			continue
		}

		var resp jsonrpcResponse
		if err := json.Unmarshal([]byte(data), &resp); err != nil {
			continue // Skip malformed events
		}

		// Match by ID — this is our response
		if resp.ID == expectedID {
			if resp.Error != nil {
				return nil, fmt.Errorf("MCP error (%d): %s", resp.Error.Code, resp.Error.Message)
			}
			return resp.Result, nil
		}
	}

	return nil, fmt.Errorf("SSE stream ended without response for request %d", expectedID)
}

func (t *httpTransport) close() {
	// Send DELETE to clean up session (best effort)
	if t.sessionID != "" {
		req, err := http.NewRequest("DELETE", t.baseURL, nil)
		if err == nil {
			req.Header.Set("Mcp-Session-Id", t.sessionID)
			for k, v := range t.headers {
				req.Header.Set(k, v)
			}
			client := &http.Client{Timeout: 5 * time.Second}
			resp, err := client.Do(req)
			if err == nil {
				resp.Body.Close()
			}
		}
	}
}

// --- Shared JSON-RPC types ---

type jsonrpcRequest struct {
	JSONRPC string `json:"jsonrpc"`
	ID      int    `json:"id"`
	Method  string `json:"method"`
	Params  any    `json:"params,omitempty"`
}

type jsonrpcResponse struct {
	JSONRPC string          `json:"jsonrpc"`
	ID      int             `json:"id"`
	Result  json.RawMessage `json:"result,omitempty"`
	Error   *jsonrpcError   `json:"error,omitempty"`
}

type jsonrpcError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

// --- Helpers ---

func detectTransport(cfg MCPServerConfig) TransportType {
	if cfg.Transport != "" {
		switch cfg.Transport {
		case "http":
			return TransportHTTP
		case "sse":
			return TransportSSE
		case "stdio":
			return TransportStdio
		}
	}
	// Auto-detect: URL present = HTTP, command present = stdio
	if cfg.URL != "" {
		return TransportHTTP
	}
	return TransportStdio
}
