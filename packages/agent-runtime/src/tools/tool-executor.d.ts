import type { AgentTemplate } from '../templates/types';
import type { FileProcessingState } from './handlers/tool/write-file';
import type { ToolName } from '@bcp/common/tools/constants';
import type { CodebuffToolCall } from '@bcp/common/tools/list';
import type { AgentRuntimeDeps, AgentRuntimeScopedDeps } from '@bcp/common/types/contracts/agent-runtime';
import type { Logger } from '@bcp/common/types/contracts/logger';
import type { ToolMessage } from '@bcp/common/types/messages/bcp-message';
import type { PrintModeEvent } from '@bcp/common/types/print-mode';
import type { AgentTemplateType, AgentState, Subgoal } from '@bcp/common/types/session-state';
import type { CustomToolDefinitions, ProjectFileContext } from '@bcp/common/util/file';
import type { ToolCallPart, ToolSet } from 'ai';
export type CustomToolCall = {
    toolName: string;
    input: Record<string, unknown>;
} & Omit<ToolCallPart, 'type'>;
export type ToolCallError = {
    toolName?: string;
    input: Record<string, unknown>;
    error: string;
} & Pick<CodebuffToolCall, 'toolCallId'>;
export declare function parseRawToolCall<T extends ToolName = ToolName>(params: {
    rawToolCall: {
        toolName: T;
        toolCallId: string;
        input: Record<string, unknown>;
    };
}): CodebuffToolCall<T> | ToolCallError;
export type ExecuteToolCallParams<T extends string = ToolName> = {
    toolName: T;
    input: Record<string, unknown>;
    autoInsertEndStepParam?: boolean;
    excludeToolFromMessageHistory?: boolean;
    agentContext: Record<string, Subgoal>;
    agentState: AgentState;
    agentStepId: string;
    ancestorRunIds: string[];
    agentTemplate: AgentTemplate;
    clientSessionId: string;
    fileContext: ProjectFileContext;
    fileProcessingState: FileProcessingState;
    fingerprintId: string;
    fromHandleSteps?: boolean;
    fullResponse: string;
    localAgentTemplates: Record<string, AgentTemplate>;
    logger: Logger;
    previousToolCallFinished: Promise<void>;
    prompt: string | undefined;
    repoId: string | undefined;
    repoUrl: string | undefined;
    runId: string;
    signal: AbortSignal;
    system: string;
    tools: ToolSet;
    toolCallId: string | undefined;
    toolCalls: (CodebuffToolCall | CustomToolCall)[];
    toolCallsToAddToMessageHistory: (CodebuffToolCall | CustomToolCall)[];
    toolResults: ToolMessage[];
    toolResultsToAddToMessageHistory: ToolMessage[];
    userId: string | undefined;
    userInputId: string;
    fetch: typeof globalThis.fetch;
    onCostCalculated: (credits: number) => Promise<void>;
    onResponseChunk: (chunk: string | PrintModeEvent) => void;
} & AgentRuntimeDeps & AgentRuntimeScopedDeps;
export declare function executeToolCall<T extends ToolName>(params: ExecuteToolCallParams<T>): Promise<void>;
export declare function parseRawCustomToolCall(params: {
    customToolDefs: CustomToolDefinitions;
    rawToolCall: {
        toolName: string;
        toolCallId: string;
        input: Record<string, unknown>;
    };
    autoInsertEndStepParam?: boolean;
}): CustomToolCall | ToolCallError;
export declare function executeCustomToolCall(params: ExecuteToolCallParams<string>): Promise<void>;
/**
 * Checks if a tool name matches a spawnable agent and returns the transformed
 * spawn_agents input if so. Returns null if not an agent tool call.
 */
export declare function tryTransformAgentToolCall(params: {
    toolName: string;
    input: Record<string, unknown>;
    spawnableAgents: AgentTemplateType[];
}): {
    toolName: 'spawn_agents';
    input: Record<string, unknown>;
} | null;
//# sourceMappingURL=tool-executor.d.ts.map