import z from 'zod/v4';
export declare const setMessagesParams: {
    toolName: "set_messages";
    endsAgentStep: true;
    description: string;
    inputSchema: z.ZodObject<{
        messages: z.ZodAny;
    }, z.core.$strip>;
    outputSchema: z.ZodTuple<[z.ZodObject<{
        type: z.ZodLiteral<"json">;
        value: z.ZodObject<{
            message: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>], null>;
};
//# sourceMappingURL=set-messages.d.ts.map