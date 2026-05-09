import type { BaseEnv, ProcessEnv } from './types/contracts/env';
/**
 * Test-only helpers for process env snapshots.
 * Keep production code using `@bcp/common/env-process`.
 */
export declare const createTestBaseEnv: (overrides?: Partial<BaseEnv>) => BaseEnv;
export declare const createTestProcessEnv: (overrides?: Partial<ProcessEnv>) => ProcessEnv;
//# sourceMappingURL=testing-env-process.d.ts.map