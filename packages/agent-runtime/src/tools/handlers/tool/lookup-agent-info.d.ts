import type { CodebuffToolCall, CodebuffToolOutput } from '@bcp/common/tools/list';
import type { AgentTemplate, Logger } from '@bcp/common/types/agent-template';
import type { FetchAgentFromDatabaseFn } from '@bcp/common/types/contracts/database';
export declare const handleLookupAgentInfo: (params: {
    toolCall: CodebuffToolCall<"lookup_agent_info">;
    previousToolCallFinished: Promise<void>;
    apiKey: string;
    databaseAgentCache: Map<string, AgentTemplate | null>;
    localAgentTemplates: Record<string, AgentTemplate>;
    logger: Logger;
    fetchAgentFromDatabase: FetchAgentFromDatabaseFn;
}) => Promise<{
    output: CodebuffToolOutput<"lookup_agent_info">;
}>;
//# sourceMappingURL=lookup-agent-info.d.ts.map