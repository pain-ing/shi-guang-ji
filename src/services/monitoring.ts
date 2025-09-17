/**
 * 性能监控服务
 * 支持错误追踪、性能指标收集、用户行为分析
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  tags?: Record<string, string>;
}

export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  source: string;
  timestamp: number;
  userAgent: string;
  url: string;
  metadata?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface UserAction {
  type: string;
  target?: string;
  timestamp: number;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface SessionData {
  id: string;
  startTime: number;
  endTime?: number;
  userId?: string;
  actions: UserAction[];
  metrics: PerformanceMetric[];
  errors: ErrorReport[];
}

export interface AnalyticsReport {
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    pageViews: number;
    uniqueUsers: number;
    sessionDuration: number;
    bounceRate: number;
    errorRate: number;
  };
  performance: {
    loadTime: number;
    renderTime: number;
    interactionTime: number;
    memoryUsage: number;
  };
  topPages: Array<{ url: string; views: number }>;
  topErrors: Array<{ message: string; count: number }>;
}

class MonitoringService {
  private session: SessionData | null = null;
  private metricsQueue: PerformanceMetric[] = [];
  private errorsQueue: ErrorReport[] = [];
  private actionsQueue: UserAction[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private observers: Map<string, PerformanceObserver> = new Map();
  private reportCallbacks: Set<(data: any) => void> = new Set();

  constructor() {
    this.initializeSession();
    this.setupErrorHandling();
    this.setupPerformanceObservers();
    this.setupVisibilityTracking();
    this.startFlushInterval();
  }

  /**
   * 初始化会话
   */
  private initializeSession() {
    this.session = {
      id: this.generateSessionId(),
      startTime: Date.now(),
      actions: [],
      metrics: [],
      errors: []
    };
  }

  /**
   * 设置错误处理
   */
  private setupErrorHandling() {
    // 全局错误捕获
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.trackError({
          message: event.message,
          source: event.filename || 'unknown',
          stack: event.error?.stack,
          severity: 'high'
        });
      });

      // Promise 拒绝处理
      window.addEventListener('unhandledrejection', (event) => {
        this.trackError({
          message: `Unhandled Promise Rejection: ${event.reason}`,
          source: 'promise',
          stack: event.reason?.stack,
          severity: 'high'
        });
      });
    }
  }

  /**
   * 设置性能观察器
   */
  private setupPerformanceObservers() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // 导航时间
      this.observePerformance('navigation', ['navigation'], (entries) => {
        entries.forEach((entry: any) => {
          this.trackMetric('page.load', entry.loadEventEnd - entry.fetchStart, 'ms');
          this.trackMetric('dom.interactive', entry.domInteractive - entry.fetchStart, 'ms');
          this.trackMetric('dom.complete', entry.domComplete - entry.fetchStart, 'ms');
        });
      });

      // 首次内容绘制 (FCP)
      this.observePerformance('paint', ['paint'], (entries) => {
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.trackMetric('fcp', entry.startTime, 'ms');
          }
        });
      });

      // 最大内容绘制 (LCP)
      this.observePerformance('lcp', ['largest-contentful-paint'], (entries) => {
        const lastEntry = entries[entries.length - 1];
        this.trackMetric('lcp', lastEntry.startTime, 'ms');
      });

      // 首次输入延迟 (FID)
      this.observePerformance('fid', ['first-input'], (entries) => {
        const firstEntry = entries[0] as any;
        this.trackMetric('fid', firstEntry.processingStart - firstEntry.startTime, 'ms');
      });

      // 累积布局偏移 (CLS)
      let clsValue = 0;
      this.observePerformance('cls', ['layout-shift'], (entries) => {
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.trackMetric('cls', clsValue, 'score');
          }
        });
      });

      // 长任务
      this.observePerformance('longtask', ['longtask'], (entries) => {
        entries.forEach((entry) => {
          this.trackMetric('long.task', entry.duration, 'ms', {
            name: entry.name
          });
        });
      });
    }
  }

  /**
   * 设置可见性追踪
   */
  private setupVisibilityTracking() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.trackAction('page.hidden');
        } else {
          this.trackAction('page.visible');
        }
      });
    }
  }

  /**
   * 开始定时刷新
   */
  private startFlushInterval() {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 30000); // 每30秒刷新一次
  }

  /**
   * 创建性能观察器
   */
  private observePerformance(
    name: string,
    entryTypes: string[],
    callback: (entries: PerformanceEntry[]) => void
  ) {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      observer.observe({ entryTypes });
      this.observers.set(name, observer);
    } catch (error) {
      console.warn(`Failed to observe ${name}:`, error);
    }
  }

  /**
   * 跟踪性能指标
   */
  trackMetric(
    name: string,
    value: number,
    unit: string = 'ms',
    tags?: Record<string, string>
  ) {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      tags
    };

    this.metricsQueue.push(metric);
    
    if (this.session) {
      this.session.metrics.push(metric);
    }

    // 内存监控
    if (name === 'memory' && typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      if (memory) {
        this.trackMetric('memory.used', memory.usedJSHeapSize / 1048576, 'MB');
        this.trackMetric('memory.total', memory.totalJSHeapSize / 1048576, 'MB');
        this.trackMetric('memory.limit', memory.jsHeapSizeLimit / 1048576, 'MB');
      }
    }
  }

  /**
   * 跟踪错误
   */
  trackError(error: Partial<ErrorReport>) {
    const errorReport: ErrorReport = {
      id: this.generateId(),
      message: error.message || 'Unknown error',
      stack: error.stack,
      source: error.source || 'unknown',
      timestamp: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      url: typeof window !== 'undefined' ? window.location.href : '',
      metadata: error.metadata,
      severity: error.severity || 'medium'
    };

    this.errorsQueue.push(errorReport);
    
    if (this.session) {
      this.session.errors.push(errorReport);
    }

    // 严重错误立即上报
    if (errorReport.severity === 'critical' || errorReport.severity === 'high') {
      this.flush();
    }

    console.error('[Monitor]', errorReport);
  }

  /**
   * 跟踪用户行为
   */
  trackAction(type: string, metadata?: Record<string, any>) {
    const action: UserAction = {
      type,
      timestamp: Date.now(),
      metadata
    };

    this.actionsQueue.push(action);
    
    if (this.session) {
      this.session.actions.push(action);
    }
  }

  /**
   * 跟踪页面浏览
   */
  trackPageView(page: string, metadata?: Record<string, any>) {
    this.trackAction('page.view', {
      page,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      ...metadata
    });
  }

  /**
   * 跟踪事件
   */
  trackEvent(category: string, action: string, label?: string, value?: number) {
    this.trackAction('event', {
      category,
      action,
      label,
      value
    });
  }

  /**
   * 跟踪时间
   */
  startTiming(name: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      this.trackMetric(`timing.${name}`, duration, 'ms');
      return duration;
    };
  }

  /**
   * 获取性能报告
   */
  getPerformanceReport(): Record<string, any> {
    const navigation = performance.getEntriesByType('navigation')[0] as any;
    const paintEntries = performance.getEntriesByType('paint');

    const report: Record<string, any> = {
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // 导航时间
    if (navigation) {
      report.navigation = {
        fetchStart: navigation.fetchStart,
        domainLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        request: navigation.responseStart - navigation.requestStart,
        response: navigation.responseEnd - navigation.responseStart,
        domInteractive: navigation.domInteractive - navigation.fetchStart,
        domComplete: navigation.domComplete - navigation.fetchStart,
        loadComplete: navigation.loadEventEnd - navigation.fetchStart
      };
    }

    // 绘制时间
    report.paint = {};
    paintEntries.forEach((entry) => {
      report.paint[entry.name] = entry.startTime;
    });

    // 内存使用
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      report.memory = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      };
    }

    // 连接信息
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      report.connection = {
        effectiveType: connection.effectiveType,
        rtt: connection.rtt,
        downlink: connection.downlink
      };
    }

    return report;
  }

  /**
   * 生成分析报告
   */
  async generateAnalyticsReport(startDate: Date, endDate: Date): Promise<AnalyticsReport> {
    // 这里应该从服务器获取数据，现在使用本地数据模拟
    const metrics = this.metricsQueue.filter(m => 
      m.timestamp >= startDate.getTime() && m.timestamp <= endDate.getTime()
    );

    const errors = this.errorsQueue.filter(e =>
      e.timestamp >= startDate.getTime() && e.timestamp <= endDate.getTime()
    );

    const actions = this.actionsQueue.filter(a =>
      a.timestamp >= startDate.getTime() && a.timestamp <= endDate.getTime()
    );

    // 计算指标
    const pageViews = actions.filter(a => a.type === 'page.view').length;
    const uniqueUsers = new Set(actions.map(a => a.metadata?.userId)).size;
    const totalDuration = actions.reduce((sum, a) => sum + (a.duration || 0), 0);
    const sessionCount = Math.max(1, Math.floor(pageViews / 5)); // 简化计算
    const sessionDuration = totalDuration / sessionCount;
    const bounceRate = pageViews > 0 ? (pageViews - uniqueUsers) / pageViews : 0;
    const errorRate = errors.length / Math.max(1, pageViews);

    // 性能指标平均值
    const loadTimes = metrics.filter(m => m.name === 'page.load').map(m => m.value);
    const renderTimes = metrics.filter(m => m.name === 'dom.complete').map(m => m.value);
    const fidValues = metrics.filter(m => m.name === 'fid').map(m => m.value);
    const memoryValues = metrics.filter(m => m.name === 'memory.used').map(m => m.value);

    const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    // 页面统计
    const pageMap = new Map<string, number>();
    actions.filter(a => a.type === 'page.view').forEach(a => {
      const page = a.metadata?.page || 'unknown';
      pageMap.set(page, (pageMap.get(page) || 0) + 1);
    });
    const topPages = Array.from(pageMap.entries())
      .map(([url, views]) => ({ url, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // 错误统计
    const errorMap = new Map<string, number>();
    errors.forEach(e => {
      errorMap.set(e.message, (errorMap.get(e.message) || 0) + 1);
    });
    const topErrors = Array.from(errorMap.entries())
      .map(([message, count]) => ({ message, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      period: {
        start: startDate,
        end: endDate
      },
      metrics: {
        pageViews,
        uniqueUsers,
        sessionDuration,
        bounceRate,
        errorRate
      },
      performance: {
        loadTime: avg(loadTimes),
        renderTime: avg(renderTimes),
        interactionTime: avg(fidValues),
        memoryUsage: avg(memoryValues)
      },
      topPages,
      topErrors
    };
  }

  /**
   * 刷新队列
   */
  private flush() {
    if (this.metricsQueue.length === 0 && 
        this.errorsQueue.length === 0 && 
        this.actionsQueue.length === 0) {
      return;
    }

    const data = {
      sessionId: this.session?.id,
      metrics: [...this.metricsQueue],
      errors: [...this.errorsQueue],
      actions: [...this.actionsQueue],
      timestamp: Date.now()
    };

    // 清空队列
    this.metricsQueue = [];
    this.errorsQueue = [];
    this.actionsQueue = [];

    // 通知所有回调
    this.reportCallbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Report callback error:', error);
      }
    });

    // 这里可以将数据发送到服务器
    this.sendToServer(data);
  }

  /**
   * 发送数据到服务器
   */
  private async sendToServer(data: any) {
    // 在实际应用中，这里应该发送到真实的监控服务
    if (typeof window !== 'undefined' && 'navigator' in window && 'sendBeacon' in navigator) {
      // 使用 sendBeacon API 确保数据发送
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      // navigator.sendBeacon('/api/monitoring', blob);
    } else {
      // 降级方案：使用 fetch
      // fetch('/api/monitoring', {
      //   method: 'POST',
      //   body: JSON.stringify(data),
      //   headers: { 'Content-Type': 'application/json' }
      // });
    }

    // 开发环境下输出到控制台
    if (process.env.NODE_ENV === 'development') {
      console.log('[Monitor] Data flushed:', data);
    }
  }

  /**
   * 注册报告回调
   */
  onReport(callback: (data: any) => void) {
    this.reportCallbacks.add(callback);
    return () => {
      this.reportCallbacks.delete(callback);
    };
  }

  /**
   * 清理资源
   */
  destroy() {
    // 停止定时器
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }

    // 断开观察器
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();

    // 最后一次刷新
    this.flush();

    // 结束会话
    if (this.session) {
      this.session.endTime = Date.now();
      this.session = null;
    }
  }

  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 生成ID
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 导出单例
export const monitoringService = new MonitoringService();