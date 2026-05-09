import { executeSubagent } from './spawn-agent-utils';
import type { CodebuffToolCall, CodebuffToolOutput } from '@bcp/common/tools/list';
import type { AgentTemplate } from '@bcp/common/types/agent-template';
import type { Logger } from '@bcp/common/types/contracts/logger';
import type { ParamsExcluding } from '@bcp/common/types/function-params';
import type { PrintModeEvent } from '@bcp/common/types/print-mode';
import type { AgentState } from '@bcp/common/types/session-state';
import type { ProjectFileContext } from '@bcp/common/util/file';
import type { ToolSet } from 'ai';
type ToolName = 'spawn_agent_inline';
export declare const handleSpawnAgentInline: (params: {
    previousToolCallFinished: Promise<void>;
    toolCall: CodebuffToolCall<ToolName>;
    agentState: AgentState;
    agentTemplate: AgentTemplate;
    clientSessionId: string;
    fileContext: ProjectFileContext;
    fingerprintId: string;
    localAgentTemplates: Record<string, AgentTemplate>;
    logger: Logger;
    system: string;
    tools: ToolSet;
    userId: string | undefined;
    userInputId: string;
    writeToClient: (chunk: string | PrintModeEvent) => void;
} & ParamsExcluding<typeof executeSubagent, "userInputId" | "prompt" | "spawnParams" | "agentTemplate" | "parentAgentState" | "agentState" | "parentSystemPrompt" | "parentTools" | "onResponseChunk" | "clearUserPromptMessagesAfterResponse" | "fingerprintId">) => Promise<{
    output: CodebuffToolOutput<ToolName>;
}>;
export {};
//# sourceMappingURL=spawn-agent-inline.d.ts.map