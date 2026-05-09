import { WEBSITE_URL } from '@bcp/sdk'

import type { FeedbackRequest } from '@bcp/common/schemas/feedback'

/**
 * API response types for consistent error handling.
 */
export type ApiResponse<T> =
  | { ok: true; status: number; data?: T }
  | { ok: false; status: number; error?: string; errorData?: Record<string, unknown> }

// ============================================================================
// Gateway API request/response types
// ============================================================================

/** User fields from /api/v1/me */
export type UserField = 'id' | 'email' | 'name' | 'is_admin'

export type UserDetails<T extends UserField = UserField> = {
  [K in T]: string
}

export interface UsageRequest {
  start?: string
  end?: string
}

export interface UsageResponse {
  total_cost_cents: number
  total_requests: number
  total_input_tokens: number
  total_output_tokens: number
  by_model: unknown[]
  start: string
  end: string
}

/** Gateway device-code auth: POST /api/v1/auth/cli/code */
export interface CLICodeRequest {
  // No body required by gateway
}

export interface CLICodeResponse {
  code: string
  user_code: string
  url: string
}

/** Gateway device-code poll: GET /api/v1/auth/cli/status?code=X */
export interface CLIStatusRequest {
  code: string
}

export interface CLIStatusResponse {
  status: 'pending' | 'approved'
  token?: string
}

// Legacy compat aliases
export interface LoginCodeRequest {
  fingerprintId: string
}
export interface LoginCodeResponse {
  loginUrl: string
  fingerprintHash: string
  expiresAt: string
}
export interface LoginStatusRequest {
  fingerprintId: string
  fingerprintHash: string
  expiresAt: string
}
export interface LoginStatusResponse {
  user?: Record<string, unknown>
}

export interface LogoutRequest {
  userId?: string
}

export interface FeedbackResponse {
  success: boolean
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries?: number
  initialDelayMs?: number
  maxDelayMs?: number
  retryableStatusCodes?: number[]
}

const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
}

/**
 * Configuration for creating a BCP API client
 */
export interface BCPApiClientConfig {
  /** Base URL for API requests (defaults to gateway URL) */
  baseUrl?: string
  /** JWT auth token for Bearer authentication */
  authToken?: string
  /** Custom fetch implementation (for testing) */
  fetch?: typeof fetch
  /** Default timeout in ms (default: 30000) */
  defaultTimeoutMs?: number
  /** Default retry configuration */
  retry?: RetryConfig
}

/** @deprecated Use BCPApiClientConfig */
export type CodebuffApiClientConfig = BCPApiClientConfig

/**
 * Options for individual requests
 */
export interface RequestOptions {
  query?: Record<string, string>
  includeAuth?: boolean
  includeCookie?: boolean
  timeoutMs?: number
  retry?: RetryConfig | false
  headers?: Record<string, string>
}

export interface BCPApiClient {
  readonly baseUrl: string
  readonly authToken?: string

  /** Make a raw HTTP request */
  request<T>(
    method: string,
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<ApiResponse<T>>

  /** Make a GET request */
  get<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>>

  /** Make a POST request */
  post<T>(
    path: string,
    body?: Record<string, unknown>,
    options?: RequestOptions,
  ): Promise<ApiResponse<T>>

  /** Make a PUT request */
  put<T>(
    path: string,
    body?: Record<string, unknown>,
    options?: RequestOptions,
  ): Promise<ApiResponse<T>>

  /** Make a PATCH request */
  patch<T>(
    path: string,
    body?: Record<string, unknown>,
    options?: RequestOptions,
  ): Promise<ApiResponse<T>>

  /** Make a DELETE request */
  delete<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>>

  // ============================================================================
  // Gateway endpoint methods
  // ============================================================================

  /** Fetch user profile from gateway /api/v1/me */
  me<T extends UserField>(
    fields: readonly T[],
  ): Promise<ApiResponse<UserDetails<T>>>

  /** Fetch usage data from gateway /api/v1/usage */
  usage(req?: UsageRequest): Promise<ApiResponse<UsageResponse>>

  /** Request a device auth code from gateway /api/v1/auth/cli/code */
  cliCode(): Promise<ApiResponse<CLICodeResponse>>

  /** Poll device auth status from gateway /api/v1/auth/cli/status */
  cliStatus(req: CLIStatusRequest): Promise<ApiResponse<CLIStatusResponse>>

  // Legacy compat methods (delegate to gateway equivalents)
  loginCode(req: LoginCodeRequest): Promise<ApiResponse<LoginCodeResponse>>
  loginStatus(req: LoginStatusRequest): Promise<ApiResponse<LoginStatusResponse>>

  /** Logout via /api/auth/cli/logout */
  logout(req?: LogoutRequest): Promise<ApiResponse<void>>

  /** Submit feedback via /api/v1/feedback */
  feedback(req: FeedbackRequest): Promise<ApiResponse<FeedbackResponse>>
}

/** @deprecated Use BCPApiClient */
export type CodebuffApiClient = BCPApiClient

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

const calculateBackoffDelay = (
  attempt: number,
  initialDelayMs: number,
  maxDelayMs: number,
): number => {
  const exponentialDelay = initialDelayMs * Math.pow(2, attempt)
  const jitter = Math.random() * 0.3 * exponentialDelay
  return Math.min(exponentialDelay + jitter, maxDelayMs)
}

const isRetryableError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const name = error.name.toLowerCase()
    const message = error.message.toLowerCase()
    if (name === 'aborterror') return false
    return (
      name === 'timeouterror' ||
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('econnreset') ||
      message.includes('econnrefused')
    )
  }
  return false
}

/**
 * Create a BCP API client for making authenticated requests to the Buji Enterprise Gateway
 */
export function createBCPApiClient(
  config: BCPApiClientConfig = {},
): BCPApiClient {
  const {
    baseUrl = WEBSITE_URL,
    authToken,
    fetch: fetchFn = fetch,
    defaultTimeoutMs = 30000,
    retry: defaultRetryConfig = {},
  } = config

  const mergedDefaultRetry: Required<RetryConfig> = {
    ...DEFAULT_RETRY_CONFIG,
    ...defaultRetryConfig,
  }

  async function request<T>(
    method: string,
    path: string,
    body?: unknown,
    options: RequestOptions = {},
  ): Promise<ApiResponse<T>> {
    const {
      query,
      includeAuth = true,
      includeCookie = false,
      timeoutMs = defaultTimeoutMs,
      retry: retryConfig = mergedDefaultRetry,
      headers: customHeaders = {},
    } = options

    let url = `${baseUrl}${path}`
    if (query && Object.keys(query).length > 0) {
      const params = new URLSearchParams(query)
      url += `?${params.toString()}`
    }

    const headers: Record<string, string> = { ...customHeaders }
    if (authToken && includeAuth) {
      headers['Authorization'] = `Bearer ${authToken}`
    }
    if (authToken && includeCookie) {
      headers['Cookie'] = `session-token=${authToken};`
    }
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json'
    }

    const fetchOptions: RequestInit = { method, headers }
    if (body !== undefined) {
      fetchOptions.body = JSON.stringify(body)
    }

    const shouldRetry = retryConfig !== false
    const retryOpts = shouldRetry
      ? { ...mergedDefaultRetry, ...retryConfig }
      : null

    let lastError: unknown
    const maxAttempts = shouldRetry ? (retryOpts?.maxRetries ?? 0) + 1 : 1

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

      try {
        const response = await fetchFn(url, {
          ...fetchOptions,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (response.ok) {
          try {
            const responseBody = await response.json()
            const data = responseBody as T
            return { ok: true, status: response.status, data }
          } catch {
            return { ok: true, status: response.status }
          }
        }

        if (
          shouldRetry &&
          retryOpts &&
          retryOpts.retryableStatusCodes.includes(response.status) &&
          attempt < maxAttempts - 1
        ) {
          const delay = calculateBackoffDelay(
            attempt,
            retryOpts.initialDelayMs,
            retryOpts.maxDelayMs,
          )
          await sleep(delay)
          continue
        }

        let errorMessage: string | undefined
        let errorData: unknown
        try {
          const errorBody = await response.json()
          errorData = errorBody
          errorMessage =
            errorBody?.error || errorBody?.message || response.statusText
        } catch {
          try {
            errorMessage = await response.text()
          } catch {
            errorMessage = response.statusText
          }
        }

        return { ok: false, status: response.status, error: errorMessage, errorData: errorData as Record<string, unknown> | undefined }
      } catch (error) {
        clearTimeout(timeoutId)
        lastError = error

        if (
          shouldRetry &&
          retryOpts &&
          isRetryableError(error) &&
          attempt < maxAttempts - 1
        ) {
          const delay = calculateBackoffDelay(
            attempt,
            retryOpts.initialDelayMs,
            retryOpts.maxDelayMs,
          )
          await sleep(delay)
          continue
        }

        if (error instanceof Error) {
          const enhancedError = new Error(
            `${error.message} (${method} ${url})`,
          )
          enhancedError.name = error.name
          enhancedError.cause = error
          throw enhancedError
        }
        throw error
      }
    }

    throw lastError ?? new Error('Request failed after all retries')
  }

  return {
    baseUrl,
    authToken,
    request,

    get<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
      return request<T>('GET', path, undefined, options)
    },

    post<T>(
      path: string,
      body?: Record<string, unknown>,
      options?: RequestOptions,
    ): Promise<ApiResponse<T>> {
      return request<T>('POST', path, body, options)
    },

    put<T>(
      path: string,
      body?: Record<string, unknown>,
      options?: RequestOptions,
    ): Promise<ApiResponse<T>> {
      return request<T>('PUT', path, body, options)
    },

    patch<T>(
      path: string,
      body?: Record<string, unknown>,
      options?: RequestOptions,
    ): Promise<ApiResponse<T>> {
      return request<T>('PATCH', path, body, options)
    },

    delete<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
      return request<T>('DELETE', path, undefined, options)
    },

    // ============================================================================
    // Gateway endpoint methods
    // ============================================================================

    me<T extends UserField>(
      fields: readonly T[],
    ): Promise<ApiResponse<UserDetails<T>>> {
      return request<UserDetails<T>>('GET', '/api/v1/me', undefined, {
        query: { fields: fields.join(',') },
      })
    },

    usage(req: UsageRequest = {}): Promise<ApiResponse<UsageResponse>> {
      const query: Record<string, string> = {}
      if (req.start) query.start = req.start
      if (req.end) query.end = req.end
      return request<UsageResponse>('GET', '/api/v1/usage', undefined, { query })
    },

    // Gateway device-code auth flow
    cliCode(): Promise<ApiResponse<CLICodeResponse>> {
      return request<CLICodeResponse>(
        'POST',
        '/api/v1/auth/cli/code',
        {},
        { includeAuth: false },
      )
    },

    cliStatus(req: CLIStatusRequest): Promise<ApiResponse<CLIStatusResponse>> {
      return request<CLIStatusResponse>('GET', '/api/v1/auth/cli/status', undefined, {
        query: { code: req.code },
        includeAuth: false,
      })
    },

    // Legacy compat — map old fingerprint-based flow to gateway device-code flow
    loginCode(_req: LoginCodeRequest): Promise<ApiResponse<LoginCodeResponse>> {
      return request<LoginCodeResponse>(
        'POST',
        '/api/v1/auth/cli/code',
        {},
        { includeAuth: false },
      )
    },

    loginStatus(
      req: LoginStatusRequest,
    ): Promise<ApiResponse<LoginStatusResponse>> {
      return request<LoginStatusResponse>('GET', '/api/v1/auth/cli/status', undefined, {
        query: {
          code: req.fingerprintHash, // map fingerprintHash → code for backwards compat
        },
        includeAuth: false,
      })
    },

    logout(req: LogoutRequest = {}): Promise<ApiResponse<void>> {
      return request<void>('POST', '/api/auth/cli/logout', {
        userId: req.userId,
      })
    },

    feedback(req: FeedbackRequest): Promise<ApiResponse<FeedbackResponse>> {
      return request<FeedbackResponse>('POST', '/api/v1/feedback', req, {
        retry: false,
      })
    },
  }
}

/** @deprecated Use createBCPApiClient */
export const createCodebuffApiClient = createBCPApiClient

// ============================================================================
// Shared singleton client
// ============================================================================

let sharedClient: BCPApiClient | null = null
let sharedAuthToken: string | undefined
let clientCreatedWithToken: string | undefined

/**
 * Get or create the shared API client singleton.
 */
export function getApiClient(): BCPApiClient {
  if (!sharedClient || clientCreatedWithToken !== sharedAuthToken) {
    sharedClient = createBCPApiClient({ authToken: sharedAuthToken })
    clientCreatedWithToken = sharedAuthToken
  }
  return sharedClient
}

/**
 * Set the auth token for the shared API client.
 */
export function setApiClientAuthToken(authToken: string | undefined): void {
  sharedAuthToken = authToken
}

/**
 * Reset the shared client (mainly for testing)
 */
export function resetApiClient(): void {
  sharedClient = null
  sharedAuthToken = undefined
  clientCreatedWithToken = undefined
}
