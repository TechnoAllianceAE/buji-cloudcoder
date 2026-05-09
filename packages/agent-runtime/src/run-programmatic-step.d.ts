import type { ExecuteToolCallParams } from './tools/tool-executor';
import type { AgentTemplate, PublicAgentState } from '@bcp/common/types/agent-template';
import type { HandleStepsLogChunkFn, SendActionFn } from '@bcp/common/types/contracts/client';
import type { AddAgentStepFn } from '@bcp/common/types/contracts/database';
import type { Logger } from '@bcp/common/types/contracts/logger';
import type { ParamsExcluding } from '@bcp/common/types/function-params';
import type { PrintModeEvent } from '@bcp/common/types/print-mode';
import type { AgentState } from '@bcp/common/types/session-state';
export declare const runIdToStepAll: Set<string>;
export declare function clearAgentGeneratorCache(params: {
    logger: Logger;
}): void;
export declare function runProgrammaticStep(params: {
    addAgentStep: AddAgentStepFn;
    agentState: AgentState;
    clientSessionId: string;
    fingerprintId: string;
    handleStepsLogChunk: HandleStepsLogChunkFn;
    localAgentTemplates: Record<string, AgentTemplate>;
    logger: Logger;
    nResponses?: string[];
    onResponseChunk: (chunk: string | PrintModeEvent) => void;
    prompt: string | undefined;
    repoId: string | undefined;
    repoUrl: string | undefined;
    stepNumber: number;
    stepsComplete: boolean;
    template: AgentTemplate;
    toolCallParams: Record<string, any> | undefined;
    sendAction: SendActionFn;
    system: string | undefined;
    userId: string | undefined;
    userInputId: string;
} & Omit<ExecuteToolCallParams, 'toolName' | 'input' | 'autoInsertEndStepParam' | 'excludeToolFromMessageHistory' | 'agentContext' | 'agentStepId' | 'agentTemplate' | 'fullResponse' | 'previousToolCallFinished' | 'fileProcessingState' | 'toolCallId' | 'toolCalls' | 'toolCallsToAddToMessageHistory' | 'toolResults' | 'toolResultsToAddToMessageHistory'> & ParamsExcluding<AddAgentStepFn, 'agentRunId' | 'stepNumber' | 'credits' | 'childRunIds' | 'status' | 'startTime' | 'messageId'>): Promise<{
    agentState: AgentState;
    endTurn: boolean;
    stepNumber: number;
    generateN?: number;
}>;
export declare const getPublicAgentState: (agentState: AgentState & Required<Pick<AgentState, "runId">>) => PublicAgentState;
//# sourceMappingURL=run-programmatic-step.d.ts.map