import { validateAndGetAgentTemplate, executeSubagent } from './spawn-agent-utils';
import type { CodebuffToolCall, CodebuffToolOutput } from '@bcp/common/tools/list';
import type { AgentTemplate } from '@bcp/common/types/agent-template';
import type { Logger } from '@bcp/common/types/contracts/logger';
import type { ParamsExcluding } from '@bcp/common/types/function-params';
import type { PrintModeEvent } from '@bcp/common/types/print-mode';
import type { AgentState } from '@bcp/common/types/session-state';
import type { ToolSet } from 'ai';
export type SendSubagentChunk = (data: {
    userInputId: string;
    agentId: string;
    agentType: string;
    chunk: string;
    prompt?: string;
    forwardToPrompt?: boolean;
}) => void;
type ToolName = 'spawn_agents';
export declare const handleSpawnAgents: (params: {
    previousToolCallFinished: Promise<void>;
    toolCall: CodebuffToolCall<ToolName>;
    agentState: AgentState;
    agentTemplate: AgentTemplate;
    fingerprintId: string;
    localAgentTemplates: Record<string, AgentTemplate>;
    logger: Logger;
    system: string;
    tools?: ToolSet;
    userId: string | undefined;
    userInputId: string;
    sendSubagentChunk: SendSubagentChunk;
    writeToClient: (chunk: string | PrintModeEvent) => void;
} & ParamsExcluding<typeof validateAndGetAgentTemplate, "agentTypeStr" | "parentAgentTemplate"> & ParamsExcluding<typeof executeSubagent, "userInputId" | "prompt" | "spawnParams" | "agentTemplate" | "parentAgentState" | "agentState" | "fingerprintId" | "isOnlyChild" | "parentSystemPrompt" | "parentTools" | "onResponseChunk">) => Promise<{
    output: CodebuffToolOutput<ToolName>;
}>;
export {};
//# sourceMappingURL=spawn-agents.d.ts.map