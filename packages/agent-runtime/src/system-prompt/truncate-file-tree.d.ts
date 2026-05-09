import type { Logger } from '@bcp/common/types/contracts/logger';
import type { ProjectFileContext } from '@bcp/common/util/file';
type TruncationLevel = 'none' | 'unimportant-files' | 'tokens' | 'depth-based';
export declare const truncateFileTreeBasedOnTokenBudget: (params: {
    fileContext: ProjectFileContext;
    tokenBudget: number;
    logger: Logger;
}) => {
    printedTree: string;
    tokenCount: number;
    truncationLevel: TruncationLevel;
};
export {};
//# sourceMappingURL=truncate-file-tree.d.ts.map