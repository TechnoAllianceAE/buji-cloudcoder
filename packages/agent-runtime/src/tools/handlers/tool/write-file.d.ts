import type { ClientToolCall, CodebuffToolCall, CodebuffToolOutput } from '@bcp/common/tools/list';
import type { RequestOptionalFileFn } from '@bcp/common/types/contracts/client';
import type { Logger } from '@bcp/common/types/contracts/logger';
import type { ParamsExcluding } from '@bcp/common/types/function-params';
import type { AgentState } from '@bcp/common/types/session-state';
type FileProcessingTools = 'write_file' | 'str_replace' | 'create_plan';
export type FileProcessing<T extends FileProcessingTools = FileProcessingTools> = {
    tool: T;
    path: string;
    toolCallId: string;
} & ({
    content: string;
    patch?: string;
    messages: string[];
} | {
    error: string;
});
export type FileProcessingState = {
    promisesByPath: Record<string, Promise<FileProcessing>[]>;
    allPromises: Promise<FileProcessing>[];
    fileChangeErrors: Extract<FileProcessing, {
        error: string;
    }>[];
    fileChanges: Exclude<FileProcessing, {
        error: string;
    }>[];
    firstFileProcessed: boolean;
};
export declare function getFileProcessingValues(state: FileProcessingState): FileProcessingState;
export declare const handleWriteFile: (params: {
    previousToolCallFinished: Promise<void>;
    toolCall: CodebuffToolCall<"write_file">;
    agentState: AgentState;
    clientSessionId: string;
    fileProcessingState: FileProcessingState;
    fingerprintId: string;
    logger: Logger;
    prompt: string | undefined;
    userId: string | undefined;
    userInputId: string;
    requestClientToolCall: (toolCall: ClientToolCall<"write_file">) => Promise<CodebuffToolOutput<"write_file">>;
    requestOptionalFile: RequestOptionalFileFn;
    writeToClient: (chunk: string) => void;
} & ParamsExcluding<RequestOptionalFileFn, "filePath">) => Promise<{
    output: CodebuffToolOutput<"write_file">;
}>;
export declare function postStreamProcessing<T extends FileProcessingTools>(toolCall: FileProcessing<T>, fileProcessingState: FileProcessingState, writeToClient: (chunk: string) => void, requestClientToolCall: (toolCall: ClientToolCall<T>) => Promise<CodebuffToolOutput<T>>): Promise<CodebuffToolOutput<T>>;
export {};
//# sourceMappingURL=write-file.d.ts.map