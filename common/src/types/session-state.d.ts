import { z } from 'zod/v4';
import type { Message } from './messages/bcp-message';
import type { ProjectFileContext } from '../util/file';
export declare const toolCallSchema: z.ZodObject<{
    toolName: z.ZodString;
    toolCallId: z.ZodString;
    input: z.ZodRecord<z.ZodString, z.ZodAny>;
}, z.core.$strip>;
export type ToolCall = z.infer<typeof toolCallSchema>;
export declare const subgoalSchema: z.ZodObject<{
    objective: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        NOT_STARTED: "NOT_STARTED";
        IN_PROGRESS: "IN_PROGRESS";
        COMPLETE: "COMPLETE";
        ABORTED: "ABORTED";
    }>>;
    plan: z.ZodOptional<z.ZodString>;
    logs: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export type Subgoal = z.infer<typeof subgoalSchema>;
export type AgentState = {
    /**
     * @deprecated agentId is replaced by runId
     */
    agentId: string;
    agentType: AgentTemplateType | null;
    agentContext: Record<string, Subgoal>;
    ancestorRunIds: string[];
    runId?: string;
    subagents: AgentState[];
    childRunIds: string[];
    messageHistory: Message[];
    stepsRemaining: number;
    creditsUsed: number;
    directCreditsUsed: number;
    output?: Record<string, any>;
    parentId?: string;
    systemPrompt: string;
    toolDefinitions: Record<string, {
        description: string | undefined;
        inputSchema: {};
    }>;
    /**
     * The accurate token count from the Anthropic API.
     * This is updated on every agent step via the /api/v1/token-count endpoint.
     */
    contextTokenCount: number;
};
export declare const AgentOutputSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"structuredOutput">;
    value: z.ZodUnion<[z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodNull]>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"lastMessage">;
    value: z.ZodArray<z.ZodAny>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"allMessages">;
    value: z.ZodArray<z.ZodAny>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"error">;
    message: z.ZodString;
    statusCode: z.ZodOptional<z.ZodNumber>;
    error: z.ZodOptional<z.ZodString>;
}, z.core.$strip>], "type">;
export type AgentOutput = z.infer<typeof AgentOutputSchema>;
export declare const AgentTemplateTypeList: readonly ["base", "base_free", "base_max", "base_experimental", "claude4_gemini_thinking", "superagent", "base_agent_builder", "ask", "planner", "dry_run", "thinker", "file_picker", "file_explorer", "researcher", "reviewer", "agent_builder", "example_programmatic"];
type UnderscoreToDash<S extends string> = S extends `${infer L}_${infer R}` ? `${L}-${UnderscoreToDash<R>}` : S;
export declare const AgentTemplateTypes: { [K in (typeof AgentTemplateTypeList)[number]]: UnderscoreToDash<K>; };
declare const agentTemplateTypeSchema: z.ZodEnum<{
    base: "base";
    base_free: "base_free";
    base_max: "base_max";
    base_experimental: "base_experimental";
    claude4_gemini_thinking: "claude4_gemini_thinking";
    superagent: "superagent";
    base_agent_builder: "base_agent_builder";
    ask: "ask";
    planner: "planner";
    dry_run: "dry_run";
    thinker: "thinker";
    file_picker: "file_picker";
    file_explorer: "file_explorer";
    researcher: "researcher";
    reviewer: "reviewer";
    agent_builder: "agent_builder";
    example_programmatic: "example_programmatic";
}>;
export type AgentTemplateType = z.infer<typeof agentTemplateTypeSchema> | (string & {});
export type SessionState = {
    fileContext: ProjectFileContext;
    mainAgentState: AgentState;
};
export declare function getInitialAgentState(): AgentState;
export declare function getInitialSessionState(fileContext: ProjectFileContext): SessionState;
export {};
//# sourceMappingURL=session-state.d.ts.map