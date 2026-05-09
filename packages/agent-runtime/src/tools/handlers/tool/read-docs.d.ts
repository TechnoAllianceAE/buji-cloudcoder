import type { fetchContext7LibraryDocumentation } from '../../../llm-api/context7-api';
import type { CodebuffToolCall, CodebuffToolOutput } from '@bcp/common/tools/list';
import type { ClientEnv, CiEnv } from '@bcp/common/types/contracts/env';
import type { Logger } from '@bcp/common/types/contracts/logger';
import type { ParamsExcluding } from '@bcp/common/types/function-params';
export declare const handleReadDocs: (params: {
    previousToolCallFinished: Promise<void>;
    toolCall: CodebuffToolCall<"read_docs">;
    agentStepId: string;
    clientSessionId: string;
    fingerprintId: string;
    logger: Logger;
    repoId: string | undefined;
    userId: string | undefined;
    userInputId: string;
    clientEnv: ClientEnv;
    ciEnv: CiEnv;
} & ParamsExcluding<typeof fetchContext7LibraryDocumentation, "query" | "topic" | "tokens">) => Promise<{
    output: CodebuffToolOutput<"read_docs">;
    creditsUsed: number;
}>;
//# sourceMappingURL=read-docs.d.ts.map