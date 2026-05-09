import { type PromptResult } from '@bcp/common/util/error';
import type { Logger } from '@bcp/common/types/contracts/logger';
type WriteFileSuccess = {
    tool: 'write_file';
    path: string;
    content: string;
    patch: string | undefined;
    messages: string[];
};
type WriteFileError = {
    tool: 'write_file';
    path: string;
    error: string;
};
export type WriteFileResult = WriteFileSuccess | WriteFileError;
/**
 * Processes a file block, replacing the file content entirely or creating a new file.
 * This is fully deterministic — the content parameter is always written as-is.
 *
 * Returns a PromptResult wrapping the result:
 * - `{ aborted: false, value: WriteFileResult }` on success or recoverable error
 */
export declare function processFileBlock(params: {
    path: string;
    initialContentPromise: Promise<string | null>;
    newContent: string;
    logger: Logger;
}): Promise<PromptResult<WriteFileResult>>;
export {};
//# sourceMappingURL=process-file-block.d.ts.map