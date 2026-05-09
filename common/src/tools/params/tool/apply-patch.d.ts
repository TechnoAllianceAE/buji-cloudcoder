import z from 'zod/v4';
export declare const applyPatchResultSchema: z.ZodUnion<readonly [z.ZodObject<{
    message: z.ZodString;
    applied: z.ZodArray<z.ZodObject<{
        file: z.ZodString;
        action: z.ZodEnum<{
            delete: "delete";
            add: "add";
            update: "update";
        }>;
    }, z.core.$strip>>;
}, z.core.$strip>, z.ZodObject<{
    errorMessage: z.ZodString;
}, z.core.$strip>]>;
declare const operationSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"create_file">;
    path: z.ZodString;
    diff: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"update_file">;
    path: z.ZodString;
    diff: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"delete_file">;
    path: z.ZodString;
}, z.core.$strip>], "type">;
export type ApplyPatchOperation = z.infer<typeof operationSchema>;
export declare const applyPatchParams: {
    toolName: "apply_patch";
    endsAgentStep: false;
    description: string;
    inputSchema: z.ZodObject<{
        operation: z.ZodDiscriminatedUnion<[z.ZodObject<{
            type: z.ZodLiteral<"create_file">;
            path: z.ZodString;
            diff: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"update_file">;
            path: z.ZodString;
            diff: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"delete_file">;
            path: z.ZodString;
        }, z.core.$strip>], "type">;
    }, z.core.$strip>;
    outputSchema: z.ZodTuple<[z.ZodObject<{
        type: z.ZodLiteral<"json">;
        value: z.ZodType<{
            message: string;
            applied: {
                file: string;
                action: "delete" | "add" | "update";
            }[];
        } | {
            errorMessage: string;
        }, unknown, z.core.$ZodTypeInternals<{
            message: string;
            applied: {
                file: string;
                action: "delete" | "add" | "update";
            }[];
        } | {
            errorMessage: string;
        }, unknown>>;
    }, z.core.$strip>], null>;
};
export {};
//# sourceMappingURL=apply-patch.d.ts.map