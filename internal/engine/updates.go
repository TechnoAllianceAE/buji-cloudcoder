package engine

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

const (
	updateCheckURL     = "https://api.github.com/repos/TechnoAllianceAE/buji-cloudcoder/releases/latest"
	currentVersion     = "0.2.0"
	updateCheckInterval = 24 * time.Hour
)

// UpdateInfo holds information about an available update
type UpdateInfo struct {
	Available   bool
	CurrentVer  string
	LatestVer   string
	ReleaseURL  string
	ReleaseDate string
}

// CheckForUpdates checks GitHub releases for a newer version
func CheckForUpdates() (*UpdateInfo, error) {
	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Get(updateCheckURL)
	if err != nil {
		return nil, fmt.Errorf("check updates: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return &UpdateInfo{Available: false, CurrentVer: currentVersion}, nil
	}

	var release struct {
		TagName     string `json:"tag_name"`
		HTMLURL     string `json:"html_url"`
		PublishedAt string `json:"published_at"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&release); err != nil {
		return nil, err
	}

	latestVer := release.TagName
	// Strip leading 'v' if present
	if len(latestVer) > 0 && latestVer[0] == 'v' {
		latestVer = latestVer[1:]
	}

	return &UpdateInfo{
		Available:   latestVer != currentVersion,
		CurrentVer:  currentVersion,
		LatestVer:   latestVer,
		ReleaseURL:  release.HTMLURL,
		ReleaseDate: release.PublishedAt,
	}, nil
}

// FormatUpdateNotification returns a user-friendly update message
func FormatUpdateNotification(info *UpdateInfo) string {
	if info == nil || !info.Available {
		return ""
	}
	return fmt.Sprintf("Update available: %s -> %s\nDownload: %s",
		info.CurrentVer, info.LatestVer, info.ReleaseURL)
}
