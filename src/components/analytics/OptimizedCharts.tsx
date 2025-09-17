'use client'

import React, { memo, useMemo, lazy, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { TrendData, MoodStats } from '@/lib/analytics'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// 动态导入Recharts组件，按需加载
const LineChart = dynamic<any>(() => import('recharts').then(mod => mod.LineChart), {
  ssr: false,
  loading: () => <ChartSkeleton />
})

const Line = dynamic<any>(() => import('recharts').then(mod => mod.Line), { ssr: false })
const AreaChart = dynamic<any>(() => import('recharts').then(mod => mod.AreaChart), { ssr: false })
const Area = dynamic<any>(() => import('recharts').then(mod => mod.Area), { ssr: false })
const BarChart = dynamic<any>(() => import('recharts').then(mod => mod.BarChart), { ssr: false })
const Bar = dynamic<any>(() => import('recharts').then(mod => mod.Bar), { ssr: false })
const PieChart = dynamic<any>(() => import('recharts').then(mod => mod.PieChart), { ssr: false })
const Pie = dynamic<any>(() => import('recharts').then(mod => mod.Pie), { ssr: false })
const Cell = dynamic<any>(() => import('recharts').then(mod => mod.Cell), { ssr: false })
const ResponsiveContainer = dynamic<any>(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false })
const XAxis = dynamic<any>(() => import('recharts').then(mod => mod.XAxis), { ssr: false })
const YAxis = dynamic<any>(() => import('recharts').then(mod => mod.YAxis), { ssr: false })
const CartesianGrid = dynamic<any>(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false })
const Tooltip = dynamic<any>(() => import('recharts').then(mod => mod.Tooltip), { ssr: false })
const Legend = dynamic<any>(() => import('recharts').then(mod => mod.Legend), { ssr: false })

// 加载骨架屏
function ChartSkeleton() {
  return <Skeleton className="h-80 w-full" />
}

// 趋势图组件 - 使用React.memo优化
interface TrendChartProps {
  data: TrendData[]
  className?: string
}

export const OptimizedTrendChart = memo(function TrendChart({ data, className }: TrendChartProps) {
  // 使用useMemo缓存处理后的数据
  const processedData = useMemo(() => {
    // 限制数据点数量，减少渲染负担
    if (data.length > 30) {
      const step = Math.ceil(data.length / 30)
      return data.filter((_, index) => index % step === 0)
    }
    return data
  }, [data])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>📈</span>
          <span>写作趋势</span>
        </CardTitle>
        <CardDescription>日记和打卡的时间趋势分析</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <Suspense fallback={<ChartSkeleton />}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="diaries"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={false} // 减少DOM节点
                  name="日记数量"
                />
                <Line
                  type="monotone"
                  dataKey="checkIns"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  name="打卡次数"
                />
              </LineChart>
            </ResponsiveContainer>
          </Suspense>
        </div>
      </CardContent>
    </Card>
  )
})

// 心情饼图组件 - 优化版
interface MoodPieChartProps {
  data: MoodStats[]
  className?: string
}

export const OptimizedMoodPieChart = memo(function MoodPieChart({ data, className }: MoodPieChartProps) {
  const COLORS = useMemo(() => [
    '#6366f1', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'
  ], [])

  // 限制显示的心情种类
  const limitedData = useMemo(() => {
    return data.slice(0, 6).map(item => ({
      ...item,
      percentage: ((item.count / data.reduce((sum, d) => sum + d.count, 0)) * 100).toFixed(1)
    }))
  }, [data])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>🎭</span>
          <span>心情分布</span>
        </CardTitle>
        <CardDescription>不同心情状态的统计占比</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <Suspense fallback={<ChartSkeleton />}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={limitedData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ percentage }: any) => `${percentage}%`}
                >
                  {limitedData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Suspense>
        </div>
      </CardContent>
    </Card>
  )
})

// 迷你图表组件
interface MiniChartProps {
  data: number[]
  type: 'line' | 'bar'
  color: string
  className?: string
}

export const OptimizedMiniChart = memo(function MiniChart({ 
  data, 
  type, 
  color, 
  className 
}: MiniChartProps) {
  const chartData = useMemo(() => {
    // 限制数据点
    const limitedData = data.slice(-10)
    return limitedData.map((value, index) => ({ value, index }))
  }, [data])

  return (
    <div className={`h-16 w-full ${className}`}>
      <Suspense fallback={<Skeleton className="h-full w-full" />}>
        <ResponsiveContainer width="100%" height="100%">
          {type === 'line' ? (
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          ) : (
            <BarChart data={chartData}>
              <Bar dataKey="value" fill={color} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </Suspense>
    </div>
  )
})

// 进度环形图组件 - 纯CSS实现，不依赖外部库
interface ProgressRingProps {
  percentage: number
  size?: number
  strokeWidth?: number
  color?: string
  backgroundColor?: string
  children?: React.ReactNode
  className?: string
}

export const OptimizedProgressRing = memo(function ProgressRing({ 
  percentage, 
  size = 120, 
  strokeWidth = 8, 
  color = '#6366f1',
  backgroundColor = '#e5e7eb',
  children,
  className 
}: ProgressRingProps) {
  const radius = useMemo(() => (size - strokeWidth) / 2, [size, strokeWidth])
  const circumference = useMemo(() => radius * 2 * Math.PI, [radius])
  const offset = useMemo(() => circumference - (percentage / 100) * circumference, [circumference, percentage])

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  )
})