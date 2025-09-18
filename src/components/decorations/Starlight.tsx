"use client";

import React, { useRef } from 'react';
import { useStarlightDOM } from './useStarlightDOM';

interface StarlightProps {
  enabled?: boolean;
  density?: number; // 10 - 100
}

export const Starlight: React.FC<StarlightProps> = ({ enabled = true, density = 20 }) => {
  const ref = useRef<HTMLDivElement>(null)
  useStarlightDOM(ref, { enabled, density })
  return (
    <div
      ref={ref}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 9999 }}
    />
  )
}

