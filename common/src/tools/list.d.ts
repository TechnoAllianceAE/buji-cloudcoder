import z from 'zod/v4';
import type { PublishedToolName, ToolName } from './constants';
import type { ToolMessage } from '../types/messages/bcp-message';
import type { ToolCallPart } from '../types/messages/content-part';
export declare const toolParams: {
    add_message: {
        toolName: "add_message";
        endsAgentStep: true;
        description: string;
        inputSchema: z.ZodObject<{
            role: z.ZodEnum<{
                user: "user";
                assistant: "assistant";
            }>;
            content: z.ZodString;
        }, z.core.$strip>;
        outputSchema: z.ZodTuple<[z.ZodObject<{
            type: z.ZodLiteral<"json">;
            value: z.ZodObject<{
                message: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>], null>;
    };
    add_subgoal: {
        toolName: "add_subgoal";
        endsAgentStep: false;
        description: string;
        inputSchema: z.ZodObject<{
            id: z.ZodString;
            objective: z.ZodString;
            status: z.ZodEnum<{
                NOT_STARTED: "NOT_STARTED";
                IN_PROGRESS: "IN_PROGRESS";
                COMPLETE: "COMPLETE";
                ABORTED: "ABORTED";
            }>;
            plan: z.ZodOptional<z.ZodString>;
            log: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
        outputSchema: z.ZodTuple<[z.ZodObject<{
            type: z.ZodLiteral<"json">;
            value: z.ZodType<{
                message: string;
            }, unknown, z.core.$ZodTypeInternals<{
                message: string;
            }, unknown>>;
        }, z.core.$strip>], null>;
    };
    apply_patch: {
        toolName: "apply_patch";
        endsAgentStep: false;
        description: string;
        inputSchema: z.ZodObject<{
            operation: z.ZodDiscriminatedUnion<[z.ZodObject<{
                type: z.ZodLiteral<"create_file">;
                path: z.ZodString;
                diff: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"update_file">;
                path: z.ZodString;
                diff: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                type: z.ZodLiteral<"delete_file">;
                path: z.ZodString;
            }, z.core.$strip>], "type">;
        }, z.core.$strip>;
        outputSchema: z.ZodTuple<[z.ZodObject<{
            type: z.ZodLiteral<"json">;
            value: z.ZodType<{
                message: string;
                applied: {
                    file: string;
                    action: "delete" | "add" | "update";
                }[];
            } | {
                errorMessage: string;
            }, unknown, z.core.$ZodTypeInternals<{
                message: string;
                applied: {
                    file: string;
                    action: "delete" | "add" | "update";
                }[];
            } | {
                errorMessage: string;
            }, unknown>>;
        }, z.core.$strip>], null>;
    };
    ask_user: {
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
    browser_logs: {
        toolName: "browser_logs";
        endsAgentStep: true;
        description: string;
        inputSchema: z.ZodObject<{
            type: z.ZodString;
            url: z.ZodString;
            waitUntil: z.ZodOptional<z.ZodEnum<{
                networkidle0: "networkidle0";
                load: "load";
                domcontentloaded: "domcontentloaded";
            }>>;
        }, z.core.$strip>;
        outputSchema: z.ZodTuple<[z.ZodObject<{
            type: z.ZodLiteral<"json">;
            value: z.ZodType<{
                success: boolean;
                logs: {
                    type: "error" | "debug" | "info" | "warning" | "verbose";
                    message: string;
                    timestamp: number;
                    source: "tool" | "browser";
                    location?: string;
                    stack?: string;
                    category?: string;
                    level?: number;
                }[];
                error?: string;
                logFilter?: {
                    types?: ("error" | "debug" | "info" | "warning" | "verbose")[];
                    minLevel?: number;
                    categories?: string[];
                };
                networkEvents?: {
                    url: string;
                    method: string;
                    timestamp: number;
                    status?: number;
                    errorText?: string;
                }[];
                metrics?: {
                    loadTime: number;
                    memoryUsage: number;
                    jsErrors: number;
                    networkErrors: number;
                    ttfb?: number;
                    lcp?: number;
                    fcp?: number;
                    domContentLoaded?: number;
                    sessionDuration?: number;
                };
                screenshots?: {
                    post: {
                        type: "image";
                        source: {
                            type: "base64";
                            media_type: "image/jpeg";
                            data: string;
                        };
                    };
                    pre?: {
                        type: "image";
                        source: {
                            type: "base64";
                            media_type: "image/jpeg";
                            data: string;
                        };
                    };
                };
            }, unknown, z.core.$ZodTypeInternals<{
                success: boolean;
                logs: {
                    type: "error" | "debug" | "info" | "warning" | "verbose";
                    message: string;
                    timestamp: number;
                    source: "tool" | "browser";
                    location?: string;
                    stack?: string;
                    category?: string;
                    level?: number;
                }[];
                error?: string;
                logFilter?: {
                    types?: ("error" | "debug" | "info" | "warning" | "verbose")[];
                    minLevel?: number;
                    categories?: string[];
                };
                networkEvents?: {
                    url: string;
                    method: string;
                    timestamp: number;
                    status?: number;
                    errorText?: string;
                }[];
                metrics?: {
                    loadTime: number;
                    memoryUsage: number;
                    jsErrors: number;
                    networkErrors: number;
                    ttfb?: number;
                    lcp?: number;
                    fcp?: number;
                    domContentLoaded?: number;
                    sessionDuration?: number;
                };
                screenshots?: {
                    post: {
                        type: "image";
                        source: {
                            type: "base64";
                            media_type: "image/jpeg";
                            data: string;
                        };
                    };
                    pre?: {
                        type: "image";
                        source: {
                            type: "base64";
                            media_type: "image/jpeg";
                            data: string;
                        };
                    };
                };
            }, unknown>>;
        }, z.core.$strip>], null>;
    };
    code_search: {
        toolName: "code_search";
        endsAgentStep: true;
        description: string;
        inputSchema: z.ZodObject<{
            pattern: z.ZodString;
            flags: z.ZodOptional<z.ZodString>;
            cwd: z.ZodOptional<z.ZodString>;
            maxResults: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        }, z.core.$strip>;
        outputSchema: z.ZodTuple<[z.ZodObject<{
            type: z.ZodLiteral<"json">;
            value: z.ZodType<{
                stdout: string;
                message: string;
                stderr?: string;
                exitCode?: number;
            } | {
                errorMessage: string;
            }, unknown, z.core.$ZodTypeInternals<{
                stdout: string;
                message: string;
                stderr?: string;
                exitCode?: number;
            } | {
                errorMessage: string;
            }, unknown>>;
        }, z.core.$strip>], null>;
    };
    create_plan: {
        toolName: "create_plan";
        endsAgentStep: false;
        description: string;
        inputSchema: z.ZodObject<{
            path: z.ZodString;
            plan: z.ZodString;
        }, z.core.$strip>;
        outputSchema: z.ZodTuple<[z.ZodObject<{
            type: z.ZodLiteral<"json">;
            value: z.ZodType<{
                file: string;
                message: string;
                unifiedDiff: string;
            } | {
                file: string;
                errorMessage: string;
                patch?: string;
            }, unknown, z.core.$ZodTypeInternals<{
                file: string;
                message: string;
                unifiedDiff: string;
            } | {
                file: string;
                errorMessage: string;
                patch?: string;
            }, unknown>>;
        }, z.core.$strip>], null>;
    };
    end_turn: {
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
    find_files: {
        toolName: "find_files";
        endsAgentStep: true;
        description: string;
        inputSchema: z.ZodObject<{
            prompt: z.ZodString;
        }, z.core.$strip>;
        outputSchema: z.ZodTuple<[z.ZodObject<{
            type: z.ZodLiteral<"json">;
            value: z.ZodType<({
                path: string;
                content: string;
                referencedBy?: Record<string, string[]>;
            } | {
                path: string;
                contentOmittedForLength: true;
            })[] | {
                message: string;
            }, unknown, z.core.$ZodTypeInternals<({
                path: string;
                content: string;
                referencedBy?: Record<string, string[]>;
            } | {
                path: string;
                contentOmittedForLength: true;
            })[] | {
                message: string;
            }, unknown>>;
        }, z.core.$strip>], null>;
    };
    glob: {
        toolName: "glob";
        description: string;
        endsAgentStep: false;
        inputSchema: z.ZodObject<{
            pattern: z.ZodString;
            cwd: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
        outputSchema: z.ZodTuple<[z.ZodObject<{
            type: z.ZodLiteral<"json">;
            value: z.ZodType<{
                files: string[];
                count: number;
                message: string;
            } | {
                errorMessage: string;
            }, unknown, z.core.$ZodTypeInternals<{
                files: string[];
                count: number;
                message: string;
            } | {
                errorMessage: string;
            }, unknown>>;
        }, z.core.$strip>], null>;
    };
    list_directory: {
        toolName: "list_directory";
        endsAgentStep: true;
        description: string;
        inputSchema: z.ZodObject<{
            path: z.ZodString;
        }, z.core.$strip>;
        outputSchema: z.ZodTuple<[z.ZodObject<{
            type: z.ZodLiteral<"json">;
            value: z.ZodType<{
                files: string[];
                directories: string[];
                path: string;
            } | {
                errorMessage: string;
            }, unknown, z.core.$ZodTypeInternals<{
                files: string[];
                directories: string[];
                path: string;
            } | {
                errorMessage: string;
            }, unknown>>;
        }, z.core.$strip>], null>;
    };
    lookup_agent_info: {
        toolName: "lookup_agent_info";
        endsAgentStep: false;
        description: string;
        inputSchema: z.ZodObject<{
            agentId: z.ZodString;
        }, z.core.$strip>;
        outputSchema: z.ZodTuple<[z.ZodObject<{
            type: z.ZodLiteral<"json">;
            value: z.ZodType<import("src").JSONValue, unknown, z.core.$ZodTypeInternals<import("src").JSONValue, unknown>>;
        }, z.core.$strip>], null>;
    };
    propose_str_replace: {
        toolName: "propose_str_replace";
        endsAgentStep: false;
        description: string;
        inputSchema: z.ZodObject<{
            path: z.ZodString;
            replacements: z.ZodArray<z.ZodObject<{
                old: z.ZodString;
                new: z.ZodString;
                allowMultiple: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
        outputSchema: z.ZodTuple<[z.ZodObject<{
            type: z.ZodLiteral<"json">;
            value: z.ZodType<{
                file: string;
                message: string;
                unifiedDiff: string;
            } | {
                file: string;
                errorMessage: string;
            }, unknown, z.core.$ZodTypeInternals<{
                file: string;
                message: string;
                unifiedDiff: string;
            } | {
                file: string;
                errorMessage: string;
            }, unknown>>;
        }, z.core.$strip>], null>;
    };
    propose_write_file: {
        toolName: "propose_write_file";
        endsAgentStep: false;
        description: string;
        inputSchema: z.ZodObject<{
            path: z.ZodString;
            instructions: z.ZodString;
            content: z.ZodString;
        }, z.core.$strip>;
        outputSchema: z.ZodTuple<[z.ZodObject<{
            type: z.ZodLiteral<"json">;
            value: z.ZodType<{
                file: string;
                message: string;
                unifiedDiff: string;
            } | {
                file: string;
                errorMessage: string;
            }, unknown, z.core.$ZodTypeInternals<{
                file: string;
                message: string;
                unifiedDiff: string;
            } | {
                file: string;
                errorMessage: string;
            }, unknown>>;
        }, z.core.$strip>], null>;
    };
    read_docs: {
        toolName: "read_docs";
        endsAgentStep: true;
        description: string;
        inputSchema: z.ZodObject<{
            libraryTitle: z.ZodString;
            topic: z.ZodString;
            max_tokens: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
        }, z.core.$strip>;
        outputSchema: z.ZodTuple<[z.ZodObject<{
            type: z.ZodLiteral<"json">;
            value: z.ZodType<{
                documentation: string;
            }, unknown, z.core.$ZodTypeInternals<{
                documentation: string;
            }, unknown>>;
        }, z.core.$strip>], null>;
    };
    read_files: {
        toolName: "read_files";
        endsAgentStep: true;
        description: string;
        inputSchema: z.ZodObject<{
            paths: z.ZodArray<z.ZodString>;
        }, z.core.$strip>;
        outputSchema: z.ZodTuple<[z.ZodObject<{
            type: z.ZodLiteral<"json">;
            value: z.ZodType<({
                path: string;
                content: string;
                referencedBy?: Record<string, string[]>;
            } | {
                path: string;
                contentOmittedForLength: true;
            })[], unknown, z.core.$ZodTypeInternals<({
                path: string;
                content: string;
                referencedBy?: Record<string, string[]>;
            } | {
                path: string;
                contentOmittedForLength: true;
            })[], unknown>>;
        }, z.core.$strip>], null>;
    };
    read_subtree: {
        toolName: "read_subtree";
        endsAgentStep: true;
        description: string;
        inputSchema: z.ZodObject<{
            paths: z.ZodOptional<z.ZodArray<z.ZodString>>;
            maxTokens: z.ZodDefault<z.ZodNumber>;
        }, z.core.$strip>;
        outputSchema: z.ZodTuple<[z.ZodObject<{
            type: z.ZodLiteral<"json">;
            value: z.ZodType<({
                path: string;
                type: "directory";
                printedTree: string;
                tokenCount: number;
                truncationLevel: "none" | "tokens" | "unimportant-files" | "depth-based";
            } | {
                path: string;
                type: "file";
                variables: string[];
            } | {
                path: string;
                errorMessage: string;
            })[], unknown, z.core.$ZodTypeInternals<({
                path: string;
                type: "directory";
                printedTree: string;
                tokenCount: number;
                truncationLevel: "none" | "tokens" | "unimportant-files" | "depth-based";
            } | {
                path: string;
                type: "file";
                variables: string[];
            } | {
                path: string;
                errorMessage: string;
            })[], unknown>>;
        }, z.core.$strip>], null>;
    };
    run_file_change_hooks: {
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
    run_terminal_command: {
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
    set_messages: {
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
    set_output: {
        toolName: "set_output";
        endsAgentStep: false;
        description: string;
        inputSchema: z.ZodObject<{
            data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, z.core.$loose>;
        outputSchema: z.ZodTuple<[z.ZodObject<{
            type: z.ZodLiteral<"json">;
            value: z.ZodObject<{
                message: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>], null>;
    };
    skill: {
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
    spawn_agents: {
        toolName: "spawn_agents";
        endsAgentStep: true;
        description: string;
        inputSchema: z.ZodObject<{
            agents: z.ZodArray<z.ZodObject<{
                agent_type: z.ZodString;
                prompt: z.ZodOptional<z.ZodString>;
                params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
        outputSchema: z.ZodTuple<[z.ZodObject<{
            type: z.ZodLiteral<"json">;
            value: z.ZodType<({
                agentType: string;
            } & import("src").JSONObject)[], unknown, z.core.$ZodTypeInternals<({
                agentType: string;
            } & import("src").JSONObject)[], unknown>>;
        }, z.core.$strip>], null>;
    };
    spawn_agent_inline: {
        toolName: "spawn_agent_inline";
        endsAgentStep: true;
        description: string;
        inputSchema: z.ZodObject<{
            agent_type: z.ZodString;
            prompt: z.ZodOptional<z.ZodString>;
            params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, z.core.$strip>;
        outputSchema: z.ZodTuple<[z.ZodObject<{
            type: z.ZodLiteral<"json">;
            value: z.ZodObject<{
                message: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>], null>;
    };
    str_replace: {
        toolName: "str_replace";
        endsAgentStep: false;
        description: string;
        inputSchema: z.ZodObject<{
            path: z.ZodString;
            replacements: z.ZodArray<z.ZodObject<{
                old: z.ZodString;
                new: z.ZodString;
                allowMultiple: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
        outputSchema: z.ZodTuple<[z.ZodObject<{
            type: z.ZodLiteral<"json">;
            value: z.ZodType<{
                file: string;
                message: string;
                unifiedDiff: string;
            } | {
                file: string;
                errorMessage: string;
                patch?: string;
            }, unknown, z.core.$ZodTypeInternals<{
                file: string;
                message: string;
                unifiedDiff: string;
            } | {
                file: string;
                errorMessage: string;
                patch?: string;
            }, unknown>>;
        }, z.core.$strip>], null>;
    };
    suggest_followups: {
        toolName: "suggest_followups";
        endsAgentStep: false;
        description: string;
        inputSchema: z.ZodObject<{
            followups: z.ZodArray<z.ZodObject<{
                prompt: z.ZodString;
                label: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
        outputSchema: z.ZodTuple<[z.ZodObject<{
            type: z.ZodLiteral<"json">;
            value: z.ZodType<{
                message: string;
            }, unknown, z.core.$ZodTypeInternals<{
                message: string;
            }, unknown>>;
        }, z.core.$strip>], null>;
    };
    task_completed: {
        toolName: "task_completed";
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
    think_deeply: {
        toolName: "think_deeply";
        endsAgentStep: false;
        description: string;
        inputSchema: z.ZodObject<{
            thought: z.ZodString;
        }, z.core.$strip>;
        outputSchema: z.ZodTuple<[z.ZodObject<{
            type: z.ZodLiteral<"json">;
            value: z.ZodObject<{
                message: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>], null>;
    };
    update_subgoal: {
        toolName: "update_subgoal";
        endsAgentStep: false;
        description: string;
        inputSchema: z.ZodObject<{
            id: z.ZodString;
            status: z.ZodOptional<z.ZodEnum<{
                NOT_STARTED: "NOT_STARTED";
                IN_PROGRESS: "IN_PROGRESS";
                COMPLETE: "COMPLETE";
                ABORTED: "ABORTED";
            }>>;
            plan: z.ZodOptional<z.ZodString>;
            log: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
        outputSchema: z.ZodTuple<[z.ZodObject<{
            type: z.ZodLiteral<"json">;
            value: z.ZodType<{
                message: string;
            }, unknown, z.core.$ZodTypeInternals<{
                message: string;
            }, unknown>>;
        }, z.core.$strip>], null>;
    };
    web_search: {
        toolName: "web_search";
        endsAgentStep: true;
        description: string;
        inputSchema: z.ZodObject<{
            query: z.ZodString;
            depth: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
                standard: "standard";
                deep: "deep";
            }>>>;
        }, z.core.$strip>;
        outputSchema: z.ZodTuple<[z.ZodObject<{
            type: z.ZodLiteral<"json">;
            value: z.ZodType<{
                result: string;
            } | {
                errorMessage: string;
            }, unknown, z.core.$ZodTypeInternals<{
                result: string;
            } | {
                errorMessage: string;
            }, unknown>>;
        }, z.core.$strip>], null>;
    };
    write_file: {
        toolName: "write_file";
        endsAgentStep: false;
        description: string;
        inputSchema: z.ZodObject<{
            path: z.ZodString;
            instructions: z.ZodString;
            content: z.ZodString;
        }, z.core.$strip>;
        outputSchema: z.ZodTuple<[z.ZodObject<{
            type: z.ZodLiteral<"json">;
            value: z.ZodType<{
                file: string;
                message: string;
                unifiedDiff: string;
            } | {
                file: string;
                errorMessage: string;
                patch?: string;
            }, unknown, z.core.$ZodTypeInternals<{
                file: string;
                message: string;
                unifiedDiff: string;
            } | {
                file: string;
                errorMessage: string;
                patch?: string;
            }, unknown>>;
        }, z.core.$strip>], null>;
    };
    write_todos: {
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
};
export type BCPToolCall<T extends ToolName = ToolName> = {
    [K in ToolName]: {
        toolName: K;
        input: z.infer<(typeof toolParams)[K]['inputSchema']>;
    } & Omit<ToolCallPart, 'type'>;
}[T];
export type BCPToolOutput<T extends ToolName = ToolName> = {
    [K in ToolName]: K extends ToolName ? z.infer<(typeof toolParams)[K]['outputSchema']> : never;
}[T];
export type BCPToolMessage<T extends ToolName = ToolName> = ToolMessage & {
    content: BCPToolOutput<T>;
};
/** @deprecated Use BCPToolCall instead */
export type CodebuffToolCall<T extends ToolName = ToolName> = BCPToolCall<T>;
/** @deprecated Use BCPToolOutput instead */
export type CodebuffToolOutput<T extends ToolName = ToolName> = BCPToolOutput<T>;
/** @deprecated Use BCPToolMessage instead */
export type CodebuffToolMessage<T extends ToolName = ToolName> = BCPToolMessage<T>;
export declare const clientToolCallSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    toolName: z.ZodLiteral<"apply_patch">;
    input: z.ZodObject<{
        operation: z.ZodDiscriminatedUnion<[z.ZodObject<{
            type: z.ZodLiteral<"create_file">;
            path: z.ZodString;
            diff: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"update_file">;
            path: z.ZodString;
            diff: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"delete_file">;
            path: z.ZodString;
        }, z.core.$strip>], "type">;
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodObject<{
    toolName: z.ZodLiteral<"ask_user">;
    input: z.ZodObject<{
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
}, z.core.$strip>, z.ZodObject<{
    toolName: z.ZodLiteral<"browser_logs">;
    input: z.ZodObject<{
        type: z.ZodString;
        url: z.ZodString;
        waitUntil: z.ZodOptional<z.ZodEnum<{
            networkidle0: "networkidle0";
            load: "load";
            domcontentloaded: "domcontentloaded";
        }>>;
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodObject<{
    toolName: z.ZodLiteral<"code_search">;
    input: z.ZodObject<{
        pattern: z.ZodString;
        flags: z.ZodOptional<z.ZodString>;
        cwd: z.ZodOptional<z.ZodString>;
        maxResults: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodObject<{
    toolName: z.ZodLiteral<"create_plan">;
    input: z.ZodObject<{
        type: z.ZodEnum<{
            file: "file";
            patch: "patch";
        }>;
        path: z.ZodString;
        content: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodObject<{
    toolName: z.ZodLiteral<"glob">;
    input: z.ZodObject<{
        pattern: z.ZodString;
        cwd: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodObject<{
    toolName: z.ZodLiteral<"list_directory">;
    input: z.ZodObject<{
        path: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodObject<{
    toolName: z.ZodLiteral<"run_file_change_hooks">;
    input: z.ZodObject<{
        files: z.ZodArray<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodObject<{
    toolName: z.ZodLiteral<"run_terminal_command">;
    input: z.ZodIntersection<z.ZodObject<{
        command: z.ZodString;
        process_type: z.ZodDefault<z.ZodEnum<{
            SYNC: "SYNC";
            BACKGROUND: "BACKGROUND";
        }>>;
        cwd: z.ZodOptional<z.ZodString>;
        timeout_seconds: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    }, z.core.$strip>, z.ZodObject<{
        mode: z.ZodEnum<{
            user: "user";
            assistant: "assistant";
        }>;
    }, z.core.$strip>>;
}, z.core.$strip>, z.ZodObject<{
    toolName: z.ZodLiteral<"str_replace">;
    input: z.ZodObject<{
        type: z.ZodEnum<{
            file: "file";
            patch: "patch";
        }>;
        path: z.ZodString;
        content: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodObject<{
    toolName: z.ZodLiteral<"write_file">;
    input: z.ZodObject<{
        type: z.ZodEnum<{
            file: "file";
            patch: "patch";
        }>;
        path: z.ZodString;
        content: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>], "toolName">;
export declare const clientToolNames: ("glob" | "create_plan" | "apply_patch" | "ask_user" | "browser_logs" | "code_search" | "list_directory" | "run_file_change_hooks" | "run_terminal_command" | "str_replace" | "write_file")[];
export type ClientToolName = (typeof clientToolNames)[number];
export type ClientToolCall<T extends ClientToolName = ClientToolName> = Extract<z.infer<typeof clientToolCallSchema>, {
    toolName: T;
}> & Pick<ToolCallPart, 'toolCallId' | 'toolName' | 'input' | 'providerOptions'>;
export type PublishedClientToolName = ClientToolName & PublishedToolName;
//# sourceMappingURL=list.d.ts.map