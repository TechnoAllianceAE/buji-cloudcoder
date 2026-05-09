# Product Requirements Document (PRD): BujiCoderPlus (BCP)

**Status:** Work In Progress (WIP)
**Project Name:** BujiCoderPlus (BCP)
**Target Platform:** macOS, Windows, Linux (CLI & Programmatic SDK)

## 1. Overview
BujiCoderPlus (BCP) is an enterprise-grade AI coding assistant designed to operate seamlessly within the Buji Enterprise ecosystem. It acts as a powerful local agent and IDE companion for software engineers, enabling autonomous code editing, file searching, and multi-step plan execution. 

BCP is an adapted evolution of the Codebuff architecture, specifically tailored for Buji's internal and enterprise needs. It removes all consumer-facing monetization mechanisms (ads, referrals, billing) and redirects all backend communication to the secure Buji Enterprise Gateway.

## 2. Objectives & Goals
1. **Enterprise Integration:** Connect BCP securely to the Buji Enterprise Gateway for all Agent and LLM invocations.
2. **Seamless Authentication:** Implement a robust Device-Code (OAuth-style) login flow, avoiding the need for browser-to-CLI local port callbacks.
3. **Data Security & Privacy:** Ensure no telemetry, third-party analytics (like PostHog), or ads are present in the application.
4. **Familiar Developer UX:** Maintain the highly polished CLI-based UI that developers enjoy, without the clutter of consumer features.

## 3. Key Features
### 3.1 Device-Code Authentication Flow
- **CLI Initiated:** BCP requests an authentication code (`userCode` and `code`) from the Gateway.
- **Browser Verification:** Users visit a secure URL and enter the provided 8-character `userCode`.
- **JWT Provisioning:** The BCP CLI polls the Gateway until the user validates the code, receiving a secure JWT `authToken` upon success.

### 3.2 Agent Execution & LLM Streaming
- All AI inferences and multi-step planning loops are routed directly to the Gateway (`/api/v1/llm/stream`).
- Streams are pushed via Server-Sent Events (SSE) back to the BCP CLI to offer real-time code generation and typing effects.
- The `bcp` CLI supports local file reading, writing, and tree-sitter based code mapping.

### 3.3 Consumer Clutter Removal
- Removed all "Pro" tier locked logic, referral codes, and generic advertising.
- Rebranded CLI text, loaders, and logs to reflect BujiCoderPlus (`bcp`).
- Default backend routes point strictly to `process.env.BCP_API_URL` or `ent.bujicoder.com`.

## 4. Architecture
### 4.1 Client-Side (BCP)
- **Framework:** Node.js + TypeScript + React (via Ink for CLI rendering).
- **Core Packages:**
  - `@bcp/cli`: The main entry point and UI layer.
  - `@bcp/sdk`: Exposes functionality to programmatic consumers and handles the internal LLM/Agent routing.
  - `@bcp/agent-runtime`: Manages the tool execution (file reads, writes, terminal commands).
  - `@bcp/code-map`: Tree-sitter powered codebase understanding.

### 4.2 Server-Side (Buji Enterprise Gateway)
- Handles user authentication, API key validation, and JWT issuing.
- Proxies LLM requests to the appropriate secure models (e.g., Anthropic Claude, OpenAI, or internal models).
- Enforces enterprise access policies and rate limits.

## 5. Development Phases
1. **Phase 1: Fork & Strip [COMPLETED]** - Established the core repository from upstream, removed ads and analytics.
2. **Phase 2: Rebrand [COMPLETED]** - Updated all package references to `@bcp`, changed branding artifacts.
3. **Phase 3: Gateway Integration [COMPLETED]** - Updated API clients, LLM streaming, and auth flows to hit the Enterprise Gateway.

### Phase 4: Build & Distribution [WIP]
The objective of Phase 4 is to establish a secure and automated pipeline to package, distribute, and install the BCP CLI to internal engineers without relying on public package managers.
- **Task 4.1: Build Script Automation**
  - Create a robust `build.ts` script for `bcp` that compiles the CLI and SDK binaries across target platforms (macOS, Windows, Linux).
  - Ensure tree-sitter WASM dependencies are correctly bundled and optimized.
- **Task 4.2: Local NPM Publishing (Enterprise Registry)**
  - Configure `package.json` to safely publish to an internal Buji NPM registry (or equivalent private registry).
  - Strip any remaining mentions of the public NPM registry to prevent accidental leaks.
- **Task 4.3: Custom Install Script**
  - Create a custom `install.sh` / `install.ps1` script for developers to cleanly install the CLI locally (e.g., `curl -fsSL https://ent.bujicoder.com/install.sh | bash`).
  - The script should place the compiled binary in standard local bin paths (e.g., `~/.bcp/bin`) and handle `PATH` configuration.

### Phase 5: Polish & Testing [UPCOMING]
The objective of Phase 5 is to guarantee the product quality is high, the Developer Experience matches constraints, and no legacy references remain.
- **Task 5.1: Agent Definition Updates**
  - Update system prompts and agent instructions to reflect the enterprise environment (e.g., advising models not to tell users to visit public sites, but rather Buji internal docs).
- **Task 5.2: Test Suite Cleanup**
  - Clean up remaining string references (`~55+` instances) to "codebuff" within the E2E test fixtures, mock data, and expected outputs.
  - Re-run the full `pnpm test` suite to ensure the CLI and SDK operate flawlessly under the new BCP architecture.
- **Task 5.3: Integration & Manual QA**
  - Run BCP across large internal repositories to gauge the Gateway's streaming performance.
  - Verify that token usage metrics correctly push up to the Buji Gateway for internal accounting.

## 6. Future Considerations
- **Telemetry for Enterprise:** We may introduce logging mechanisms later that report *only* to the Enterprise Gateway for internal auditing, completely isolated from the internet.
- **Custom Internal Tools:** Adding explicit tool callbacks for Buji's internal CI/CD stack (e.g., executing Jenkins/GitHub Actions triggers directly from within BCP).
