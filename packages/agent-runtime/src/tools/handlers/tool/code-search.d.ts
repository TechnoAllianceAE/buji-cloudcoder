import type { ClientToolCall, CodebuffToolCall, CodebuffToolOutput } from '@bcp/common/tools/list';
export declare const handleCodeSearch: (params: {
    previousToolCallFinished: Promise<void>;
    toolCall: CodebuffToolCall<"code_search">;
    requestClientToolCall: (toolCall: ClientToolCall<"code_search">) => Promise<CodebuffToolOutput<"code_search">>;
}) => Promise<{
    output: CodebuffToolOutput<"code_search">;
}>;
//# sourceMappingURL=code-search.d.ts.map