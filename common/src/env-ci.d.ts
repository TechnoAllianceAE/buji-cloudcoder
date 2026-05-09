/**
 * CI environment helper for dependency injection.
 *
 * This module provides a typed interface to CI-specific environment variables.
 * These are used in CI/CD pipelines and eval contexts.
 * In tests, use `@bcp/common/testing-env-ci`.
 */
import type { CiEnv } from './types/contracts/env';
/**
 * Get CI environment values.
 * Returns a snapshot of the current process.env values for CI-specific vars.
 */
export declare const getCiEnv: () => CiEnv;
/**
 * Default CI env instance.
 * Use this for production code, inject mocks in tests.
 */
export declare const ciEnv: CiEnv;
/**
 * Check if running in CI environment
 */
export declare const isCI: () => boolean;
//# sourceMappingURL=env-ci.d.ts.map