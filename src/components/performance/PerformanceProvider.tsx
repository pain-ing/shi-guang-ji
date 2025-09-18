'use client';

import React, { useEffect } from 'react';
import { usePerformanceMonitor } from '@/utils/performanceMonitor';

interface PerformanceProviderProps {
  children?: React.ReactNode;
}

export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({ children }) => {
  const { startMonitoring, stopMonitoring } = usePerformanceMonitor();

  useEffect(() => {
    // 只在开发环境或启用性能监控时启动
    const shouldMonitor = 
      process.env.NODE_ENV === 'development' || 
      process.env.NEXT_PUBLIC_PERFORMANCE_MONITORING === 'true';

    if (shouldMonitor) {
      console.log('🚀 Performance monitoring started');
      startMonitoring();

      // 在页面卸载时停止监控
      return () => {
        console.log('⏹️ Performance monitoring stopped');
        stopMonitoring();
      };
    }
  }, [startMonitoring, stopMonitoring]);

  // 这个组件不渲染任何内容，只是启用性能监控
  return children ? <>{children}</> : null;
};
