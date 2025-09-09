import React from 'react'
import { render, cleanup } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Sakura } from './Sakura'

function mockMatchMedia(map: Record<string, boolean>) {
  // @ts-expect-error
  global.window.matchMedia = (query: string) => ({
    matches: !!map[query],
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })
}

describe('useSakuraDOM hook via Sakura component', () => {
  beforeEach(() => {
    cleanup()
    mockMatchMedia({})
    // @ts-expect-error
    ;(navigator as any).deviceMemory = undefined
  })

  it('creates expected number of petals for given density', () => {
    const { container } = render(
      <Sakura enabled density={12} speed={1} butterfliesEnabled={false} starlightEnabled={false} />
    )
    const petals = container.querySelectorAll('.sakura-petal-wrap')
    expect(petals.length).toBe(12)
  })

  it('does not create elements when prefers-reduced-motion is true', () => {
    mockMatchMedia({ '(prefers-reduced-motion: reduce)': true })
    const { container } = render(
      <Sakura enabled density={20} speed={1} butterfliesEnabled starlightEnabled />
    )
    expect(container.querySelectorAll('.sakura-petal-wrap').length).toBe(0)
    expect(container.querySelectorAll('.butterfly').length).toBe(0)
    expect(container.querySelectorAll('.twinkle-star').length).toBe(0)
  })

  it('creates butterflies and starlight when enabled with counts', () => {
    const { container } = render(
      <Sakura enabled density={10} speed={1} butterfliesEnabled butterfliesCount={3} starlightEnabled starlightDensity={15} />
    )
    expect(container.querySelectorAll('.butterfly').length).toBe(3)
    expect(container.querySelectorAll('.twinkle-star').length).toBe(15)
  })

  it('cleans up DOM when disabled', () => {
    const { container, rerender } = render(
      <Sakura enabled density={10} speed={1} />
    )
    expect(container.querySelectorAll('.sakura-petal-wrap').length).toBe(10)

    rerender(<Sakura enabled={false} density={10} speed={1} />)
    expect(container.querySelectorAll('.sakura-petal-wrap').length).toBe(0)
    const target = container.firstElementChild as HTMLElement | null
    expect(target?.innerHTML.trim()).toBe('')
  })
})

