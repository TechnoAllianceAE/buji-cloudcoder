import { env, IS_DEV, IS_TEST, IS_PROD } from '@bcp/common/env'

export { IS_DEV, IS_TEST, IS_PROD }

export const BCP_BINARY = 'bcp'

// BCP uses the Buji Enterprise Gateway
export const GATEWAY_URL =
  process.env.BCP_API_URL || env.NEXT_PUBLIC_BCP_APP_URL || 'https://ent.bujicoder.com'

// Keep WEBSITE_URL for backwards compatibility
export const WEBSITE_URL = GATEWAY_URL
