'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Achievement, WritingGoal } from '@/lib/analytics'
import { analyticsUtils } from '@/stores/analyticsStore'
import { 
  Trophy, 
  Target, 
  Flame, 
  Star, 
  Award, 
  Calendar,
  BookOpen,
  Zap,
  Crown,
  Medal
} from 'lucide-react'
import { cn } from '@/lib/utils'

// 成就展示组件
interface AchievementsDisplayProps {
  achievements: Achievement[]
  className?: string
}

export function AchievementsDisplay({ achievements, className }: AchievementsDisplayProps) {
  const achievedCount = achievements.filter(a => a.achieved).length
  const totalCount = achievements.length
  const progressPercentage = totalCount > 0 ? (achievedCount / totalCount) * 100 : 0

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span>成就系统</span>
            </CardTitle>
            <CardDescription>
              解锁成就，记录你的写作里程碑
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {achievedCount}/{totalCount}
            </div>
            <div className="text-sm text-muted-foreground">
              已获得
            </div>
          </div>
        </div>
        
        {/* 总体进度条 */}
        <div className="space-y-2 mt-4">
          <div className="flex justify-between text-sm">
            <span>总体完成度</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// 单个成就徽章组件
interface AchievementBadgeProps {
  achievement: Achievement
  className?: string
}

function AchievementBadge({ achievement, className }: AchievementBadgeProps) {
  const progressPercentage = achievement.maxProgress > 0 
    ? (achievement.progress / achievement.maxProgress) * 100 
    : 0

  return (
    <div
      className={cn(
        "relative p-4 rounded-lg border transition-all duration-200",
        achievement.achieved
          ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-md hover:shadow-lg"
          : "bg-muted/30 border-muted hover:border-muted-foreground/20",
        className
      )}
    >
      {/* 已解锁标志 */}
      {achievement.achieved && (
        <div className="absolute -top-2 -right-2">
          <div className="bg-yellow-500 text-white rounded-full p-1">
            <Medal className="h-4 w-4" />
          </div>
        </div>
      )}

      <div className="space-y-3">
        {/* 成就图标和基本信息 */}
        <div className="flex items-start space-x-3">
          <div
            className={cn(
              "text-3xl flex-shrink-0 transition-all duration-200",
              achievement.achieved ? "grayscale-0" : "grayscale opacity-50"
            )}
          >
            {achievement.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className={cn(
              "font-semibold text-sm truncate",
              achievement.achieved ? "text-yellow-700" : "text-muted-foreground"
            )}>
              {achievement.name}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              {achievement.description}
            </p>
          </div>
        </div>

        {/* 进度条 */}
        {!achievement.achieved && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">进度</span>
              <span className="font-mono">
                {achievement.progress}/{achievement.maxProgress}
              </span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-1" 
            />
          </div>
        )}

        {/* 解锁时间 */}
        {achievement.achieved && achievement.unlockedAt && (
          <div className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
            🎉 {new Date(achievement.unlockedAt).toLocaleDateString('zh-CN')} 解锁
          </div>
        )}
      </div>
    </div>
  )
}

// 写作目标组件
interface WritingGoalsProps {
  goals: WritingGoal[]
  className?: string
}

export function WritingGoals({ goals, className }: WritingGoalsProps) {
  const dailyGoals = goals.filter(g => g.type === 'daily')
  const weeklyGoals = goals.filter(g => g.type === 'weekly')
  const monthlyGoals = goals.filter(g => g.type === 'monthly')

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-blue-500" />
          <span>写作目标</span>
        </CardTitle>
        <CardDescription>
          设定目标，追踪你的写作进度
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* 今日目标 */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>今日目标</span>
          </h4>
          <div className="space-y-3">
            {dailyGoals.map((goal, index) => (
              <GoalProgressCard key={index} goal={goal} />
            ))}
          </div>
        </div>

        {/* 本周目标 */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm flex items-center space-x-2">
            <Flame className="h-4 w-4" />
            <span>本周目标</span>
          </h4>
          <div className="space-y-3">
            {weeklyGoals.map((goal, index) => (
              <GoalProgressCard key={index} goal={goal} />
            ))}
          </div>
        </div>

        {/* 本月目标 */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm flex items-center space-x-2">
            <Star className="h-4 w-4" />
            <span>本月目标</span>
          </h4>
          <div className="space-y-3">
            {monthlyGoals.map((goal, index) => (
              <GoalProgressCard key={index} goal={goal} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 单个目标进度卡片
interface GoalProgressCardProps {
  goal: WritingGoal
  className?: string
}

function GoalProgressCard({ goal, className }: GoalProgressCardProps) {
  const isCompleted = goal.percentage >= 100
  const unitLabel = goal.unit === 'entries' ? '篇' : '字'
  
  return (
    <div className={cn(
      "p-3 rounded-lg border bg-card",
      isCompleted && "bg-green-50 border-green-200",
      className
    )}>
      <div className="space-y-2">
        {/* 目标描述和完成状态 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {goal.unit === 'entries' ? (
              <BookOpen className="h-4 w-4 text-blue-500" />
            ) : (
              <Zap className="h-4 w-4 text-orange-500" />
            )}
            <span className="text-sm font-medium">
              {goal.unit === 'entries' ? '写作数量' : '写作字数'}
            </span>
          </div>
          
          {isCompleted && (
            <Badge className="bg-green-500 text-white">
              <Crown className="h-3 w-3 mr-1" />
              已完成
            </Badge>
          )}
        </div>

        {/* 进度信息 */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {goal.current} / {goal.target} {unitLabel}
          </span>
          <span className="font-mono">
            {Math.round(goal.percentage)}%
          </span>
        </div>

        {/* 进度条 */}
        <Progress
          value={Math.min(goal.percentage, 100)}
          className={cn(
            "h-2",
            isCompleted && "bg-green-100"
          )}
        />

        {/* 剩余目标提示 */}
        {!isCompleted && (
          <div className="text-xs text-muted-foreground">
            还需 {goal.target - goal.current} {unitLabel}即可完成目标
          </div>
        )}
      </div>
    </div>
  )
}

// 连续打卡展示组件
interface StreakDisplayProps {
  currentStreak: number
  longestStreak: number
  className?: string
}

export function StreakDisplay({ currentStreak, longestStreak, className }: StreakDisplayProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <span>连续打卡</span>
        </CardTitle>
        <CardDescription>
          保持写作习惯，延续你的创作火焰
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          {/* 当前连续天数 */}
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-orange-500 flex items-center justify-center">
              {currentStreak}
              <Flame className="h-6 w-6 ml-1" />
            </div>
            <div className="text-sm text-muted-foreground">当前连续</div>
            <div className="text-xs text-muted-foreground">
              {currentStreak > 0 ? '保持势头！' : '开始你的连续记录吧'}
            </div>
          </div>

          {/* 历史最长连续 */}
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-blue-500 flex items-center justify-center">
              {longestStreak}
              <Crown className="h-6 w-6 ml-1" />
            </div>
            <div className="text-sm text-muted-foreground">历史最长</div>
            <div className="text-xs text-muted-foreground">
              {longestStreak > 0 ? '你的最好记录' : '创造第一个记录'}
            </div>
          </div>
        </div>

        {/* 连续天数等级 */}
        <div className="mt-6 p-3 bg-muted/30 rounded-lg">
          <div className="text-sm font-medium mb-2">连续等级</div>
          <div className="flex justify-between items-center text-xs">
            <div className={cn(
              "flex items-center space-x-1",
              currentStreak >= 1 ? "text-green-600" : "text-muted-foreground"
            )}>
              <div className={cn(
                "w-2 h-2 rounded-full",
                currentStreak >= 1 ? "bg-green-500" : "bg-muted-foreground"
              )} />
              <span>新手(1天)</span>
            </div>
            <div className={cn(
              "flex items-center space-x-1",
              currentStreak >= 7 ? "text-blue-600" : "text-muted-foreground"
            )}>
              <div className={cn(
                "w-2 h-2 rounded-full",
                currentStreak >= 7 ? "bg-blue-500" : "bg-muted-foreground"
              )} />
              <span>坚持(7天)</span>
            </div>
            <div className={cn(
              "flex items-center space-x-1",
              currentStreak >= 30 ? "text-purple-600" : "text-muted-foreground"
            )}>
              <div className={cn(
                "w-2 h-2 rounded-full",
                currentStreak >= 30 ? "bg-purple-500" : "bg-muted-foreground"
              )} />
              <span>专家(30天)</span>
            </div>
            <div className={cn(
              "flex items-center space-x-1",
              currentStreak >= 100 ? "text-yellow-600" : "text-muted-foreground"
            )}>
              <div className={cn(
                "w-2 h-2 rounded-full",
                currentStreak >= 100 ? "bg-yellow-500" : "bg-muted-foreground"
              )} />
              <span>大师(100天)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 最近成就组件
interface RecentAchievementsProps {
  achievements: Achievement[]
  limit?: number
  className?: string
}

export function RecentAchievements({ achievements, limit = 3, className }: RecentAchievementsProps) {
  const recentAchievements = achievements
    .filter(a => a.achieved && a.unlockedAt)
    .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
    .slice(0, limit)

  if (recentAchievements.length === 0) {
    return null
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Award className="h-5 w-5 text-purple-500" />
          <span>最近解锁</span>
        </CardTitle>
        <CardDescription>
          恭喜你获得了新成就！
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {recentAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200"
            >
              <div className="text-2xl flex-shrink-0">
                {achievement.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-purple-700">
                  {achievement.name}
                </h4>
                <p className="text-xs text-purple-600">
                  {new Date(achievement.unlockedAt!).toLocaleDateString('zh-CN')} 解锁
                </p>
              </div>
              <Badge className="bg-purple-500 text-white">
                新获得
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
