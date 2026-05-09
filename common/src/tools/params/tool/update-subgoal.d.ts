import z from 'zod/v4';
export declare const updateSubgoalParams: {
    toolName: "update_subgoal";
    endsAgentStep: false;
    description: string;
    inputSchema: z.ZodObject<{
        id: z.ZodString;
        status: z.ZodOptional<z.ZodEnum<{
            NOT_STARTED: "NOT_STARTED";
            IN_PROGRESS: "IN_PROGRESS";
            COMPLETE: "COMPLETE";
            ABORTED: "ABORTED";
        }>>;
        plan: z.ZodOptional<z.ZodString>;
        log: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    outputSchema: z.ZodTuple<[z.ZodObject<{
        type: z.ZodLiteral<"json">;
        value: z.ZodType<{
            message: string;
        }, unknown, z.core.$ZodTypeInternals<{
            message: string;
        }, unknown>>;
    }, z.core.$strip>], null>;
};
//# sourceMappingURL=update-subgoal.d.ts.map