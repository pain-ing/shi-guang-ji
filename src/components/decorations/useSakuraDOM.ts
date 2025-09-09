import { useEffect } from 'react'
import type { SakuraConfig } from './types'

// 渐变色组：粉 -> 樱粉 -> 紫粉
const gradients = [
  ['hsl(340 90% 90%)', 'hsl(330 100% 85%)'],
  ['hsl(330 90% 88%)', 'hsl(315 100% 85%)'],
  ['hsl(320 100% 88%)', 'hsl(300 90% 85%)'],
  ['hsl(350 90% 92%)', 'hsl(320 100% 88%)'],
  ['hsl(300 90% 90%)', 'hsl(280 90% 85%)'],
] as const

export function useSakuraDOM(
  container: React.RefObject<HTMLDivElement>,
  {
    enabled = true,
    density = 30,
    speed = 1,
    butterfliesEnabled = false,
    butterfliesCount = 2,
    starlightEnabled = false,
    starlightDensity = 20,
  }: SakuraConfig,
) {
  useEffect(() => {
    if (!enabled || !container.current) return

    const el = container.current

    // 性能与无障碍自适应
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

    // 清空旧元素
    el.innerHTML = ''

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
      el.appendChild(wrap)
    }

    for (let i = 0; i < count; i++) createPetal(i)

    // 蝴蝶
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
        el.appendChild(b)
      }
    }

    // 星光
    const sInit = Math.max(10, Math.min(100, starlightDensity || 0))
    const sCount = (!starlightEnabled || prefersReducedMotion) ? 0 : Math.max(0, Math.round(sInit * perfMul))
    if (sCount > 0) {
      for (let i = 0; i < sCount; i++) {
        const s = document.createElement('div')
        s.className = 'twinkle-star'
        s.style.left = `${Math.random() * 100}vw`
        s.style.top = `${Math.random() * 100}vh`
        s.style.animationDelay = `${Math.random() * 5}s`
        s.style.animationDuration = `${2 + Math.random() * 3}s`
        el.appendChild(s)
      }
    }

    return () => { el && (el.innerHTML = '') }
  }, [enabled, density, speed, butterfliesEnabled, butterfliesCount, starlightEnabled, starlightDensity])
}

