export type ParsedToolCallFromText = {
    type: 'tool_call';
    toolName: string;
    input: Record<string, unknown>;
};
export type ParsedTextSegment = {
    type: 'text';
    text: string;
};
export type ParsedSegment = ParsedToolCallFromText | ParsedTextSegment;
/**
 * Parses text containing tool calls in the <bcp_tool_call> XML format,
 * returning interleaved text and tool call segments in order.
 *
 * Example input:
 * ```
 * Some text before
 * <bcp_tool_call>
 * {
 *   "cb_tool_name": "read_files",
 *   "paths": ["file.ts"]
 * }
 * </bcp_tool_call>
 * Some text after
 * ```
 *
 * @param text - The text containing tool calls in XML format
 * @returns Array of segments (text and tool calls) in order of appearance
 */
export declare function parseTextWithToolCalls(text: string): ParsedSegment[];
/**
 * Parses tool calls from text in the <bcp_tool_call> XML format.
 * This is a convenience function that returns only tool calls (no text segments).
 *
 * @param text - The text containing tool calls in XML format
 * @returns Array of parsed tool calls with toolName and input
 */
export declare function parseToolCallsFromText(text: string): Omit<ParsedToolCallFromText, 'type'>[];
//# sourceMappingURL=parse-tool-calls-from-text.d.ts.map