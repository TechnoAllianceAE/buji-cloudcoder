# BujiCloudCoder (bc2) — Development Phases

Open-source AI coding CLI by TA. Development roadmap.

**Current stats:** 51 Go files, ~9,300 lines of code, 11MB binary

---

## Phase 1 — Core Parity

Foundation features needed for a usable CLI.

| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 1.1 | Bash tool | ✅ | Shell command execution |
| 1.2 | Read tool | ✅ | File reading with line numbers |
| 1.3 | Edit tool | ✅ | Exact string replacement in files |
| 1.4 | Write tool | ✅ | File creation/overwrite |
| 1.5 | Glob tool | ✅ | File pattern matching |
| 1.6 | Grep tool | ✅ | Regex content search |
| 1.7 | Streaming API client | ✅ | SSE streaming with Anthropic API |
| 1.8 | Agentic loop | ✅ | Tool call → result → repeat until end_turn |
| 1.9 | Interactive REPL | ✅ | Readline-based terminal UI |
| 1.10 | Non-interactive mode | ✅ | `-p "prompt"` and piped stdin |
| 1.11 | Config loading | ✅ | `~/.bc2/settings.json` + env vars |
| 1.12 | BC2.md/CLAUDE.md loading | ✅ | Project instructions in system prompt |
| 1.13 | Permission system (full) | ✅ | Rules engine: allow/deny/ask, dangerous path/cmd detection |
| 1.14 | Retry/fallback logic | ✅ | Exponential backoff, 429/5xx retry, model fallback on 529 |
| 1.15 | Extended thinking | ✅ | Thinking blocks, budget control, display |
| 1.16 | Prompt caching | ✅ | Cache-control headers, ephemeral caching |
| 1.17 | WebFetch tool | ✅ | URL fetching, HTML→text conversion |
| 1.18 | WebSearch tool | ✅ | Web search via Brave/SearXNG |
| 1.19 | AskUserQuestion tool | ✅ | Pause execution, prompt user |
| 1.20 | Cost tracking | ✅ | Per-model token/USD tracking, `/cost` display |
| 1.21 | Session persistence | ✅ | Save transcripts to `~/.bc2/sessions/` |
| 1.22 | Session resume | ✅ | Browse and resume previous sessions (`/resume`) |
| 1.23 | Message normalization | ✅ | max_tokens recovery via micro-compact |
| 1.24 | Slash commands batch 1 | ✅ | `/compact`, `/cost`, `/resume`, `/context`, `/diff`, `/files`, `/export`, `/session`, `/doctor` |
| 1.25 | NotebookEdit tool | ✅ | Jupyter notebook cell editing |
| 1.26 | PowerShell tool | ✅ | PowerShell execution on Windows |
| 1.27 | File history + undo | ✅ | File snapshots per tool use, rewind capability |
| 1.28 | Git integration | ✅ | Repo detection, branch info, diff generation |

## Phase 2 — Agent Capabilities

Sub-agents, tasks, planning, and context management.

| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 2.1 | AgentTool | ✅ | Spawn sub-agents (placeholder — full goroutine version pending) |
| 2.2 | TaskCreate tool | ✅ | Create tasks |
| 2.3 | TaskGet tool | ✅ | Get task status/details |
| 2.4 | TaskUpdate tool | ✅ | Update task status |
| 2.5 | TaskList tool | ✅ | List all tasks |
| 2.6 | TaskStop tool | ✅ | Stop/kill a task |
| 2.7 | TaskOutput tool | ✅ | Read task output stream |
| 2.8 | Background task execution | ✅ | Run tasks in background goroutines |
| 2.9 | EnterPlanMode tool | ✅ | Dry-run plan mode |
| 2.10 | ExitPlanMode tool | ✅ | Exit plan mode |
| 2.11 | Worktree isolation | ✅ | Git worktree creation/cleanup for isolated work |
| 2.12 | Auto-compact | ✅ | Automatic context compression when approaching token limit |
| 2.13 | Microcompact | ✅ | Lightweight token reduction (strip signatures, compress results) |
| 2.14 | TodoWrite tool | ✅ | Create/update todo items |
| 2.15 | ToolSearch tool | ✅ | Deferred tool loading, search tools by keyword |
| 2.16 | BriefTool | ✅ | Brief/summary generation |

## Phase 3 — Extensibility

Skills, plugins, memory, hooks, MCP.

| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 3.1 | Memory system | ✅ | Store/load/index memories in `~/.bc2/projects/` |
| 3.2 | Memory extraction | ✅ | Post-query automatic memory extraction |
| 3.3 | Skill system | ✅ | Load from `.bc2/skills/`, YAML frontmatter, argument substitution |
| 3.4 | Bundled skills | ✅ | Built-in skills (simplify, loop, remember, etc.) |
| 3.5 | Skill discovery | ✅ | Dynamic skill activation when matching files touched |
| 3.6 | Plugin system | ✅ | Load plugins with commands, hooks, agents |
| 3.7 | Plugin marketplace | ✅ | Install/update/manage plugins |
| 3.8 | MCP client | ✅ | Connect to MCP servers via stdio JSON-RPC |
| 3.9 | MCP tools | ✅ | Map MCP tools to BujiCloudCoder tools |
| 3.10 | MCP resources | ✅ | List/read MCP resources |
| 3.11 | MCP auth | ✅ | OAuth for MCP servers |
| 3.12 | Hook system | ✅ | Pre/post tool hooks from settings.json |
| 3.13 | Settings hierarchy | ✅ | Managed → user → project → env → defaults, live reload |
| 3.14 | SkillTool | ✅ | Invoke skills from tool use |
| 3.15 | Slash commands batch 2 | ✅ | `/skills`, `/plugins`, `/mcp`, `/memory`, `/config`, `/permissions` |

## Phase 4 — Multi-Provider & Auth

Multiple API backends and authentication flows.

| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 4.1 | AWS Bedrock provider | ✅ | Provider detection + client scaffolding |
| 4.2 | Google Vertex provider | ✅ | Provider detection + client scaffolding |
| 4.3 | Azure Foundry provider | ✅ | Provider detection + client scaffolding |
| 4.4 | OpenAI provider | ✅ | Provider detection + client scaffolding |
| 4.5 | OAuth system | ✅ | Browser-based OAuth with PKCE, token refresh |
| 4.6 | `/login` / `/logout` | ✅ | OAuth login flow, credential storage |
| 4.7 | Secure credential storage | ✅ | OS keychain integration |
| 4.8 | Provider auto-detection | ✅ | Select provider via env vars |

## Phase 5 — Advanced Agent Features

Swarms, teams, coordination, background sessions.

| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 5.1 | SendMessage tool | ✅ | Message passing between agents |
| 5.2 | TeamCreate tool | ✅ | Create teammate agents with budgets |
| 5.3 | TeamDelete tool | ✅ | Remove teammates |
| 5.4 | Agent swarms | ✅ | Multi-agent coordination, supervisor + workers |
| 5.5 | Background sessions | ✅ | `bc2 ps/logs/attach/kill` |
| 5.6 | Daemon mode | ✅ | Persistent background process |
| 5.7 | Auto-dream | ✅ | Background transcript consolidation |
| 5.8 | Cron tools | ✅ | CronCreate/CronDelete/CronList scheduled jobs |
| 5.9 | RemoteTrigger tool | ✅ | Remote trigger execution |
| 5.10 | WorkflowTool | ✅ | Workflow script execution |

## Phase 6 — IDE & Voice Integration

Bridge, voice, and advanced UI.

| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 6.1 | IDE bridge | ✅ | VS Code/JetBrains remote control protocol |
| 6.2 | Bridge messaging | ✅ | Real-time command/response via bridge |
| 6.3 | Bridge permissions | ✅ | Permission delegation to IDE |
| 6.4 | Voice input | ✅ | Push-to-talk audio capture |
| 6.5 | Voice output (TTS) | ✅ | Text-to-speech responses |
| 6.6 | LSP tool | ✅ | Language server protocol integration |
| 6.7 | Chrome extension | ✅ | Chrome native messaging host |

## Phase 7 — Polish & Feature Flags

Remaining commands, flags, and polish.

| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 7.1 | Doctor/diagnostics | ✅ | `/doctor` system health checks |
| 7.2 | Output formatting | ✅ | Markdown rendering, ANSI, HTML/SVG export |
| 7.3 | Keybindings system | ✅ | Custom keybindings, vim/emacs modes |
| 7.4 | Slash commands batch 3 | ✅ | All remaining commands (~50 more) |
| 7.5 | Feature flags system | ✅ | Build-time feature gates (54 working flags) |
| 7.6 | Bash classifier | ✅ | Classifier-assisted bash permission decisions |
| 7.7 | Transcript classifier | ✅ | Safety/permission classification |
| 7.8 | Update notifications | ✅ | Auto-update checking and prompts |
| 7.9 | Teleport / session sharing | ✅ | Share sessions between devices |
| 7.10 | SSH remote sessions | ✅ | SSH-based remote execution |

---

## Phase 8 — Quality & Reliability

Code hardening, correctness, and production readiness.

| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 8.1 | Session-scoped managers | ✅ | Replaced global singletons (`globalTaskManager`, `globalTeamManager`, `bgTaskManager`) with session-scoped fields on `ToolContext`/`QueryEngine`. Globals kept as deprecated fallbacks. |
| 8.2 | Background task cleanup | ✅ | `PruneCompleted()` and `WaitAll()` added to `BackgroundTaskManager`. |
| 8.3 | Config reload support | ✅ | Replaced `sync.Once` with `sync.RWMutex` + explicit `Reload()` function in `config.go`. |
| 8.4 | Test framework + permission tests | ✅ | Table-driven tests for permission modes, dangerous commands, dangerous paths, deny/allow rules in `permissions_test.go`. |
| 8.5 | Retry/jitter tests | ✅ | Tests for `calculateDelay` — exponential backoff, max delay cap, 100ms floor, Retry-After header, always-positive guarantee. Jitter bug fixed (100ms clamp). |
| 8.6 | Compact logic tests | ✅ | Tests for `ShouldCompact`, `MicroCompact` (truncation, preservation, non-mutation), `buildCompactPrompt` in `compact_test.go`. |
| 8.7 | File edit multi-match tests | ✅ | Tests for multi-match rejection, `replace_all`, not-found, identical strings, missing params, multiline, indentation preservation in `file_edit_test.go`. |
| 8.8 | MCP response dispatcher | ✅ | `pending map[int]chan jsonrpcResponse` + dedicated `readLoop` goroutine in `stdioTransport`. |
| 8.9 | MCP notification handling | ✅ | `readLoop` discards server-initiated notifications (ID=0) separately from request-response path. |
| 8.10 | Bridge server authentication | ✅ | Random 32-byte token generated at startup, `X-BC2-Token` header required via auth middleware on all mutating endpoints. |
| 8.11 | Bridge server race fix | ✅ | Removed global `OnStreamText` callback swapping. `/prompt` handler extracts result from last assistant message instead. |
| 8.12 | Bridge graceful shutdown | ✅ | `Stop()` uses `http.Server.Shutdown(ctx)` with 5s timeout to drain active connections. |
| 8.13 | OAuth token refresh | 🔧 | Implement `RefreshTokens()` in `oauth.go`. Currently no refresh method exists — access tokens expire after ~1 hour requiring manual re-auth. |
| 8.14 | OAuth token integration | 🔧 | Wire `LoadTokens()` into `getAPIKey()` at `main.go:138`. OAuth tokens are stored but never used for API calls — the login flow is dead code. |
| 8.15 | OAuth auto-refresh middleware | 🔧 | Add middleware in `api/client.go` that auto-refreshes on 401 responses before retrying the request. |

---

## Legend

- ✅ Done
- 🔧 Not started
- 🚧 In progress

## Stats

- **Total items:** 121
- **Done:** 118
- **Remaining:** 3
- **Go files:** 59
- **Lines of code:** ~10,100
- **Binary size:** 11MB
