'use client';

import React, { useEffect } from 'react';
import { useThemeStore } from '@/stores/themeStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const initializeTheme = useThemeStore(state => state.initializeTheme);

  useEffect(() => {
    // 初始化主题
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
    const timer = setTimeout(addThemeTransitions, 100);

    return () => clearTimeout(timer);
  }, [initializeTheme]);

  return <>{children}</>;
};
