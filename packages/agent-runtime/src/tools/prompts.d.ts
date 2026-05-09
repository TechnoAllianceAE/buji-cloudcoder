import { toolParams } from '@bcp/common/tools/list';
import z from 'zod/v4';
import type { SkillsMap } from '@bcp/common/types/skill';
import type { CustomToolDefinitions, customToolDefinitionsSchema } from '@bcp/common/util/file';
import type { ToolSet } from 'ai';
/**
 * Ensures the inputSchema is a Zod schema. If it's a JSON Schema object
 * (from SDK custom tools that were serialized), converts it to Zod.
 */
export declare function ensureZodSchema(schema: z.ZodType | Record<string, unknown>): z.ZodType;
export declare function buildToolDescription(params: {
    toolName: string;
    schema: z.ZodType;
    description?: string;
    endsAgentStep: boolean;
    exampleInputs?: any[];
}): string;
export declare const toolDescriptions: Record<keyof typeof toolParams, string>;
export declare const getToolsInstructions: (tools: readonly string[], additionalToolDefinitions: NonNullable<z.input<typeof customToolDefinitionsSchema>>, options?: {
    availableSkillsXml?: string;
}) => string;
export declare const fullToolList: (toolNames: readonly string[], additionalToolDefinitions: CustomToolDefinitions, options?: {
    availableSkillsXml?: string;
}) => string;
export declare const getShortToolInstructions: (toolNames: readonly string[], additionalToolDefinitions: CustomToolDefinitions) => string;
export declare function getToolSet(params: {
    toolNames: string[];
    additionalToolDefinitions: () => Promise<CustomToolDefinitions>;
    agentTools: ToolSet;
    skills: SkillsMap;
}): Promise<ToolSet>;
//# sourceMappingURL=prompts.d.ts.map