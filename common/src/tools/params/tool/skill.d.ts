import z from 'zod/v4';
/**
 * Placeholder marker that will be replaced with the actual available skills XML.
 * This is replaced at runtime when generating tool prompts.
 */
export declare const AVAILABLE_SKILLS_PLACEHOLDER = "{{AVAILABLE_SKILLS}}";
export declare const skillParams: {
    toolName: "skill";
    endsAgentStep: true;
    description: string;
    inputSchema: z.ZodObject<{
        name: z.ZodString;
    }, z.core.$strip>;
    outputSchema: z.ZodTuple<[z.ZodObject<{
        type: z.ZodLiteral<"json">;
        value: z.ZodType<{
            name: string;
            description: string;
            content: string;
            license?: string;
        }, unknown, z.core.$ZodTypeInternals<{
            name: string;
            description: string;
            content: string;
            license?: string;
        }, unknown>>;
    }, z.core.$strip>], null>;
};
//# sourceMappingURL=skill.d.ts.map