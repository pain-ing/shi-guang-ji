"use client";

import React, { useRef } from 'react'
import { useDecorationManager, type DecorationInitializer } from './manager'

export interface DecorationsHostProps {
  zIndex?: number
  initializers: DecorationInitializer[]
}

export const DecorationsHost: React.FC<DecorationsHostProps> = ({ zIndex = 9999, initializers }) => {
  const ref = useRef<HTMLDivElement>(null)
  useDecorationManager(ref, initializers)
  return (
    <div
      ref={ref}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        pointerEvents: 'none', overflow: 'hidden', zIndex,
      }}
    />
  )
}

