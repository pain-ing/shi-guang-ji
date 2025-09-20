import React from 'react'
import { render, screen, cleanup } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'

// ---- dynamic mocks helpers ----
let currentPath = '/'
let currentDecorations: any = {
  sakuraEnabled: true,
  sakuraDensity: 40,
  sakuraSpeed: 1,
  sakuraScope: 'all',
  sakuraPages: [],
  surprises: {
    butterfliesEnabled: false,
    butterfliesCount: 2,
    starlightEnabled: false,
    starlightDensity: 20,
  },
}

vi.mock('next/navigation', () => ({
  usePathname: () => currentPath,
}))

vi.mock('@/stores/themeStore', () => ({
  useThemeStore: () => ({ decorations: currentDecorations }),
}))


import { SakuraProvider } from './SakuraProvider'

describe('SakuraProvider visibility rules', () => {
  beforeEach(() => {
    cleanup()
    currentPath = '/'
    currentDecorations = {
      sakuraEnabled: true,
      sakuraDensity: 40,
      sakuraSpeed: 1,
      sakuraScope: 'all',
      sakuraPages: [],
      surprises: {
        butterfliesEnabled: false,
        butterfliesCount: 2,
        starlightEnabled: false,
        starlightDensity: 20,
      },
    }
  })

  it('does not render when sakuraEnabled=false', () => {
    currentDecorations.sakuraEnabled = false
    render(<SakuraProvider />)
    expect(document.querySelector('.sakura-petal-wrap')).toBeNull()
  })

  it('renders when scope=all', () => {
    currentDecorations.sakuraScope = 'all'
    render(<SakuraProvider />)
    expect(document.querySelector('.sakura-petal-wrap')).not.toBeNull()
  })

  it('renders only when include prefixes match', () => {
    currentDecorations.sakuraScope = 'include'
    currentDecorations.sakuraPages = ['/a', '/b']

    currentPath = '/a/1'
    render(<SakuraProvider />)
    expect(document.querySelector('.sakura-petal-wrap')).not.toBeNull()

    cleanup()
    currentPath = '/c/2'
    render(<SakuraProvider />)
    expect(document.querySelector('.sakura-petal-wrap')).toBeNull()
  })

  it('does not render when exclude prefixes match', () => {
    currentDecorations.sakuraScope = 'exclude'
    currentDecorations.sakuraPages = ['/private', '/admin']

    currentPath = '/private/zone'
    render(<SakuraProvider />)
    expect(document.querySelector('.sakura-petal-wrap')).toBeNull()

    cleanup()
    currentPath = '/public/page'
    render(<SakuraProvider />)
    expect(document.querySelector('.sakura-petal-wrap')).not.toBeNull()
  })

  it('safe fallback with empty pages list', () => {
    currentDecorations.sakuraScope = 'include'
    currentDecorations.sakuraPages = []
    render(<SakuraProvider />)
    // include + empty => none
    expect(document.querySelector('.sakura-petal-wrap')).toBeNull()

    cleanup()
    currentDecorations.sakuraScope = 'exclude'
    render(<SakuraProvider />)
    // exclude + empty => show
    expect(document.querySelector('.sakura-petal-wrap')).not.toBeNull()
  })
})

