import type { ClientEnv, CiEnv } from '@bcp/common/types/contracts/env';
import type { Logger } from '@bcp/common/types/contracts/logger';
interface BCPWebApiEnv {
    clientEnv: ClientEnv;
    ciEnv: CiEnv;
}
export declare function callWebSearchAPI(params: {
    query: string;
    depth?: 'standard' | 'deep';
    repoUrl?: string | null;
    fetch: typeof globalThis.fetch;
    logger: Logger;
    env: BCPWebApiEnv;
    baseUrl?: string;
    apiKey?: string;
}): Promise<{
    result?: string;
    error?: string;
    creditsUsed?: number;
}>;
export declare function callDocsSearchAPI(params: {
    libraryTitle: string;
    topic?: string;
    maxTokens?: number;
    repoUrl?: string | null;
    fetch: typeof globalThis.fetch;
    logger: Logger;
    env: BCPWebApiEnv;
    baseUrl?: string;
    apiKey?: string;
}): Promise<{
    documentation?: string;
    error?: string;
    creditsUsed?: number;
}>;
export declare function callTokenCountAPI(params: {
    messages: unknown[];
    system?: string;
    model?: string;
    fetch: typeof globalThis.fetch;
    logger: Logger;
    env: BCPWebApiEnv;
    baseUrl?: string;
    apiKey?: string;
}): Promise<{
    inputTokens?: number;
    error?: string;
}>;
export {};
//# sourceMappingURL=codebuff-web-api.d.ts.map