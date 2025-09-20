'use client'

import { useState } from 'react'
import { CheckIn, MOOD_OPTIONS } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CheckInCalendarProps {
  checkIns: CheckIn[]
}

export function CheckInCalendar({ checkIns }: CheckInCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // 获取当月第一天和最后一天
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  // 获取当月第一天是星期几 (0 = 周日)
  const firstDayOfWeek = firstDay.getDay()
  
  // 获取当月天数
  const daysInMonth = lastDay.getDate()

  // 生成日历数组
  const calendarDays = []
  
  // 添加上个月的空白天数
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null)
  }
  
  // 添加当月的天数
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  // 获取指定日期的打卡记录
  const getCheckInForDate = (day: number) => {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0]
    return checkIns.find(checkIn => checkIn.created_at === dateStr)
  }

  // 获取心情对应的emoji
  const getMoodEmoji = (mood: string) => {
    const moodOption = MOOD_OPTIONS.find(option => option.value === mood)
    return moodOption?.emoji || '😊'
  }

  // 获取心情对应的颜色
  const getMoodColor = (mood: string) => {
    const colorMap: Record<string, string> = {
      happy: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      calm: 'bg-blue-100 text-blue-800 border-blue-200',
      excited: 'bg-orange-100 text-orange-800 border-orange-200',
      tired: 'bg-gray-100 text-gray-800 border-gray-200',
      sad: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      angry: 'bg-red-100 text-red-800 border-red-200',
      anxious: 'bg-purple-100 text-purple-800 border-purple-200',
      grateful: 'bg-green-100 text-green-800 border-green-200',
    }
    return colorMap[mood] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ]

  const weekDays = ['日', '一', '二', '三', '四', '五', '六']

  const today = new Date()
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()

  return (
    <div className="space-y-4">
      {/* 日历头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">
            {year}年 {monthNames[month]}
          </h3>
          <Button variant="outline" size="sm" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {!isCurrentMonth && (
          <Button variant="outline" size="sm" onClick={goToToday}>
            回到今天
          </Button>
        )}
      </div>

      {/* 星期标题 */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div
            key={day}
            className="h-8 flex items-center justify-center text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* 日历网格 */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={index} className="h-12" />
          }

          const checkIn = getCheckInForDate(day)
          const isToday = isCurrentMonth && day === today.getDate()
          const hasCheckIn = !!checkIn

          return (
            <Card
              key={day}
              className={cn(
                'h-12 cursor-pointer transition-all hover:shadow-md',
                isToday && 'ring-2 ring-primary ring-offset-1',
                hasCheckIn && getMoodColor(checkIn.mood)
              )}
            >
              <CardContent className="p-0 h-full flex flex-col items-center justify-center">
                <span className={cn(
                  'text-sm font-medium',
                  isToday && 'font-bold'
                )}>
                  {day}
                </span>
                {hasCheckIn && (
                  <span className="text-xs">
                    {getMoodEmoji(checkIn.mood)}
                  </span>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 图例 */}
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded border-2 border-primary" />
          <span>今天</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded bg-green-100 border border-green-200" />
          <span>已打卡</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded bg-gray-50 border border-gray-200" />
          <span>未打卡</span>
        </div>
      </div>
    </div>
  )
}
