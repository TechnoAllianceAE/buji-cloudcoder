import type { Logger } from '../types/contracts/logger';
import type { JSONValue } from '../types/json';
import type { AssistantMessage, Message, SystemMessage, UserMessage } from '../types/messages/bcp-message';
import type { ToolResultOutput } from '../types/messages/content-part';
import type { ProviderMetadata } from '../types/messages/provider-metadata';
import type { ModelMessage } from 'ai';
export declare function toContentString(msg: ModelMessage): string;
export declare function withCacheControl<T extends {
    providerOptions?: ProviderMetadata;
}>(obj: T): T;
export declare function withoutCacheControl<T extends {
    providerOptions?: ProviderMetadata;
}>(obj: T): T;
export declare function convertCbToModelMessages({ messages, includeCacheControl, logger, }: {
    messages: Message[];
    includeCacheControl?: boolean;
    logger?: Logger;
}): ModelMessage[];
export type SystemContent = string | SystemMessage['content'][number] | SystemMessage['content'];
export declare function systemContent(content: SystemContent): SystemMessage['content'];
export declare function systemMessage(params: SystemContent | ({
    content: SystemContent;
} & Omit<SystemMessage, 'role' | 'content'>)): SystemMessage;
export type UserContent = string | UserMessage['content'][number] | UserMessage['content'];
export declare function userContent(content: UserContent): UserMessage['content'];
export declare function userMessage(params: UserContent | ({
    content: UserContent;
} & Omit<UserMessage, 'role' | 'content'>)): UserMessage;
export type AssistantContent = string | AssistantMessage['content'][number] | AssistantMessage['content'];
export declare function assistantContent(content: AssistantContent): AssistantMessage['content'];
export declare function assistantMessage(params: AssistantContent | ({
    content: AssistantContent;
} & Omit<AssistantMessage, 'role' | 'content'>)): AssistantMessage;
export declare function jsonToolResult<T extends JSONValue>(value: T): [
    Extract<ToolResultOutput, {
        type: 'json';
    }> & {
        value: T;
    }
];
export declare function mediaToolResult(params: {
    data: string;
    mediaType: string;
}): [Extract<ToolResultOutput, {
    type: 'media';
}>];
//# sourceMappingURL=messages.d.ts.map