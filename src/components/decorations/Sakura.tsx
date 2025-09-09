'use client';

import React, { useRef } from 'react';
import { useSakuraDOM } from './useSakuraDOM';

interface SakuraProps {
  enabled?: boolean;
  density?: number; // 10 - 150
  zIndex?: number;
  speed?: number; // 0.5 - 2.0 倍速
  butterfliesEnabled?: boolean;
  butterfliesCount?: number; // 1-10
  starlightEnabled?: boolean;
  starlightDensity?: number; // 10-100
}



export const Sakura: React.FC<SakuraProps> = ({ enabled = true, density = 30, zIndex = 10, speed = 1, butterfliesEnabled = false, butterfliesCount = 2, starlightEnabled = false, starlightDensity = 20 }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useSakuraDOM(containerRef, {
    enabled,
    density,
    speed,
    butterfliesEnabled,
    butterfliesCount,
    starlightEnabled,
    starlightDensity,
  });

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 9999, // 确保樱花在最顶层
      }}
    />
  );
};

