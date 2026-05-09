import type { FileProcessingState } from './write-file';
import type { ClientToolCall, CodebuffToolCall, CodebuffToolOutput } from '@bcp/common/tools/list';
import type { RequestOptionalFileFn } from '@bcp/common/types/contracts/client';
import type { Logger } from '@bcp/common/types/contracts/logger';
import type { ParamsExcluding } from '@bcp/common/types/function-params';
export declare const handleStrReplace: (params: {
    previousToolCallFinished: Promise<void>;
    toolCall: CodebuffToolCall<"str_replace">;
    fileProcessingState: FileProcessingState;
    logger: Logger;
    requestClientToolCall: (toolCall: ClientToolCall<"str_replace">) => Promise<CodebuffToolOutput<"str_replace">>;
    writeToClient: (chunk: string) => void;
    requestOptionalFile: RequestOptionalFileFn;
} & ParamsExcluding<RequestOptionalFileFn, "filePath">) => Promise<{
    output: CodebuffToolOutput<"str_replace">;
}>;
//# sourceMappingURL=str-replace.d.ts.map