import type { DynamicAgentValidationError } from '@bcp/common/templates/agent-validation';
import type { AgentTemplate } from '@bcp/common/types/agent-template';
import type { FetchAgentFromDatabaseFn } from '@bcp/common/types/contracts/database';
import type { Logger } from '@bcp/common/types/contracts/logger';
import type { ParamsExcluding } from '@bcp/common/types/function-params';
import type { ProjectFileContext } from '@bcp/common/util/file';
/**
 * Single function to look up an agent template with clear priority order:
 * 1. localAgentTemplates (dynamic agents + static templates)
 * 2. Database cache
 * 3. Database query
 */
export declare function getAgentTemplate(params: {
    agentId: string;
    localAgentTemplates: Record<string, AgentTemplate>;
    fetchAgentFromDatabase: FetchAgentFromDatabaseFn;
    databaseAgentCache: Map<string, AgentTemplate | null>;
    logger: Logger;
} & ParamsExcluding<FetchAgentFromDatabaseFn, 'parsedAgentId'>): Promise<AgentTemplate | null>;
/**
 * Assemble local agent templates from fileContext + static templates
 */
export declare function assembleLocalAgentTemplates(params: {
    fileContext: ProjectFileContext;
    logger: Logger;
}): {
    agentTemplates: Record<string, AgentTemplate>;
    validationErrors: DynamicAgentValidationError[];
};
/**
 * Clear the database agent cache (useful for testing)
 */
export declare function clearDatabaseCache(params: {
    databaseAgentCache: Map<string, AgentTemplate | null>;
}): void;
//# sourceMappingURL=agent-registry.d.ts.map