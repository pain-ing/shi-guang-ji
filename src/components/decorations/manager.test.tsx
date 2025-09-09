import React from 'react'
import { render, cleanup } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { DecorationsHost } from './DecorationsHost'

const markerClass = 'x-marker'

function createDummyInitializer(id: string) {
  return (container: HTMLElement) => {
    const el = document.createElement('div')
    el.className = `${markerClass} ${id}`
    container.appendChild(el)
    return () => { el.remove() }
  }
}

describe('useDecorationManager with DecorationsHost', () => {
  beforeEach(() => cleanup())

  it('mounts and cleans up single initializer', () => {
    const { container, unmount } = render(
      <DecorationsHost initializers={[createDummyInitializer('a')]} />
    )
    expect(container.querySelectorAll(`.${markerClass}`).length).toBe(1)
    unmount()
    expect(container.querySelectorAll(`.${markerClass}`).length).toBe(0)
  })

  it('supports multiple initializers', () => {
    const { container, unmount } = render(
      <DecorationsHost initializers={[createDummyInitializer('a'), createDummyInitializer('b')]} />
    )
    expect(container.querySelectorAll(`.${markerClass}`).length).toBe(2)
    unmount()
    expect(container.querySelectorAll(`.${markerClass}`).length).toBe(0)
  })
})

