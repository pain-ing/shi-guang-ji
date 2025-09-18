'use client';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  fps: number;
  componentRenderCount: number;
  bundleSize: number;
}

interface ComponentMetrics {
  name: string;
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  lastRenderTime: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics;
  private componentMetrics: Map<string, ComponentMetrics> = new Map();
  private fpsCounter: number[] = [];
  private lastFrameTime = 0;
  private isMonitoring = false;
  private observers: ((metrics: PerformanceMetrics) => void)[] = [];

  private constructor() {
    this.metrics = {
      renderTime: 0,
      memoryUsage: 0,
      fps: 0,
      componentRenderCount: 0,
      bundleSize: 0
    };
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // 开始监控
  public startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.measureFPS();
    this.measureMemoryUsage();
    this.measureBundleSize();
    
    // 每秒更新一次指标
    setInterval(() => {
      this.updateMetrics();
      this.notifyObservers();
    }, 1000);
  }

  // 停止监控
  public stopMonitoring(): void {
    this.isMonitoring = false;
  }

  // 测量组件渲染性能
  public measureComponentRender<T>(
    componentName: string,
    renderFunction: () => T
  ): T {
    const startTime = performance.now();
    const result = renderFunction();
    const endTime = performance.now();
    const renderTime = endTime - startTime;

    this.updateComponentMetrics(componentName, renderTime);
    return result;
  }

  // 测量异步操作性能
  public async measureAsyncOperation<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    try {
      const result = await operation();
      const endTime = performance.now();
      console.log(`${operationName} completed in ${endTime - startTime}ms`);
      return result;
    } catch (error) {
      const endTime = performance.now();
      console.error(`${operationName} failed after ${endTime - startTime}ms:`, error);
      throw error;
    }
  }

  // 测量 FPS
  private measureFPS(): void {
    const measureFrame = (timestamp: number) => {
      if (this.lastFrameTime) {
        const delta = timestamp - this.lastFrameTime;
        const fps = 1000 / delta;
        
        this.fpsCounter.push(fps);
        if (this.fpsCounter.length > 60) {
          this.fpsCounter.shift();
        }
      }
      
      this.lastFrameTime = timestamp;
      
      if (this.isMonitoring) {
        requestAnimationFrame(measureFrame);
      }
    };
    
    requestAnimationFrame(measureFrame);
  }

  // 测量内存使用
  private measureMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
    }
  }

  // 测量 Bundle 大小
  private measureBundleSize(): void {
    if ('getEntriesByType' in performance) {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      let totalSize = 0;
      
      resources.forEach(resource => {
        if (resource.name.includes('.js') || resource.name.includes('.css')) {
          totalSize += resource.transferSize || 0;
        }
      });
      
      this.metrics.bundleSize = totalSize / 1024; // KB
    }
  }

  // 更新组件指标
  private updateComponentMetrics(componentName: string, renderTime: number): void {
    const existing = this.componentMetrics.get(componentName);
    
    if (existing) {
      existing.renderCount++;
      existing.totalRenderTime += renderTime;
      existing.averageRenderTime = existing.totalRenderTime / existing.renderCount;
      existing.lastRenderTime = renderTime;
    } else {
      this.componentMetrics.set(componentName, {
        name: componentName,
        renderCount: 1,
        totalRenderTime: renderTime,
        averageRenderTime: renderTime,
        lastRenderTime: renderTime
      });
    }
    
    this.metrics.componentRenderCount++;
  }

  // 更新总体指标
  private updateMetrics(): void {
    // 计算平均 FPS
    if (this.fpsCounter.length > 0) {
      this.metrics.fps = this.fpsCounter.reduce((sum, fps) => sum + fps, 0) / this.fpsCounter.length;
    }
    
    // 更新内存使用
    this.measureMemoryUsage();
  }

  // 获取当前指标
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // 获取组件指标
  public getComponentMetrics(): ComponentMetrics[] {
    return Array.from(this.componentMetrics.values());
  }

  // 获取性能报告
  public getPerformanceReport(): {
    overall: PerformanceMetrics;
    components: ComponentMetrics[];
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    
    // 分析 FPS
    if (this.metrics.fps < 30) {
      recommendations.push('FPS 过低，考虑优化动画或减少重渲染');
    }
    
    // 分析内存使用
    if (this.metrics.memoryUsage > 100) {
      recommendations.push('内存使用过高，检查是否存在内存泄漏');
    }
    
    // 分析组件渲染
    const slowComponents = Array.from(this.componentMetrics.values())
      .filter(comp => comp.averageRenderTime > 16) // 超过一帧时间
      .sort((a, b) => b.averageRenderTime - a.averageRenderTime);
    
    if (slowComponents.length > 0) {
      recommendations.push(`以下组件渲染较慢: ${slowComponents.slice(0, 3).map(c => c.name).join(', ')}`);
    }
    
    // 分析 Bundle 大小
    if (this.metrics.bundleSize > 1000) {
      recommendations.push('Bundle 大小过大，考虑代码分割和懒加载');
    }
    
    return {
      overall: this.getMetrics(),
      components: this.getComponentMetrics(),
      recommendations
    };
  }

  // 添加观察者
  public addObserver(callback: (metrics: PerformanceMetrics) => void): void {
    this.observers.push(callback);
  }

  // 移除观察者
  public removeObserver(callback: (metrics: PerformanceMetrics) => void): void {
    const index = this.observers.indexOf(callback);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  // 通知观察者
  private notifyObservers(): void {
    this.observers.forEach(callback => callback(this.getMetrics()));
  }

  // 导出性能数据
  public exportMetrics(): string {
    const report = this.getPerformanceReport();
    return JSON.stringify(report, null, 2);
  }

  // 重置指标
  public reset(): void {
    this.componentMetrics.clear();
    this.fpsCounter = [];
    this.metrics = {
      renderTime: 0,
      memoryUsage: 0,
      fps: 0,
      componentRenderCount: 0,
      bundleSize: 0
    };
  }
}

// React Hook 用于性能监控
export function usePerformanceMonitor() {
  const monitor = PerformanceMonitor.getInstance();
  
  return {
    startMonitoring: () => monitor.startMonitoring(),
    stopMonitoring: () => monitor.stopMonitoring(),
    measureRender: <T>(componentName: string, renderFn: () => T) => 
      monitor.measureComponentRender(componentName, renderFn),
    measureAsync: <T>(operationName: string, operation: () => Promise<T>) =>
      monitor.measureAsyncOperation(operationName, operation),
    getMetrics: () => monitor.getMetrics(),
    getReport: () => monitor.getPerformanceReport(),
    exportMetrics: () => monitor.exportMetrics(),
    reset: () => monitor.reset()
  };
}

// HOC 用于自动测量组件性能
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const WrappedComponent = (props: P) => {
    const monitor = PerformanceMonitor.getInstance();
    const name = componentName || Component.displayName || Component.name || 'Unknown';

    return monitor.measureComponentRender(name, () => {
      const React = require('react');
      return React.createElement(Component, props);
    });
  };
  
  WrappedComponent.displayName = `withPerformanceMonitoring(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

export default PerformanceMonitor;
