import z from 'zod/v4';
export declare const codeSearchParams: {
    toolName: "code_search";
    endsAgentStep: true;
    description: string;
    inputSchema: z.ZodObject<{
        pattern: z.ZodString;
        flags: z.ZodOptional<z.ZodString>;
        cwd: z.ZodOptional<z.ZodString>;
        maxResults: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    }, z.core.$strip>;
    outputSchema: z.ZodTuple<[z.ZodObject<{
        type: z.ZodLiteral<"json">;
        value: z.ZodType<{
            stdout: string;
            message: string;
            stderr?: string;
            exitCode?: number;
        } | {
            errorMessage: string;
        }, unknown, z.core.$ZodTypeInternals<{
            stdout: string;
            message: string;
            stderr?: string;
            exitCode?: number;
        } | {
            errorMessage: string;
        }, unknown>>;
    }, z.core.$strip>], null>;
};
//# sourceMappingURL=code-search.d.ts.map