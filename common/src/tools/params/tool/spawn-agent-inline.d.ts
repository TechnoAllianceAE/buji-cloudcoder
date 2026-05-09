import z from 'zod/v4';
export declare const spawnAgentInlineParams: {
    toolName: "spawn_agent_inline";
    endsAgentStep: true;
    description: string;
    inputSchema: z.ZodObject<{
        agent_type: z.ZodString;
        prompt: z.ZodOptional<z.ZodString>;
        params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, z.core.$strip>;
    outputSchema: z.ZodTuple<[z.ZodObject<{
        type: z.ZodLiteral<"json">;
        value: z.ZodObject<{
            message: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>], null>;
};
//# sourceMappingURL=spawn-agent-inline.d.ts.map