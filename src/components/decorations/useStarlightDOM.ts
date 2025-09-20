import { useEffect } from 'react'
import type { StarlightConfig } from './types'
import { mountStarlight } from './dom/starlight'

export function useStarlightDOM(
  container: React.RefObject<HTMLDivElement>,
  cfg: StarlightConfig,
) {
  useEffect(() => {
    const el = container.current
    if (!el) return
    const cleanup = mountStarlight(el, cfg)
    return () => cleanup && cleanup()
  }, [container, cfg?.enabled, cfg?.density])
}

