import type { CodebuffToolHandlerFunction } from './handler-function-type';
/**
 * Each value in this record that:
 * - Will be called immediately once it is parsed out of the stream.
 * - Takes as argument
 *   - The previous tool call (to await)
 *   - The BCPToolCall for the current tool
 *   - Any additional arguments for the tool
 * - Returns a promise that will be awaited
 */
export declare const bcpToolHandlers: {
    add_message: (params: {
        previousToolCallFinished: Promise<void>;
        toolCall: import("@bcp/common/tools/list").CodebuffToolCall<"add_message">;
        agentState: import("@bcp/common/types/session-state").AgentState;
    }) => Promise<{
        output: import("src").CodebuffToolOutput<"add_message">;
    }>;
    add_subgoal: (params: {
        previousToolCallFinished: Promise<void>;
        toolCall: import("@bcp/common/tools/list").CodebuffToolCall<"add_subgoal">;
        agentContext: Record<string, import("@bcp/common/types/session-state").Subgoal>;
    }) => Promise<{
        output: import("src").CodebuffToolOutput<"add_subgoal">;
    }>;
    apply_patch: ({ previousToolCallFinished, toolCall, requestClientToolCall, }: ({
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
        fileProcessingState: import("./tool/write-file").FileProcessingState;
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
    ask_user: (params: {
        previousToolCallFinished: Promise<void>;
        toolCall: import("@bcp/common/tools/list").CodebuffToolCall<"ask_user">;
        requestClientToolCall: (toolCall: any) => Promise<any>;
    }) => Promise<{
        output: import("src").CodebuffToolOutput<"ask_user">;
    }>;
    browser_logs: (params: {
        previousToolCallFinished: Promise<void>;
        toolCall: import("@bcp/common/tools/list").CodebuffToolCall<"browser_logs">;
        requestClientToolCall: (toolCall: import("src").ClientToolCall<"browser_logs">) => Promise<import("src").CodebuffToolOutput<"browser_logs">>;
    }) => Promise<{
        output: import("src").CodebuffToolOutput<"browser_logs">;
    }>;
    code_search: (params: {
        previousToolCallFinished: Promise<void>;
        toolCall: import("@bcp/common/tools/list").CodebuffToolCall<"code_search">;
        requestClientToolCall: (toolCall: import("src").ClientToolCall<"code_search">) => Promise<import("src").CodebuffToolOutput<"code_search">>;
    }) => Promise<{
        output: import("src").CodebuffToolOutput<"code_search">;
    }>;
    create_plan: (params: {
        previousToolCallFinished: Promise<void>;
        toolCall: import("@bcp/common/tools/list").CodebuffToolCall<"create_plan">;
        fileProcessingState: import("./tool/write-file").FileProcessingState;
        logger: import("@bcp/common/types/contracts/logger").Logger;
        requestClientToolCall: (toolCall: import("src").ClientToolCall<"create_plan">) => Promise<import("src").CodebuffToolOutput<"create_plan">>;
        writeToClient: (chunk: string) => void;
    }) => Promise<{
        output: import("src").CodebuffToolOutput<"create_plan">;
    }>;
    end_turn: (params: {
        previousToolCallFinished: Promise<any>;
        toolCall: import("@bcp/common/tools/list").CodebuffToolCall<"end_turn">;
    }) => Promise<{
        output: import("src").CodebuffToolOutput<"end_turn">;
    }>;
    find_files: (params: {
        previousToolCallFinished: Promise<any>;
        toolCall: import("@bcp/common/tools/list").CodebuffToolCall<"find_files">;
        logger: import("@bcp/common/types/contracts/logger").Logger;
        agentState: import("@bcp/common/types/session-state").AgentState;
        agentStepId: string;
        clientSessionId: string;
        fileContext: import("@bcp/common/util/file").ProjectFileContext;
        fingerprintId: string;
        repoId: string | undefined;
        userId: string | undefined;
        userInputId: string;
    } & import("@bcp/common/types/function-params").ParamsExcluding<typeof import("../../find-files/request-files-prompt").requestRelevantFiles, "messages" | "system" | "assistantPrompt"> & import("@bcp/common/types/function-params").ParamsExcluding<(params: {
        requestFiles: import("@bcp/common/types/contracts/client").RequestFilesFn;
    } & import("@bcp/common/types/function-params").ParamsOf<typeof import("../../find-files/request-files-prompt").requestRelevantFilesForTraining>) => Promise<void>, "messages" | "system" | "assistantPrompt"> & import("@bcp/common/types/function-params").ParamsExcluding<typeof import("../../get-file-reading-updates").getFileReadingUpdates, "requestedFiles">) => Promise<{
        output: import("src").CodebuffToolOutput<"find_files">;
    }>;
    glob: (params: {
        previousToolCallFinished: Promise<void>;
        toolCall: import("@bcp/common/tools/list").CodebuffToolCall<"glob">;
        requestClientToolCall: (toolCall: import("src").ClientToolCall<"glob">) => Promise<import("src").CodebuffToolOutput<"glob">>;
    }) => Promise<{
        output: import("src").CodebuffToolOutput<"glob">;
    }>;
    list_directory: (params: {
        previousToolCallFinished: Promise<void>;
        toolCall: import("@bcp/common/tools/list").CodebuffToolCall<"list_directory">;
        requestClientToolCall: (toolCall: import("src").ClientToolCall<"list_directory">) => Promise<import("src").CodebuffToolOutput<"list_directory">>;
    }) => Promise<{
        output: import("src").CodebuffToolOutput<"list_directory">;
    }>;
    lookup_agent_info: (params: {
        toolCall: import("@bcp/common/tools/list").CodebuffToolCall<"lookup_agent_info">;
        previousToolCallFinished: Promise<void>;
        apiKey: string;
        databaseAgentCache: Map<string, import("@bcp/common/types/agent-template").AgentTemplate | null>;
        localAgentTemplates: Record<string, import("@bcp/common/types/agent-template").AgentTemplate>;
        logger: import("@bcp/common/types/agent-template").Logger;
        fetchAgentFromDatabase: import("@bcp/common/types/contracts/database").FetchAgentFromDatabaseFn;
    }) => Promise<{
        output: import("src").CodebuffToolOutput<"lookup_agent_info">;
    }>;
    propose_str_replace: (params: {
        previousToolCallFinished: Promise<void>;
        toolCall: import("@bcp/common/tools/list").CodebuffToolCall<"propose_str_replace">;
        logger: import("@bcp/common/types/contracts/logger").Logger;
        agentState: import("@bcp/common/types/session-state").AgentState;
        runId: string;
        requestOptionalFile: import("@bcp/common/types/contracts/client").RequestOptionalFileFn;
    } & import("@bcp/common/types/function-params").ParamsExcluding<import("@bcp/common/types/contracts/client").RequestOptionalFileFn, "filePath">) => Promise<{
        output: import("src").CodebuffToolOutput<"propose_str_replace">;
    }>;
    propose_write_file: CodebuffToolHandlerFunction<"propose_write_file">;
    read_docs: (params: {
        previousToolCallFinished: Promise<void>;
        toolCall: import("@bcp/common/tools/list").CodebuffToolCall<"read_docs">;
        agentStepId: string;
        clientSessionId: string;
        fingerprintId: string;
        logger: import("@bcp/common/types/contracts/logger").Logger;
        repoId: string | undefined;
        userId: string | undefined;
        userInputId: string;
        clientEnv: import("@bcp/common/env-schema").ClientEnv;
        ciEnv: import("@bcp/common/types/contracts/env").CiEnv;
    } & import("@bcp/common/types/function-params").ParamsExcluding<typeof import("../../llm-api/context7-api").fetchContext7LibraryDocumentation, "query" | "topic" | "tokens">) => Promise<{
        output: import("src").CodebuffToolOutput<"read_docs">;
        creditsUsed: number;
    }>;
    read_files: (params: {
        previousToolCallFinished: Promise<void>;
        toolCall: import("@bcp/common/tools/list").CodebuffToolCall<"read_files">;
        fileContext: import("@bcp/common/util/file").ProjectFileContext;
    } & import("@bcp/common/types/function-params").ParamsExcluding<typeof import("../../get-file-reading-updates").getFileReadingUpdates, "requestedFiles">) => Promise<{
        output: import("src").CodebuffToolOutput<"read_files">;
    }>;
    read_subtree: (params: {
        previousToolCallFinished: Promise<void>;
        toolCall: import("@bcp/common/tools/list").CodebuffToolCall<"read_subtree">;
        fileContext: import("@bcp/common/util/file").ProjectFileContext;
        logger: import("@bcp/common/types/contracts/logger").Logger;
    }) => Promise<{
        output: import("src").CodebuffToolOutput<"read_subtree">;
    }>;
    run_file_change_hooks: (params: {
        previousToolCallFinished: Promise<void>;
        toolCall: import("@bcp/common/tools/list").CodebuffToolCall<"run_file_change_hooks">;
        requestClientToolCall: (toolCall: import("src").ClientToolCall<"run_file_change_hooks">) => Promise<import("src").CodebuffToolOutput<"run_file_change_hooks">>;
    }) => Promise<{
        output: import("src").CodebuffToolOutput<"run_file_change_hooks">;
    }>;
    run_terminal_command: ({ previousToolCallFinished, toolCall, requestClientToolCall, }: {
        previousToolCallFinished: Promise<void>;
        toolCall: import("@bcp/common/tools/list").CodebuffToolCall<"run_terminal_command">;
        requestClientToolCall: (toolCall: import("src").ClientToolCall<"run_terminal_command">) => Promise<import("src").CodebuffToolOutput<"run_terminal_command">>;
    }) => Promise<{
        output: import("src").CodebuffToolOutput<"run_terminal_command">;
    }>;
    set_messages: (params: {
        previousToolCallFinished: Promise<void>;
        toolCall: import("@bcp/common/tools/list").CodebuffToolCall<"set_messages">;
        agentState: import("@bcp/common/types/session-state").AgentState;
    }) => Promise<{
        output: import("src").CodebuffToolOutput<"set_messages">;
    }>;
    set_output: (params: {
        previousToolCallFinished: Promise<void>;
        toolCall: import("@bcp/common/tools/list").CodebuffToolCall<"set_output">;
        agentState: import("@bcp/common/types/session-state").AgentState;
        apiKey: string;
        databaseAgentCache: Map<string, import("@bcp/common/types/agent-template").AgentTemplate | null>;
        localAgentTemplates: Record<string, import("@bcp/common/types/agent-template").AgentTemplate>;
        logger: import("@bcp/common/types/agent-template").Logger;
        fetchAgentFromDatabase: import("@bcp/common/types/contracts/database").FetchAgentFromDatabaseFn;
    }) => Promise<{
        output: import("src").CodebuffToolOutput<"set_output">;
    }>;
    skill: (params: {
        previousToolCallFinished: Promise<void>;
        toolCall: import("@bcp/common/tools/list").CodebuffToolCall<"skill">;
        fileContext: import("@bcp/common/util/file").ProjectFileContext;
    }) => Promise<{
        output: import("src").CodebuffToolOutput<"skill">;
    }>;
    spawn_agents: (params: {
        previousToolCallFinished: Promise<void>;
        toolCall: import("@bcp/common/tools/list").CodebuffToolCall<"spawn_agents">;
        agentState: import("@bcp/common/types/session-state").AgentState;
        agentTemplate: import("@bcp/common/types/agent-template").AgentTemplate;
        fingerprintId: string;
        localAgentTemplates: Record<string, import("@bcp/common/types/agent-template").AgentTemplate>;
        logger: import("@bcp/common/types/contracts/logger").Logger;
        system: string;
        tools?: import("ai").ToolSet;
        userId: string | undefined;
        userInputId: string;
        sendSubagentChunk: import("./tool/spawn-agents").SendSubagentChunk;
        writeToClient: (chunk: string | import("src").PrintModeEvent) => void;
    } & import("@bcp/common/types/function-params").ParamsExcluding<typeof import("./tool/spawn-agent-utils").validateAndGetAgentTemplate, "agentTypeStr" | "parentAgentTemplate"> & import("@bcp/common/types/function-params").ParamsExcluding<typeof import("./tool/spawn-agent-utils").executeSubagent, "userInputId" | "prompt" | "spawnParams" | "agentTemplate" | "parentAgentState" | "agentState" | "fingerprintId" | "isOnlyChild" | "parentSystemPrompt" | "parentTools" | "onResponseChunk">) => Promise<{
        output: import("src").CodebuffToolOutput<"spawn_agents">;
    }>;
    spawn_agent_inline: (params: {
        previousToolCallFinished: Promise<void>;
        toolCall: import("@bcp/common/tools/list").CodebuffToolCall<"spawn_agent_inline">;
        agentState: import("@bcp/common/types/session-state").AgentState;
        agentTemplate: import("@bcp/common/types/agent-template").AgentTemplate;
        clientSessionId: string;
        fileContext: import("@bcp/common/util/file").ProjectFileContext;
        fingerprintId: string;
        localAgentTemplates: Record<string, import("@bcp/common/types/agent-template").AgentTemplate>;
        logger: import("@bcp/common/types/contracts/logger").Logger;
        system: string;
        tools: import("ai").ToolSet;
        userId: string | undefined;
        userInputId: string;
        writeToClient: (chunk: string | import("src").PrintModeEvent) => void;
    } & import("@bcp/common/types/function-params").ParamsExcluding<typeof import("./tool/spawn-agent-utils").executeSubagent, "userInputId" | "prompt" | "spawnParams" | "agentTemplate" | "parentAgentState" | "agentState" | "parentSystemPrompt" | "parentTools" | "onResponseChunk" | "clearUserPromptMessagesAfterResponse" | "fingerprintId">) => Promise<{
        output: import("src").CodebuffToolOutput<"spawn_agent_inline">;
    }>;
    str_replace: (params: {
        previousToolCallFinished: Promise<void>;
        toolCall: import("@bcp/common/tools/list").CodebuffToolCall<"str_replace">;
        fileProcessingState: import("./tool/write-file").FileProcessingState;
        logger: import("@bcp/common/types/contracts/logger").Logger;
        requestClientToolCall: (toolCall: import("src").ClientToolCall<"str_replace">) => Promise<import("src").CodebuffToolOutput<"str_replace">>;
        writeToClient: (chunk: string) => void;
        requestOptionalFile: import("@bcp/common/types/contracts/client").RequestOptionalFileFn;
    } & import("@bcp/common/types/function-params").ParamsExcluding<import("@bcp/common/types/contracts/client").RequestOptionalFileFn, "filePath">) => Promise<{
        output: import("src").CodebuffToolOutput<"str_replace">;
    }>;
    suggest_followups: (params: {
        previousToolCallFinished: Promise<unknown>;
        toolCall: import("@bcp/common/tools/list").CodebuffToolCall<"suggest_followups">;
        logger: import("@bcp/common/types/contracts/logger").Logger;
    }) => Promise<{
        output: import("src").CodebuffToolOutput<"suggest_followups">;
    }>;
    task_completed: ({ previousToolCallFinished, }: {
        previousToolCallFinished: Promise<any>;
        toolCall: import("@bcp/common/tools/list").CodebuffToolCall<"task_completed">;
    }) => Promise<{
        output: import("src").CodebuffToolOutput<"task_completed">;
    }>;
    think_deeply: (params: {
        previousToolCallFinished: Promise<any>;
        toolCall: import("@bcp/common/tools/list").CodebuffToolCall<"think_deeply">;
        logger: import("@bcp/common/types/contracts/logger").Logger;
    }) => Promise<{
        output: import("src").CodebuffToolOutput<"think_deeply">;
    }>;
    update_subgoal: (params: {
        previousToolCallFinished: Promise<void>;
        toolCall: import("@bcp/common/tools/list").CodebuffToolCall<"update_subgoal">;
        agentContext: Record<string, import("@bcp/common/types/session-state").Subgoal>;
    }) => Promise<{
        output: import("src").CodebuffToolOutput<"update_subgoal">;
    }>;
    web_search: (params: {
        previousToolCallFinished: Promise<void>;
        toolCall: import("@bcp/common/tools/list").CodebuffToolCall<"web_search">;
        logger: import("@bcp/common/types/contracts/logger").Logger;
        apiKey: string;
        agentStepId: string;
        clientSessionId: string;
        fingerprintId: string;
        repoId: string | undefined;
        repoUrl: string | undefined;
        userInputId: string;
        userId: string | undefined;
        fetch: typeof globalThis.fetch;
        clientEnv: import("@bcp/common/env-schema").ClientEnv;
        ciEnv: import("@bcp/common/types/contracts/env").CiEnv;
    }) => Promise<{
        output: import("src").CodebuffToolOutput<"web_search">;
        creditsUsed: number;
    }>;
    write_file: (params: {
        previousToolCallFinished: Promise<void>;
        toolCall: import("@bcp/common/tools/list").CodebuffToolCall<"write_file">;
        agentState: import("@bcp/common/types/session-state").AgentState;
        clientSessionId: string;
        fileProcessingState: import("./tool/write-file").FileProcessingState;
        fingerprintId: string;
        logger: import("@bcp/common/types/contracts/logger").Logger;
        prompt: string | undefined;
        userId: string | undefined;
        userInputId: string;
        requestClientToolCall: (toolCall: import("src").ClientToolCall<"write_file">) => Promise<import("src").CodebuffToolOutput<"write_file">>;
        requestOptionalFile: import("@bcp/common/types/contracts/client").RequestOptionalFileFn;
        writeToClient: (chunk: string) => void;
    } & import("@bcp/common/types/function-params").ParamsExcluding<import("@bcp/common/types/contracts/client").RequestOptionalFileFn, "filePath">) => Promise<{
        output: import("src").CodebuffToolOutput<"write_file">;
    }>;
    write_todos: (params: {
        previousToolCallFinished: Promise<void>;
        toolCall: import("@bcp/common/tools/list").CodebuffToolCall<"write_todos">;
    }) => Promise<{
        output: import("src").CodebuffToolOutput<"write_todos">;
    }>;
};
//# sourceMappingURL=list.d.ts.map