# BujiCoderPlus (BCP)

BujiCoderPlus is an AI coding assistant built in TypeScript. It provides agent-based code editing through natural language via a CLI (OpenTUI + React TUI) and SDK, backed by the Buji Enterprise Gateway.

## Goals

- Help developers write, debug, refactor, and understand code faster.
- Leverage the Buji Enterprise Gateway for multi-provider LLM routing.
- Provide a flexible agent system with local tool execution.

## Key Technologies

- TypeScript monorepo (pnpm workspaces)
- Node.js runtime + pnpm package manager
- OpenTUI + React (CLI TUI)
- Multiple LLM providers via Buji Enterprise Gateway

## Repo Map

- `cli/`: TUI client (OpenTUI + React) and local UX
- `sdk/`: JS/TS SDK used by the CLI and external users
- `common/`: Shared types, tools, schemas, utilities
- `packages/agent-runtime/`: Agent runtime + tool handling
- `packages/code-map/`: Codebase indexing
- `agents/`: Agent definitions shipped with BCP
- `scripts/`: Development and build scripts

## Request Flow

1. CLI/SDK sends user input + context to the Buji Enterprise Gateway.
2. Gateway runs agent runtime, streams events/chunks back via SSE.
3. Tools execute locally (file edits, terminal commands, search) to satisfy tool calls.

## Development

```bash
pnpm install       # Install dependencies
pnpm run start-cli     # Start the CLI
pnpm run typecheck  # Type-check all packages
pnpm test          # Run tests
```

## Environment Variables

- `BCP_API_URL` — Gateway URL (default: `https://ent.bujicoder.com`)
- `BCP_CONFIG_DIR` — Config directory (default: `~/.bcp`)
