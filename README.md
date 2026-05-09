# BujiCoderPlus (BCP)

> AI coding assistant — powered by Buji Enterprise

BujiCoderPlus is a TypeScript-based AI coding assistant that connects to the Buji Enterprise Gateway. It's part of the BujiCoder product family, alongside BujiCoder (Go).

## Quick Start

```bash
# Install dependencies
pnpm install

# Start the CLI
pnpm run start-cli

# Or run in dev mode
pnpm run dev
```

## Architecture

```
CLI (OpenTUI + React) ─── SSE ───▶ Buji Enterprise Gateway (:8080)
     │                                     │
     ├── Local Tools                       ├── Agent Runtime (Go)
     │   ├── File Edit                     ├── LLM Proxy (multi-provider)
     │   ├── Terminal                      ├── Auth (JWT)
     │   ├── Search                        └── Billing
     │   └── Git
     │
     └── BCP SDK (@bcp/sdk)
```

## Project Structure

| Directory | Description |
|---|---|
| `cli/` | TUI client — OpenTUI + React terminal UI |
| `sdk/` | JavaScript/TypeScript SDK |
| `common/` | Shared types, tools, schemas |
| `packages/agent-runtime/` | Agent execution runtime |
| `packages/code-map/` | Code indexing |
| `agents/` | Agent definitions (YAML-style in TS) |

## License

Derived from [Codebuff](https://github.com/codebuff-community/codebuff) (Apache 2.0).
See [NOTICE](./NOTICE) for attribution.
