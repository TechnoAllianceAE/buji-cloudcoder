import { vi } from 'vitest'

export {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  test,
} from 'vitest'

type CompatMock = typeof vi.fn & {
  module: (modulePath: string, factory: () => Record<string, unknown>) => void
  clearAllMocks: () => void
  restore: () => void
}

export const mock = Object.assign(vi.fn, {
  module: (modulePath: string, factory: () => Record<string, unknown>) => {
    vi.doMock(modulePath, factory)
  },
  clearAllMocks: () => vi.clearAllMocks(),
  restore: () => vi.restoreAllMocks(),
}) as CompatMock
type CompatSpyOn = {
  <T extends object, K extends keyof T>(object: T, method: K): any
}

export const spyOn = vi.spyOn as CompatSpyOn
export type { Mock } from 'vitest'
