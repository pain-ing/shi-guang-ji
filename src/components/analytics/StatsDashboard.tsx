'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAnalyticsStore, analyticsUtils } from '@/stores/analyticsStore'
import { useDiaryStore } from '@/stores/diaryStore'
import { useCheckInStore } from '@/stores/checkInStore'
import { useMediaStore } from '@/stores/mediaStore'
import { TimeRange } from '@/lib/analytics'
import { 
  TrendChart, 
  ActivityAreaChart, 
  WeeklyBarChart, 
  MoodPieChart, 
  ActivityHeatmap,
  MiniChart,
  ProgressRing
} from './Charts'
import { 
  AchievementsDisplay, 
  WritingGoals, 
  StreakDisplay,
  RecentAchievements 
} from './Achievements'
import {
  BarChart3,
  Calendar,
  TrendingUp,
  Users,
  BookOpen,
  PenTool,
  Target,
  Trophy,
  RefreshCw,
  Filter,
  Eye,
  Award,
  Flame
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsDashboardProps {
  className?: string
}

export function StatsDashboard({ className }: StatsDashboardProps) {
  const [activeView, setActiveView] = useState<'overview' | 'trends' | 'achievements'>('overview')
  
  // 获取各个Store的数据
  const { diaries } = useDiaryStore()
  const { checkIns } = useCheckInStore()
  const { mediaFiles } = useMediaStore()
  
  // 统计Store
  const {
    timeRange,
    basicStats,
    trendData,
    moodStats,
    activityData,
    achievements,
    writingGoals,
    comparison,
    loading,
    selectedYear,
    setTimeRange,
    setSelectedYear,
    updateData,
    getTodayStats,
    getAchievementProgress
  } = useAnalyticsStore()

  // 初始化和更新数据
  useEffect(() => {
    updateData(diaries, checkIns, mediaFiles)
  }, [diaries, checkIns, mediaFiles, updateData])

  const todayStats = getTodayStats()
  const achievementProgress = getAchievementProgress()

  return (
    <div className={cn("space-y-6", className)}>
      {/* 头部控制区 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-text">统计仪表板</h1>
          <p className="text-muted-foreground mt-1">
            深入了解你的写作习惯和成长轨迹
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* 时间范围选择器 */}
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">今日</SelectItem>
              <SelectItem value="week">本周</SelectItem>
              <SelectItem value="month">本月</SelectItem>
              <SelectItem value="year">今年</SelectItem>
              <SelectItem value="all">全部</SelectItem>
            </SelectContent>
          </Select>

          {/* 视图切换 */}
          <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)}>
            <TabsList>
              <TabsTrigger value="overview" className="flex items-center space-x-1">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">概览</span>
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">趋势</span>
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex items-center space-x-1">
                <Trophy className="h-4 w-4" />
                <span className="hidden sm:inline">成就</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {loading ? (
        <StatsLoadingSkeleton />
      ) : (
        <>
          {/* 概览视图 */}
          {activeView === 'overview' && (
            <div className="space-y-6">
              {/* 核心指标卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="今日写作"
                  value={todayStats.diaries}
                  unit="篇"
                  icon={<BookOpen className="h-5 w-5" />}
                  change={comparison?.diariesChange}
                  color="bg-blue-500"
                />
                <StatCard
                  title="今日打卡"
                  value={todayStats.checkIns}
                  unit="次"
                  icon={<Calendar className="h-5 w-5" />}
                  change={comparison?.checkInsChange}
                  color="bg-green-500"
                />
                <StatCard
                  title="今日字数"
                  value={todayStats.words}
                  unit="字"
                  icon={<PenTool className="h-5 w-5" />}
                  change={comparison?.wordsChange}
                  color="bg-orange-500"
                />
                <StatCard
                  title="连续天数"
                  value={todayStats.streak}
                  unit="天"
                  icon={<Flame className="h-5 w-5" />}
                  color="bg-red-500"
                />
              </div>

              {/* 主要图表 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TrendChart data={trendData} />
                <MoodPieChart data={moodStats} />
              </div>

              {/* 次要统计 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <OverviewStatsCard basicStats={basicStats} />
                <WritingGoals goals={writingGoals} />
                <RecentAchievements achievements={achievements} />
              </div>
            </div>
          )}

          {/* 趋势视图 */}
          {activeView === 'trends' && (
            <div className="space-y-6">
              {/* 年份选择器（用于热力图） */}
              <div className="flex justify-end">
                <Select 
                  value={selectedYear.toString()} 
                  onValueChange={(value) => setSelectedYear(parseInt(value))}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() - i
                      return (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* 趋势图表 */}
              <div className="space-y-6">
                <TrendChart data={trendData} className="col-span-full" />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ActivityAreaChart data={trendData} />
                  <WeeklyBarChart data={trendData} />
                </div>
                
                <ActivityHeatmap 
                  data={activityData} 
                  year={selectedYear}
                  className="col-span-full"
                />
              </div>
            </div>
          )}

          {/* 成就视图 */}
          {activeView === 'achievements' && (
            <div className="space-y-6">
              {/* 成就概览 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">成就进度</p>
                        <p className="text-2xl font-bold">{achievementProgress}%</p>
                      </div>
                      <ProgressRing 
                        percentage={achievementProgress}
                        size={80}
                        color="#f59e0b"
                      >
                        <Award className="h-6 w-6 text-orange-500" />
                      </ProgressRing>
                    </div>
                  </CardContent>
                </Card>

                <StreakDisplay 
                  currentStreak={basicStats?.currentStreak || 0}
                  longestStreak={basicStats?.longestStreak || 0}
                />

                <WritingGoals goals={writingGoals} />
              </div>

              {/* 成就展示 */}
              <AchievementsDisplay achievements={achievements} />
            </div>
          )}
        </>
      )}
    </div>
  )
}

// 统计卡片组件
interface StatCardProps {
  title: string
  value: number | string
  unit?: string
  icon: React.ReactNode
  change?: number
  color: string
  className?: string
}

function StatCard({ title, value, unit, icon, change, color, className }: StatCardProps) {
  const trendIcon = change !== undefined ? analyticsUtils.getTrendIcon(change) : null

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <div className="flex items-end space-x-1">
              <p className="text-2xl font-bold">
                {typeof value === 'number' ? analyticsUtils.formatNumber(value) : value}
              </p>
              {unit && <p className="text-sm text-muted-foreground mb-1">{unit}</p>}
            </div>
            {change !== undefined && change !== 0 && (
              <div className={cn("flex items-center text-xs", trendIcon?.color)}>
                <span>{trendIcon?.icon}</span>
                <span className="ml-1">
                  {change > 0 ? '+' : ''}{change}%
                </span>
              </div>
            )}
          </div>
          
          <div className={cn("p-3 rounded-lg text-white", color)}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 概览统计卡片
interface OverviewStatsCardProps {
  basicStats: any
  className?: string
}

function OverviewStatsCard({ basicStats, className }: OverviewStatsCardProps) {
  if (!basicStats) return null

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <span>总体统计</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">总日记数</p>
            <p className="text-lg font-semibold">
              {analyticsUtils.formatNumber(basicStats.totalDiaries)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">总打卡数</p>
            <p className="text-lg font-semibold">
              {analyticsUtils.formatNumber(basicStats.totalCheckIns)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">总字数</p>
            <p className="text-lg font-semibold">
              {analyticsUtils.formatNumber(basicStats.totalWords)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">活跃天数</p>
            <p className="text-lg font-semibold">
              {analyticsUtils.formatNumber(basicStats.activeDays)}
            </p>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">平均字数/篇</p>
            <p className="text-lg font-semibold">
              {analyticsUtils.formatNumber(basicStats.avgWordsPerDiary)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 加载骨架屏
function StatsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* 统计卡片骨架 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-12" />
                </div>
                <Skeleton className="h-12 w-12 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 图表骨架 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
