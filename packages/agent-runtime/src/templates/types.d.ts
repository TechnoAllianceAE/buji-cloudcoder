import type { ToolName } from '@bcp/common/tools/constants';
import type { AgentTemplate, StepGenerator, StepHandler } from '@bcp/common/types/agent-template';
import type { AgentTemplateType } from '@bcp/common/types/session-state';
export type { AgentTemplate, StepGenerator, StepHandler };
declare const placeholderNames: readonly ["AGENT_NAME", "FILE_TREE_PROMPT_SMALL", "FILE_TREE_PROMPT", "FILE_TREE_PROMPT_LARGE", "GIT_CHANGES_PROMPT", "INITIAL_AGENT_PROMPT", "KNOWLEDGE_FILES_CONTENTS", "PROJECT_ROOT", "REMAINING_STEPS", "SYSTEM_INFO_PROMPT", "USER_CWD", "USER_INPUT_PROMPT"];
type PlaceholderType<T extends typeof placeholderNames> = {
    [K in T[number]]: `{BCP_${K}}`;
};
export declare const PLACEHOLDER: PlaceholderType<typeof placeholderNames>;
export type PlaceholderValue = (typeof PLACEHOLDER)[keyof typeof PLACEHOLDER];
export declare const placeholderValues: ("{BCP_AGENT_NAME}" | "{BCP_FILE_TREE_PROMPT_SMALL}" | "{BCP_FILE_TREE_PROMPT}" | "{BCP_FILE_TREE_PROMPT_LARGE}" | "{BCP_GIT_CHANGES_PROMPT}" | "{BCP_INITIAL_AGENT_PROMPT}" | "{BCP_KNOWLEDGE_FILES_CONTENTS}" | "{BCP_PROJECT_ROOT}" | "{BCP_REMAINING_STEPS}" | "{BCP_SYSTEM_INFO_PROMPT}" | "{BCP_USER_CWD}" | "{BCP_USER_INPUT_PROMPT}")[];
export declare const baseAgentToolNames: ToolName[];
export declare const baseAgentSubagents: AgentTemplateType[];
//# sourceMappingURL=types.d.ts.map