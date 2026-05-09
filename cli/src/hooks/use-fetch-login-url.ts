import { useMutation } from '@tanstack/react-query'
import open from 'open'

import { WEBSITE_URL } from '../login/constants'
import { generateLoginUrl } from '../login/login-flow'
import { logger } from '../utils/logger'

interface UseFetchLoginUrlParams {
  setLoginUrl: (url: string | null) => void
  setFingerprintHash: (hash: string | null) => void
  setUserCode: (userCode: string | null) => void
  setIsWaitingForEnter: (waiting: boolean) => void
  setHasOpenedBrowser: (opened: boolean) => void
  setError: (error: string | null) => void
}

/**
 * Custom hook that handles fetching the login URL and opening the browser
 */
export function useFetchLoginUrl({
  setLoginUrl,
  setFingerprintHash,
  setUserCode,
  setIsWaitingForEnter,
  setHasOpenedBrowser,
  setError,
}: UseFetchLoginUrlParams) {
  const fetchLoginUrlMutation = useMutation({
    mutationFn: async () => {
      return generateLoginUrl(
        {
          logger,
        },
        {
          baseUrl: WEBSITE_URL,
        },
      )
    },
    onSuccess: async (data) => {
      setLoginUrl(data.url)
      setFingerprintHash(data.code)
      setUserCode(data.user_code)
      setIsWaitingForEnter(true)
      setHasOpenedBrowser(true)

      // Open browser after fetching URL (fire and forget)
      open(data.url).catch((err) => {
        logger.error(err, 'Failed to open browser')
        // Don't show error, user can still click the URL
      })
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to get login URL')
      logger.error(
        {
          error: err instanceof Error ? err.message : String(err),
        },
        'Failed to get login URL',
      )
    },
  })

  return fetchLoginUrlMutation
}
