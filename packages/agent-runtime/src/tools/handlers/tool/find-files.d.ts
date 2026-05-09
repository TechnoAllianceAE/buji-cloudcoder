import { requestRelevantFiles, requestRelevantFilesForTraining } from '../../../find-files/request-files-prompt';
import { getFileReadingUpdates } from '../../../get-file-reading-updates';
import type { CodebuffToolCall, CodebuffToolOutput } from '@bcp/common/tools/list';
import type { RequestFilesFn } from '@bcp/common/types/contracts/client';
import type { Logger } from '@bcp/common/types/contracts/logger';
import type { ParamsExcluding, ParamsOf } from '@bcp/common/types/function-params';
import type { AgentState } from '@bcp/common/types/session-state';
import type { ProjectFileContext } from '@bcp/common/util/file';
export declare const handleFindFiles: (params: {
    previousToolCallFinished: Promise<any>;
    toolCall: CodebuffToolCall<"find_files">;
    logger: Logger;
    agentState: AgentState;
    agentStepId: string;
    clientSessionId: string;
    fileContext: ProjectFileContext;
    fingerprintId: string;
    repoId: string | undefined;
    userId: string | undefined;
    userInputId: string;
} & ParamsExcluding<typeof requestRelevantFiles, "messages" | "system" | "assistantPrompt"> & ParamsExcluding<typeof uploadExpandedFileContextForTraining, "messages" | "system" | "assistantPrompt"> & ParamsExcluding<typeof getFileReadingUpdates, "requestedFiles">) => Promise<{
    output: CodebuffToolOutput<"find_files">;
}>;
declare function uploadExpandedFileContextForTraining(params: {
    requestFiles: RequestFilesFn;
} & ParamsOf<typeof requestRelevantFilesForTraining>): Promise<void>;
export {};
//# sourceMappingURL=find-files.d.ts.map