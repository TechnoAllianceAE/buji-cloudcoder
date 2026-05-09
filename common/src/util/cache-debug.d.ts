import type { JSONValue } from '../types/json';
type SerializableValue = JSONValue;
export type CacheDebugCorrelation = {
    projectRoot: string;
    filename: string;
    snapshotId: string;
};
export declare function serializeCacheDebugCorrelation(correlation: CacheDebugCorrelation): string;
export declare function parseCacheDebugCorrelation(value: unknown): CacheDebugCorrelation | undefined;
export declare function normalizeProviderRequestBodyForCacheDebug(params: {
    provider: string;
    body: unknown;
}): SerializableValue;
export {};
//# sourceMappingURL=cache-debug.d.ts.map