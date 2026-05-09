import z from 'zod/v4';
export declare const writeTodosParams: {
    toolName: "write_todos";
    endsAgentStep: false;
    description: string;
    inputSchema: z.ZodObject<{
        todos: z.ZodArray<z.ZodObject<{
            task: z.ZodString;
            completed: z.ZodBoolean;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    outputSchema: z.ZodTuple<[z.ZodObject<{
        type: z.ZodLiteral<"json">;
        value: z.ZodObject<{
            message: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>], null>;
};
//# sourceMappingURL=write-todos.d.ts.map