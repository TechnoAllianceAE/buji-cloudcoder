import type { CodebuffToolCall, CodebuffToolOutput } from '@bcp/common/tools/list';
import type { ClientEnv, CiEnv } from '@bcp/common/types/contracts/env';
import type { Logger } from '@bcp/common/types/contracts/logger';
export declare const handleWebSearch: (params: {
    previousToolCallFinished: Promise<void>;
    toolCall: CodebuffToolCall<"web_search">;
    logger: Logger;
    apiKey: string;
    agentStepId: string;
    clientSessionId: string;
    fingerprintId: string;
    repoId: string | undefined;
    repoUrl: string | undefined;
    userInputId: string;
    userId: string | undefined;
    fetch: typeof globalThis.fetch;
    clientEnv: ClientEnv;
    ciEnv: CiEnv;
}) => Promise<{
    output: CodebuffToolOutput<"web_search">;
    creditsUsed: number;
}>;
//# sourceMappingURL=web-search.d.ts.map