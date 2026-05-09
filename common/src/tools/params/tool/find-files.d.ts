import z from 'zod/v4';
export declare const findFilesParams: {
    toolName: "find_files";
    endsAgentStep: true;
    description: string;
    inputSchema: z.ZodObject<{
        prompt: z.ZodString;
    }, z.core.$strip>;
    outputSchema: z.ZodTuple<[z.ZodObject<{
        type: z.ZodLiteral<"json">;
        value: z.ZodType<({
            path: string;
            content: string;
            referencedBy?: Record<string, string[]>;
        } | {
            path: string;
            contentOmittedForLength: true;
        })[] | {
            message: string;
        }, unknown, z.core.$ZodTypeInternals<({
            path: string;
            content: string;
            referencedBy?: Record<string, string[]>;
        } | {
            path: string;
            contentOmittedForLength: true;
        })[] | {
            message: string;
        }, unknown>>;
    }, z.core.$strip>], null>;
};
//# sourceMappingURL=find-files.d.ts.map