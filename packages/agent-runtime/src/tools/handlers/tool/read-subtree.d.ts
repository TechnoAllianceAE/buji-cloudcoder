import type { CodebuffToolCall, CodebuffToolOutput } from '@bcp/common/tools/list';
import type { Logger } from '@bcp/common/types/contracts/logger';
import type { ProjectFileContext } from '@bcp/common/util/file';
type ToolName = 'read_subtree';
export declare const handleReadSubtree: (params: {
    previousToolCallFinished: Promise<void>;
    toolCall: CodebuffToolCall<ToolName>;
    fileContext: ProjectFileContext;
    logger: Logger;
}) => Promise<{
    output: CodebuffToolOutput<ToolName>;
}>;
export {};
//# sourceMappingURL=read-subtree.d.ts.map