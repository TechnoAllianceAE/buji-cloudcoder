import type { Logger } from '@bcp/common/types/contracts/logger';
import type { ProjectFileContext } from '@bcp/common/util/file';
export declare const knowledgeFilesPrompt: string;
export declare const additionalSystemPrompts: {
    readonly '/init': string;
    readonly init: string;
    readonly '/export': string;
    readonly export: string;
    readonly '/compact': string;
    readonly compact: string;
};
export declare const getProjectFileTreePrompt: (params: {
    fileContext: ProjectFileContext;
    fileTreeTokenBudget: number;
    mode: "search" | "agent";
    logger: Logger;
}) => string;
export declare const getSystemInfoPrompt: (fileContext: ProjectFileContext) => string;
export declare const getGitChangesPrompt: (fileContext: ProjectFileContext) => string;
//# sourceMappingURL=prompts.d.ts.map