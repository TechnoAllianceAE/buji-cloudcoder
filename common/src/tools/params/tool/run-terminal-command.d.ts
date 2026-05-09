import z from 'zod/v4';
export declare const terminalCommandOutputSchema: z.ZodUnion<readonly [z.ZodObject<{
    command: z.ZodString;
    startingCwd: z.ZodOptional<z.ZodString>;
    message: z.ZodOptional<z.ZodString>;
    stderr: z.ZodOptional<z.ZodString>;
    stdout: z.ZodOptional<z.ZodString>;
    exitCode: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    command: z.ZodString;
    startingCwd: z.ZodOptional<z.ZodString>;
    message: z.ZodOptional<z.ZodString>;
    stderr: z.ZodOptional<z.ZodString>;
    stdoutOmittedForLength: z.ZodLiteral<true>;
    exitCode: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    command: z.ZodString;
    processId: z.ZodNumber;
    backgroundProcessStatus: z.ZodEnum<{
        error: "error";
        running: "running";
        completed: "completed";
    }>;
}, z.core.$strip>, z.ZodObject<{
    command: z.ZodString;
    errorMessage: z.ZodString;
}, z.core.$strip>]>;
export declare const gitCommitGuidePrompt = "\n### Using git to commit changes\n\nWhen the user requests a new git commit, please follow these steps closely:\n\n1. **Run two run_terminal_command tool calls:**\n   - Run `git diff` to review both staged and unstaged modifications.\n   - Run `git log` to check recent commit messages, ensuring consistency with this repository's style.\n\n2. **Select relevant files to include in the commit:**\n   Use the git context established at the start of this conversation to decide which files are pertinent to the changes. Stage any new untracked files that are relevant, but avoid committing previously modified files (from the beginning of the conversation) unless they directly relate to this commit.\n\n3. **Analyze the staged changes and compose a commit message:**\n   Enclose your analysis in <commit_analysis> tags. Within these tags, you should:\n   - Note which files have been altered or added.\n   - Categorize the nature of the changes (e.g., new feature, fix, refactor, documentation, etc.).\n   - Consider the purpose or motivation behind the alterations.\n   - Refrain from using tools to inspect code beyond what is presented in the git context.\n   - Evaluate the overall impact on the project.\n   - Check for sensitive details that should not be committed.\n   - Draft a concise, one- to two-sentence commit message focusing on the \u201Cwhy\u201D rather than the \u201Cwhat.\u201D\n   - Use precise, straightforward language that accurately represents the changes.\n   - Ensure the message provides clarity\u2014avoid generic or vague terms like \u201CUpdate\u201D or \u201CFix\u201D without context.\n   - Revisit your draft to confirm it truly reflects the changes and their intention.\n\n4. **Create the commit, ending with this specific footer:**\n   ```\n   Generated with Codebuff \uD83E\uDD16\n   Co-Authored-By: BujiCoderPlus <noreply@bujicoder.com>\n   ```\n   To maintain proper formatting, use cross-platform compatible commit messages:\n   \n   **For Unix/bash shells:**\n   ```\n   git commit -m \"$(cat <<'EOF'\n   Your commit message here.\n\n   \uD83E\uDD16 Generated with Codebuff\n   Co-Authored-By: BujiCoderPlus <noreply@bujicoder.com>\n   EOF\n   )\"\n   ```\n   \n   **For Windows Command Prompt:**\n   ```\n   git commit -m \"Your commit message here.\n\n   \uD83E\uDD16 Generated with Codebuff\n   Co-Authored-By: BujiCoderPlus <noreply@bujicoder.com>\"\n   ```\n   \n   Always detect the platform and use the appropriate syntax. HEREDOC syntax (`<<'EOF'`) only works in bash/Unix shells and will fail on Windows Command Prompt.\n\n**Important details**\n\n- When feasible, use a single `git commit -am` command to add and commit together, but do not accidentally stage unrelated files.\n- Never alter the git config.\n- Do not push to the remote repository.\n- Avoid using interactive flags (e.g., `-i`) that require unsupported interactive input.\n- Do not create an empty commit if there are no changes.\n- Make sure your commit message is concise yet descriptive, focusing on the intention behind the changes rather than merely describing them.\n";
export declare const runTerminalCommandParams: {
    toolName: "run_terminal_command";
    endsAgentStep: true;
    description: string;
    inputSchema: z.ZodObject<{
        command: z.ZodString;
        process_type: z.ZodDefault<z.ZodEnum<{
            SYNC: "SYNC";
            BACKGROUND: "BACKGROUND";
        }>>;
        cwd: z.ZodOptional<z.ZodString>;
        timeout_seconds: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    }, z.core.$strip>;
    outputSchema: z.ZodTuple<[z.ZodObject<{
        type: z.ZodLiteral<"json">;
        value: z.ZodType<{
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
        }, unknown, z.core.$ZodTypeInternals<{
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
        }, unknown>>;
    }, z.core.$strip>], null>;
};
//# sourceMappingURL=run-terminal-command.d.ts.map