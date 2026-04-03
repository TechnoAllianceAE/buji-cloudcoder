package engine

import (
	"fmt"
	"os/exec"
	"strings"
)

// SSHSession represents a remote SSH session for bc2
type SSHSession struct {
	Host       string
	Port       int
	User       string
	KeyFile    string
	RemoteCWD  string
	Connected  bool
}

// NewSSHSession creates an SSH session configuration
func NewSSHSession(host, user string, port int) *SSHSession {
	if port == 0 {
		port = 22
	}
	return &SSHSession{
		Host: host,
		Port: port,
		User: user,
	}
}

// Connect establishes the SSH connection
func (s *SSHSession) Connect() error {
	// Verify SSH is available
	if _, err := exec.LookPath("ssh"); err != nil {
		return fmt.Errorf("ssh not found in PATH")
	}

	// Test connection
	args := s.buildSSHArgs("-o", "ConnectTimeout=5", "echo", "ok")
	cmd := exec.Command("ssh", args...)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("SSH connection failed: %v\n%s", err, string(output))
	}

	if strings.TrimSpace(string(output)) != "ok" {
		return fmt.Errorf("unexpected SSH response: %s", string(output))
	}

	s.Connected = true
	return nil
}

// Execute runs a command on the remote host
func (s *SSHSession) Execute(command string) (string, error) {
	if !s.Connected {
		return "", fmt.Errorf("not connected")
	}

	args := s.buildSSHArgs(command)
	cmd := exec.Command("ssh", args...)
	output, err := cmd.CombinedOutput()
	return string(output), err
}

// Disconnect closes the SSH session
func (s *SSHSession) Disconnect() {
	s.Connected = false
}

func (s *SSHSession) buildSSHArgs(extraArgs ...string) []string {
	var args []string
	if s.Port != 22 {
		args = append(args, "-p", fmt.Sprintf("%d", s.Port))
	}
	if s.KeyFile != "" {
		args = append(args, "-i", s.KeyFile)
	}
	args = append(args, "-o", "StrictHostKeyChecking=no")

	target := s.Host
	if s.User != "" {
		target = s.User + "@" + s.Host
	}
	args = append(args, target)
	args = append(args, extraArgs...)
	return args
}

// Teleport exports a session for sharing between devices
type TeleportSession struct {
	SessionID string `json:"session_id"`
	Host      string `json:"host"`
	Token     string `json:"token"`
	ExpiresAt string `json:"expires_at"`
}

// CreateTeleportSession creates a shareable session link
func CreateTeleportSession(sessionID string) *TeleportSession {
	return &TeleportSession{
		SessionID: sessionID,
		Host:      "localhost",
		Token:     generateState(), // reuse the random token generator
	}
}
