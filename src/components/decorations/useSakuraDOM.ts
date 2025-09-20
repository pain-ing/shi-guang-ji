import { useEffect } from 'react'
import type { SakuraConfig } from './types'
import { mountSakura } from './dom/sakura'

export function useSakuraDOM(
  container: React.RefObject<HTMLDivElement>,
  cfg: SakuraConfig,
) {
  useEffect(() => {
    const el = container.current
    if (!el) return
    const cleanup = mountSakura(el, cfg)
    return () => cleanup && cleanup()
  }, [container, cfg?.enabled, cfg?.density, cfg?.speed, cfg?.butterfliesEnabled, cfg?.butterfliesCount])
}

