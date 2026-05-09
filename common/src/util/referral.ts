import { env } from '@bcp/common/env'

export const getReferralLink = (referralCode: string): string =>
  `${env.NEXT_PUBLIC_BCP_APP_URL}/referrals/${referralCode}`
