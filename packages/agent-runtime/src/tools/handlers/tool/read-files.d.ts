import { getFileReadingUpdates } from '../../../get-file-reading-updates';
import type { CodebuffToolCall, CodebuffToolOutput } from '@bcp/common/tools/list';
import type { ParamsExcluding } from '@bcp/common/types/function-params';
import type { ProjectFileContext } from '@bcp/common/util/file';
type ToolName = 'read_files';
export declare const handleReadFiles: (params: {
    previousToolCallFinished: Promise<void>;
    toolCall: CodebuffToolCall<ToolName>;
    fileContext: ProjectFileContext;
} & ParamsExcluding<typeof getFileReadingUpdates, "requestedFiles">) => Promise<{
    output: CodebuffToolOutput<ToolName>;
}>;
export {};
//# sourceMappingURL=read-files.d.ts.map