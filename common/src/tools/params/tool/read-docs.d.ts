import z from 'zod/v4';
export declare const readDocsParams: {
    toolName: "read_docs";
    endsAgentStep: true;
    description: string;
    inputSchema: z.ZodObject<{
        libraryTitle: z.ZodString;
        topic: z.ZodString;
        max_tokens: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    }, z.core.$strip>;
    outputSchema: z.ZodTuple<[z.ZodObject<{
        type: z.ZodLiteral<"json">;
        value: z.ZodType<{
            documentation: string;
        }, unknown, z.core.$ZodTypeInternals<{
            documentation: string;
        }, unknown>>;
    }, z.core.$strip>], null>;
};
//# sourceMappingURL=read-docs.d.ts.map