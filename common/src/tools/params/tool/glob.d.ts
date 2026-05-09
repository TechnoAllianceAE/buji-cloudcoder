import z from 'zod/v4';
export declare const globParams: {
    toolName: "glob";
    description: string;
    endsAgentStep: false;
    inputSchema: z.ZodObject<{
        pattern: z.ZodString;
        cwd: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    outputSchema: z.ZodTuple<[z.ZodObject<{
        type: z.ZodLiteral<"json">;
        value: z.ZodType<{
            files: string[];
            count: number;
            message: string;
        } | {
            errorMessage: string;
        }, unknown, z.core.$ZodTypeInternals<{
            files: string[];
            count: number;
            message: string;
        } | {
            errorMessage: string;
        }, unknown>>;
    }, z.core.$strip>], null>;
};
//# sourceMappingURL=glob.d.ts.map