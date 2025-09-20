import { useEffect } from 'react'

export type DecorationInitializer = (container: HTMLElement) => void | (() => void)

export function useDecorationManager(ref: React.RefObject<HTMLDivElement>, initializers: DecorationInitializer[]) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const cleanups: Array<(() => void) | void> = []
    for (const init of initializers) {
      try {
        const c = init(el)
        cleanups.push(c)
      } catch (e) {
        // fail-safe: continue others
        // eslint-disable-next-line no-console
        console.warn('Decoration init failed:', e)
      }
    }
    return () => {
      for (const c of cleanups.reverse()) {
        try {
          if (typeof c === 'function') {
            c()
          }
        } catch {}

      }
      // 最后清空容器，防御性处理
      el.innerHTML = ''
    }
  }, [ref, ...initializers])
}

