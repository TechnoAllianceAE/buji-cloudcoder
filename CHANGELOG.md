# Changelog

## v0.5.5 (2026-03-27)

### Bug Fixes
- **Tree-sitter WASM crash fully resolved** — `web-tree-sitter`'s `abort()` throws synchronous `RuntimeError`/`LinkError` inside WASM callbacks that bypass try-catch. Now pre-checks WASM file exists before calling `Parser.init()`, uses dynamic import, and intercepts uncaught exceptions. CLI continues without code-map features if WASM fails.
- **WASM files bundled with binary** — Build scripts now find WASM files in node_modules-based package storage. Installer downloads WASM tarball alongside the binary.

## v0.5.4 (2026-03-27)

### Bug Fixes
- **Fixed tree-sitter WASM loading in compiled binaries** — Compiled Node bundles embed `/$bunfs/` virtual paths that don't exist on target machines. `initTreeSitterForNode()` now searches multiple candidate locations: `BCP_WASM_DIR` env override, exec directory, `wasm/` subdirectory, `node_modules/`, `@vscode/tree-sitter-wasm`, and monorepo walk-up.

## v0.5.3 (2026-03-26)

### Features
- **Feature parity with Codebuff** — Ported 60+ agents, lib framework, skills, sessions, and evals/benchmark framework from Codebuff.
- **SDK type declarations fixed** — Replaced `dts-bundle-generator` with `tsc --emitDeclarationOnly` to resolve cross-package resolution failures.
- **Tree-sitter as hard dependency** — Moved from `optionalDependencies` to `dependencies` for reliable code-map support.

### Branding
- **Codebuff → BCP cleanup** — 270+ edits across 50+ files replacing Codebuff branding with BujiCoderPlus/BCP.

## v0.5.2 (2026-03-18)

### Features
- Initial BujiCoderPlus release with enterprise gateway integration.
- Device-code auth flow via BujiCoder Enterprise gateway.
- 60+ TypeScript agent definitions with programmatic generator-based control.
- React 19 TUI with OpenTUI, markdown rendering, syntax highlighting.
- MCP (Model Context Protocol) support for extending tools.
- Cross-platform Node CLI bundles (macOS/Linux/Windows, x64/ARM).

## v0.5.1 (2026-03-18)

- SDK build fixes and dependency resolution.

## v0.3.0 (2026-03-18)

- Initial fork from Codebuff with enterprise gateway routing.

## v0.2.0

- Early prototype.
