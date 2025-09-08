import { 
  format, 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  subWeeks,
  subMonths,
  subYears,
  differenceInDays,
  isWithinInterval,
  parseISO,
  isSameDay,
  getDay,
  startOfISOWeek,
  endOfISOWeek
} from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Diary, CheckIn, MediaFile } from '@/types/database'

// 时间范围类型
export type TimeRange = 'day' | 'week' | 'month' | 'year' | 'all'

// 统计数据接口
export interface AnalyticsData {
  diaries: Diary[]
  checkIns: CheckIn[]
  mediaFiles: MediaFile[]
}

// 基础统计接口
export interface BasicStats {
  totalDiaries: number
  totalCheckIns: number
  totalMedia: number
  totalWords: number
  avgWordsPerDiary: number
  activeDays: number
  currentStreak: number
  longestStreak: number
}

// 趋势数据接口
export interface TrendData {
  date: string
  diaries: number
  checkIns: number
  words: number
  mood?: string
}

// 心情统计接口
export interface MoodStats {
  mood: string
  count: number
  percentage: number
  emoji: string
  label: string
}

// 活跃度数据接口
export interface ActivityData {
  date: string
  value: number
  level: number // 0-4 活跃度级别
}

// 成就数据接口
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  achieved: boolean
  progress: number
  maxProgress: number
  unlockedAt?: string
}

// 写作目标接口
export interface WritingGoal {
  type: 'daily' | 'weekly' | 'monthly'
  target: number
  current: number
  percentage: number
  unit: 'entries' | 'words'
}

/**
 * 获取指定时间范围的数据
 */
export function getDataInRange(data: AnalyticsData, range: TimeRange, customDate?: Date): AnalyticsData {
  const now = customDate || new Date()
  let startDate: Date
  let endDate: Date

  switch (range) {
    case 'day':
      startDate = startOfDay(now)
      endDate = endOfDay(now)
      break
    case 'week':
      startDate = startOfISOWeek(now)
      endDate = endOfISOWeek(now)
      break
    case 'month':
      startDate = startOfMonth(now)
      endDate = endOfMonth(now)
      break
    case 'year':
      startDate = startOfYear(now)
      endDate = endOfYear(now)
      break
    case 'all':
    default:
      return data
  }

  return {
    diaries: data.diaries.filter(diary => 
      isWithinInterval(parseISO(diary.created_at), { start: startDate, end: endDate })
    ),
    checkIns: data.checkIns.filter(checkIn => 
      isWithinInterval(parseISO(checkIn.created_at), { start: startDate, end: endDate })
    ),
    mediaFiles: data.mediaFiles.filter(media => 
      isWithinInterval(parseISO(media.created_at), { start: startDate, end: endDate })
    ),
  }
}

/**
 * 计算基础统计数据
 */
export function calculateBasicStats(data: AnalyticsData): BasicStats {
  const totalDiaries = data.diaries.length
  const totalCheckIns = data.checkIns.length
  const totalMedia = data.mediaFiles.length
  
  // 计算总字数和平均字数
  const totalWords = data.diaries.reduce((sum, diary) => sum + diary.content.length, 0)
  const avgWordsPerDiary = totalDiaries > 0 ? Math.round(totalWords / totalDiaries) : 0

  // 计算活跃天数
  const allDates = [
    ...data.diaries.map(d => format(parseISO(d.created_at), 'yyyy-MM-dd')),
    ...data.checkIns.map(c => format(parseISO(c.created_at), 'yyyy-MM-dd')),
    ...data.mediaFiles.map(m => format(parseISO(m.created_at), 'yyyy-MM-dd'))
  ]
  const uniqueDates = new Set(allDates)
  const activeDays = uniqueDates.size

  // 计算连续打卡天数
  const { currentStreak, longestStreak } = calculateStreaks(data)

  return {
    totalDiaries,
    totalCheckIns,
    totalMedia,
    totalWords,
    avgWordsPerDiary,
    activeDays,
    currentStreak,
    longestStreak
  }
}

/**
 * 计算连续打卡天数
 */
export function calculateStreaks(data: AnalyticsData): { currentStreak: number; longestStreak: number } {
  // 获取所有活动日期
  const allDates = [
    ...data.diaries.map(d => format(parseISO(d.created_at), 'yyyy-MM-dd')),
    ...data.checkIns.map(c => format(parseISO(c.created_at), 'yyyy-MM-dd'))
  ]
  
  const uniqueDates = Array.from(new Set(allDates)).sort()
  
  if (uniqueDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 }
  }

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 1

  // 检查是否包含今天
  const today = format(new Date(), 'yyyy-MM-dd')
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')
  
  // 计算当前连续天数
  if (uniqueDates.includes(today) || uniqueDates.includes(yesterday)) {
    let checkDate = uniqueDates.includes(today) ? new Date() : subDays(new Date(), 1)
    currentStreak = 1
    
    for (let i = 1; i <= 365; i++) { // 最多检查一年
      const prevDate = format(subDays(checkDate, i), 'yyyy-MM-dd')
      if (uniqueDates.includes(prevDate)) {
        currentStreak++
      } else {
        break
      }
    }
  }

  // 计算最长连续天数
  for (let i = 1; i < uniqueDates.length; i++) {
    const currentDate = parseISO(uniqueDates[i])
    const prevDate = parseISO(uniqueDates[i - 1])
    
    if (differenceInDays(currentDate, prevDate) === 1) {
      tempStreak++
    } else {
      longestStreak = Math.max(longestStreak, tempStreak)
      tempStreak = 1
    }
  }
  
  longestStreak = Math.max(longestStreak, tempStreak)

  return { currentStreak, longestStreak }
}

/**
 * 生成趋势数据
 */
export function generateTrendData(data: AnalyticsData, range: TimeRange, days: number = 30): TrendData[] {
  const endDate = new Date()
  const startDate = subDays(endDate, days - 1)
  
  const trendData: TrendData[] = []
  
  for (let i = 0; i < days; i++) {
    const currentDate = subDays(endDate, days - 1 - i)
    const dateStr = format(currentDate, 'yyyy-MM-dd')
    const displayDate = format(currentDate, 'MM/dd')
    
    // 统计当天的数据
    const dailyDiaries = data.diaries.filter(diary => 
      format(parseISO(diary.created_at), 'yyyy-MM-dd') === dateStr
    )
    
    const dailyCheckIns = data.checkIns.filter(checkIn => 
      format(parseISO(checkIn.created_at), 'yyyy-MM-dd') === dateStr
    )
    
    const dailyWords = dailyDiaries.reduce((sum, diary) => sum + diary.content.length, 0)
    
    // 获取当天主要心情（最多的心情）
    const moodCounts: { [key: string]: number } = {}
    dailyCheckIns.forEach(checkIn => {
      moodCounts[checkIn.mood] = (moodCounts[checkIn.mood] || 0) + 1
    })
    
    const topMood = Object.keys(moodCounts).length > 0 
      ? Object.keys(moodCounts).reduce((a, b) => moodCounts[a] > moodCounts[b] ? a : b)
      : undefined

    trendData.push({
      date: displayDate,
      diaries: dailyDiaries.length,
      checkIns: dailyCheckIns.length,
      words: dailyWords,
      mood: topMood
    })
  }
  
  return trendData
}

/**
 * 计算心情统计
 */
export function calculateMoodStats(data: AnalyticsData): MoodStats[] {
  const moodCounts: { [key: string]: number } = {}
  const total = data.checkIns.length

  if (total === 0) return []

  // 统计每种心情的数量
  data.checkIns.forEach(checkIn => {
    moodCounts[checkIn.mood] = (moodCounts[checkIn.mood] || 0) + 1
  })

  // 心情映射（假设心情值对应表情和标签）
  const moodMapping: { [key: string]: { emoji: string; label: string } } = {
    'happy': { emoji: '😊', label: '开心' },
    'calm': { emoji: '😌', label: '平静' },
    'excited': { emoji: '🤩', label: '兴奋' },
    'tired': { emoji: '😴', label: '疲惫' },
    'sad': { emoji: '😢', label: '难过' },
    'angry': { emoji: '😠', label: '生气' },
    'anxious': { emoji: '😰', label: '焦虑' },
    'grateful': { emoji: '🙏', label: '感恩' }
  }

  return Object.entries(moodCounts)
    .map(([mood, count]) => ({
      mood,
      count,
      percentage: Math.round((count / total) * 100),
      emoji: moodMapping[mood]?.emoji || '😐',
      label: moodMapping[mood]?.label || mood
    }))
    .sort((a, b) => b.count - a.count)
}

/**
 * 生成活跃度热力图数据
 */
export function generateActivityHeatmap(data: AnalyticsData, year?: number): ActivityData[] {
  const targetYear = year || new Date().getFullYear()
  const startDate = new Date(targetYear, 0, 1) // 年初
  const endDate = new Date(targetYear, 11, 31) // 年末
  
  const activityData: ActivityData[] = []
  const dayActivity: { [key: string]: number } = {}

  // 统计每天的活动数量
  const allActivities = [
    ...data.diaries.map(d => ({ date: d.created_at, weight: 2 })), // 日记权重更高
    ...data.checkIns.map(c => ({ date: c.created_at, weight: 1 })),
    ...data.mediaFiles.map(m => ({ date: m.created_at, weight: 1 }))
  ]

  allActivities.forEach(activity => {
    const activityDate = parseISO(activity.date)
    if (activityDate.getFullYear() === targetYear) {
      const dateKey = format(activityDate, 'yyyy-MM-dd')
      dayActivity[dateKey] = (dayActivity[dateKey] || 0) + activity.weight
    }
  })

  // 生成整年的数据
  let currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    const dateKey = format(currentDate, 'yyyy-MM-dd')
    const value = dayActivity[dateKey] || 0
    
    // 计算活跃度级别 (0-4)
    let level = 0
    if (value > 0) level = 1
    if (value >= 3) level = 2
    if (value >= 5) level = 3
    if (value >= 8) level = 4

    activityData.push({
      date: dateKey,
      value,
      level
    })

    currentDate = new Date(currentDate)
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return activityData
}

/**
 * 计算成就系统
 */
export function calculateAchievements(data: AnalyticsData): Achievement[] {
  const stats = calculateBasicStats(data)
  const { currentStreak, longestStreak } = calculateStreaks(data)
  
  const achievements: Achievement[] = [
    {
      id: 'first_diary',
      name: '初次记录',
      description: '写下第一篇日记',
      icon: '📝',
      achieved: stats.totalDiaries >= 1,
      progress: Math.min(stats.totalDiaries, 1),
      maxProgress: 1
    },
    {
      id: 'diary_10',
      name: '记录达人',
      description: '累计写作10篇日记',
      icon: '📚',
      achieved: stats.totalDiaries >= 10,
      progress: Math.min(stats.totalDiaries, 10),
      maxProgress: 10
    },
    {
      id: 'diary_50',
      name: '写作能手',
      description: '累计写作50篇日记',
      icon: '✍️',
      achieved: stats.totalDiaries >= 50,
      progress: Math.min(stats.totalDiaries, 50),
      maxProgress: 50
    },
    {
      id: 'diary_100',
      name: '写作大师',
      description: '累计写作100篇日记',
      icon: '🏆',
      achieved: stats.totalDiaries >= 100,
      progress: Math.min(stats.totalDiaries, 100),
      maxProgress: 100
    },
    {
      id: 'streak_7',
      name: '坚持一周',
      description: '连续7天记录',
      icon: '🔥',
      achieved: longestStreak >= 7,
      progress: Math.min(currentStreak, 7),
      maxProgress: 7
    },
    {
      id: 'streak_30',
      name: '坚持一月',
      description: '连续30天记录',
      icon: '🌟',
      achieved: longestStreak >= 30,
      progress: Math.min(currentStreak, 30),
      maxProgress: 30
    },
    {
      id: 'streak_100',
      name: '百日坚持',
      description: '连续100天记录',
      icon: '💯',
      achieved: longestStreak >= 100,
      progress: Math.min(currentStreak, 100),
      maxProgress: 100
    },
    {
      id: 'words_1000',
      name: '千字文豪',
      description: '累计写作1000字',
      icon: '📖',
      achieved: stats.totalWords >= 1000,
      progress: Math.min(stats.totalWords, 1000),
      maxProgress: 1000
    },
    {
      id: 'words_10000',
      name: '万字作家',
      description: '累计写作10000字',
      icon: '📜',
      achieved: stats.totalWords >= 10000,
      progress: Math.min(stats.totalWords, 10000),
      maxProgress: 10000
    },
    {
      id: 'mood_variety',
      name: '情感丰富',
      description: '记录5种不同心情',
      icon: '🎭',
      achieved: calculateMoodStats(data).length >= 5,
      progress: Math.min(calculateMoodStats(data).length, 5),
      maxProgress: 5
    }
  ]

  // 为已达成的成就添加解锁时间
  return achievements.map(achievement => {
    if (achievement.achieved && !achievement.unlockedAt) {
      // 这里可以根据实际数据计算解锁时间
      // 暂时使用当前时间
      return {
        ...achievement,
        unlockedAt: new Date().toISOString()
      }
    }
    return achievement
  })
}

/**
 * 计算写作目标
 */
export function calculateWritingGoals(data: AnalyticsData): WritingGoal[] {
  const now = new Date()
  
  // 今日数据
  const todayData = getDataInRange(data, 'day', now)
  const todayDiaries = todayData.diaries.length
  const todayWords = todayData.diaries.reduce((sum, diary) => sum + diary.content.length, 0)
  
  // 本周数据
  const weekData = getDataInRange(data, 'week', now)
  const weekDiaries = weekData.diaries.length
  const weekWords = weekData.diaries.reduce((sum, diary) => sum + diary.content.length, 0)
  
  // 本月数据
  const monthData = getDataInRange(data, 'month', now)
  const monthDiaries = monthData.diaries.length
  const monthWords = monthData.diaries.reduce((sum, diary) => sum + diary.content.length, 0)

  return [
    {
      type: 'daily',
      target: 1,
      current: todayDiaries,
      percentage: Math.min((todayDiaries / 1) * 100, 100),
      unit: 'entries'
    },
    {
      type: 'daily',
      target: 300,
      current: todayWords,
      percentage: Math.min((todayWords / 300) * 100, 100),
      unit: 'words'
    },
    {
      type: 'weekly',
      target: 5,
      current: weekDiaries,
      percentage: Math.min((weekDiaries / 5) * 100, 100),
      unit: 'entries'
    },
    {
      type: 'weekly',
      target: 2000,
      current: weekWords,
      percentage: Math.min((weekWords / 2000) * 100, 100),
      unit: 'words'
    },
    {
      type: 'monthly',
      target: 20,
      current: monthDiaries,
      percentage: Math.min((monthDiaries / 20) * 100, 100),
      unit: 'entries'
    },
    {
      type: 'monthly',
      target: 10000,
      current: monthWords,
      percentage: Math.min((monthWords / 10000) * 100, 100),
      unit: 'words'
    }
  ]
}

/**
 * 格式化数字显示
 */
export function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

/**
 * 格式化百分比
 */
export function formatPercentage(percentage: number): string {
  return `${Math.round(percentage)}%`
}

/**
 * 获取时间范围标签
 */
export function getTimeRangeLabel(range: TimeRange): string {
  const labels = {
    day: '今日',
    week: '本周',
    month: '本月',
    year: '今年',
    all: '全部'
  }
  return labels[range]
}

/**
 * 计算对比数据（与上期比较）
 */
export function calculateComparison(current: AnalyticsData, range: TimeRange): {
  diariesChange: number
  checkInsChange: number
  wordsChange: number
} {
  const now = new Date()
  let previousData: AnalyticsData

  switch (range) {
    case 'day':
      previousData = getDataInRange(current, 'day', subDays(now, 1))
      break
    case 'week':
      previousData = getDataInRange(current, 'week', subWeeks(now, 1))
      break
    case 'month':
      previousData = getDataInRange(current, 'month', subMonths(now, 1))
      break
    case 'year':
      previousData = getDataInRange(current, 'year', subYears(now, 1))
      break
    default:
      return { diariesChange: 0, checkInsChange: 0, wordsChange: 0 }
  }

  const currentStats = calculateBasicStats(current)
  const previousStats = calculateBasicStats(previousData)

  const diariesChange = previousStats.totalDiaries === 0 
    ? 0 
    : ((currentStats.totalDiaries - previousStats.totalDiaries) / previousStats.totalDiaries) * 100

  const checkInsChange = previousStats.totalCheckIns === 0 
    ? 0 
    : ((currentStats.totalCheckIns - previousStats.totalCheckIns) / previousStats.totalCheckIns) * 100

  const wordsChange = previousStats.totalWords === 0 
    ? 0 
    : ((currentStats.totalWords - previousStats.totalWords) / previousStats.totalWords) * 100

  return {
    diariesChange: Math.round(diariesChange),
    checkInsChange: Math.round(checkInsChange),
    wordsChange: Math.round(wordsChange)
  }
}
