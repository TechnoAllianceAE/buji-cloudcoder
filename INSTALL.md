# BujiCoderPlus (BCP) — Installation Guide

## Quick Install (Pre-built Binaries)

### macOS / Linux

```sh
curl -fsSL https://ent.bujicoder.com/download/install-bcp.sh | sh
```

### Windows (PowerShell)

```powershell
irm https://ent.bujicoder.com/download/install-bcp.ps1 | iex
```

### Custom Server URL

```sh
# macOS / Linux
curl -fsSL https://ent.bujicoder.com/download/install-bcp.sh | sh -s -- --server https://your-server.com

# Windows
$env:BCP_SERVER="https://your-server.com"; irm https://ent.bujicoder.com/download/install-bcp.ps1 | iex
```

## Build from Source

### Prerequisites

- Node.js 20+ and pnpm 10+

### Steps

```sh
# Clone and enter the repo
git clone https://github.com/TechnoAllianceAE/bujicoder-enterprise.git
cd bujicoder-enterprise/bujicoderplus

# Install dependencies
make install

# Build SDK + CLI binary for your current platform
make build

# Install to ~/.local/bin/bcp
make install-cli
```

### Cross-compile for All Platforms

```sh
make dist-cli VERSION=0.1.0
```

This produces binaries + checksums in `cli/bin/dist/`:

| File | Platform |
|------|----------|
| `bcp_linux_amd64` | Linux x86_64 |
| `bcp_linux_arm64` | Linux ARM64 |
| `bcp_darwin_amd64` | macOS Intel |
| `bcp_darwin_arm64` | macOS Apple Silicon |
| `bcp_windows_amd64.exe` | Windows x86_64 |
| `checksums.txt` | SHA-256 checksums |

## Configuration

BCP stores configuration in `~/.bcp/`.

| File | Purpose |
|------|---------|
| `~/.bcp/credentials.json` | Auth token (created by `bcp login`) |
| `~/.bcp/config.json` | Server URL and settings |

### Environment Variables

Copy `.env.example` to `.env` at the repo root. Key variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_BCP_APP_URL` | Yes | Gateway URL (default: `https://ent.bujicoder.com`) |
| `NEXT_PUBLIC_CB_ENVIRONMENT` | Yes | `dev`, `test`, or `prod` |
| `BCP_API_URL` | No | Override API URL |
| `BCP_API_KEY` | No | API key for headless/CI usage |

## Makefile Targets

| Command | Description |
|---------|-------------|
| `make install` | Install dependencies (`pnpm install`) |
| `make dev` | Start CLI in development mode |
| `make build` | Build SDK + CLI binary |
| `make build-sdk` | Build SDK only (ESM + CJS) |
| `make build-cli` | Build CLI for current platform |
| `make dist-cli` | Cross-compile CLI for all platforms |
| `make install-cli` | Install CLI to `~/.local/bin/bcp` |
| `make test` | Run all tests |
| `make typecheck` | Type-check all packages |
| `make format` | Format code with Prettier |
| `make clean` | Remove build artifacts |

## Verify Installation

```sh
bcp --version
```

## Uninstall

```sh
# Remove the binary
rm -f /usr/local/bin/bcp ~/.local/bin/bcp

# Remove config (optional)
rm -rf ~/.bcp
```
