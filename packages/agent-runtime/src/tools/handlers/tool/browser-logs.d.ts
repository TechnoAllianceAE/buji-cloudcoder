import type { ClientToolCall, CodebuffToolCall, CodebuffToolOutput } from '@bcp/common/tools/list';
export declare const handleBrowserLogs: (params: {
    previousToolCallFinished: Promise<void>;
    toolCall: CodebuffToolCall<"browser_logs">;
    requestClientToolCall: (toolCall: ClientToolCall<"browser_logs">) => Promise<CodebuffToolOutput<"browser_logs">>;
}) => Promise<{
    output: CodebuffToolOutput<"browser_logs">;
}>;
//# sourceMappingURL=browser-logs.d.ts.map