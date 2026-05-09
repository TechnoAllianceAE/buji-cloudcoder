import { useEffect, useRef } from 'react'

import { WEBSITE_URL } from '../login/constants'
import { pollLoginStatus } from '../login/login-flow'
import { logger } from '../utils/logger'

import type { User } from '../utils/auth'

interface UseLoginPollingParams {
  loginUrl: string | null
  code: string | null
  isWaitingForEnter: boolean
  onSuccess: (token: string) => void
  onTimeout: () => void
  onError: (error: string) => void
}

/**
 * Custom hook that handles polling for login status
 */
export function useLoginPolling({
  loginUrl,
  code,
  isWaitingForEnter,
  onSuccess,
  onTimeout,
  onError,
}: UseLoginPollingParams) {
  // Store callbacks in refs to prevent effect re-runs
  const onSuccessRef = useRef(onSuccess)
  const onTimeoutRef = useRef(onTimeout)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    onSuccessRef.current = onSuccess
  }, [onSuccess])

  useEffect(() => {
    onTimeoutRef.current = onTimeout
  }, [onTimeout])

  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  useEffect(() => {
    if (!loginUrl || !code || !isWaitingForEnter) {
      return
    }

    let active = true

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        setTimeout(resolve, ms)
      })

    pollLoginStatus(
      {
        sleep,
        logger,
      },
      {
        baseUrl: WEBSITE_URL,
        code,
        shouldContinue: () => active,
      },
    )
      .then((result) => {
        if (!active) {
          return
        }

        if (result.status === 'success') {
          onSuccessRef.current(result.token)
        } else if (result.status === 'timeout') {
          logger.warn('Login polling timed out after configured limit')
          onTimeoutRef.current()
        }
      })
      .catch((error) => {
        if (!active) {
          return
        }
        logger.error(
          {
            error: error instanceof Error ? error.message : String(error),
          },
          '💥 Unexpected error while polling login status',
        )
        onErrorRef.current(
          error instanceof Error ? error.message : 'Failed to complete login',
        )
      })

    return () => {
      active = false
    }
  }, [loginUrl, code, isWaitingForEnter])
}
