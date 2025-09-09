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

    // 性能与无障碍自适应（prefers-reduced-motion、deviceMemory、触控设备）
    const prefersReducedMotion = typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarse = typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(pointer: coarse)').matches;
    const deviceMemory = (navigator as any)?.deviceMemory as number | undefined;

    let perfMul = 1; // 密度缩放
    if (deviceMemory && deviceMemory <= 2) perfMul = Math.min(perfMul, 0.4);
    else if (deviceMemory && deviceMemory <= 4) perfMul = Math.min(perfMul, 0.6);
    if (isCoarse) perfMul = Math.min(perfMul, 0.6);

    const baseCount = Math.min(Math.max(density, 10), 150);
    const count = prefersReducedMotion ? 0 : Math.round(baseCount * perfMul);
    const speedFactor = Math.max(0.5, Math.min(2, speed)) * (prefersReducedMotion ? 0.8 : 1);
    console.log('Sakura: Creating', count, 'petals (prefersReducedMotion=', prefersReducedMotion, ', perfMul=', perfMul, ')');

    // 清空旧元素
    container.innerHTML = '';

    const createPetal = (i: number) => {
      // 外层包裹用于下落动画
      const wrap = document.createElement('div');
      wrap.className = 'sakura-petal-wrap';

      const startLeft = Math.random() * 100; // vw
      const size = (perfMul < 0.7 ? 10 + Math.random() * 6 : 12 + Math.random() * 8); // 自适应尺寸
      const duration = (8 + Math.random() * 6) / speedFactor; // 8-14秒（更柔和）
      const delay = Math.random() * 2.5; // 最多2.5秒，避免集中生成
      const sway = 18 + Math.random() * 18; // 18-36px（更自然）
      const rotate = Math.random() * 360;
      const g = gradients[i % gradients.length];

      wrap.style.left = `${startLeft}vw`;
      wrap.style.animationDuration = `${duration}s`;
      wrap.style.animationDelay = `${delay}s`;

      // 内层花瓣用于摇摆和旋转
      const petal = document.createElement('div');
      petal.className = 'sakura-petal';
      petal.style.width = `${size}px`;
      petal.style.height = `${size * 0.8}px`;
      petal.style.animationDuration = `${duration}s`;
      petal.style.animationDelay = `${delay}s`;
      petal.style.setProperty('--sway', `${sway}px`);
      petal.style.setProperty('--rotate', `${rotate}deg`);
      // 柔和粉色渐变
      petal.style.background = `linear-gradient(135deg, ${g[0]}, ${g[1]})`;
      petal.style.opacity = '0.65';
      petal.style.pointerEvents = 'none';

      // 添加调试信息
      console.log(`Created petal ${i}: left=${startLeft}vw, size=${size}px, duration=${duration}s`);

      wrap.appendChild(petal);
      container.appendChild(wrap);
    };

    for (let i = 0; i < count; i++) createPetal(i);

    // 蝴蝶彩蛋（自适应密度 & 减少动态）
    const bCountInit = Math.max(1, Math.min(10, butterfliesCount || 0));
    const bCount = (!butterfliesEnabled || prefersReducedMotion) ? 0 : Math.max(0, Math.round(bCountInit * perfMul));
    if (bCount > 0) {
      for (let i = 0; i < bCount; i++) {
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

    // 星光彩蛋（自适应密度 & 减少动态）
    const sInit = Math.max(10, Math.min(100, starlightDensity || 0));
    const sCount = (!starlightEnabled || prefersReducedMotion) ? 0 : Math.max(0, Math.round(sInit * perfMul));
    if (sCount > 0) {
      for (let i = 0; i < sCount; i++) {
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

