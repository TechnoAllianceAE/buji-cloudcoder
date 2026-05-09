import { z } from 'zod/v4';
import { getAgentTemplate } from './agent-registry';
import type { AgentTemplate } from '@bcp/common/types/agent-template';
import type { Logger } from '@bcp/common/types/contracts/logger';
import type { ParamsExcluding } from '@bcp/common/types/function-params';
import type { AgentTemplateType } from '@bcp/common/types/session-state';
import type { ToolSet } from 'ai';
/**
 * Gets the short agent name from a fully qualified agent ID.
 * E.g., 'bcp/file-picker@1.0.0' -> 'file-picker'
 */
export declare function getAgentShortName(agentType: AgentTemplateType): string;
/**
 * Builds an input schema for an agent tool with prompt and params as top-level fields.
 * This matches the spawn_agents schema structure: { prompt?: string, params?: object }
 */
export declare function buildAgentToolInputSchema(agentTemplate: AgentTemplate): z.ZodType;
/**
 * Builds AI SDK tool definitions for spawnable agents.
 * These tools allow the model to call agents directly as tool calls.
 */
export declare function buildAgentToolSet(params: {
    spawnableAgents: AgentTemplateType[];
    agentTemplates: Record<string, AgentTemplate>;
    logger: Logger;
} & ParamsExcluding<typeof getAgentTemplate, 'agentId' | 'localAgentTemplates'>): Promise<ToolSet>;
/**
 * Builds the full spawnable agents specification for subagent instructions.
 * This is used when inheritSystemPrompt is true to tell subagents which agents they can spawn.
 */
export declare function buildFullSpawnableAgentsSpec(params: {
    spawnableAgents: AgentTemplateType[];
    agentTemplates: Record<string, AgentTemplate>;
    logger: Logger;
} & ParamsExcluding<typeof getAgentTemplate, 'agentId' | 'localAgentTemplates'>): Promise<string>;
//# sourceMappingURL=prompts.d.ts.map