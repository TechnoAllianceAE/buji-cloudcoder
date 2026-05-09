import type { CodebuffToolCall, CodebuffToolOutput } from '@bcp/common/tools/list';
import type { AgentTemplate, Logger } from '@bcp/common/types/agent-template';
import type { FetchAgentFromDatabaseFn } from '@bcp/common/types/contracts/database';
import type { AgentState } from '@bcp/common/types/session-state';
type ToolName = 'set_output';
export declare const handleSetOutput: (params: {
    previousToolCallFinished: Promise<void>;
    toolCall: CodebuffToolCall<ToolName>;
    agentState: AgentState;
    apiKey: string;
    databaseAgentCache: Map<string, AgentTemplate | null>;
    localAgentTemplates: Record<string, AgentTemplate>;
    logger: Logger;
    fetchAgentFromDatabase: FetchAgentFromDatabaseFn;
}) => Promise<{
    output: CodebuffToolOutput<ToolName>;
}>;
export {};
//# sourceMappingURL=set-output.d.ts.map