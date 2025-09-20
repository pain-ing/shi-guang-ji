import type { SakuraConfig } from './types'
import { mountSakura } from './dom/sakura'

export function createSakuraInitializer(cfg: SakuraConfig) {
  return (container: HTMLElement) => mountSakura(container, cfg)
}

