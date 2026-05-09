/**
 * Process environment helper for dependency injection.
 *
 * This module provides a typed interface to process.env values that aren't
 * part of our validated schemas (ClientEnv/ServerEnv). These are runtime
 * environment variables like SHELL, HOME, TERM, etc.
 *
 * Usage:
 * - Import `getBaseEnv` for base OS-level vars only
 * - Import `getProcessEnv` for the full ProcessEnv (base + extensions)
 * - In tests, use `@bcp/common/testing-env-process`
 */
import type { BaseEnv, ProcessEnv } from './types/contracts/env';
/**
 * Get base environment values (OS-level vars only).
 * This is the foundation that package-specific helpers should spread into.
 */
export declare const getBaseEnv: () => BaseEnv;
/**
 * Get full process environment values (base + all extensions).
 * Returns a snapshot of the current process.env values for the ProcessEnv type.
 */
export declare const getProcessEnv: () => ProcessEnv;
/**
 * Default process env instance.
 * Use this for production code, inject mocks in tests.
 */
export declare const processEnv: ProcessEnv;
//# sourceMappingURL=env-process.d.ts.map