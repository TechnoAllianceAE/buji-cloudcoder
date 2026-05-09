import { loopAgentSteps } from './run-agent-step';
import { getAgentTemplate } from './templates/agent-registry';
import type { AgentTemplate } from './templates/types';
import type { ClientAction } from '@bcp/common/actions';
import type { RequestToolCallFn, SendActionFn } from '@bcp/common/types/contracts/client';
import type { Logger } from '@bcp/common/types/contracts/logger';
import type { ParamsExcluding } from '@bcp/common/types/function-params';
import type { PrintModeEvent } from '@bcp/common/types/print-mode';
import type { SessionState, AgentOutput } from '@bcp/common/types/session-state';
export declare function mainPrompt(params: {
    action: ClientAction<'prompt'>;
    onResponseChunk: (chunk: string | PrintModeEvent) => void;
    localAgentTemplates: Record<string, AgentTemplate>;
    requestToolCall: RequestToolCallFn;
    logger: Logger;
} & ParamsExcluding<typeof loopAgentSteps, 'userInputId' | 'spawnParams' | 'agentState' | 'prompt' | 'content' | 'agentType' | 'fingerprintId' | 'fileContext' | 'ancestorRunIds'> & ParamsExcluding<typeof getAgentTemplate, 'agentId'>): Promise<{
    sessionState: SessionState;
    output: AgentOutput;
}>;
export declare function callMainPrompt(params: {
    action: ClientAction<'prompt'>;
    promptId: string;
    sendAction: SendActionFn;
    logger: Logger;
    signal: AbortSignal;
} & ParamsExcluding<typeof mainPrompt, 'localAgentTemplates' | 'onResponseChunk'>): Promise<{
    sessionState: SessionState;
    output: AgentOutput;
}>;
//# sourceMappingURL=main-prompt.d.ts.map