import type { Logger } from '@bcp/common/types/contracts/logger';
import type { ProjectFileContext } from '@bcp/common/util/file';
export declare function getSearchSystemPrompt(params: {
    fileContext: ProjectFileContext;
    messagesTokens: number;
    logger: Logger;
    options: {
        agentStepId: string;
        clientSessionId: string;
        fingerprintId: string;
        userInputId: string;
        userId: string | undefined;
    };
}): string;
//# sourceMappingURL=search-system-prompt.d.ts.map