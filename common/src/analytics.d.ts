import { AnalyticsEvent } from './constants/analytics-events';
import type { Logger } from '@bcp/common/types/contracts/logger';
export declare function flushAnalytics(logger?: Logger): Promise<void>;
export declare function trackEvent({ event, userId, properties, logger, }: {
    event: AnalyticsEvent;
    userId: string;
    properties?: Record<string, any>;
    logger: Logger;
}): void;
//# sourceMappingURL=analytics.d.ts.map