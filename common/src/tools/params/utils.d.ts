import z from 'zod/v4';
import type { JSONValue } from '../../types/json';
/** Only used for generating tool call strings before all tools are defined.
 *
 * @param toolName - The name of the tool to call
 * @param inputSchema - The zod schema for the tool. This is only used as type validation and is unused otherwise.
 * @param input - The input to the tool
 * @param endsAgentStep - Whether the agent should end its turn after this tool call
 */
export declare function $getToolCallString<Input>(params: {
    toolName: string;
    inputSchema: z.ZodType<any, Input> | null;
    input: Input;
    endsAgentStep: boolean;
}): string;
export declare function $getNativeToolCallExampleString<Input>(params: {
    toolName: string;
    inputSchema: z.ZodType<any, Input> | null;
    input: Input;
    endsAgentStep?: boolean;
}): string;
/** Generates the zod schema for a single JSON tool result. */
export declare function jsonToolResultSchema<T extends JSONValue>(valueSchema: z.ZodType<T>): z.ZodTuple<[z.ZodObject<{
    type: z.ZodLiteral<"json">;
    value: z.ZodType<T, unknown, z.core.$ZodTypeInternals<T, unknown>>;
}, z.core.$strip>], null>;
/** Generates the zod schema for an empty tool result. */
export declare function emptyToolResultSchema(): z.ZodTuple<[], null>;
/** Generates the zod schema for a simple text tool result. */
export declare function textToolResultSchema(): z.ZodTuple<[z.ZodObject<{
    type: z.ZodLiteral<"json">;
    value: z.ZodObject<{
        message: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>], null>;
//# sourceMappingURL=utils.d.ts.map