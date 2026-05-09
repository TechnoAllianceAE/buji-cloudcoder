import z from 'zod/v4';
export declare const readSubtreeParams: {
    toolName: "read_subtree";
    endsAgentStep: true;
    description: string;
    inputSchema: z.ZodObject<{
        paths: z.ZodOptional<z.ZodArray<z.ZodString>>;
        maxTokens: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>;
    outputSchema: z.ZodTuple<[z.ZodObject<{
        type: z.ZodLiteral<"json">;
        value: z.ZodType<({
            path: string;
            type: "directory";
            printedTree: string;
            tokenCount: number;
            truncationLevel: "none" | "tokens" | "unimportant-files" | "depth-based";
        } | {
            path: string;
            type: "file";
            variables: string[];
        } | {
            path: string;
            errorMessage: string;
        })[], unknown, z.core.$ZodTypeInternals<({
            path: string;
            type: "directory";
            printedTree: string;
            tokenCount: number;
            truncationLevel: "none" | "tokens" | "unimportant-files" | "depth-based";
        } | {
            path: string;
            type: "file";
            variables: string[];
        } | {
            path: string;
            errorMessage: string;
        })[], unknown>>;
    }, z.core.$strip>], null>;
};
//# sourceMappingURL=read-subtree.d.ts.map