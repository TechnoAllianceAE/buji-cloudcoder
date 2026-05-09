import type { CodebuffToolCall, CodebuffToolOutput } from '@bcp/common/tools/list';
import type { RequestOptionalFileFn } from '@bcp/common/types/contracts/client';
import type { Logger } from '@bcp/common/types/contracts/logger';
import type { ParamsExcluding } from '@bcp/common/types/function-params';
import type { AgentState } from '@bcp/common/types/session-state';
export declare const handleProposeStrReplace: (params: {
    previousToolCallFinished: Promise<void>;
    toolCall: CodebuffToolCall<"propose_str_replace">;
    logger: Logger;
    agentState: AgentState;
    runId: string;
    requestOptionalFile: RequestOptionalFileFn;
} & ParamsExcluding<RequestOptionalFileFn, "filePath">) => Promise<{
    output: CodebuffToolOutput<"propose_str_replace">;
}>;
//# sourceMappingURL=propose-str-replace.d.ts.map