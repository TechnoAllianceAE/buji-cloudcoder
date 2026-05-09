import type { AgentTemplate } from '../types/agent-template';
import type { DynamicAgentTemplate } from '../types/dynamic-agent-template';
import type { Logger } from '@bcp/common/types/contracts/logger';
export interface DynamicAgentValidationError {
    filePath: string;
    message: string;
}
/**
 * Collect all agent IDs from template files without full validation
 */
export declare function collectAgentIds(params: {
    agentTemplates?: Record<string, DynamicAgentTemplate>;
    logger: Logger;
}): {
    agentIds: string[];
    spawnableAgentIds: string[];
};
/**
 * Validate and load dynamic agent templates from user-provided agentTemplates
 */
export declare function validateAgents(params: {
    agentTemplates?: Record<string, any>;
    logger: Logger;
}): {
    templates: Record<string, AgentTemplate>;
    dynamicTemplates: Record<string, DynamicAgentTemplate>;
    validationErrors: DynamicAgentValidationError[];
};
/**
 * Validates a single dynamic agent template and converts it to an AgentTemplate.
 * This is a plain function equivalent to the core logic of loadSingleAgent.
 *
 * @param dynamicAgentIds - Array of all available dynamic agent IDs for validation
 * @param template - The raw agent template to validate (any type)
 * @param options - Optional configuration object
 * @param options.filePath - Optional file path for error context
 * @param options.skipSubagentValidation - Skip subagent validation when loading from database
 * @returns Validation result with either the converted AgentTemplate or an error
 */
export declare function validateSingleAgent(params: {
    template: any;
    filePath?: string;
}): {
    success: boolean;
    agentTemplate?: AgentTemplate;
    dynamicAgentTemplate?: DynamicAgentTemplate;
    error?: string;
};
//# sourceMappingURL=agent-validation.d.ts.map