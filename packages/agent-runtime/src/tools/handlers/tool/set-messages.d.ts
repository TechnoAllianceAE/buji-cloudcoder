import type { CodebuffToolCall, CodebuffToolOutput } from '@bcp/common/tools/list';
import type { AgentState } from '@bcp/common/types/session-state';
export declare const handleSetMessages: (params: {
    previousToolCallFinished: Promise<void>;
    toolCall: CodebuffToolCall<"set_messages">;
    agentState: AgentState;
}) => Promise<{
    output: CodebuffToolOutput<"set_messages">;
}>;
//# sourceMappingURL=set-messages.d.ts.map