import type { TrackEventFn } from './analytics';
import type { ConsumeCreditsWithFallbackFn } from './billing';
import type { HandleStepsLogChunkFn, RequestFilesFn, RequestMcpToolDataFn, RequestOptionalFileFn, RequestToolCallFn, SendActionFn, SendSubagentChunkFn } from './client';
import type { AddAgentStepFn, DatabaseAgentCache, FetchAgentFromDatabaseFn, FinishAgentRunFn, GetUserInfoFromApiKeyFn, StartAgentRunFn } from './database';
import type { ClientEnv, CiEnv } from './env';
import type { PromptAiSdkFn, PromptAiSdkStreamFn, PromptAiSdkStructuredFn } from './llm';
import type { Logger } from './logger';
/** Shared dependencies */
export type AgentRuntimeDeps = {
    clientEnv: ClientEnv;
    ciEnv: CiEnv;
    getUserInfoFromApiKey: GetUserInfoFromApiKeyFn;
    fetchAgentFromDatabase: FetchAgentFromDatabaseFn;
    startAgentRun: StartAgentRunFn;
    finishAgentRun: FinishAgentRunFn;
    addAgentStep: AddAgentStepFn;
    consumeCreditsWithFallback: ConsumeCreditsWithFallbackFn;
    promptAiSdkStream: PromptAiSdkStreamFn;
    promptAiSdk: PromptAiSdkFn;
    promptAiSdkStructured: PromptAiSdkStructuredFn;
    databaseAgentCache: DatabaseAgentCache;
    trackEvent: TrackEventFn;
    logger: Logger;
    fetch: typeof globalThis.fetch;
};
/** Per-run dependencies */
export type AgentRuntimeScopedDeps = {
    handleStepsLogChunk: HandleStepsLogChunkFn;
    requestToolCall: RequestToolCallFn;
    requestMcpToolData: RequestMcpToolDataFn;
    requestFiles: RequestFilesFn;
    requestOptionalFile: RequestOptionalFileFn;
    sendAction: SendActionFn;
    sendSubagentChunk: SendSubagentChunkFn;
    apiKey: string;
};
//# sourceMappingURL=agent-runtime.d.ts.map