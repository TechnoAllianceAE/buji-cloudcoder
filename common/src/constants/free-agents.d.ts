import type { CostMode } from './model-config';
/**
 * The cost mode that indicates FREE mode.
 * Only allowlisted agent+model combinations cost 0 credits in this mode.
 */
export declare const FREE_COST_MODE: "free";
/**
 * Agents that are allowed to run in FREE mode.
 * Only these specific agents (and their expected models) get 0 credits in FREE mode.
 * This prevents abuse by users trying to use arbitrary agents for free.
 *
 * The mapping also specifies which models each agent is allowed to use in free mode.
 * If an agent uses a different model, it will be charged full credits.
 */
export declare const FREE_MODE_AGENT_MODELS: Record<string, Set<string>>;
/**
 * Agents that don't charge credits when credits would be very small (<5).
 *
 * These are typically lightweight utility agents that:
 * - Use cheap models (e.g., Gemini Flash)
 * - Have limited, programmatic capabilities
 * - Are frequently spawned as subagents
 *
 * Making them free avoids user confusion when they connect their own
 * Claude subscription (BYOK) but still see credit charges for non-Claude models.
 *
 * NOTE: This is separate from FREE_MODE_ALLOWED_AGENTS which is for the
 * explicit "free" cost mode. These agents get free credits only when
 * the cost would be trivial (<5 credits).
 */
export declare const FREE_TIER_AGENTS: Set<string>;
/**
 * Check if the current cost mode is FREE mode.
 * In FREE mode, agents using allowed models cost 0 credits.
 */
export declare function isFreeMode(costMode: CostMode | string | undefined): boolean;
/**
 * Check if a specific agent is allowed to use a specific model in FREE mode.
 * This is the strictest check - validates both the agent AND model combination.
 *
 * Returns true only if:
 * 1. The agent has a valid agent ID
 * 2. The agent is in the allowed free-mode agents list
 * 3. The agent is either internal or published by 'codebuff' (prevents spoofing)
 * 4. The model is in that agent's allowed model set
 */
export declare function isFreeModeAllowedAgentModel(fullAgentId: string, model: string): boolean;
/**
 * Check if an agent should be free (no credit charge) for small requests.
 * This is separate from FREE mode - these agents get free credits only
 * when the cost would be trivial (<5 credits).
 *
 * Handles all agent ID formats:
 * - 'file-picker'
 * - 'file-picker@1.0.0'
 * - 'bcp/file-picker@0.0.2'
 */
export declare function isFreeAgent(fullAgentId: string): boolean;
//# sourceMappingURL=free-agents.d.ts.map