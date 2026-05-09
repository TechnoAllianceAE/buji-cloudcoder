export declare const INITIAL_RETRY_DELAY = 1000;
export declare function withRetry<T>(operation: () => Promise<T>, options?: {
    maxRetries?: number;
    retryIf?: (error: any) => boolean;
    onRetry?: (error: any, attempt: number) => void;
    retryDelayMs?: number;
}): Promise<T>;
export declare const sleep: (ms: number) => Promise<unknown>;
/**
 * Wraps a promise with a timeout
 * @param promise The promise to wrap
 * @param timeoutMs Timeout in milliseconds
 * @param timeoutMessage Optional message for the timeout error
 * @returns A promise that resolves with the result of the original promise or rejects with a timeout error
 */
export declare function withTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutMessage?: string): Promise<T>;
//# sourceMappingURL=promise.d.ts.map