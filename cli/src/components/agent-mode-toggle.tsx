// Stub — agent mode toggle not used in BujiCoderPlus
import React, { useState, useCallback } from 'react'

export function AgentModeToggle(_props: Record<string, unknown>): React.ReactElement | null {
  return null
}

export function useHoverToggle() {
  const [isHovered, setIsHovered] = useState(false)
  const onMouseEnter = useCallback(() => setIsHovered(true), [])
  const onMouseLeave = useCallback(() => setIsHovered(false), [])
  return { isHovered, onMouseEnter, onMouseLeave }
}
