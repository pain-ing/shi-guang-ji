'use client'

import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

// 动态导入统计仪表板组件
const StatsDashboard = dynamic(
  () => import('@/components/analytics/StatsDashboard').then(mod => ({ default: mod.StatsDashboard })),
  {
    loading: () => <StatsLoadingSkeleton />,
    ssr: false // 禁用服务端渲染，减少首屏体积
  }
)

// 加载骨架屏组件
function StatsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* 头部骨架 */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      
      {/* 统计卡片骨架 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      
      {/* 图表骨架 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  )
}

export default function StatsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <StatsDashboard />
      </div>
    </div>
  )
}
