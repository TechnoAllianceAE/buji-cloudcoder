/**
 * ChatGPT subscription OAuth constants for experimental direct OpenAI routing.
 */
/**
 * Feature flag for ChatGPT OAuth (connect:chatgpt) functionality.
 * Default OFF until validated.
 */
export declare const CHATGPT_OAUTH_ENABLED = true;
/** OAuth client id used by Codex-compatible OAuth ecosystems. */
export declare const CHATGPT_OAUTH_CLIENT_ID = "app_EMoamEEZ73f0CkXaXp7hrann";
/** OAuth endpoints */
export declare const CHATGPT_OAUTH_AUTHORIZE_URL = "https://auth.openai.com/oauth/authorize";
export declare const CHATGPT_OAUTH_TOKEN_URL = "https://auth.openai.com/oauth/token";
/** Pinned redirect URI for paste-based localhost callback flow. */
export declare const CHATGPT_OAUTH_REDIRECT_URI = "http://localhost:1455/auth/callback";
/** Base URL for ChatGPT backend API (Codex endpoint). */
export declare const CHATGPT_BACKEND_BASE_URL = "https://chatgpt.com/backend-api";
/** Environment variable for OAuth token override. */
export declare const CHATGPT_OAUTH_TOKEN_ENV_VAR = "BCP_CHATGPT_OAUTH_TOKEN";
/**
 * OpenRouter-style model IDs that are allowed for ChatGPT OAuth direct routing.
 * This includes optimistic aliases requested by the user.
 */
export declare const OPENROUTER_TO_OPENAI_MODEL_MAP: Record<string, string>;
export declare const CHATGPT_OAUTH_OPENAI_MODEL_ALLOWLIST: Array<keyof typeof OPENROUTER_TO_OPENAI_MODEL_MAP>;
export declare function isOpenAIProviderModel(model: string): boolean;
/**
 * Check if model is in the explicit ChatGPT OAuth allowlist.
 */
export declare function isChatGptOAuthModelAllowed(model: string): boolean;
/**
 * Normalize OpenRouter-style model IDs to direct OpenAI model IDs.
 * Example: "openai/gpt-5.3-codex" => "gpt-5.3-codex"
 */
export declare function toOpenAIModelId(model: string): string;
//# sourceMappingURL=chatgpt-oauth.d.ts.map