import type { ClientToolCall, CodebuffToolCall, CodebuffToolOutput } from '@bcp/common/tools/list';
type ToolName = 'run_terminal_command';
export declare const handleRunTerminalCommand: ({ previousToolCallFinished, toolCall, requestClientToolCall, }: {
    previousToolCallFinished: Promise<void>;
    toolCall: CodebuffToolCall<ToolName>;
    requestClientToolCall: (toolCall: ClientToolCall<ToolName>) => Promise<CodebuffToolOutput<ToolName>>;
}) => Promise<{
    output: CodebuffToolOutput<ToolName>;
}>;
export {};
//# sourceMappingURL=run-terminal-command.d.ts.map