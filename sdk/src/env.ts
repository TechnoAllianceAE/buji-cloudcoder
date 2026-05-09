/**
 * SDK environment helper for dependency injection.
 *
 * This module provides SDK-specific env helpers that extend the base
 * process env with SDK-specific vars for binary paths and WASM.
 */

import { BYOK_OPENROUTER_ENV_VAR } from '@bcp/common/constants/byok'
import { CHATGPT_OAUTH_TOKEN_ENV_VAR } from '@bcp/common/constants/chatgpt-oauth'
import { CLAUDE_OAUTH_TOKEN_ENV_VAR } from '@bcp/common/constants/claude-oauth'
import { API_KEY_ENV_VAR } from '@bcp/common/constants/paths'
import { getBaseEnv } from '@bcp/common/env-process'

import type { SdkEnv } from './types/env'

/**
 * Get SDK environment values.
 * Composes from getBaseEnv() + SDK-specific vars.
 */
export const getSdkEnv = (): SdkEnv => ({
  ...getBaseEnv(),

  // SDK-specific paths
  BCP_RG_PATH: process.env.BCP_RG_PATH,
  BCP_WASM_DIR: process.env.BCP_WASM_DIR,

  // Build flags
  VERBOSE: process.env.VERBOSE,
  OVERRIDE_TARGET: process.env.OVERRIDE_TARGET,
  OVERRIDE_PLATFORM: process.env.OVERRIDE_PLATFORM,
  OVERRIDE_ARCH: process.env.OVERRIDE_ARCH,
})

export const getBCPApiKeyFromEnv = (): string | undefined => {
  return process.env[API_KEY_ENV_VAR]
}

/** @deprecated Use getBCPApiKeyFromEnv instead */
export const getCodebuffApiKeyFromEnv = getBCPApiKeyFromEnv

export const getSystemProcessEnv = (): NodeJS.ProcessEnv => {
  return process.env
}

export const getByokOpenrouterApiKeyFromEnv = (): string | undefined => {
  return process.env[BYOK_OPENROUTER_ENV_VAR]
}

/**
 * Get Claude OAuth token from environment variable.
 * This allows users to provide their Claude Pro/Max OAuth token for direct Anthropic API access.
 */
export const getClaudeOAuthTokenFromEnv = (): string | undefined => {
  return process.env[CLAUDE_OAUTH_TOKEN_ENV_VAR]
}

/**
 * Get ChatGPT OAuth token from environment variable.
 */
export const getChatGptOAuthTokenFromEnv = (): string | undefined => {
  return process.env[CHATGPT_OAUTH_TOKEN_ENV_VAR]
}
