'use client'

import { CheckIn, MOOD_OPTIONS } from '@/types/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { checkInUtils } from '@/stores/checkInStore'
import { Calendar, Flame, TrendingUp, Heart } from 'lucide-react'

interface CheckInStatsProps {
  checkIns: CheckIn[]
}

export function CheckInStats({ checkIns }: CheckInStatsProps) {
  const streakDays = checkInUtils.getStreakDays(checkIns)
  const monthlyCheckIns = checkInUtils.getMonthlyCheckIns(checkIns)
  const moodStats = checkInUtils.getMoodStats(checkIns)
  
  // 计算本月目标完成度 (假设目标是每月打卡20天)
  const monthlyTarget = 20
  const monthlyProgress = Math.min((monthlyCheckIns / monthlyTarget) * 100, 100)

  // 获取最常见的心情
  const mostCommonMood = Object.entries(moodStats).reduce(
    (a, b) => (moodStats[a[0]] > moodStats[b[0]] ? a : b),
    ['', 0]
  )[0]

  const getMoodEmoji = (mood: string) => {
    const moodOption = MOOD_OPTIONS.find(option => option.value === mood)
    return moodOption?.emoji || '😊'
  }

  const getMoodLabel = (mood: string) => {
    const moodOption = MOOD_OPTIONS.find(option => option.value === mood)
    return moodOption?.label || mood
  }

  return (
    <div className="space-y-4">
      {/* 连续打卡天数 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">连续打卡</CardTitle>
          <Flame className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{streakDays} 天</div>
          <p className="text-xs text-muted-foreground">
            {streakDays > 0 ? '继续保持！' : '开始您的打卡之旅'}
          </p>
        </CardContent>
      </Card>

      {/* 本月打卡 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">本月打卡</CardTitle>
          <Calendar className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{monthlyCheckIns} 天</div>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span>目标: {monthlyTarget} 天</span>
              <span>{monthlyProgress.toFixed(0)}%</span>
            </div>
            <Progress value={monthlyProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* 总打卡天数 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">总打卡</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{checkIns.length} 天</div>
          <p className="text-xs text-muted-foreground">
            记录了 {checkIns.length} 个美好时刻
          </p>
        </CardContent>
      </Card>

      {/* 最常见心情 */}
      {mostCommonMood && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">最常心情</CardTitle>
            <Heart className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{getMoodEmoji(mostCommonMood)}</span>
              <div>
                <div className="font-medium">{getMoodLabel(mostCommonMood)}</div>
                <div className="text-xs text-muted-foreground">
                  {moodStats[mostCommonMood]} 次
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 心情分布 */}
      {Object.keys(moodStats).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">心情分布</CardTitle>
            <CardDescription>最近的心情统计</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(moodStats)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([mood, count]) => {
                const percentage = (count / checkIns.length) * 100
                return (
                  <div key={mood} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <span>{getMoodEmoji(mood)}</span>
                        <span>{getMoodLabel(mood)}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {count} 次 ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-1" />
                  </div>
                )
              })}
          </CardContent>
        </Card>
      )}

      {/* 激励信息 */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <div className="text-2xl">🌟</div>
            <div className="text-sm font-medium">
              {streakDays === 0 && '开始您的第一次打卡吧！'}
              {streakDays > 0 && streakDays < 7 && '很好的开始，继续保持！'}
              {streakDays >= 7 && streakDays < 30 && '太棒了！您已经养成了好习惯'}
              {streakDays >= 30 && '您是打卡达人！'}
            </div>
            <div className="text-xs text-muted-foreground">
              每天记录心情，让生活更有意义
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
