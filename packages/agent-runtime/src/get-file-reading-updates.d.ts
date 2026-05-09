import type { RequestFilesFn } from '@bcp/common/types/contracts/client';
export declare function getFileReadingUpdates(params: {
    requestFiles: RequestFilesFn;
    requestedFiles: string[];
}): Promise<{
    path: string;
    content: string;
}[]>;
//# sourceMappingURL=get-file-reading-updates.d.ts.map