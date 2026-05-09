import { processStreamWithTools } from '../tool-stream-parser';
import type { CustomToolCall, ExecuteToolCallParams } from './tool-executor';
import type { AgentTemplate } from '../templates/types';
import type { CodebuffToolCall } from '@bcp/common/tools/list';
import type { Logger } from '@bcp/common/types/contracts/logger';
import type { ParamsExcluding } from '@bcp/common/types/function-params';
import type { Message, ToolMessage } from '@bcp/common/types/messages/bcp-message';
import type { PrintModeEvent } from '@bcp/common/types/print-mode';
import type { Subgoal } from '@bcp/common/types/session-state';
import type { ProjectFileContext } from '@bcp/common/util/file';
export declare function processStream(params: {
    agentContext: Record<string, Subgoal>;
    agentTemplate: AgentTemplate;
    ancestorRunIds: string[];
    fileContext: ProjectFileContext;
    fingerprintId: string;
    fullResponse: string;
    logger: Logger;
    messages: Message[];
    repoId: string | undefined;
    runId: string;
    signal: AbortSignal;
    userId: string | undefined;
    onCostCalculated: (credits: number) => Promise<void>;
    onResponseChunk: (chunk: string | PrintModeEvent) => void;
} & Omit<ExecuteToolCallParams<any>, 'fileProcessingState' | 'fromHandleSteps' | 'fullResponse' | 'input' | 'previousToolCallFinished' | 'state' | 'toolCallId' | 'toolCalls' | 'toolCallsToAddToMessageHistory' | 'toolName' | 'toolResults' | 'toolResultsToAddToMessageHistory'> & ParamsExcluding<typeof processStreamWithTools, 'processors' | 'defaultProcessor' | 'loggerOptions' | 'executeXmlToolCall'>): Promise<{
    fullResponse: string;
    fullResponseChunks: string[];
    hadToolCallError: boolean;
    messageId: string;
    toolCalls: (CustomToolCall | CodebuffToolCall)[];
    toolResults: ToolMessage[];
}>;
//# sourceMappingURL=stream-parser.d.ts.map