'use client';

import React, { useEffect, useRef } from 'react';

interface SakuraProps {
  enabled?: boolean;
  density?: number; // 10 - 150
  zIndex?: number;
}

// 渐变色组：粉 -> 樱粉 -> 紫粉
const gradients = [
  ['hsl(340 90% 90%)', 'hsl(330 100% 85%)'],
  ['hsl(330 90% 88%)', 'hsl(315 100% 85%)'],
  ['hsl(320 100% 88%)', 'hsl(300 90% 85%)'],
  ['hsl(350 90% 92%)', 'hsl(320 100% 88%)'],
  ['hsl(300 90% 90%)', 'hsl(280 90% 85%)'],
];

export const Sakura: React.FC<SakuraProps> = ({ enabled = true, density = 30, zIndex = 10 }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    const count = Math.min(Math.max(density, 10), 150);

    // 清空旧元素
    container.innerHTML = '';

    const createPetal = (i: number) => {
      const petal = document.createElement('div');
      petal.className = 'sakura-petal';

      const startLeft = Math.random() * 100; // vw
      const size = 8 + Math.random() * 10; // px
      const duration = 10 + Math.random() * 14; // s
      const delay = Math.random() * 10; // s
      const sway = 30 + Math.random() * 30; // px
      const rotate = Math.random() * 360;
      const g = gradients[i % gradients.length];

      petal.style.left = `${startLeft}vw`;
      petal.style.width = `${size}px`;
      petal.style.height = `${size * 0.8}px`;
      petal.style.animationDuration = `${duration}s`;
      petal.style.animationDelay = `${delay}s`;
      petal.style.setProperty('--sway', `${sway}px`);
      petal.style.setProperty('--rotate', `${rotate}deg`);
      petal.style.background = `linear-gradient(135deg, ${g[0]}, ${g[1]})`;

      container.appendChild(petal);
    };

    for (let i = 0; i < count; i++) createPetal(i);

    return () => {
      container.innerHTML = '';
    };
  }, [enabled, density]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex,
      }}
    />
  );
};

