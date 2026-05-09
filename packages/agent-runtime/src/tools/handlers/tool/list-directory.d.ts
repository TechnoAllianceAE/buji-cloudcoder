import type { ClientToolCall, CodebuffToolCall, CodebuffToolOutput } from '@bcp/common/tools/list';
type ToolName = 'list_directory';
export declare const handleListDirectory: (params: {
    previousToolCallFinished: Promise<void>;
    toolCall: CodebuffToolCall<ToolName>;
    requestClientToolCall: (toolCall: ClientToolCall<ToolName>) => Promise<CodebuffToolOutput<ToolName>>;
}) => Promise<{
    output: CodebuffToolOutput<ToolName>;
}>;
export {};
//# sourceMappingURL=list-directory.d.ts.map