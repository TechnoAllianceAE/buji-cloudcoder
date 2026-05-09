import z from 'zod/v4';
export declare const lookupAgentInfoParams: {
    toolName: "lookup_agent_info";
    endsAgentStep: false;
    description: string;
    inputSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
    outputSchema: z.ZodTuple<[z.ZodObject<{
        type: z.ZodLiteral<"json">;
        value: z.ZodType<import("../../../types/json").JSONValue, unknown, z.core.$ZodTypeInternals<import("../../../types/json").JSONValue, unknown>>;
    }, z.core.$strip>], null>;
};
//# sourceMappingURL=lookup-agent-info.d.ts.map