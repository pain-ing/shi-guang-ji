import type { SakuraConfig } from '../types'

export function mountSakura(container: HTMLElement, cfg: SakuraConfig): () => void {
  const {
    enabled = true,
    density = 30,
    speed = 1,
    butterfliesEnabled = false,
    butterfliesCount = 2,
  } = cfg

  // 为樱花创建独立层，避免互相清空容器影响其他装饰
  const layer = document.createElement('div')
  layer.className = 'sakura-layer'

  if (!enabled) {
    // 未启用则确保清理自身图层
    if (layer.parentElement) layer.remove()
    return () => { if (layer.parentElement) layer.remove() }
  }

  // 渐变色组：粉 -> 樱粉 -> 紫粉
  const gradients = [
    ['hsl(340 90% 90%)', 'hsl(330 100% 85%)'],
    ['hsl(330 90% 88%)', 'hsl(315 100% 85%)'],
    ['hsl(320 100% 88%)', 'hsl(300 90% 85%)'],
    ['hsl(350 90% 92%)', 'hsl(320 100% 88%)'],
    ['hsl(300 90% 90%)', 'hsl(280 90% 85%)'],
  ] as const

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

  const baseCount = Math.min(Math.max(density, 10), 150)
  const count = prefersReducedMotion ? 0 : Math.round(baseCount * perfMul)
  const speedFactor = Math.max(0.5, Math.min(2, speed)) * (prefersReducedMotion ? 0.8 : 1)

  const createPetal = (i: number) => {
    const wrap = document.createElement('div')
    wrap.className = 'sakura-petal-wrap'

    const startLeft = Math.random() * 100 // vw
    const size = (perfMul < 0.7 ? 10 + Math.random() * 6 : 12 + Math.random() * 8)
    const duration = (8 + Math.random() * 6) / speedFactor
    const delay = Math.random() * 2.5
    const sway = 18 + Math.random() * 18
    const rotate = Math.random() * 360
    const g = gradients[i % gradients.length]

    wrap.style.left = `${startLeft}vw`
    wrap.style.animationDuration = `${duration}s`
    wrap.style.animationDelay = `${delay}s`

    const petal = document.createElement('div')
    petal.className = 'sakura-petal'
    petal.style.width = `${size}px`
    petal.style.height = `${size * 0.8}px`
    petal.style.animationDuration = `${duration}s`
    petal.style.animationDelay = `${delay}s`
    petal.style.setProperty('--sway', `${sway}px`)
    petal.style.setProperty('--rotate', `${rotate}deg`)
    petal.style.background = `linear-gradient(135deg, ${g[0]}, ${g[1]})`
    petal.style.opacity = '0.65'
    petal.style.pointerEvents = 'none'

    wrap.appendChild(petal)
    layer.appendChild(wrap)
  }

  for (let i = 0; i < count; i++) createPetal(i)

  const bInit = Math.max(1, Math.min(10, butterfliesCount || 0))
  const bCount = (!butterfliesEnabled || prefersReducedMotion) ? 0 : Math.max(0, Math.round(bInit * perfMul))
  if (bCount > 0) {
    for (let i = 0; i < bCount; i++) {
      const b = document.createElement('div')
      b.className = 'butterfly'
      const top = Math.random() * 60 + 10
      const duration = 20 + Math.random() * 20
      const delay = Math.random() * 10
      b.style.top = `${top}vh`
      b.style.animationDuration = `${duration}s`
      b.style.animationDelay = `${delay}s`
      b.style.left = `${-10 - Math.random() * 20}vw`
      layer.appendChild(b)
    }
  }

  // 挂载到容器
  container.appendChild(layer)

  return () => { if (layer.parentElement) layer.remove() }
}

