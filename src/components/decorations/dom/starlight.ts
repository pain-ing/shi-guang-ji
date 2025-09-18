import type { StarlightConfig } from '../types'

export function mountStarlight(container: HTMLElement, cfg: StarlightConfig): () => void {
  const { enabled = true, density = 20 } = cfg

  const layer = document.createElement('div')
  layer.className = 'starlight-layer'

  if (!enabled) {
    if (layer.parentElement) layer.remove()
    return () => { if (layer.parentElement) layer.remove() }
  }

  const prefersReducedMotion = typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const isCoarse = typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse)').matches
  const deviceMemory = (navigator as any)?.deviceMemory as number | undefined

  let perfMul = 1
  if (deviceMemory && deviceMemory <= 2) perfMul = Math.min(perfMul, 0.4)
  else if (deviceMemory && deviceMemory <= 4) perfMul = Math.min(perfMul, 0.6)
  if (isCoarse) perfMul = Math.min(perfMul, 0.6)

  const base = Math.max(10, Math.min(100, density))
  const count = prefersReducedMotion ? 0 : Math.round(base * perfMul)

  for (let i = 0; i < count; i++) {
    const s = document.createElement('div')
    s.className = 'twinkle-star'
    s.style.left = `${Math.random() * 100}vw`
    s.style.top = `${Math.random() * 100}vh`
    s.style.animationDelay = `${Math.random() * 5}s`
    s.style.animationDuration = `${2 + Math.random() * 3}s`
    layer.appendChild(s)
  }

  container.appendChild(layer)

  return () => { if (layer.parentElement) layer.remove() }
}

