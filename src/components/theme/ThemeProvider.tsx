'use client';

import React, { useEffect } from 'react';
import { useThemeStore } from '@/stores/themeStore';
import { applyTheme } from '@/lib/themes';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { initializeTheme, currentTheme } = useThemeStore();

  useEffect(() => {
    // 初始化主题
    console.log('ThemeProvider: Initializing theme...');
    initializeTheme();

    // 确保所有元素都有主题过渡效果
    const addThemeTransitions = () => {
      const elements = document.querySelectorAll('*');
      elements.forEach(el => {
        if (el instanceof HTMLElement) {
          el.classList.add('theme-transition');
        }
      });
    };

    // 延迟添加过渡效果，避免初始化时的闪烁
    const timer = setTimeout(addThemeTransitions, 200);

    return () => clearTimeout(timer);
  }, [initializeTheme]);

  // 监听主题变化并确保正确应用
  useEffect(() => {
    if (currentTheme && typeof window !== 'undefined') {
      // 在主题变化时重新应用
      console.log('ThemeProvider: Applying theme:', currentTheme.id, currentTheme.displayName);
      applyTheme(currentTheme);
    }
  }, [currentTheme]);

  return <>{children}</>;
};
