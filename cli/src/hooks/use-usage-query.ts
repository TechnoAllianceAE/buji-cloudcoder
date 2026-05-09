// Stub — usage tracking handled by enterprise gateway in BujiCoderPlus
export const usageQueryKeys = {
  all: ['usage'] as const,
  current: () => [...usageQueryKeys.all, 'current'] as const,
}

export function useUsageQuery() {
  return {
    data: null,
    isLoading: false,
    error: null,
    refetch: () => {},
  }
}
