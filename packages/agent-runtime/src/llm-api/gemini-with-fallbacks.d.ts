import type { FinetunedVertexModel } from '@bcp/common/old-constants';
import type { PromptAiSdkFn } from '@bcp/common/types/contracts/llm';
import type { Logger } from '@bcp/common/types/contracts/logger';
import type { ParamsExcluding } from '@bcp/common/types/function-params';
import type { Message } from '@bcp/common/types/messages/bcp-message';
/**
 * Prompts a Gemini model with fallback logic.
 *
 * Attempts to call the specified Gemini model via the standard Gemini API.
 * If that fails, it falls back to using the Vertex AI Gemini endpoint.
 * If Vertex AI also fails, it falls back to either GPT-4o (if `useGPT4oInsteadOfClaude` is true)
 * or a Claude model (Sonnet for 'max' costMode, Haiku otherwise).
 *
 * This function handles non-streaming requests and returns the complete response string.
 *
 * @param messages - The array of messages forming the conversation history.
 * @param system - An optional system prompt string or array of text blocks.
 * @param options - Configuration options for the API call.
 * @param options.clientSessionId - Unique ID for the client session.
 * @param options.fingerprintId - Unique ID for the user's device/fingerprint.
 * @param options.userInputId - Unique ID for the specific user input triggering this call.
 * @param options.model - The primary Gemini model to attempt.
 * @param options.userId - The ID of the user making the request.
 * @param options.maxTokens - Optional maximum number of tokens for the response.
 * @param options.temperature - Optional temperature setting for generation (0-1).
 * @param options.costMode - Optional cost mode ('free', 'normal', 'max') influencing fallback model choice.
 * @param options.useGPT4oInsteadOfClaude - Optional flag to use GPT-4o instead of Claude as the final fallback.
 * @returns A promise that resolves to the complete response string from the successful API call.
 * @throws {Error} If all API calls (primary and fallbacks) fail.
 * @throws {Error} When the request is aborted by user. Check with `isAbortError()`. Aborts are not retried.
 */
export declare function promptFlashWithFallbacks(params: {
    messages: Message[];
    costMode?: string;
    useGPT4oInsteadOfClaude?: boolean;
    thinkingBudget?: number;
    useFinetunedModel?: FinetunedVertexModel | undefined;
    promptAiSdk: PromptAiSdkFn;
    logger: Logger;
} & ParamsExcluding<PromptAiSdkFn, 'messages'>): Promise<string>;
//# sourceMappingURL=gemini-with-fallbacks.d.ts.map