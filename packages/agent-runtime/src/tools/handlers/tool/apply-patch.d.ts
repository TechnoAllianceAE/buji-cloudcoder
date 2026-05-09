export declare const handleApplyPatch: ({ previousToolCallFinished, toolCall, requestClientToolCall, }: ({
    previousToolCallFinished: Promise<void>;
    toolCall: {
        toolName: "apply_patch";
        input: {
            operation?: {
                type: "create_file";
                path: string;
                diff: string;
            } | {
                type: "update_file";
                path: string;
                diff: string;
            } | {
                type: "delete_file";
                path: string;
            };
        };
    } & Omit<{
        type: "tool-call";
        toolCallId: string;
        toolName: string;
        input: Record<string, unknown>;
        providerOptions?: Record<string, Record<string, import("src").JSONValue>>;
        providerExecuted?: boolean;
    }, "type">;
    agentContext: Record<string, import("@bcp/common/types/session-state").Subgoal>;
    agentState: import("@bcp/common/types/session-state").AgentState;
    agentStepId: string;
    agentTemplate: import("@bcp/common/types/agent-template").AgentTemplate;
    ancestorRunIds: string[];
    apiKey: string;
    clientSessionId: string;
    fetch: typeof globalThis.fetch;
    fileContext: import("@bcp/common/util/file").ProjectFileContext;
    fileProcessingState: import("./write-file").FileProcessingState;
    fingerprintId: string;
    fullResponse: string;
    localAgentTemplates: Record<string, import("@bcp/common/types/agent-template").AgentTemplate>;
    logger: import("@bcp/common/types/contracts/logger").Logger;
    prompt: string | undefined;
    repoId: string | undefined;
    repoUrl: string | undefined;
    runId: string;
    sendSubagentChunk: import("@bcp/common/types/contracts/client").SendSubagentChunkFn;
    signal: AbortSignal;
    system: string;
    tools: import("ai").ToolSet;
    trackEvent: import("@bcp/common/types/contracts/analytics").TrackEventFn;
    userId: string | undefined;
    userInputId: string;
    writeToClient: (chunk: string | import("src").PrintModeEvent) => void;
} & ({
    requestClientToolCall: never;
} | {
    requestClientToolCall: (toolCall: import("src").ClientToolCall<"apply_patch">) => Promise<[{
        type: "json";
        value: {
            message: string;
            applied: {
                file: string;
                action: "delete" | "add" | "update";
            }[];
        } | {
            errorMessage: string;
        };
    }?, ...unknown[]]>;
})) & import("@bcp/common/types/contracts/agent-runtime").AgentRuntimeDeps & import("@bcp/common/types/contracts/agent-runtime").AgentRuntimeScopedDeps) => Promise<{
    output: [{
        type: "json";
        value: {
            message: string;
            applied: {
                file: string;
                action: "delete" | "add" | "update";
            }[];
        } | {
            errorMessage: string;
        };
    }?, ...unknown[]];
}>;
//# sourceMappingURL=apply-patch.d.ts.map