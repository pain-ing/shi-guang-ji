'use client';

import React, { useEffect, useRef } from 'react';

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

// 渐变色组：粉 -> 樱粉 -> 紫粉
const gradients = [
  ['hsl(340 90% 90%)', 'hsl(330 100% 85%)'],
  ['hsl(330 90% 88%)', 'hsl(315 100% 85%)'],
  ['hsl(320 100% 88%)', 'hsl(300 90% 85%)'],
  ['hsl(350 90% 92%)', 'hsl(320 100% 88%)'],
  ['hsl(300 90% 90%)', 'hsl(280 90% 85%)'],
];

export const Sakura: React.FC<SakuraProps> = ({ enabled = true, density = 30, zIndex = 10, speed = 1, butterfliesEnabled = false, butterfliesCount = 2, starlightEnabled = false, starlightDensity = 20 }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('Sakura: enabled =', enabled, 'density =', density, 'speed =', speed);
    if (!enabled || !containerRef.current) {
      console.log('Sakura: Not creating petals - enabled:', enabled, 'containerRef:', !!containerRef.current);
      return;
    }

    const container = containerRef.current;
    const count = Math.min(Math.max(density, 10), 150);
    const speedFactor = Math.max(0.5, Math.min(2, speed));
    console.log('Sakura: Creating', count, 'petals');

    // 清空旧元素
    container.innerHTML = '';

    const createPetal = (i: number) => {
      const petal = document.createElement('div');
      petal.className = 'sakura-petal';

      const startLeft = Math.random() * 100; // vw
      const size = 15 + Math.random() * 10; // 增大尺寸便于观察
      const duration = (8 + Math.random() * 6) / speedFactor; // 加快速度
      const delay = Math.random() * 3; // 减少延迟
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
      petal.style.zIndex = '9999';
      petal.style.position = 'absolute';
      
      // 添加调试信息
      console.log(`Created petal ${i}: left=${startLeft}vw, size=${size}px, duration=${duration}s`);

      container.appendChild(petal);
    };

    for (let i = 0; i < count; i++) createPetal(i);

    // 蝴蝶彩蛋
    if (butterfliesEnabled) {
      const c = Math.max(1, Math.min(10, butterfliesCount));
      for (let i = 0; i < c; i++) {
        const b = document.createElement('div');
        b.className = 'butterfly';
        const top = Math.random() * 60 + 10; // vh
        const duration = 20 + Math.random() * 20;
        const delay = Math.random() * 10;
        b.style.top = `${top}vh`;
        b.style.animationDuration = `${duration}s`;
        b.style.animationDelay = `${delay}s`;
        b.style.left = `${-10 - Math.random() * 20}vw`;
        container.appendChild(b);
      }
    }

    // 星光彩蛋
    if (starlightEnabled) {
      const d = Math.max(10, Math.min(100, starlightDensity));
      for (let i = 0; i < d; i++) {
        const s = document.createElement('div');
        s.className = 'twinkle-star';
        s.style.left = `${Math.random() * 100}vw`;
        s.style.top = `${Math.random() * 100}vh`;
        s.style.animationDelay = `${Math.random() * 5}s`;
        s.style.animationDuration = `${2 + Math.random() * 3}s`;
        container.appendChild(s);
      }
    }

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [enabled, density, speed, butterfliesEnabled, butterfliesCount, starlightEnabled, starlightDensity]);

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

