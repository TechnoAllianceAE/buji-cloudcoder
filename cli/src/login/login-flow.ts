import { createBCPApiClient } from '../utils/bcp-api'

import type {
  BCPApiClient,
  CLICodeResponse,
} from '../utils/bcp-api'
import type { Logger } from '@bcp/common/types/contracts/logger'

// Re-export for gateway compatibility
export type LoginUrlResponse = CLICodeResponse

export interface GenerateLoginUrlDeps {
  logger: Logger
  apiClient?: BCPApiClient
}

export interface GenerateLoginUrlOptions {
  baseUrl: string
}

export async function generateLoginUrl(
  deps: GenerateLoginUrlDeps,
  options: GenerateLoginUrlOptions,
): Promise<LoginUrlResponse> {
  const { logger, apiClient: providedApiClient } = deps
  const { baseUrl } = options

  const apiClient =
    providedApiClient ??
    createBCPApiClient({
      baseUrl,
    })

  const response = await apiClient.cliCode()

  if (!response.ok) {
    logger.error(
      {
        status: response.status,
        error: response.error,
      },
      '❌ Failed to request login code from gateway',
    )
    throw new Error('Failed to get login code')
  }

  if (!response.data) {
    logger.error(
      { status: response.status },
      '❌ Empty response from gateway login code',
    )
    throw new Error('Failed to get login code')
  }

  return response.data
}

interface PollLoginStatusDeps {
  sleep: (ms: number) => Promise<void>
  logger: Logger
  now?: () => number
  apiClient?: BCPApiClient
}

interface PollLoginStatusOptions {
  baseUrl: string
  code: string
  intervalMs?: number
  timeoutMs?: number
  shouldContinue?: () => boolean
}

export type PollLoginStatusResult =
  | { status: 'success'; token: string; attempts: number }
  | { status: 'timeout' }
  | { status: 'aborted' }

export async function pollLoginStatus(
  deps: PollLoginStatusDeps,
  options: PollLoginStatusOptions,
): Promise<PollLoginStatusResult> {
  const { sleep, logger, apiClient: providedApiClient } = deps
  const {
    baseUrl,
    code,
    intervalMs = 5000,
    timeoutMs = 5 * 60 * 1000,
    shouldContinue,
  } = options

  const now = deps.now ?? Date.now
  const startTime = now()
  let attempts = 0

  const apiClient =
    providedApiClient ??
    createBCPApiClient({
      baseUrl,
    })

  while (true) {
    if (shouldContinue && !shouldContinue()) {
      logger.warn('🛑 Polling aborted by caller')
      return { status: 'aborted' }
    }

    if (now() - startTime >= timeoutMs) {
      logger.warn('⌛️ Login polling timed out')
      return { status: 'timeout' }
    }

    attempts += 1

    try {
      const response = await apiClient.cliStatus({
        code,
      })

      if (!response.ok) {
        if (response.status !== 401 && response.status !== 403) {
          logger.warn(
            {
              attempts,
              status: response.status,
              error: response.error,
            },
            '⚠️ Unexpected status while polling gateway',
          )
        }
        await sleep(intervalMs)
        continue
      }

      if (response.data?.status === 'approved' && response.data.token) {
        return {
          status: 'success',
          token: response.data.token,
          attempts,
        }
      }

      await sleep(intervalMs)
    } catch (error) {
      logger.error(
        {
          attempts,
          error: error instanceof Error ? error.message : String(error),
        },
        '💥 Network error during gateway login status polling',
      )
      await sleep(intervalMs)
      continue
    }
  }
}
