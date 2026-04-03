package engine

import (
	"bytes"
	"fmt"
	"os/exec"
	"runtime"
	"strings"
)

// VoiceEngine handles voice input and output
type VoiceEngine struct {
	enabled    bool
	recording  bool
	soxPath    string
}

// NewVoiceEngine creates a voice engine
func NewVoiceEngine() *VoiceEngine {
	ve := &VoiceEngine{}
	ve.detectSox()
	return ve
}

// IsAvailable checks if voice features can be used
func (ve *VoiceEngine) IsAvailable() bool {
	return ve.soxPath != ""
}

// Enable turns on voice mode
func (ve *VoiceEngine) Enable() error {
	if !ve.IsAvailable() {
		return fmt.Errorf("voice mode requires SoX (Sound eXchange). Install with:\n" +
			"  macOS:   brew install sox\n" +
			"  Linux:   sudo apt install sox\n" +
			"  Windows: choco install sox")
	}
	ve.enabled = true
	return nil
}

// Disable turns off voice mode
func (ve *VoiceEngine) Disable() {
	ve.enabled = false
	ve.recording = false
}

// IsEnabled returns whether voice is on
func (ve *VoiceEngine) IsEnabled() bool { return ve.enabled }

// RecordAudio captures audio from the microphone and returns the file path
func (ve *VoiceEngine) RecordAudio(durationSecs int) (string, error) {
	if !ve.enabled {
		return "", fmt.Errorf("voice mode is not enabled")
	}

	tmpFile := "/tmp/bc2-voice-input.wav"
	if runtime.GOOS == "windows" {
		tmpFile = "C:\\Temp\\bc2-voice-input.wav"
	}

	args := []string{
		"-d", // default input device
		"-r", "16000", // 16kHz sample rate
		"-c", "1", // mono
		"-b", "16", // 16-bit
		tmpFile,
		"trim", "0", fmt.Sprintf("%d", durationSecs),
	}

	cmd := exec.Command(ve.soxPath, args...)
	var stderr bytes.Buffer
	cmd.Stderr = &stderr

	ve.recording = true
	err := cmd.Run()
	ve.recording = false

	if err != nil {
		return "", fmt.Errorf("recording failed: %v (%s)", err, stderr.String())
	}

	return tmpFile, nil
}

// TextToSpeech converts text to speech output
func (ve *VoiceEngine) TextToSpeech(text string) error {
	if !ve.enabled {
		return fmt.Errorf("voice mode is not enabled")
	}

	// Platform-specific TTS
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "darwin":
		cmd = exec.Command("say", text)
	case "linux":
		// Try espeak
		if path, err := exec.LookPath("espeak"); err == nil {
			cmd = exec.Command(path, text)
		} else if path, err := exec.LookPath("festival"); err == nil {
			cmd = exec.Command(path, "--tts")
			cmd.Stdin = strings.NewReader(text)
		} else {
			return fmt.Errorf("no TTS engine found. Install espeak or festival")
		}
	case "windows":
		// PowerShell TTS
		psScript := fmt.Sprintf(`Add-Type -AssemblyName System.Speech; $s = New-Object System.Speech.Synthesis.SpeechSynthesizer; $s.Speak('%s')`,
			strings.ReplaceAll(text, "'", "''"))
		cmd = exec.Command("powershell", "-Command", psScript)
	default:
		return fmt.Errorf("TTS not supported on %s", runtime.GOOS)
	}

	return cmd.Run()
}

func (ve *VoiceEngine) detectSox() {
	if path, err := exec.LookPath("sox"); err == nil {
		ve.soxPath = path
	} else if path, err := exec.LookPath("rec"); err == nil {
		ve.soxPath = path
	}
}
