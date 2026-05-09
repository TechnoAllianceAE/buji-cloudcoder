import { loopAgentSteps } from '../../../run-agent-step';
import { getAgentTemplate } from '../../../templates/agent-registry';
import type { AgentTemplate } from '@bcp/common/types/agent-template';
import type { AgentRuntimeDeps, AgentRuntimeScopedDeps } from '@bcp/common/types/contracts/agent-runtime';
import type { Logger } from '@bcp/common/types/contracts/logger';
import type { ParamsExcluding, OptionalFields } from '@bcp/common/types/function-params';
import type { PrintModeEvent } from '@bcp/common/types/print-mode';
import type { AgentState, AgentTemplateType, Subgoal } from '@bcp/common/types/session-state';
import type { ProjectFileContext } from '@bcp/common/util/file';
import type { ToolSet } from 'ai';
/**
 * Common context params needed for spawning subagents.
 * These are the params that don't change between different spawn calls
 * and are passed through from the parent agent runtime.
 */
export type SubagentContextParams = AgentRuntimeDeps & AgentRuntimeScopedDeps & {
    clientSessionId: string;
    costMode?: string;
    fileContext: ProjectFileContext;
    localAgentTemplates: Record<string, AgentTemplate>;
    repoId: string | undefined;
    repoUrl: string | undefined;
    signal: AbortSignal;
    userId: string | undefined;
};
/**
 * Extracts the common context params needed for spawning subagents.
 * This avoids bugs from spreading all params with `...params` which can
 * accidentally pass through params that should be overridden.
 */
export declare function extractSubagentContextParams(params: SubagentContextParams): SubagentContextParams;
/**
 * Checks if a parent agent is allowed to spawn a child agent
 */
export declare function getMatchingSpawn(spawnableAgents: AgentTemplateType[], childFullAgentId: string): AgentTemplateType;
/**
 * Synchronously transforms spawn_agents input to use 'commander-lite' instead of 'commander'
 * when the parent agent doesn't have access to 'commander' but does have access to 'commander-lite'.
 * This should be called BEFORE the tool call is streamed to the UI.
 */
export declare function transformSpawnAgentsInput(input: Record<string, unknown>, spawnableAgents: AgentTemplateType[]): Record<string, unknown>;
/**
 * Validates agent template and permissions
 */
export declare function validateAndGetAgentTemplate(params: {
    agentTypeStr: string;
    parentAgentTemplate: AgentTemplate;
    localAgentTemplates: Record<string, AgentTemplate>;
    logger: Logger;
} & ParamsExcluding<typeof getAgentTemplate, 'agentId'>): Promise<{
    agentTemplate: AgentTemplate;
    agentType: string;
}>;
/**
 * Validates prompt and params against agent schema
 */
export declare function validateAgentInput(agentTemplate: AgentTemplate, agentType: string, prompt?: string, params?: any): void;
/**
 * Creates a new agent state for spawned agents
 */
export declare function createAgentState(agentType: string, agentTemplate: AgentTemplate, parentAgentState: AgentState, agentContext: Record<string, Subgoal>): AgentState;
/**
 * Logs agent spawn information
 */
export declare function logAgentSpawn(params: {
    agentTemplate: AgentTemplate;
    agentType: string;
    agentId: string;
    parentId: string | undefined;
    prompt?: string;
    spawnParams?: any;
    inline?: boolean;
    logger: Logger;
}): void;
/**
 * Executes a subagent using loopAgentSteps
 */
export declare function executeSubagent(options: OptionalFields<{
    agentTemplate: AgentTemplate;
    parentAgentState: AgentState;
    parentTools?: ToolSet;
    onResponseChunk: (chunk: string | PrintModeEvent) => void;
    isOnlyChild?: boolean;
    ancestorRunIds: string[];
} & ParamsExcluding<typeof loopAgentSteps, 'agentType' | 'ancestorRunIds'>, 'isOnlyChild' | 'clearUserPromptMessagesAfterResponse'>): Promise<{
    agentState: AgentState;
    output: import("@bcp/common/types/session-state").AgentOutput;
}>;
//# sourceMappingURL=spawn-agent-utils.d.ts.map