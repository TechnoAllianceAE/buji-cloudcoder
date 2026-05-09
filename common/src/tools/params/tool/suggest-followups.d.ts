import z from 'zod/v4';
declare const followupSchema: z.ZodObject<{
    prompt: z.ZodString;
    label: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type SuggestFollowup = z.infer<typeof followupSchema>;
export declare const suggestFollowupsParams: {
    toolName: "suggest_followups";
    endsAgentStep: false;
    description: string;
    inputSchema: z.ZodObject<{
        followups: z.ZodArray<z.ZodObject<{
            prompt: z.ZodString;
            label: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    outputSchema: z.ZodTuple<[z.ZodObject<{
        type: z.ZodLiteral<"json">;
        value: z.ZodType<{
            message: string;
        }, unknown, z.core.$ZodTypeInternals<{
            message: string;
        }, unknown>>;
    }, z.core.$strip>], null>;
};
export {};
//# sourceMappingURL=suggest-followups.d.ts.map