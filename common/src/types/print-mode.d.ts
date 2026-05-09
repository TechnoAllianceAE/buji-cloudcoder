import z from 'zod/v4';
export declare const printModeStartSchema: z.ZodObject<{
    type: z.ZodLiteral<"start">;
    agentId: z.ZodOptional<z.ZodString>;
    messageHistoryLength: z.ZodNumber;
}, z.core.$strip>;
export type PrintModeStart = z.infer<typeof printModeStartSchema>;
export declare const printModeErrorSchema: z.ZodObject<{
    type: z.ZodLiteral<"error">;
    message: z.ZodString;
}, z.core.$strip>;
export type PrintModeError = z.infer<typeof printModeErrorSchema>;
export declare const printModeDownloadStatusSchema: z.ZodObject<{
    type: z.ZodLiteral<"download">;
    version: z.ZodString;
    status: z.ZodEnum<{
        complete: "complete";
        failed: "failed";
    }>;
}, z.core.$strip>;
export type PrintModeDownloadStatus = z.infer<typeof printModeDownloadStatusSchema>;
export declare const printModeToolCallSchema: z.ZodObject<{
    type: z.ZodLiteral<"tool_call">;
    toolCallId: z.ZodString;
    toolName: z.ZodString;
    input: z.ZodRecord<z.ZodString, z.ZodAny>;
    agentId: z.ZodOptional<z.ZodString>;
    parentAgentId: z.ZodOptional<z.ZodString>;
    includeToolCall: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type PrintModeToolCall = z.infer<typeof printModeToolCallSchema>;
export declare const printModeToolResultSchema: z.ZodObject<{
    type: z.ZodLiteral<"tool_result">;
    toolCallId: z.ZodString;
    toolName: z.ZodString;
    output: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"json">;
        value: z.ZodType<import("src").JSONValue, unknown, z.core.$ZodTypeInternals<import("src").JSONValue, unknown>>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"media">;
        data: z.ZodString;
        mediaType: z.ZodString;
    }, z.core.$strip>], "type">>;
    parentAgentId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type PrintModeToolResult = z.infer<typeof printModeToolResultSchema>;
export declare const printModeTextSchema: z.ZodObject<{
    type: z.ZodLiteral<"text">;
    text: z.ZodString;
    agentId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type PrintModeText = z.infer<typeof printModeTextSchema>;
export declare const printModeFinishSchema: z.ZodObject<{
    type: z.ZodLiteral<"finish">;
    agentId: z.ZodOptional<z.ZodString>;
    totalCost: z.ZodNumber;
}, z.core.$strip>;
export type PrintModeFinish = z.infer<typeof printModeFinishSchema>;
export declare const printModeSubagentStartSchema: z.ZodObject<{
    type: z.ZodLiteral<"subagent_start">;
    agentId: z.ZodString;
    agentType: z.ZodString;
    displayName: z.ZodString;
    onlyChild: z.ZodBoolean;
    parentAgentId: z.ZodOptional<z.ZodString>;
    params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    prompt: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type PrintModeSubagentStart = z.infer<typeof printModeSubagentStartSchema>;
export declare const printModeSubagentFinishSchema: z.ZodObject<{
    type: z.ZodLiteral<"subagent_finish">;
    agentId: z.ZodString;
    agentType: z.ZodString;
    displayName: z.ZodString;
    onlyChild: z.ZodBoolean;
    parentAgentId: z.ZodOptional<z.ZodString>;
    params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    prompt: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type PrintModeSubagentFinish = z.infer<typeof printModeSubagentFinishSchema>;
export declare const printModeReasoningDeltaSchema: z.ZodObject<{
    type: z.ZodLiteral<"reasoning_delta">;
    text: z.ZodString;
    ancestorRunIds: z.ZodArray<z.ZodString>;
    runId: z.ZodString;
}, z.core.$strip>;
export type PrintModeReasoningDelta = z.infer<typeof printModeReasoningDeltaSchema>;
export declare const printModeEventSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"download">;
    version: z.ZodString;
    status: z.ZodEnum<{
        complete: "complete";
        failed: "failed";
    }>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"error">;
    message: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"finish">;
    agentId: z.ZodOptional<z.ZodString>;
    totalCost: z.ZodNumber;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"start">;
    agentId: z.ZodOptional<z.ZodString>;
    messageHistoryLength: z.ZodNumber;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"subagent_finish">;
    agentId: z.ZodString;
    agentType: z.ZodString;
    displayName: z.ZodString;
    onlyChild: z.ZodBoolean;
    parentAgentId: z.ZodOptional<z.ZodString>;
    params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    prompt: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"subagent_start">;
    agentId: z.ZodString;
    agentType: z.ZodString;
    displayName: z.ZodString;
    onlyChild: z.ZodBoolean;
    parentAgentId: z.ZodOptional<z.ZodString>;
    params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    prompt: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"text">;
    text: z.ZodString;
    agentId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"tool_call">;
    toolCallId: z.ZodString;
    toolName: z.ZodString;
    input: z.ZodRecord<z.ZodString, z.ZodAny>;
    agentId: z.ZodOptional<z.ZodString>;
    parentAgentId: z.ZodOptional<z.ZodString>;
    includeToolCall: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"tool_result">;
    toolCallId: z.ZodString;
    toolName: z.ZodString;
    output: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"json">;
        value: z.ZodType<import("src").JSONValue, unknown, z.core.$ZodTypeInternals<import("src").JSONValue, unknown>>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"media">;
        data: z.ZodString;
        mediaType: z.ZodString;
    }, z.core.$strip>], "type">>;
    parentAgentId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"reasoning_delta">;
    text: z.ZodString;
    ancestorRunIds: z.ZodArray<z.ZodString>;
    runId: z.ZodString;
}, z.core.$strip>], "type">;
export type PrintModeEvent = z.infer<typeof printModeEventSchema>;
//# sourceMappingURL=print-mode.d.ts.map