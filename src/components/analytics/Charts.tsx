'use client'

import React from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { TrendData, MoodStats, ActivityData } from '@/lib/analytics'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// 趋势图组件
interface TrendChartProps {
  data: TrendData[]
  className?: string
}

export function TrendChart({ data, className }: TrendChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>📈</span>
          <span>写作趋势</span>
        </CardTitle>
        <CardDescription>
          日记和打卡的时间趋势分析
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="diaries"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#6366f1', strokeWidth: 2 }}
                name="日记数量"
              />
              <Line
                type="monotone"
                dataKey="checkIns"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                name="打卡次数"
              />
              <Line
                type="monotone"
                dataKey="words"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2 }}
                name="字数"
                yAxisId="right"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

// 区域图组件（用于显示累计数据）
interface AreaChartProps {
  data: TrendData[]
  className?: string
}

export function ActivityAreaChart({ data, className }: AreaChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>📊</span>
          <span>活动统计</span>
        </CardTitle>
        <CardDescription>
          日常活动的累计趋势
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={false}
              />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="diaries"
                stackId="1"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.6}
                name="日记"
              />
              <Area
                type="monotone"
                dataKey="checkIns"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
                name="打卡"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

// 柱状图组件
interface BarChartProps {
  data: TrendData[]
  className?: string
}

export function WeeklyBarChart({ data, className }: BarChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>📊</span>
          <span>每日活动</span>
        </CardTitle>
        <CardDescription>
          每日写作和打卡活动对比
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={false}
              />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="diaries" 
                fill="#6366f1" 
                name="日记" 
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="checkIns" 
                fill="#10b981" 
                name="打卡" 
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

// 心情饼图组件
interface MoodPieChartProps {
  data: MoodStats[]
  className?: string
}

export function MoodPieChart({ data, className }: MoodPieChartProps) {
  const COLORS = [
    '#6366f1', // 紫色
    '#10b981', // 绿色
    '#f59e0b', // 橙色
    '#ef4444', // 红色
    '#8b5cf6', // 紫罗兰
    '#06b6d4', // 青色
    '#f97316', // 橘色
    '#84cc16'  // lime绿
  ]

  const renderCustomizedLabel = (entry: any) => {
    const RADIAN = Math.PI / 180
    const radius = entry.innerRadius + (entry.outerRadius - entry.innerRadius) * 0.5
    const x = entry.cx + radius * Math.cos(-entry.midAngle * RADIAN)
    const y = entry.cy + radius * Math.sin(-entry.midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > entry.cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${entry.percentage}%`}
      </text>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>🎭</span>
          <span>心情分布</span>
        </CardTitle>
        <CardDescription>
          不同心情状态的统计占比
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name, props) => [
                `${value} 次 (${props.payload.percentage}%)`,
                `${props.payload.emoji} ${props.payload.label}`
              ]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* 图例 */}
        <div className="mt-4 flex flex-wrap gap-2">
          {data.map((entry, index) => (
            <Badge
              key={entry.mood}
              variant="outline"
              className="flex items-center space-x-1"
              style={{ borderColor: COLORS[index % COLORS.length] }}
            >
              <span>{entry.emoji}</span>
              <span>{entry.label}</span>
              <span className="font-mono text-xs">
                {entry.count}次
              </span>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// 活跃度热力图组件
interface ActivityHeatmapProps {
  data: ActivityData[]
  year: number
  className?: string
}

export function ActivityHeatmap({ data, year, className }: ActivityHeatmapProps) {
  // 获取活跃度级别对应的颜色
  const getLevelColor = (level: number): string => {
    const colors = [
      '#ebedf0', // 0 - 无活动
      '#9be9a8', // 1 - 低活跃
      '#40c463', // 2 - 中活跃
      '#30a14e', // 3 - 高活跃
      '#216e39'  // 4 - 极高活跃
    ]
    return colors[level] || colors[0]
  }

  // 将数据按周分组
  const weeks: ActivityData[][] = []
  let currentWeek: ActivityData[] = []
  
  data.forEach((day, index) => {
    const date = new Date(day.date)
    const dayOfWeek = date.getDay()
    
    if (index === 0) {
      // 第一天，可能需要填充前面的空位
      currentWeek = new Array(dayOfWeek).fill(null)
      currentWeek.push(day)
    } else if (dayOfWeek === 0 && currentWeek.length > 0) {
      // 新的一周开始
      weeks.push(currentWeek)
      currentWeek = [day]
    } else {
      currentWeek.push(day)
    }
    
    // 最后一天
    if (index === data.length - 1) {
      weeks.push(currentWeek)
    }
  })

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>🔥</span>
            <span>活跃度热力图</span>
          </div>
          <Badge variant="outline" className="font-mono">
            {year}年
          </Badge>
        </CardTitle>
        <CardDescription>
          每日活动强度可视化（绿色越深表示活跃度越高）
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 月份标签 */}
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            {['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'].map(month => (
              <span key={month}>{month}</span>
            ))}
          </div>
          
          {/* 热力图网格 */}
          <div className="flex gap-1 overflow-x-auto">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {Array.from({ length: 7 }, (_, dayIndex) => {
                  const dayData = week[dayIndex]
                  const isEmpty = !dayData
                  
                  return (
                    <div
                      key={dayIndex}
                      className="w-3 h-3 rounded-sm border border-gray-200"
                      style={{
                        backgroundColor: isEmpty ? '#ebedf0' : getLevelColor(dayData.level)
                      }}
                      title={
                        isEmpty 
                          ? '' 
                          : `${dayData.date}: ${dayData.value} 次活动`
                      }
                    />
                  )
                })}
              </div>
            ))}
          </div>
          
          {/* 星期标签 */}
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>周日</span>
            <span>周一</span>
            <span>周二</span>
            <span>周三</span>
            <span>周四</span>
            <span>周五</span>
            <span>周六</span>
          </div>
          
          {/* 活跃度图例 */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-muted-foreground">活跃度:</span>
            <div className="flex items-center space-x-1">
              <span className="text-xs text-muted-foreground">少</span>
              {[0, 1, 2, 3, 4].map(level => (
                <div
                  key={level}
                  className="w-3 h-3 rounded-sm border border-gray-200"
                  style={{ backgroundColor: getLevelColor(level) }}
                />
              ))}
              <span className="text-xs text-muted-foreground">多</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 迷你图表组件（用于统计卡片）
interface MiniChartProps {
  data: number[]
  type: 'line' | 'bar'
  color: string
  className?: string
}

export function MiniChart({ data, type, color, className }: MiniChartProps) {
  const chartData = data.map((value, index) => ({ value, index }))

  return (
    <div className={`h-16 w-full ${className}`}>
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
    </div>
  )
}

// 进度环形图组件
interface ProgressRingProps {
  percentage: number
  size?: number
  strokeWidth?: number
  color?: string
  backgroundColor?: string
  children?: React.ReactNode
  className?: string
}

export function ProgressRing({ 
  percentage, 
  size = 120, 
  strokeWidth = 8, 
  color = '#6366f1',
  backgroundColor = '#e5e7eb',
  children,
  className 
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

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
}
