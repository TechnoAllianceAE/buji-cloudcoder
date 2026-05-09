import z from 'zod/v4';
export declare const thinkDeeplyParams: {
    toolName: "think_deeply";
    endsAgentStep: false;
    description: string;
    inputSchema: z.ZodObject<{
        thought: z.ZodString;
    }, z.core.$strip>;
    outputSchema: z.ZodTuple<[z.ZodObject<{
        type: z.ZodLiteral<"json">;
        value: z.ZodObject<{
            message: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>], null>;
};
//# sourceMappingURL=think-deeply.d.ts.map