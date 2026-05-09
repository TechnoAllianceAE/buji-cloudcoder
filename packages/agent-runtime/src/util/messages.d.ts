import type { System } from '../llm-api/claude';
import type { Logger } from '@bcp/common/types/contracts/logger';
import type { Message } from '@bcp/common/types/messages/bcp-message';
import type { TextPart, ImagePart } from '@bcp/common/types/messages/content-part';
export declare function messagesWithSystem(params: {
    messages: Message[];
    system: System;
}): Message[];
export declare function asUserMessage(str: string): string;
/**
 * Combines prompt, params, and content into a unified message content structure.
 * Always wraps the first text part in <user_message> tags for consistent XML framing.
 * If you need a specific text part wrapped, put it first or pre-wrap it yourself before calling.
 */
export declare function buildUserMessageContent(prompt: string | undefined, params: Record<string, any> | undefined, content?: Array<TextPart | ImagePart>): Array<TextPart | ImagePart>;
export declare function parseUserMessage(str: string): string | undefined;
export declare function withSystemInstructionTags(str: string): string;
export declare function withSystemTags(str: string): string;
export declare function castAssistantMessage(message: Message): Message | null;
/**
 * Trims messages from the beginning to fit within token limits while preserving
 * important content. Also simplifies terminal command outputs to save tokens.
 *
 * The function:
 * 1. Processes messages from newest to oldest
 * 2. Simplifies terminal command outputs after keeping N most recent ones
 * 3. Stops adding messages when approaching token limit
 *
 * @param messages - Array of messages to trim
 * @param systemTokens - Number of tokens used by system prompt
 * @param maxTotalTokens - Maximum total tokens allowed, defaults to 200k
 * @returns Trimmed array of messages that fits within token limit
 */
export declare function trimMessagesToFitTokenLimit(params: {
    messages: Message[];
    systemTokens: number;
    maxTotalTokens?: number;
    logger: Logger;
}): Message[];
export declare function getMessagesSubset(params: {
    messages: Message[];
    otherTokens: number;
    logger: Logger;
}): Message[];
export declare function expireMessages(messages: Message[], endOf: 'agentStep' | 'userPrompt'): Message[];
/**
 * Removes tool calls from the message history that don't have corresponding tool responses.
 * This is important when passing message history to spawned agents, as unfinished tool calls
 * will cause issues with the LLM expecting tool responses.
 *
 * The function:
 * 1. Collects all toolCallIds from tool response messages
 * 2. Filters assistant messages to remove tool-call content parts without responses
 * 3. Removes assistant messages that become empty after filtering
 */
export declare function filterUnfinishedToolCalls(messages: Message[]): Message[];
export declare function getEditedFiles(params: {
    messages: Message[];
    logger: Logger;
}): string[];
export declare function getPreviouslyReadFiles(params: {
    messages: Message[];
    logger: Logger;
}): {
    path: string;
    content: string;
    referencedBy?: Record<string, string[]>;
}[];
//# sourceMappingURL=messages.d.ts.map