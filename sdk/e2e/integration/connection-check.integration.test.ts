/**
 * Integration Test: Connection Check
 *
 * Tests the checkConnection() method of BCPClient.
 */

import { describe, test, expect, beforeAll } from '@bcp/common/testing/vitest-compat'

import { BCPClient } from '../../src/client'
import { getApiKey, skipIfNoApiKey } from '../utils'

describe('Integration: Connection Check', () => {
  let client: BCPClient

  beforeAll(() => {
    if (skipIfNoApiKey()) return
    client = new BCPClient({ apiKey: getApiKey() })
  })

  test('checkConnection returns true when backend is reachable', async () => {
    if (skipIfNoApiKey()) return

    const isConnected = await client.checkConnection()
    expect(isConnected).toBe(true)
  })

  test('checkConnection returns boolean', async () => {
    if (skipIfNoApiKey()) return

    const result = await client.checkConnection()
    expect(typeof result).toBe('boolean')
  })
})
