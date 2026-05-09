import type { Logger } from '@bcp/common/types/contracts/logger';
import type { ParamsOf } from '@bcp/common/types/function-params';
export interface SearchResponse {
    results: Array<{
        id: string;
        title: string;
        description: string;
        branch: string;
        lastUpdateDate: string;
        state: DocumentState;
        totalTokens: number;
        totalSnippets: number;
        totalPages: number;
        stars?: number;
        trustScore?: number;
    }>;
}
type DocumentState = 'initial' | 'finalized' | 'error' | 'delete';
export interface SearchResult {
    id: string;
    title: string;
    description: string;
    branch: string;
    lastUpdateDate: string;
    state: DocumentState;
    totalTokens: number;
    totalSnippets: number;
    totalPages: number;
    stars?: number;
    trustScore?: number;
}
/**
 * Lists all available documentation projects from Context7
 * @returns Array of projects with their metadata, or null if the request fails
 */
export declare function searchLibraries(params: {
    query: string;
    logger: Logger;
    fetch: typeof globalThis.fetch;
}): Promise<SearchResult[] | null>;
/**
 * Fetches documentation context for a specific library
 * @param libraryId The library ID to fetch documentation for
 * @param options Options for the request
 * @returns The documentation text or null if the request fails
 */
export declare function fetchContext7LibraryDocumentation(params: {
    query: string;
    tokens?: number;
    topic?: string;
    folders?: string;
    logger: Logger;
    fetch: typeof globalThis.fetch;
} & ParamsOf<typeof searchLibraries>): Promise<string | null>;
export {};
//# sourceMappingURL=context7-api.d.ts.map