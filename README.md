# BujiCloudCoder (bc2)

An open-source AI coding CLI built in Go by **TA** (TechnoAllianceAE).

bc2 is an agentic coding assistant that runs in your terminal. It connects to Claude's API and uses tools to read, write, search, and execute code on your behalf.

## Features

- **20 built-in tools** — Bash, Read, Edit, Write, Glob, Grep, WebFetch, WebSearch, Agent, Tasks, and more
- **Streaming responses** — real-time token streaming via SSE
- **Agentic loop** — Claude calls tools, gets results, continues until done
- **Interactive REPL** — readline with history, colored output, slash commands
- **Non-interactive mode** — pipe input or use `-p "prompt"`
- **Cost tracking** — per-model token/USD breakdown
- **Session persistence** — save/resume conversations
- **Auto-compact** — automatic context compression when approaching token limits
- **Permission system** — allow/deny/ask rules, dangerous command detection
- **File history** — snapshots before each edit, rewind capability
- **Git integration** — repo detection, branch info, diff tracking
- **MCP support** — connect to MCP servers via stdio JSON-RPC
- **Multi-provider** — Anthropic, AWS Bedrock, Google Vertex, Azure Foundry, OpenAI
- **Extended thinking** — thinking blocks with budget control
- **Retry/fallback** — exponential backoff, model fallback on overload
- **Hook system** — pre/post tool hooks from settings
- **Skill system** — load custom skills from `.bc2/skills/`
- **Memory system** — persistent memories across sessions
- **Diagnostics** — `/doctor` for system health checks

## Quick Start

```bash
# Build
go build -o bc2 ./cmd/bc2/

# Set your API key
export ANTHROPIC_API_KEY=sk-ant-...

# Interactive mode
./bc2

# One-shot
./bc2 -p "explain this codebase"

# Piped
echo "list all Go files" | ./bc2

# With options
./bc2 -model claude-opus-4-20250514 -thinking -p "refactor main.go"

# Diagnostics
./bc2 -doctor
```

## Slash Commands

| Command | Description |
|---------|-------------|
| `/help` | Show available commands |
| `/model [name]` | Get or set the model |
| `/cost` | Show session cost breakdown |
| `/usage` | Show token usage |
| `/context` | Show context window usage |
| `/compact` | Compress conversation history |
| `/diff` | Show diffs of modified files |
| `/files` | List files modified this session |
| `/resume` | Resume a previous session |
| `/session` | Show current session info |
| `/export [fmt]` | Export conversation (text/markdown) |
| `/doctor` | Run system diagnostics |
| `/clear` | Clear conversation history |
| `/exit` | Exit |

## Configuration

Config is stored in `~/.bc2/settings.json`. Project-level config goes in `.bc2/settings.json`.

Environment variables:
- `ANTHROPIC_API_KEY` — API key (required for direct API)
- `ANTHROPIC_DEFAULT_MODEL` — Override default model
- `ANTHROPIC_BASE_URL` — Custom API endpoint
- `CLAUDE_CODE_USE_BEDROCK=true` — Use AWS Bedrock
- `CLAUDE_CODE_USE_VERTEX=true` — Use Google Vertex AI
- `CLAUDE_CODE_USE_FOUNDRY=true` — Use Azure Foundry
- `CLAUDE_CODE_USE_OPENAI=true` — Use OpenAI-compatible API
- `BRAVE_API_KEY` — Enable web search (Brave)
- `SEARXNG_URL` — Enable web search (SearXNG)

## Project Instructions

Create a `BC2.md` (or `CLAUDE.md` for backwards compatibility) in your project root to provide context to the assistant. This file is automatically loaded into the system prompt.

## Architecture

```
cmd/bc2/                — CLI entry point, flags, modes
internal/api/           — API client, SSE streaming, retry, multi-provider
internal/config/        — Config loading, shell/platform detection
internal/engine/        — Query engine, cost, permissions, compact,
                          git, file history, sessions, memory, MCP,
                          hooks, skills, diagnostics
internal/tools/         — 20 tool implementations
internal/repl/          — Interactive REPL with readline
internal/types/         — Shared types (Message, StreamEvent, etc.)
internal/utils/         — UUID, path, file helpers
```

## Development

See [DEV_PHASES.md](DEV_PHASES.md) for the full porting roadmap and feature status.

## License

Open source. See LICENSE for details.

## Credits

Built by **TA** (TechnoAllianceAE).
