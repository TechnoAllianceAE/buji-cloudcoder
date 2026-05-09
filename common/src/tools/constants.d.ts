import type { ToolResultOutput } from '../types/messages/content-part';
import type { Tool } from 'ai';
export declare const toolNameParam = "cb_tool_name";
export declare const endsAgentStepParam = "cb_easp";
export declare const toolXmlName = "bcp_tool_call";
export declare const startToolTag = "<bcp_tool_call>\n";
export declare const endToolTag = "\n</bcp_tool_call>";
export declare const TOOLS_WHICH_WONT_FORCE_NEXT_STEP: string[];
export declare const toolNames: readonly ["apply_patch", "add_subgoal", "add_message", "ask_user", "browser_logs", "code_search", "create_plan", "end_turn", "find_files", "glob", "list_directory", "lookup_agent_info", "propose_str_replace", "propose_write_file", "read_docs", "read_files", "read_subtree", "run_file_change_hooks", "run_terminal_command", "set_messages", "set_output", "skill", "spawn_agents", "spawn_agent_inline", "str_replace", "suggest_followups", "task_completed", "think_deeply", "update_subgoal", "web_search", "write_file", "write_todos"];
export declare const publishedTools: readonly ["apply_patch", "add_message", "ask_user", "code_search", "end_turn", "find_files", "glob", "list_directory", "lookup_agent_info", "propose_str_replace", "propose_write_file", "read_docs", "read_files", "read_subtree", "run_file_change_hooks", "run_terminal_command", "set_messages", "set_output", "skill", "spawn_agents", "str_replace", "suggest_followups", "task_completed", "think_deeply", "web_search", "write_file", "write_todos"];
export type ToolName = (typeof toolNames)[number];
export type PublishedToolName = (typeof publishedTools)[number];
/** Only used for validating tool definitions */
export type $ToolParams<T extends ToolName = ToolName> = Required<Pick<Tool<any, ToolResultOutput[]>, 'description' | 'inputSchema' | 'outputSchema'>> & {
    toolName: T;
    endsAgentStep: boolean;
};
//# sourceMappingURL=constants.d.ts.map