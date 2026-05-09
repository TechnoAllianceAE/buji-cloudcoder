# BujiCoderPlus Evals

This directory contains the evaluation framework for testing and measuring BujiCoderPlus's coding capabilities, with a focus on the **Git Commit Reimplementation Evaluation** system (BuffBench).

## Overview

The evaluation system takes a fundamentally different approach from traditional coding benchmarks like SWE Bench or Terminal Bench. Instead of passing predefined tests, our evaluations challenge coding agents to reimplement real git commits from open source projects over multiple interactive steps.

### Core Idea: Commit Reconstruction Methodology

Our evaluation framework centers on having coding agents reconstruct actual git commits from open source repositories through an interactive, multi-turn process.

A specialized prompting agent guides the coding agent through up to 5 conversational rounds to implement a specification derived from the original commit's changes.

The process concludes with an AI judge that provides comprehensive scoring by comparing the agent's implementation against the ground truth commit.

## Architecture

### System Components

1. **Evaluation Orchestration** (`run-buffbench.ts`)
   - Manages the complete evaluation pipeline
   - Handles concurrency and process management
   - Coordinates between all system components

2. **Agent Runners** (`runners/`)
   - **BCP Runner**: Integrates with BujiCoderPlus SDK
   - **Claude Runner**: Integrates with Anthropic's Claude Code
   - **Codex Runner**: Integrates with OpenAI Codex CLI
   - **Runner Interface**: Common abstraction for all coding agents

3. **Judging System** (`judge.ts`)
   - Uses AI to score implementations
   - Compares agent output against ground truth git diffs
   - Provides detailed scoring across multiple dimensions
   - Runs 2 judges in parallel and takes median for robustness

4. **Trace Analyzer** (`trace-analyzer.ts`)
   - Analyzes how agents approach problems
   - Compares agent workflows and decision-making
   - Provides per-agent feedback and recommendations

5. **Meta Analyzer** (`meta-analyzer.ts`)
   - Identifies patterns across multiple evaluation tasks
   - Provides high-level insights and key findings

6. **Test Repository Management** (`setup-test-repo.ts`)
   - Clones and manages git repositories for testing
   - Handles commit checkout and environment setup
   - Provides isolated testing environments

### Evaluation Workflow

```
Orchestrator → Setup repo at commit^ → Run agent → Get diff → Judge → Analyze
```

## Usage

### Running Evaluations

```bash
# Run the default buffbench evaluation
pnpm run buffbench/main.ts

# Run with specific eval file and agents
pnpm run buffbench/run-buffbench.ts
```

### Adding New Agents

Implement the `Runner` interface in `runners/`:

```typescript
export interface Runner {
  run: (prompt: string) => Promise<RunnerResult>
}

export type RunnerResult = {
  steps: AgentStep[]
  totalCostUsd: number
  diff: string
}
```

## Scoring

The AI judge evaluates three dimensions:
- **Completion Score (0-10)**: How completely was the spec implemented?
- **Code Quality Score (0-10)**: How well-structured and maintainable is the code?
- **Overall Score (0-10)**: Combined assessment of implementation quality

## Directory Structure

```
evals/
├── buffbench/                   # Main evaluation framework
│   ├── main.ts                  # Entry point
│   ├── run-buffbench.ts         # Core orchestrator
│   ├── agent-runner.ts          # Agent execution
│   ├── judge.ts                 # AI judging system
│   ├── trace-analyzer.ts        # Trace analysis
│   ├── meta-analyzer.ts         # Cross-task analysis
│   ├── format-output.ts         # Output formatting
│   ├── analyze-task-scores.ts   # Score analysis tools
│   ├── setup-test-repo.ts       # Repository management
│   ├── filter-supplemental-files.ts
│   ├── trace-utils.ts           # Trace truncation
│   ├── types.ts                 # Type definitions
│   └── runners/                 # Agent integrations
│       ├── runner.ts            # Common runner interface
│       ├── bcp.ts               # BujiCoderPlus runner
│       ├── claude.ts            # Claude Code runner
│       ├── codex.ts             # Codex runner
│       └── index.ts             # Exports
├── subagents/
│   └── test-repo-utils.ts       # Test repo helpers
├── logger.ts                    # Logging
├── scaffolding.ts               # Test environment utilities
├── constants.ts                 # Constants
├── package.json
├── tsconfig.json
└── README.md
```

## Ported From

This evaluation framework was ported from the Codebuff project's evals system, with imports renamed from `@codebuff/*` to `@bcp/*` and the runner renamed from `CodebuffRunner` to `BCPRunner`.
