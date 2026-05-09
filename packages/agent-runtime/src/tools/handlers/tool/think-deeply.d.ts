import type { CodebuffToolCall, CodebuffToolOutput } from '@bcp/common/tools/list';
import type { Logger } from '@bcp/common/types/contracts/logger';
export declare const handleThinkDeeply: (params: {
    previousToolCallFinished: Promise<any>;
    toolCall: CodebuffToolCall<"think_deeply">;
    logger: Logger;
}) => Promise<{
    output: CodebuffToolOutput<"think_deeply">;
}>;
//# sourceMappingURL=think-deeply.d.ts.map