import type { StarlightConfig } from './types'
import { mountStarlight } from './dom/starlight'

export function createStarlightInitializer(cfg: StarlightConfig) {
  return (container: HTMLElement) => mountStarlight(container, cfg)
}

