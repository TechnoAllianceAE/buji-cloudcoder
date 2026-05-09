import type { ClientToolCall, CodebuffToolCall, CodebuffToolOutput } from '@bcp/common/tools/list';
type ToolName = 'glob';
export declare const handleGlob: (params: {
    previousToolCallFinished: Promise<void>;
    toolCall: CodebuffToolCall<ToolName>;
    requestClientToolCall: (toolCall: ClientToolCall<ToolName>) => Promise<CodebuffToolOutput<ToolName>>;
}) => Promise<{
    output: CodebuffToolOutput<ToolName>;
}>;
export {};
//# sourceMappingURL=glob.d.ts.map