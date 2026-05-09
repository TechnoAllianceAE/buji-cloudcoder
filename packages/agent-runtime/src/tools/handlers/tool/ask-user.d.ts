import type { CodebuffToolCall, CodebuffToolOutput } from '@bcp/common/tools/list';
type ToolName = 'ask_user';
export declare const handleAskUser: (params: {
    previousToolCallFinished: Promise<void>;
    toolCall: CodebuffToolCall<ToolName>;
    requestClientToolCall: (toolCall: any) => Promise<any>;
}) => Promise<{
    output: CodebuffToolOutput<ToolName>;
}>;
export {};
//# sourceMappingURL=ask-user.d.ts.map