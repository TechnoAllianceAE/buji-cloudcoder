import { describe, expect, it } from '@bcp/common/testing/vitest-compat'

import {
  getFileProcessingValues,
  type FileProcessingState,
} from '../write-file'

describe('handleWriteFile', () => {
  describe('getFileProcessingValues', () => {
    it('should copy file processing state values', () => {
      const state: FileProcessingState = {
        promisesByPath: { 'test.ts': [] },
        allPromises: [],
        fileChangeErrors: [],
        fileChanges: [],
        firstFileProcessed: true,
      }

      const result = getFileProcessingValues(state)
      expect(result.firstFileProcessed).toBe(true)
      expect(result.promisesByPath).toEqual({ 'test.ts': [] })
    })
  })
})
