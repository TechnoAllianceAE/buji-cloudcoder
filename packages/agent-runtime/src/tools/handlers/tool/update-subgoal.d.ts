import type { CodebuffToolCall, CodebuffToolOutput } from '@bcp/common/tools/list';
import type { Subgoal } from '@bcp/common/types/session-state';
type ToolName = 'update_subgoal';
export declare const handleUpdateSubgoal: (params: {
    previousToolCallFinished: Promise<void>;
    toolCall: CodebuffToolCall<ToolName>;
    agentContext: Record<string, Subgoal>;
}) => Promise<{
    output: CodebuffToolOutput<ToolName>;
}>;
export {};
//# sourceMappingURL=update-subgoal.d.ts.map