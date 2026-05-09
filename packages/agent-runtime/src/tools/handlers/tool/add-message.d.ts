import type { CodebuffToolCall, CodebuffToolOutput } from '@bcp/common/tools/list';
import type { AgentState } from '@bcp/common/types/session-state';
export declare const handleAddMessage: (params: {
    previousToolCallFinished: Promise<void>;
    toolCall: CodebuffToolCall<"add_message">;
    agentState: AgentState;
}) => Promise<{
    output: CodebuffToolOutput<"add_message">;
}>;
//# sourceMappingURL=add-message.d.ts.map