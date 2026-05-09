export type ErrorOr<T, E extends ErrorObject = ErrorObject> = Success<T> | Failure<E>;
export type Success<T> = {
    success: true;
    value: T;
};
export type Failure<E extends ErrorObject = ErrorObject> = {
    success: false;
    error: E;
};
/**
 * Result type for prompt functions that can be aborted.
 * Provides rich semantics to distinguish between successful completion and user abort.
 *
 * ## When to use `PromptResult<T>` vs `ErrorOr<T>`
 *
 * Use `PromptResult<T>` when:
 * - The operation can be cancelled by the user (via AbortSignal)
 * - An abort is an expected outcome, not an error
 * - You need to distinguish between errors (which might trigger fallbacks) and
 *   user-initiated aborts (which should propagate immediately)
 *
 * Use `ErrorOr<T>` when:
 * - The operation can fail with an error that should be handled
 * - There's no concept of user-initiated abort
 * - You want to return error details rather than throw
 *
 * ## Abort handling patterns
 *
 * 1. **Check and return early** - For graceful handling where abort means "stop, no error":
 *    ```ts
 *    const result = await promptAiSdk({ ... })
 *    if (result.aborted) return // or return null, false, etc.
 *    doSomething(result.value)
 *    ```
 *
 * 2. **Unwrap and throw** - For propagating aborts as exceptions:
 *    ```ts
 *    const value = unwrapPromptResult(await promptAiSdk({ ... }))
 *    // Throws if aborted, callers should use isAbortError() in catch blocks
 *    ```
 *
 * 3. **Rethrow in catch blocks** - Prevent swallowing abort errors:
 *    ```ts
 *    try {
 *      await someOperation()
 *    } catch (error) {
 *      if (isAbortError(error)) throw error // Don't swallow aborts
 *      // Handle other errors
 *    }
 *    ```
 */
export type PromptResult<T> = PromptSuccess<T> | PromptAborted;
export type PromptSuccess<T> = {
    aborted: false;
    value: T;
};
export type PromptAborted = {
    aborted: true;
    reason?: string;
};
export type ErrorObject = {
    name: string;
    message: string;
    stack?: string;
    /** HTTP status code from error.status (used by some libraries) */
    status?: number;
    /** HTTP status code from error.statusCode (used by AI SDK and BCP errors) */
    statusCode?: number;
    /** Optional machine-friendly error code, if available */
    code?: string;
    /** Optional raw error object */
    rawError?: string;
    /** Response body from API errors (AI SDK APICallError) */
    responseBody?: string;
    /** URL that was called (API errors) */
    url?: string;
    /** Whether the error is retryable (API errors) */
    isRetryable?: boolean;
    /** Request body values that were sent (API errors) - stringified for safety */
    requestBodyValues?: string;
    /** Cause of the error, if nested */
    cause?: ErrorObject;
};
export declare function success<T>(value: T): Success<T>;
export declare function failure(error: unknown): Failure<ErrorObject>;
/**
 * Create a successful prompt result.
 */
export declare function promptSuccess<T>(value: T): PromptSuccess<T>;
/**
 * Create an aborted prompt result.
 */
export declare function promptAborted(reason?: string): PromptAborted;
/**
 * Standard error message for aborted requests.
 * Use this constant when throwing abort errors to ensure consistency.
 */
export declare const ABORT_ERROR_MESSAGE = "Request aborted";
/**
 * Custom error class for abort errors.
 * Use this class instead of generic Error for abort errors to ensure
 * robust detection via isAbortError() (checks error.name === 'AbortError').
 */
export declare class AbortError extends Error {
    constructor(reason?: string);
}
/**
 * Check if an error is an abort error.
 * Use this helper to detect abort errors in catch blocks.
 *
 * Detects both:
 * - Errors with message starting with 'Request aborted' (thrown by our code via AbortError)
 * - Native AbortError (thrown by fetch/AI SDK when AbortSignal is triggered)
 */
export declare function isAbortError(error: unknown): boolean;
/**
 * Unwrap a PromptResult, returning the value if successful or throwing if aborted.
 *
 * Use this helper for consistent abort handling when you want aborts to propagate
 * as exceptions. Callers should use `isAbortError()` in catch blocks to detect
 * and handle abort errors appropriately (e.g., rethrow instead of logging as errors).
 *
 * @throws {AbortError} When result.aborted is true.
 */
export declare function unwrapPromptResult<T>(result: PromptResult<T>): T;
/**
 * Parses a JSON response body string from an API error to extract structured error details.
 * Used to extract machine-readable error codes and human-readable messages from API responses
 * (e.g., AI SDK's APICallError includes a responseBody with the server's JSON response).
 *
 * Returns extracted fields, or an empty object if the responseBody is not a valid JSON string
 * with the expected shape.
 */
export declare function parseApiErrorResponseBody(responseBody: unknown): {
    errorCode?: string;
    message?: string;
};
export declare function getErrorObject(error: unknown, options?: {
    includeRawError?: boolean;
}): ErrorObject;
//# sourceMappingURL=error.d.ts.map