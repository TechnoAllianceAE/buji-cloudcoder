import z from 'zod/v4';
export declare const runFileChangeHooksParams: {
    toolName: "run_file_change_hooks";
    endsAgentStep: true;
    description: string;
    inputSchema: z.ZodObject<{
        files: z.ZodArray<z.ZodString>;
    }, z.core.$strip>;
    outputSchema: z.ZodTuple<[z.ZodObject<{
        type: z.ZodLiteral<"json">;
        value: z.ZodType<((({
            command: string;
            startingCwd?: string;
            message?: string;
            stderr?: string;
            stdout?: string;
            exitCode?: number;
        } | {
            command: string;
            stdoutOmittedForLength: true;
            startingCwd?: string;
            message?: string;
            stderr?: string;
            exitCode?: number;
        } | {
            command: string;
            processId: number;
            backgroundProcessStatus: "error" | "running" | "completed";
        } | {
            command: string;
            errorMessage: string;
        }) & {
            hookName: string;
        }) | {
            errorMessage: string;
        })[], unknown, z.core.$ZodTypeInternals<((({
            command: string;
            startingCwd?: string;
            message?: string;
            stderr?: string;
            stdout?: string;
            exitCode?: number;
        } | {
            command: string;
            stdoutOmittedForLength: true;
            startingCwd?: string;
            message?: string;
            stderr?: string;
            exitCode?: number;
        } | {
            command: string;
            processId: number;
            backgroundProcessStatus: "error" | "running" | "completed";
        } | {
            command: string;
            errorMessage: string;
        }) & {
            hookName: string;
        }) | {
            errorMessage: string;
        })[], unknown>>;
    }, z.core.$strip>], null>;
};
//# sourceMappingURL=run-file-change-hooks.d.ts.map