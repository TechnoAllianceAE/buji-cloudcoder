import z from 'zod/v4';
export declare const endTurnParams: {
    toolName: "end_turn";
    endsAgentStep: true;
    description: string;
    inputSchema: z.ZodObject<{}, z.core.$strip>;
    outputSchema: z.ZodTuple<[z.ZodObject<{
        type: z.ZodLiteral<"json">;
        value: z.ZodObject<{
            message: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>], null>;
};
//# sourceMappingURL=end-turn.d.ts.map