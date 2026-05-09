import z from 'zod/v4';
export declare const questionSchema: z.ZodObject<{
    question: z.ZodString;
    header: z.ZodOptional<z.ZodString>;
    options: z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    multiSelect: z.ZodDefault<z.ZodBoolean>;
    validation: z.ZodOptional<z.ZodObject<{
        maxLength: z.ZodOptional<z.ZodNumber>;
        minLength: z.ZodOptional<z.ZodNumber>;
        pattern: z.ZodOptional<z.ZodString>;
        patternError: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type AskUserQuestion = z.infer<typeof questionSchema>;
export declare const askUserParams: {
    toolName: "ask_user";
    endsAgentStep: true;
    description: string;
    inputSchema: z.ZodObject<{
        questions: z.ZodArray<z.ZodObject<{
            question: z.ZodString;
            header: z.ZodOptional<z.ZodString>;
            options: z.ZodArray<z.ZodObject<{
                label: z.ZodString;
                description: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>;
            multiSelect: z.ZodDefault<z.ZodBoolean>;
            validation: z.ZodOptional<z.ZodObject<{
                maxLength: z.ZodOptional<z.ZodNumber>;
                minLength: z.ZodOptional<z.ZodNumber>;
                pattern: z.ZodOptional<z.ZodString>;
                patternError: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    outputSchema: z.ZodTuple<[z.ZodObject<{
        type: z.ZodLiteral<"json">;
        value: z.ZodType<{
            answers?: {
                questionIndex: number;
                selectedOption?: string;
                selectedOptions?: string[];
                otherText?: string;
            }[];
            skipped?: boolean;
        }, unknown, z.core.$ZodTypeInternals<{
            answers?: {
                questionIndex: number;
                selectedOption?: string;
                selectedOptions?: string[];
                otherText?: string;
            }[];
            skipped?: boolean;
        }, unknown>>;
    }, z.core.$strip>], null>;
};
//# sourceMappingURL=ask-user.d.ts.map