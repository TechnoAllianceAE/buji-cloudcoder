import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    testTimeout: 30000,
  },
  resolve: {
    alias: {
      '@bcp/common': new URL('./common/src', import.meta.url).pathname,
      '@bcp/agent-runtime': new URL('./packages/agent-runtime/src', import.meta.url).pathname,
      '@bcp/internal': new URL('./packages/internal/src', import.meta.url).pathname,
      '@bcp/code-map': new URL('./packages/code-map/src', import.meta.url).pathname,
      '@bcp/sdk': new URL('./sdk/src/index.ts', import.meta.url).pathname,
    },
  },
})
