/**
 * Claude Code OAuth constants for connecting to user's Claude Pro/Max subscription.
 * These are used by the CLI for the OAuth PKCE flow and by the SDK for direct Anthropic API calls.
 */
/**
 * Feature flag for Claude OAuth (connect:claude) functionality.
 * Set to true to re-enable Claude OAuth across:
 * - CLI: /connect:claude command, OAuth banner, usage display
 * - SDK: Direct Anthropic API routing via OAuth token
 * - Init: Background credential refresh on startup
 */
export declare const CLAUDE_OAUTH_ENABLED = false;
export declare const CLAUDE_OAUTH_CLIENT_ID = "9d1c250a-e61b-44d9-88ed-5944d1962f5e";
export declare const CLAUDE_OAUTH_AUTHORIZE_URL = "https://console.anthropic.com/oauth/authorize";
export declare const CLAUDE_OAUTH_TOKEN_URL = "https://console.anthropic.com/oauth/token";
export declare const ANTHROPIC_API_BASE_URL = "https://api.anthropic.com";
export declare const CLAUDE_OAUTH_TOKEN_ENV_VAR = "BCP_CLAUDE_OAUTH_TOKEN";
export declare const ANTHROPIC_API_VERSION = "2023-06-01";
/**
 * Beta headers required for Claude OAuth access to Claude 4+ models.
 * These must be included in the anthropic-beta header when making requests.
 */
export declare const CLAUDE_OAUTH_BETA_HEADERS: readonly ["oauth-2025-04-20", "claude-code-20250219", "interleaved-thinking-2025-05-14", "fine-grained-tool-streaming-2025-05-14"];
/**
 * System prompt prefix required by Anthropic to allow OAuth access to Claude 4+ models.
 * This must be prepended to the system prompt when using Claude OAuth with Claude 4+ models.
 * Without this prefix, requests will fail with "This credential is only authorized for use with Claude Code".
 */
export declare const CLAUDE_CODE_SYSTEM_PROMPT_PREFIX = "You are Claude Code, Anthropic's official CLI for Claude.";
/**
 * Model ID mapping from OpenRouter format to Anthropic format.
 * OpenRouter uses prefixed IDs like "anthropic/claude-sonnet-4",
 * while Anthropic uses versioned IDs like "claude-3-5-haiku-20241022".
 */
export declare const OPENROUTER_TO_ANTHROPIC_MODEL_MAP: Record<string, string>;
/**
 * Check if a model is a Claude/Anthropic model that can use OAuth.
 */
export declare function isClaudeModel(model: string): boolean;
/**
 * Convert an OpenRouter model ID to an Anthropic model ID.
 * Throws an error if the model has a provider prefix but is not an Anthropic model.
 */
export declare function toAnthropicModelId(openrouterModel: string): string;
//# sourceMappingURL=claude-oauth.d.ts.map