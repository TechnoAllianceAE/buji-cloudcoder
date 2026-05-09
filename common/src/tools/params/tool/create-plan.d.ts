import z from 'zod/v4';
export declare const createPlanParams: {
    toolName: "create_plan";
    endsAgentStep: false;
    description: string;
    inputSchema: z.ZodObject<{
        path: z.ZodString;
        plan: z.ZodString;
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
            patch?: string;
        }, unknown, z.core.$ZodTypeInternals<{
            file: string;
            message: string;
            unifiedDiff: string;
        } | {
            file: string;
            errorMessage: string;
            patch?: string;
        }, unknown>>;
    }, z.core.$strip>], null>;
};
//# sourceMappingURL=create-plan.d.ts.map