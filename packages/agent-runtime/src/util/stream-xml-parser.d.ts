/**
 * Stateful stream XML parser that extracts tool calls from <bcp_tool_call> XML
 * and filters them out of the text stream.
 *
 * Handles partial tags at chunk boundaries using a stateful approach.
 */
export type ParsedToolCall = {
    toolName: string;
    input: Record<string, unknown>;
};
export type StreamParserState = {
    /** Buffer for holding partial content when inside a tool call tag or at boundaries */
    buffer: string;
    /** Whether we're currently inside a tool call tag */
    insideToolCall: boolean;
};
export type ParseResult = {
    /** Filtered text with tool call XML removed */
    filteredText: string;
    /** Tool calls extracted from this chunk */
    toolCalls: ParsedToolCall[];
};
/**
 * Creates initial parser state
 */
export declare function createStreamParserState(): StreamParserState;
/**
 * Parses a stream chunk, extracting tool calls and filtering out the XML.
 *
 * @param chunk - The incoming text chunk
 * @param state - Mutable parser state (updated in place)
 * @returns Filtered text and any extracted tool calls
 */
export declare function parseStreamChunk(chunk: string, state: StreamParserState): ParseResult;
//# sourceMappingURL=stream-xml-parser.d.ts.map