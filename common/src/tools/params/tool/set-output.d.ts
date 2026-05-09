import z from 'zod/v4';
export declare const setOutputParams: {
    toolName: "set_output";
    endsAgentStep: false;
    description: string;
    inputSchema: z.ZodObject<{
        data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, z.core.$loose>;
    outputSchema: z.ZodTuple<[z.ZodObject<{
        type: z.ZodLiteral<"json">;
        value: z.ZodObject<{
            message: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>], null>;
};
//# sourceMappingURL=set-output.d.ts.map