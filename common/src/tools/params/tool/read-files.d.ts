import z from 'zod/v4';
export declare const fileContentsSchema: z.ZodUnion<readonly [z.ZodObject<{
    path: z.ZodString;
    content: z.ZodString;
    referencedBy: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString>>>;
}, z.core.$strip>, z.ZodObject<{
    path: z.ZodString;
    contentOmittedForLength: z.ZodLiteral<true>;
}, z.core.$strip>]>;
export declare const readFilesParams: {
    toolName: "read_files";
    endsAgentStep: true;
    description: string;
    inputSchema: z.ZodObject<{
        paths: z.ZodArray<z.ZodString>;
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
        })[], unknown, z.core.$ZodTypeInternals<({
            path: string;
            content: string;
            referencedBy?: Record<string, string[]>;
        } | {
            path: string;
            contentOmittedForLength: true;
        })[], unknown>>;
    }, z.core.$strip>], null>;
};
//# sourceMappingURL=read-files.d.ts.map