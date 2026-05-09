import type { ClientToolCall, CodebuffToolCall, CodebuffToolOutput } from '@bcp/common/tools/list';
type ToolName = 'run_file_change_hooks';
export declare const handleRunFileChangeHooks: (params: {
    previousToolCallFinished: Promise<void>;
    toolCall: CodebuffToolCall<ToolName>;
    requestClientToolCall: (toolCall: ClientToolCall<ToolName>) => Promise<CodebuffToolOutput<ToolName>>;
}) => Promise<{
    output: CodebuffToolOutput<ToolName>;
}>;
export {};
//# sourceMappingURL=run-file-change-hooks.d.ts.map