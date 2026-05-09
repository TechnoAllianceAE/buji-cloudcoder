import type { CodebuffToolCall, CodebuffToolOutput } from '@bcp/common/tools/list';
type ToolName = 'write_todos';
export declare const handleWriteTodos: (params: {
    previousToolCallFinished: Promise<void>;
    toolCall: CodebuffToolCall<ToolName>;
}) => Promise<{
    output: CodebuffToolOutput<ToolName>;
}>;
export {};
//# sourceMappingURL=write-todos.d.ts.map