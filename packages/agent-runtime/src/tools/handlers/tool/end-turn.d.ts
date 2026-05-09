import type { CodebuffToolCall, CodebuffToolOutput } from '@bcp/common/tools/list';
export declare const handleEndTurn: (params: {
    previousToolCallFinished: Promise<any>;
    toolCall: CodebuffToolCall<"end_turn">;
}) => Promise<{
    output: CodebuffToolOutput<"end_turn">;
}>;
//# sourceMappingURL=end-turn.d.ts.map