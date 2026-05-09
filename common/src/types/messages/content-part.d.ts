import z from 'zod/v4';
export declare const textPartSchema: z.ZodObject<{
    type: z.ZodLiteral<"text">;
    text: z.ZodString;
    providerOptions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodType<import("../json").JSONValue, unknown, z.core.$ZodTypeInternals<import("../json").JSONValue, unknown>>>>>;
}, z.core.$strip>;
export type TextPart = z.infer<typeof textPartSchema>;
export declare const imagePartSchema: z.ZodObject<{
    type: z.ZodLiteral<"image">;
    image: z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodString, z.ZodCustom<Uint8Array, Uint8Array>, z.ZodCustom<ArrayBuffer, ArrayBuffer>, z.ZodCustom<Buffer, Buffer>]>, z.ZodCustom<URL, URL>]>;
    mediaType: z.ZodOptional<z.ZodString>;
    providerOptions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodType<import("../json").JSONValue, unknown, z.core.$ZodTypeInternals<import("../json").JSONValue, unknown>>>>>;
}, z.core.$strip>;
export type ImagePart = z.infer<typeof imagePartSchema>;
export declare const filePartSchema: z.ZodObject<{
    type: z.ZodLiteral<"file">;
    data: z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodString, z.ZodCustom<Uint8Array, Uint8Array>, z.ZodCustom<ArrayBuffer, ArrayBuffer>, z.ZodCustom<Buffer, Buffer>]>, z.ZodCustom<URL, URL>]>;
    filename: z.ZodOptional<z.ZodString>;
    mediaType: z.ZodString;
    providerOptions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodType<import("../json").JSONValue, unknown, z.core.$ZodTypeInternals<import("../json").JSONValue, unknown>>>>>;
}, z.core.$strip>;
export type FilePart = z.infer<typeof filePartSchema>;
export declare const reasoningPartSchema: z.ZodObject<{
    type: z.ZodLiteral<"reasoning">;
    text: z.ZodString;
    providerOptions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodType<import("../json").JSONValue, unknown, z.core.$ZodTypeInternals<import("../json").JSONValue, unknown>>>>>;
}, z.core.$strip>;
export type ReasoningPart = z.infer<typeof reasoningPartSchema>;
export declare const toolCallPartSchema: z.ZodObject<{
    type: z.ZodLiteral<"tool-call">;
    toolCallId: z.ZodString;
    toolName: z.ZodString;
    input: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    providerOptions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodType<import("../json").JSONValue, unknown, z.core.$ZodTypeInternals<import("../json").JSONValue, unknown>>>>>;
    providerExecuted: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type ToolCallPart = z.infer<typeof toolCallPartSchema>;
export declare const toolResultOutputSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"json">;
    value: z.ZodType<import("../json").JSONValue, unknown, z.core.$ZodTypeInternals<import("../json").JSONValue, unknown>>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"media">;
    data: z.ZodString;
    mediaType: z.ZodString;
}, z.core.$strip>], "type">;
export type ToolResultOutput = z.infer<typeof toolResultOutputSchema>;
//# sourceMappingURL=content-part.d.ts.map