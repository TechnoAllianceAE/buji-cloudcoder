/**
 * Backend Agent Template Types
 *
 * This file provides backend-compatible agent template types with strict validation.
 * It imports base types from the user-facing template to eliminate duplication.
 */
import { z } from 'zod/v4';
import type { MCPConfig } from './mcp';
import type { Model } from '../old-constants';
import type { ToolResultOutput } from './messages/content-part';
import type { AgentState, AgentTemplateType } from './session-state';
import type { ToolCall, AgentState as PublicAgentState } from '../templates/initial-agents-dir/types/agent-definition';
import type { Logger } from '../templates/initial-agents-dir/types/util-types';
import type { ToolName } from '../tools/constants';
export type AgentId = `${string}/${string}@${number}.${number}.${number}`;
export type OpenRouterReasoningOptions = {
    /**
     * https://openrouter.ai/docs/use-cases/reasoning-tokens
     * One of `max_tokens` or `effort` is required.
     * If `exclude` is true, reasoning will be removed from the response. Default is false.
     */
    enabled?: boolean;
    exclude?: boolean;
} & ({
    max_tokens: number;
} | {
    effort: 'high' | 'medium' | 'low' | 'minimal' | 'none';
});
export type OpenRouterProviderRoutingOptions = {
    /**
     * List of provider slugs to try in order (e.g. ["anthropic", "openai"])
     */
    order?: string[];
    /**
     * Whether to allow backup providers when primary is unavailable (default: true)
     */
    allow_fallbacks?: boolean;
    /**
     * Only use providers that support all parameters in your request (default: false)
     */
    require_parameters?: boolean;
    /**
     * Control whether to use providers that may store data
     */
    data_collection?: 'allow' | 'deny';
    /**
     * List of provider slugs to allow for this request
     */
    only?: string[];
    /**
     * List of provider slugs to skip for this request
     */
    ignore?: string[];
    /**
     * List of quantization levels to filter by (e.g. ["int4", "int8"])
     */
    quantizations?: Array<'int4' | 'int8' | 'fp4' | 'fp6' | 'fp8' | 'fp16' | 'bf16' | 'fp32' | 'unknown'>;
    /**
     * Sort providers by price, throughput, or latency
     */
    sort?: 'price' | 'throughput' | 'latency';
    /**
     * Maximum pricing you want to pay for this request
     */
    max_price?: {
        prompt?: number | string;
        completion?: number | string;
        image?: number | string;
        audio?: number | string;
        request?: number | string;
    };
};
export type OpenRouterProviderOptions = {
    models?: string[];
    reasoning?: OpenRouterReasoningOptions;
    /**
     * A unique identifier representing your end-user, which can
     * help OpenRouter to monitor and detect abuse.
     */
    user?: string;
};
/**
 * Backend agent template with strict validation and Zod schemas
 * Extends the user-facing AgentDefinition but with backend-specific requirements
 */
export type AgentTemplate<P = string | undefined, T = Record<string, any> | undefined> = {
    id: AgentTemplateType;
    displayName: string;
    model: Model;
    reasoningOptions?: OpenRouterReasoningOptions;
    providerOptions?: OpenRouterProviderRoutingOptions;
    mcpServers: Record<string, MCPConfig>;
    toolNames: (ToolName | (string & {}))[];
    spawnableAgents: AgentTemplateType[];
    spawnerPrompt?: string;
    systemPrompt: string;
    instructionsPrompt: string;
    stepPrompt: string;
    parentInstructions?: Record<string, string>;
    inputSchema: {
        prompt?: z.ZodSchema<P>;
        params?: z.ZodSchema<T>;
    };
    includeMessageHistory: boolean;
    inheritParentSystemPrompt: boolean;
    outputMode: 'last_message' | 'all_messages' | 'structured_output';
    outputSchema?: z.ZodSchema<any>;
    handleSteps?: StepHandler<P, T> | string;
};
export type StepText = {
    type: 'STEP_TEXT';
    text: string;
};
export type GenerateN = {
    type: 'GENERATE_N';
    n: number;
};
export declare const StepTextSchema: z.ZodObject<{
    type: z.ZodLiteral<"STEP_TEXT">;
    text: z.ZodString;
}, z.core.$strip>;
export declare const GenerateNSchema: z.ZodObject<{
    type: z.ZodLiteral<"GENERATE_N">;
    n: z.ZodNumber;
}, z.core.$strip>;
export declare const HandleStepsToolCallSchema: z.ZodObject<{
    toolName: z.ZodString;
    input: z.ZodRecord<z.ZodString, z.ZodAny>;
    includeToolCall: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const HandleStepsYieldValueSchema: z.ZodUnion<readonly [z.ZodLiteral<"STEP">, z.ZodLiteral<"STEP_ALL">, z.ZodObject<{
    type: z.ZodLiteral<"STEP_TEXT">;
    text: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"GENERATE_N">;
    n: z.ZodNumber;
}, z.core.$strip>, z.ZodObject<{
    toolName: z.ZodString;
    input: z.ZodRecord<z.ZodString, z.ZodAny>;
    includeToolCall: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>]>;
export type HandleStepsYieldValue = z.infer<typeof HandleStepsYieldValueSchema>;
export type StepGenerator = Generator<Omit<ToolCall, 'toolCallId'> | 'STEP' | 'STEP_ALL' | StepText | GenerateN, // Generic tool call type
void, {
    agentState: PublicAgentState;
    toolResult: ToolResultOutput[];
    stepsComplete: boolean;
    nResponses?: string[];
}>;
export type StepHandler<P = string | undefined, T = Record<string, any> | undefined> = (context: {
    agentState: AgentState;
    prompt: P;
    params: T;
    logger: Logger;
}) => StepGenerator;
export { Logger, PublicAgentState };
//# sourceMappingURL=agent-template.d.ts.map