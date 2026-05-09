import { z } from 'zod/v4';
import type { JSONSchema } from 'zod/v4/core';
export declare const JsonSchemaSchema: z.ZodType<JSONSchema.BaseSchema, JSONSchema.BaseSchema>;
declare const PromptFieldSchema: z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
    path: z.ZodString;
}, z.core.$strip>]>;
export type PromptField = z.infer<typeof PromptFieldSchema>;
export declare const DynamicAgentDefinitionSchema: z.ZodObject<{
    id: z.ZodString;
    version: z.ZodOptional<z.ZodString>;
    publisher: z.ZodOptional<z.ZodString>;
    displayName: z.ZodString;
    model: z.ZodString;
    reasoningOptions: z.ZodOptional<z.ZodIntersection<z.ZodObject<{
        enabled: z.ZodOptional<z.ZodBoolean>;
        exclude: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>, z.ZodUnion<readonly [z.ZodObject<{
        max_tokens: z.ZodNumber;
    }, z.core.$strip>, z.ZodObject<{
        effort: z.ZodEnum<{
            high: "high";
            medium: "medium";
            low: "low";
            minimal: "minimal";
            none: "none";
        }>;
    }, z.core.$strip>]>>>;
    providerOptions: z.ZodOptional<z.ZodObject<{
        order: z.ZodOptional<z.ZodArray<z.ZodString>>;
        allow_fallbacks: z.ZodOptional<z.ZodBoolean>;
        require_parameters: z.ZodOptional<z.ZodBoolean>;
        data_collection: z.ZodOptional<z.ZodEnum<{
            allow: "allow";
            deny: "deny";
        }>>;
        only: z.ZodOptional<z.ZodArray<z.ZodString>>;
        ignore: z.ZodOptional<z.ZodArray<z.ZodString>>;
        quantizations: z.ZodOptional<z.ZodArray<z.ZodEnum<{
            unknown: "unknown";
            int4: "int4";
            int8: "int8";
            fp4: "fp4";
            fp6: "fp6";
            fp8: "fp8";
            fp16: "fp16";
            bf16: "bf16";
            fp32: "fp32";
        }>>>;
        sort: z.ZodOptional<z.ZodEnum<{
            price: "price";
            throughput: "throughput";
            latency: "latency";
        }>>;
        max_price: z.ZodOptional<z.ZodObject<{
            prompt: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>>;
            completion: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>>;
            image: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>>;
            audio: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>>;
            request: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    mcpServers: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodObject<{
        type: z.ZodDefault<z.ZodEnum<{
            http: "http";
            sse: "sse";
        }>>;
        url: z.ZodString;
        params: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
        headers: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodDefault<z.ZodLiteral<"stdio">>;
        command: z.ZodString;
        args: z.ZodDefault<z.ZodArray<z.ZodString>>;
        env: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, z.core.$strict>]>>>;
    toolNames: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    spawnableAgents: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    inputSchema: z.ZodOptional<z.ZodObject<{
        prompt: z.ZodOptional<z.ZodObject<{
            type: z.ZodLiteral<"string">;
            description: z.ZodOptional<z.ZodString>;
        }, z.core.$loose>>;
        params: z.ZodOptional<z.ZodIntersection<z.ZodType<z.core.JSONSchema.JSONSchema, z.core.JSONSchema.JSONSchema, z.core.$ZodTypeInternals<z.core.JSONSchema.JSONSchema, z.core.JSONSchema.JSONSchema>>, z.ZodObject<{
            type: z.ZodLiteral<"object">;
        }, z.core.$strip>>>;
    }, z.core.$loose>>;
    includeMessageHistory: z.ZodDefault<z.ZodBoolean>;
    inheritParentSystemPrompt: z.ZodDefault<z.ZodBoolean>;
    outputMode: z.ZodDefault<z.ZodEnum<{
        last_message: "last_message";
        all_messages: "all_messages";
        structured_output: "structured_output";
    }>>;
    outputSchema: z.ZodOptional<z.ZodIntersection<z.ZodType<z.core.JSONSchema.JSONSchema, z.core.JSONSchema.JSONSchema, z.core.$ZodTypeInternals<z.core.JSONSchema.JSONSchema, z.core.JSONSchema.JSONSchema>>, z.ZodObject<{
        type: z.ZodLiteral<"object">;
    }, z.core.$strip>>>;
    spawnerPrompt: z.ZodOptional<z.ZodString>;
    systemPrompt: z.ZodOptional<z.ZodString>;
    instructionsPrompt: z.ZodOptional<z.ZodString>;
    stepPrompt: z.ZodOptional<z.ZodString>;
    handleSteps: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodOptional<z.ZodCustom<z.core.$InferInnerFunctionType<z.ZodTuple<readonly [z.ZodObject<{
        agentState: z.ZodObject<{
            agentId: z.ZodString;
            parentId: z.ZodString;
            messageHistory: z.ZodArray<z.ZodAny>;
        }, z.core.$strip>;
        prompt: z.ZodOptional<z.ZodString>;
        params: z.ZodOptional<z.ZodAny>;
    }, z.core.$strip>, z.ZodOptional<z.ZodObject<{
        debug: z.ZodFunction<z.ZodTuple<readonly [z.ZodAny, z.ZodOptional<z.ZodString>], null>, z.ZodVoid>;
        info: z.ZodFunction<z.ZodTuple<readonly [z.ZodAny, z.ZodOptional<z.ZodString>], null>, z.ZodVoid>;
        warn: z.ZodFunction<z.ZodTuple<readonly [z.ZodAny, z.ZodOptional<z.ZodString>], null>, z.ZodVoid>;
        error: z.ZodFunction<z.ZodTuple<readonly [z.ZodAny, z.ZodOptional<z.ZodString>], null>, z.ZodVoid>;
    }, z.core.$strip>>], null>, z.ZodAny>, z.core.$InferInnerFunctionType<z.ZodTuple<readonly [z.ZodObject<{
        agentState: z.ZodObject<{
            agentId: z.ZodString;
            parentId: z.ZodString;
            messageHistory: z.ZodArray<z.ZodAny>;
        }, z.core.$strip>;
        prompt: z.ZodOptional<z.ZodString>;
        params: z.ZodOptional<z.ZodAny>;
    }, z.core.$strip>, z.ZodOptional<z.ZodObject<{
        debug: z.ZodFunction<z.ZodTuple<readonly [z.ZodAny, z.ZodOptional<z.ZodString>], null>, z.ZodVoid>;
        info: z.ZodFunction<z.ZodTuple<readonly [z.ZodAny, z.ZodOptional<z.ZodString>], null>, z.ZodVoid>;
        warn: z.ZodFunction<z.ZodTuple<readonly [z.ZodAny, z.ZodOptional<z.ZodString>], null>, z.ZodVoid>;
        error: z.ZodFunction<z.ZodTuple<readonly [z.ZodAny, z.ZodOptional<z.ZodString>], null>, z.ZodVoid>;
    }, z.core.$strip>>], null>, z.ZodAny>>>]>>;
}, z.core.$strip>;
export type DynamicAgentDefinition = z.input<typeof DynamicAgentDefinitionSchema>;
export type DynamicAgentDefinitionParsed = z.infer<typeof DynamicAgentDefinitionSchema>;
export declare const DynamicAgentTemplateSchema: z.ZodObject<{
    id: z.ZodString;
    version: z.ZodOptional<z.ZodString>;
    publisher: z.ZodOptional<z.ZodString>;
    displayName: z.ZodString;
    model: z.ZodString;
    reasoningOptions: z.ZodOptional<z.ZodIntersection<z.ZodObject<{
        enabled: z.ZodOptional<z.ZodBoolean>;
        exclude: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>, z.ZodUnion<readonly [z.ZodObject<{
        max_tokens: z.ZodNumber;
    }, z.core.$strip>, z.ZodObject<{
        effort: z.ZodEnum<{
            high: "high";
            medium: "medium";
            low: "low";
            minimal: "minimal";
            none: "none";
        }>;
    }, z.core.$strip>]>>>;
    providerOptions: z.ZodOptional<z.ZodObject<{
        order: z.ZodOptional<z.ZodArray<z.ZodString>>;
        allow_fallbacks: z.ZodOptional<z.ZodBoolean>;
        require_parameters: z.ZodOptional<z.ZodBoolean>;
        data_collection: z.ZodOptional<z.ZodEnum<{
            allow: "allow";
            deny: "deny";
        }>>;
        only: z.ZodOptional<z.ZodArray<z.ZodString>>;
        ignore: z.ZodOptional<z.ZodArray<z.ZodString>>;
        quantizations: z.ZodOptional<z.ZodArray<z.ZodEnum<{
            unknown: "unknown";
            int4: "int4";
            int8: "int8";
            fp4: "fp4";
            fp6: "fp6";
            fp8: "fp8";
            fp16: "fp16";
            bf16: "bf16";
            fp32: "fp32";
        }>>>;
        sort: z.ZodOptional<z.ZodEnum<{
            price: "price";
            throughput: "throughput";
            latency: "latency";
        }>>;
        max_price: z.ZodOptional<z.ZodObject<{
            prompt: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>>;
            completion: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>>;
            image: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>>;
            audio: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>>;
            request: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    mcpServers: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodObject<{
        type: z.ZodDefault<z.ZodEnum<{
            http: "http";
            sse: "sse";
        }>>;
        url: z.ZodString;
        params: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
        headers: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodDefault<z.ZodLiteral<"stdio">>;
        command: z.ZodString;
        args: z.ZodDefault<z.ZodArray<z.ZodString>>;
        env: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, z.core.$strict>]>>>;
    toolNames: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    spawnableAgents: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    inputSchema: z.ZodOptional<z.ZodObject<{
        prompt: z.ZodOptional<z.ZodObject<{
            type: z.ZodLiteral<"string">;
            description: z.ZodOptional<z.ZodString>;
        }, z.core.$loose>>;
        params: z.ZodOptional<z.ZodIntersection<z.ZodType<z.core.JSONSchema.JSONSchema, z.core.JSONSchema.JSONSchema, z.core.$ZodTypeInternals<z.core.JSONSchema.JSONSchema, z.core.JSONSchema.JSONSchema>>, z.ZodObject<{
            type: z.ZodLiteral<"object">;
        }, z.core.$strip>>>;
    }, z.core.$loose>>;
    includeMessageHistory: z.ZodDefault<z.ZodBoolean>;
    inheritParentSystemPrompt: z.ZodDefault<z.ZodBoolean>;
    outputMode: z.ZodDefault<z.ZodEnum<{
        last_message: "last_message";
        all_messages: "all_messages";
        structured_output: "structured_output";
    }>>;
    outputSchema: z.ZodOptional<z.ZodIntersection<z.ZodType<z.core.JSONSchema.JSONSchema, z.core.JSONSchema.JSONSchema, z.core.$ZodTypeInternals<z.core.JSONSchema.JSONSchema, z.core.JSONSchema.JSONSchema>>, z.ZodObject<{
        type: z.ZodLiteral<"object">;
    }, z.core.$strip>>>;
    spawnerPrompt: z.ZodOptional<z.ZodString>;
    systemPrompt: z.ZodString;
    instructionsPrompt: z.ZodString;
    stepPrompt: z.ZodString;
    handleSteps: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type DynamicAgentTemplate = z.infer<typeof DynamicAgentTemplateSchema>;
export {};
//# sourceMappingURL=dynamic-agent-template.d.ts.map