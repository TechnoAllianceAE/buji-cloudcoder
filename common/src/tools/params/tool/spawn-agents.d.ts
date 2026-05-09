import z from 'zod/v4';
export declare const spawnAgentsOutputSchema: z.ZodArray<z.ZodIntersection<z.ZodObject<{
    agentType: z.ZodString;
}, z.core.$strip>, z.ZodType<import("../../../types/json").JSONObject, unknown, z.core.$ZodTypeInternals<import("../../../types/json").JSONObject, unknown>>>>;
export declare const spawnAgentsParams: {
    toolName: "spawn_agents";
    endsAgentStep: true;
    description: string;
    inputSchema: z.ZodObject<{
        agents: z.ZodArray<z.ZodObject<{
            agent_type: z.ZodString;
            prompt: z.ZodOptional<z.ZodString>;
            params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    outputSchema: z.ZodTuple<[z.ZodObject<{
        type: z.ZodLiteral<"json">;
        value: z.ZodType<({
            agentType: string;
        } & import("../../../types/json").JSONObject)[], unknown, z.core.$ZodTypeInternals<({
            agentType: string;
        } & import("../../../types/json").JSONObject)[], unknown>>;
    }, z.core.$strip>], null>;
};
//# sourceMappingURL=spawn-agents.d.ts.map