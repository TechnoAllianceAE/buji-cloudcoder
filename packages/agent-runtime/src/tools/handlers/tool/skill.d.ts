import type { CodebuffToolCall, CodebuffToolOutput } from '@bcp/common/tools/list';
import type { ProjectFileContext } from '@bcp/common/util/file';
type ToolName = 'skill';
export declare const handleSkill: (params: {
    previousToolCallFinished: Promise<void>;
    toolCall: CodebuffToolCall<ToolName>;
    fileContext: ProjectFileContext;
}) => Promise<{
    output: CodebuffToolOutput<ToolName>;
}>;
export {};
//# sourceMappingURL=skill.d.ts.map