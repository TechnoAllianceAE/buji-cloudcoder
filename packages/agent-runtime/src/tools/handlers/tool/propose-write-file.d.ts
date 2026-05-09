import type { CodebuffToolHandlerFunction } from '../handler-function-type';
/**
 * Proposes writing a file without actually applying the changes.
 * Simply overwrites the file exactly with the given content (creating if it doesn't exist).
 * Returns a unified diff of the changes for review.
 */
export declare const handleProposeWriteFile: CodebuffToolHandlerFunction<"propose_write_file">;
//# sourceMappingURL=propose-write-file.d.ts.map