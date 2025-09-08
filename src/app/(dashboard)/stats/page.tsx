import { Metadata } from 'next'
import { StatsDashboard } from '@/components/analytics/StatsDashboard'

export const metadata: Metadata = {
  title: '统计分析 | 拾光集',
  description: '深入了解你的写作习惯、成长轨迹和成就进度',
  themeColor: '#14b8a6',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
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
