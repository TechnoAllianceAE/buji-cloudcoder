import type { AgentTemplate } from './templates/types';
import type { TrackEventFn } from '@bcp/common/types/contracts/analytics';
import type { SendActionFn } from '@bcp/common/types/contracts/client';
import type { CacheDebugUsageData, PromptAiSdkStreamFn } from '@bcp/common/types/contracts/llm';
import type { Logger } from '@bcp/common/types/contracts/logger';
import type { Message } from '@bcp/common/types/messages/bcp-message';
import type { ToolSet } from 'ai';
export declare const getAgentStreamFromTemplate: (params: {
    agentId?: string;
    apiKey: string;
    clientSessionId: string;
    costMode?: string;
    fingerprintId: string;
    includeCacheControl?: boolean;
    localAgentTemplates: Record<string, AgentTemplate>;
    logger: Logger;
    messages: Message[];
    runId: string;
    signal: AbortSignal;
    template: AgentTemplate;
    tools: ToolSet;
    userId: string | undefined;
    userInputId: string;
    cacheDebugCorrelation?: string;
    onCacheDebugProviderRequestBuilt?: (params: {
        provider: string;
        rawBody: unknown;
        normalizedBody?: unknown;
    }) => void;
    onCacheDebugUsageReceived?: (usage: CacheDebugUsageData) => void;
    onCostCalculated?: (credits: number) => Promise<void>;
    promptAiSdkStream: PromptAiSdkStreamFn;
    sendAction: SendActionFn;
    trackEvent: TrackEventFn;
}) => ReturnType<PromptAiSdkStreamFn>;
//# sourceMappingURL=prompt-agent-stream.d.ts.map