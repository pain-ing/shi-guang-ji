import React from 'react'
import { render, cleanup } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Starlight } from './Starlight'

function mockMatchMedia(map: Record<string, boolean>) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: !!map[query],
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  })
}

describe('useStarlightDOM via Starlight component', () => {
  beforeEach(() => {
    cleanup()
    mockMatchMedia({})
    Object.defineProperty(navigator, 'deviceMemory', { writable: true, value: undefined })
  })

  it('creates expected number of stars for given density', () => {
    const { container } = render(<Starlight enabled density={12} />)
    expect(container.querySelectorAll('.twinkle-star').length).toBe(12)
  })

  it('does not create stars when prefers-reduced-motion is true', () => {
    mockMatchMedia({ '(prefers-reduced-motion: reduce)': true })
    const { container } = render(<Starlight enabled density={20} />)
    expect(container.querySelectorAll('.twinkle-star').length).toBe(0)
  })
})

