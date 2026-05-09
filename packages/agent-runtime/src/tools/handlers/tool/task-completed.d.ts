import type { CodebuffToolCall, CodebuffToolOutput } from '@bcp/common/tools/list';
export declare const handleTaskCompleted: ({ previousToolCallFinished, }: {
    previousToolCallFinished: Promise<any>;
    toolCall: CodebuffToolCall<"task_completed">;
}) => Promise<{
    output: CodebuffToolOutput<"task_completed">;
}>;
//# sourceMappingURL=task-completed.d.ts.map