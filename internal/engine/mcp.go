package engine

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"sync"

	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/config"
	"github.com/TechnoAllianceAE/buji-cloudcoder/internal/types"
)

// MCPServerConfig defines an MCP server from settings
type MCPServerConfig struct {
	Command string            `json:"command"`
	Args    []string          `json:"args"`
	Env     map[string]string `json:"env,omitempty"`
	Enabled *bool             `json:"enabled,omitempty"`
}

// MCPClient manages a connection to an MCP server via stdio
type MCPClient struct {
	name    string
	cmd     *exec.Cmd
	stdin   io.WriteCloser
	stdout  *bufio.Reader
	mu      sync.Mutex
	nextID  int
	tools   []types.ToolDefinition
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
		if cfg.Command == "" {
			continue
		}
		_ = mgr.Connect(name, cfg)
	}
}

// Connect starts an MCP server process
func (mgr *MCPManager) Connect(name string, cfg MCPServerConfig) error {
	cmd := exec.Command(cfg.Command, cfg.Args...)

	// Set environment
	cmd.Env = os.Environ()
	for k, v := range cfg.Env {
		cmd.Env = append(cmd.Env, fmt.Sprintf("%s=%s", k, v))
	}

	stdin, err := cmd.StdinPipe()
	if err != nil {
		return fmt.Errorf("stdin pipe: %w", err)
	}

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return fmt.Errorf("stdout pipe: %w", err)
	}

	if err := cmd.Start(); err != nil {
		return fmt.Errorf("start MCP server %s: %w", name, err)
	}

	client := &MCPClient{
		name:   name,
		cmd:    cmd,
		stdin:  stdin,
		stdout: bufio.NewReader(stdout),
	}

	mgr.clients[name] = client

	// Initialize the MCP connection
	if err := client.initialize(); err != nil {
		_ = cmd.Process.Kill()
		delete(mgr.clients, name)
		return fmt.Errorf("initialize MCP %s: %w", name, err)
	}

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

// Close shuts down all MCP servers
func (mgr *MCPManager) Close() {
	for _, client := range mgr.clients {
		client.close()
	}
}

// --- MCPClient methods ---

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

func (c *MCPClient) send(method string, params any) (json.RawMessage, error) {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.nextID++
	req := jsonrpcRequest{
		JSONRPC: "2.0",
		ID:      c.nextID,
		Method:  method,
		Params:  params,
	}

	data, err := json.Marshal(req)
	if err != nil {
		return nil, err
	}
	data = append(data, '\n')

	if _, err := c.stdin.Write(data); err != nil {
		return nil, fmt.Errorf("write to MCP: %w", err)
	}

	// Read response
	line, err := c.stdout.ReadBytes('\n')
	if err != nil {
		return nil, fmt.Errorf("read from MCP: %w", err)
	}

	var resp jsonrpcResponse
	if err := json.Unmarshal(line, &resp); err != nil {
		return nil, fmt.Errorf("parse MCP response: %w", err)
	}

	if resp.Error != nil {
		return nil, fmt.Errorf("MCP error (%d): %s", resp.Error.Code, resp.Error.Message)
	}

	return resp.Result, nil
}

func (c *MCPClient) initialize() error {
	// Send initialize request
	_, err := c.send("initialize", map[string]any{
		"protocolVersion": "2024-11-05",
		"capabilities":    map[string]any{},
		"clientInfo": map[string]any{
			"name":    "bc2",
			"version": "1.0.0",
		},
	})
	if err != nil {
		return err
	}

	// Send initialized notification (no response expected)
	notif, _ := json.Marshal(jsonrpcRequest{
		JSONRPC: "2.0",
		Method:  "notifications/initialized",
	})
	notif = append(notif, '\n')
	_, _ = c.stdin.Write(notif)

	// List tools
	result, err := c.send("tools/list", nil)
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

func (c *MCPClient) callTool(toolName string, input map[string]any) (string, error) {
	result, err := c.send("tools/call", map[string]any{
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
	return fmt.Sprintf("%s", parts), nil
}

func (c *MCPClient) close() {
	_ = c.stdin.Close()
	if c.cmd.Process != nil {
		_ = c.cmd.Process.Kill()
	}
}
