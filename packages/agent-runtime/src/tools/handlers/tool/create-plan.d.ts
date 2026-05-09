import type { FileProcessingState } from './write-file';
import type { ClientToolCall, CodebuffToolCall, CodebuffToolOutput } from '@bcp/common/tools/list';
import type { Logger } from '@bcp/common/types/contracts/logger';
export declare const handleCreatePlan: (params: {
    previousToolCallFinished: Promise<void>;
    toolCall: CodebuffToolCall<"create_plan">;
    fileProcessingState: FileProcessingState;
    logger: Logger;
    requestClientToolCall: (toolCall: ClientToolCall<"create_plan">) => Promise<CodebuffToolOutput<"create_plan">>;
    writeToClient: (chunk: string) => void;
}) => Promise<{
    output: CodebuffToolOutput<"create_plan">;
}>;
//# sourceMappingURL=create-plan.d.ts.map