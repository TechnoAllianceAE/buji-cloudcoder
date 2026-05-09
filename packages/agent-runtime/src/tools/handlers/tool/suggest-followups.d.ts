import type { CodebuffToolCall, CodebuffToolOutput } from '@bcp/common/tools/list';
import type { Logger } from '@bcp/common/types/contracts/logger';
export declare const handleSuggestFollowups: (params: {
    previousToolCallFinished: Promise<unknown>;
    toolCall: CodebuffToolCall<"suggest_followups">;
    logger: Logger;
}) => Promise<{
    output: CodebuffToolOutput<"suggest_followups">;
}>;
//# sourceMappingURL=suggest-followups.d.ts.map