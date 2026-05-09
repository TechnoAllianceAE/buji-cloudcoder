import type { CodebuffToolCall, CodebuffToolOutput } from '@bcp/common/tools/list';
import type { Subgoal } from '@bcp/common/types/session-state';
export declare const handleAddSubgoal: (params: {
    previousToolCallFinished: Promise<void>;
    toolCall: CodebuffToolCall<"add_subgoal">;
    agentContext: Record<string, Subgoal>;
}) => Promise<{
    output: CodebuffToolOutput<"add_subgoal">;
}>;
//# sourceMappingURL=add-subgoal.d.ts.map