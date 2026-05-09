import z from 'zod/v4';
export declare const listDirectoryParams: {
    toolName: "list_directory";
    endsAgentStep: true;
    description: string;
    inputSchema: z.ZodObject<{
        path: z.ZodString;
    }, z.core.$strip>;
    outputSchema: z.ZodTuple<[z.ZodObject<{
        type: z.ZodLiteral<"json">;
        value: z.ZodType<{
            files: string[];
            directories: string[];
            path: string;
        } | {
            errorMessage: string;
        }, unknown, z.core.$ZodTypeInternals<{
            files: string[];
            directories: string[];
            path: string;
        } | {
            errorMessage: string;
        }, unknown>>;
    }, z.core.$strip>], null>;
};
//# sourceMappingURL=list-directory.d.ts.map