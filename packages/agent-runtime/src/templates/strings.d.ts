import { getAgentTemplate } from './agent-registry';
import { buildFullSpawnableAgentsSpec } from './prompts';
import type { AgentTemplate } from './types';
import type { Logger } from '@bcp/common/types/contracts/logger';
import type { ParamsExcluding } from '@bcp/common/types/function-params';
import type { AgentState, AgentTemplateType } from '@bcp/common/types/session-state';
import type { CustomToolDefinitions, ProjectFileContext } from '@bcp/common/util/file';
export declare function formatPrompt(params: {
    prompt: string;
    fileContext: ProjectFileContext;
    agentState: AgentState;
    tools: readonly string[];
    spawnableAgents: AgentTemplateType[];
    agentTemplates: Record<string, AgentTemplate>;
    intitialAgentPrompt?: string;
    additionalToolDefinitions: () => Promise<ProjectFileContext['customToolDefinitions']>;
    logger: Logger;
} & ParamsExcluding<typeof getAgentTemplate, 'agentId' | 'localAgentTemplates'>): Promise<string>;
type StringField = 'systemPrompt' | 'instructionsPrompt' | 'stepPrompt';
export declare function getAgentPrompt<T extends StringField>(params: {
    agentTemplate: AgentTemplate;
    promptType: {
        type: T;
    };
    fileContext: ProjectFileContext;
    agentState: AgentState;
    agentTemplates: Record<string, AgentTemplate>;
    additionalToolDefinitions: () => Promise<CustomToolDefinitions>;
    logger: Logger;
    useParentTools?: boolean;
} & ParamsExcluding<typeof formatPrompt, 'prompt' | 'tools' | 'spawnableAgents'> & ParamsExcluding<typeof buildFullSpawnableAgentsSpec, 'spawnableAgents' | 'agentTemplates'>): Promise<string | undefined>;
export {};
//# sourceMappingURL=strings.d.ts.map