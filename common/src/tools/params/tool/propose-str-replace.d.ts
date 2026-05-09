import z from 'zod/v4';
export declare const proposeUpdateFileResultSchema: z.ZodUnion<readonly [z.ZodObject<{
    file: z.ZodString;
    message: z.ZodString;
    unifiedDiff: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    file: z.ZodString;
    errorMessage: z.ZodString;
}, z.core.$strip>]>;
export declare const proposeStrReplaceParams: {
    toolName: "propose_str_replace";
    endsAgentStep: false;
    description: string;
    inputSchema: z.ZodObject<{
        path: z.ZodString;
        replacements: z.ZodArray<z.ZodObject<{
            old: z.ZodString;
            new: z.ZodString;
            allowMultiple: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        }, z.core.$strip>>;
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
//# sourceMappingURL=propose-str-replace.d.ts.map