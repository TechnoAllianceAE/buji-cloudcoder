import z from 'zod/v4';
export declare const webSearchParams: {
    toolName: "web_search";
    endsAgentStep: true;
    description: string;
    inputSchema: z.ZodObject<{
        query: z.ZodString;
        depth: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
            standard: "standard";
            deep: "deep";
        }>>>;
    }, z.core.$strip>;
    outputSchema: z.ZodTuple<[z.ZodObject<{
        type: z.ZodLiteral<"json">;
        value: z.ZodType<{
            result: string;
        } | {
            errorMessage: string;
        }, unknown, z.core.$ZodTypeInternals<{
            result: string;
        } | {
            errorMessage: string;
        }, unknown>>;
    }, z.core.$strip>], null>;
};
//# sourceMappingURL=web-search.d.ts.map