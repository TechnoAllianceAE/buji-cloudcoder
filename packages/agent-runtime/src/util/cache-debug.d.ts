import { type CacheDebugCorrelation } from '@bcp/common/util/cache-debug';
import type { CacheDebugUsageData } from '@bcp/common/types/contracts/llm';
import type { Logger } from '@bcp/common/types/contracts/logger';
import type { Message } from '@bcp/common/types/messages/bcp-message';
import type { ProviderMetadata } from '@bcp/common/types/messages/provider-metadata';
import type { JSONValue } from '@bcp/common/types/json';
type SerializableValue = JSONValue;
type CacheDebugMessageSnapshot = {
    role: Message['role'];
    content: SerializableValue;
    tags?: string[];
    timeToLive?: 'agentStep' | 'userPrompt';
    sentAt?: number;
    providerOptions?: ProviderMetadata;
    toolCallId?: string;
    toolName?: string;
};
type CacheDebugPreConversionSnapshot = {
    systemPrompt: string;
    toolDefinitions: Record<string, unknown>;
    messages: CacheDebugMessageSnapshot[];
};
type CacheDebugProviderRequestSnapshot = {
    provider: string;
    rawBody: SerializableValue;
    normalized: SerializableValue;
};
export type CacheDebugSnapshot = {
    id: string;
    index: number;
    filename: string;
    filePath: string;
    timestamp: string;
    agentType: string;
    runId?: string;
    userInputId?: string;
    agentStepId?: string;
    model?: string;
    systemHash?: string;
    toolsHash?: string;
    preConversion: CacheDebugPreConversionSnapshot;
    providerRequest?: CacheDebugProviderRequestSnapshot;
    usage?: CacheDebugUsageData;
};
export declare function createCacheDebugSnapshot(params: {
    agentType: string;
    system: string;
    toolDefinitions: Record<string, unknown>;
    messages: Message[];
    logger: Logger;
    projectRoot: string;
    runId?: string;
    userInputId?: string;
    agentStepId?: string;
    model?: string;
}): CacheDebugCorrelation;
export declare function enrichCacheDebugSnapshotWithUsage(params: {
    correlation: CacheDebugCorrelation;
    usage: CacheDebugUsageData;
    logger: Logger;
}): void;
export declare function enrichCacheDebugSnapshotWithProviderRequest(params: {
    correlation: CacheDebugCorrelation;
    provider: string;
    rawBody: unknown;
    normalized: unknown;
    logger: Logger;
}): void;
export {};
//# sourceMappingURL=cache-debug.d.ts.map