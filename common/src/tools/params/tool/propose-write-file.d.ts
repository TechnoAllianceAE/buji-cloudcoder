import z from 'zod/v4';
export declare const proposeWriteFileParams: {
    toolName: "propose_write_file";
    endsAgentStep: false;
    description: string;
    inputSchema: z.ZodObject<{
        path: z.ZodString;
        instructions: z.ZodString;
        content: z.ZodString;
    }, z.core.$strip>;
    outputSchema: z.ZodTuple<[z.ZodObject<{
        type: z.ZodLiteral<"json">;
        value: z.ZodType<{
            file: string;
            message: string;
            unifiedDiff: string;
        } | {
            file: string;
            errorMessage: string;
        }, unknown, z.core.$ZodTypeInternals<{
            file: string;
            message: string;
            unifiedDiff: string;
        } | {
            file: string;
            errorMessage: string;
        }, unknown>>;
    }, z.core.$strip>], null>;
};
//# sourceMappingURL=propose-write-file.d.ts.map