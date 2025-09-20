import { create } from 'zustand'
import { 
  AnalyticsData,
  BasicStats, 
  TrendData, 
  MoodStats, 
  ActivityData, 
  Achievement, 
  WritingGoal,
  TimeRange,
  calculateBasicStats,
  generateTrendData,
  calculateMoodStats,
  generateActivityHeatmap,
  calculateAchievements,
  calculateWritingGoals,
  getDataInRange,
  calculateComparison
} from '@/lib/analytics'
import { Diary, CheckIn, MediaFile } from '@/types/database'

// 分析状态接口
interface AnalyticsState {
  // 原始数据
  rawData: AnalyticsData
  
  // 当前时间范围
  timeRange: TimeRange
  
  // 基础统计
  basicStats: BasicStats | null
  
  // 趋势数据
  trendData: TrendData[]
  
  // 心情统计
  moodStats: MoodStats[]
  
  // 活跃度热力图数据
  activityData: ActivityData[]
  
  // 成就数据
  achievements: Achievement[]
  
  // 写作目标
  writingGoals: WritingGoal[]
  
  // 对比数据
  comparison: {
    diariesChange: number
    checkInsChange: number
    wordsChange: number
  } | null
  
  // 加载状态
  loading: boolean
  
  // 缓存时间戳
  lastUpdated: string | null
  
  // 选中的年份（用于热力图）
  selectedYear: number
}

// 分析操作接口
interface AnalyticsActions {
  // 设置原始数据
  setRawData: (data: AnalyticsData) => void
  
  // 更新数据（从各个Store获取）
  updateData: (diaries: Diary[], checkIns: CheckIn[], mediaFiles: MediaFile[]) => void
  
  // 设置时间范围
  setTimeRange: (range: TimeRange) => void
  
  // 设置选中年份
  setSelectedYear: (year: number) => void
  
  // 计算所有统计数据
  calculateAllStats: () => void
  
  // 刷新统计数据
  refreshStats: () => void
  
  // 获取过滤后的数据
  getFilteredData: () => AnalyticsData
  
  // 获取成就进度
  getAchievementProgress: () => number
  
  // 获取今日统计
  getTodayStats: () => {
    diaries: number
    checkIns: number
    words: number
    streak: number
  }
  
  // 清空数据
  clearData: () => void
}

type AnalyticsStore = AnalyticsState & AnalyticsActions

export const useAnalyticsStore = create<AnalyticsStore>((set, get) => ({
  // 初始状态
  rawData: { diaries: [], checkIns: [], mediaFiles: [] },
  timeRange: 'month',
  basicStats: null,
  trendData: [],
  moodStats: [],
  activityData: [],
  achievements: [],
  writingGoals: [],
  comparison: null,
  loading: false,
  lastUpdated: null,
  selectedYear: new Date().getFullYear(),

  // 设置原始数据
  setRawData: (data) => {
    set({ rawData: data })
    get().calculateAllStats()
  },

  // 更新数据
  updateData: (diaries, checkIns, mediaFiles) => {
    const data: AnalyticsData = { diaries, checkIns, mediaFiles }
    set({ rawData: data })
    get().calculateAllStats()
  },

  // 设置时间范围
  setTimeRange: (range) => {
    set({ timeRange: range })
    get().calculateAllStats()
  },

  // 设置选中年份
  setSelectedYear: (year) => {
    set({ selectedYear: year })
    // 重新计算活跃度热力图
    const { rawData } = get()
    const activityData = generateActivityHeatmap(rawData, year)
    set({ activityData })
  },

  // 计算所有统计数据
  calculateAllStats: () => {
    set({ loading: true })
    
    try {
      const { rawData, timeRange, selectedYear } = get()
      
      if (rawData.diaries.length === 0 && rawData.checkIns.length === 0 && rawData.mediaFiles.length === 0) {
        set({
          basicStats: {
            totalDiaries: 0,
            totalCheckIns: 0,
            totalMedia: 0,
            totalWords: 0,
            avgWordsPerDiary: 0,
            activeDays: 0,
            currentStreak: 0,
            longestStreak: 0
          },
          trendData: [],
          moodStats: [],
          activityData: [],
          achievements: [],
          writingGoals: [],
          comparison: { diariesChange: 0, checkInsChange: 0, wordsChange: 0 },
          loading: false,
          lastUpdated: new Date().toISOString()
        })
        return
      }

      // 获取当前时间范围的数据
      const filteredData = getDataInRange(rawData, timeRange)
      
      // 计算基础统计
      const basicStats = calculateBasicStats(filteredData)
      
      // 生成趋势数据（根据时间范围调整天数）
      let trendDays = 30
      switch (timeRange) {
        case 'week':
          trendDays = 7
          break
        case 'month':
          trendDays = 30
          break
        case 'year':
          trendDays = 365
          break
        case 'all':
          // 计算从第一条记录到现在的天数
          const allDates = [
            ...rawData.diaries.map(d => d.created_at),
            ...rawData.checkIns.map(c => c.created_at),
            ...rawData.mediaFiles.map(m => m.created_at)
          ]
          if (allDates.length > 0) {
            const firstDate = new Date(Math.min(...allDates.map(d => new Date(d).getTime())))
            const daysDiff = Math.ceil((new Date().getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24))
            trendDays = Math.min(daysDiff, 365) // 最多显示一年
          }
          break
        default:
          trendDays = 30
      }
      
      const trendData = generateTrendData(filteredData, timeRange, trendDays)
      
      // 计算心情统计
      const moodStats = calculateMoodStats(filteredData)
      
      // 生成活跃度热力图（使用完整数据）
      const activityData = generateActivityHeatmap(rawData, selectedYear)
      
      // 计算成就（使用完整数据）
      const achievements = calculateAchievements(rawData)
      
      // 计算写作目标（使用完整数据）
      const writingGoals = calculateWritingGoals(rawData)
      
      // 计算对比数据
      const comparison = calculateComparison(filteredData, timeRange)
      
      set({
        basicStats,
        trendData,
        moodStats,
        activityData,
        achievements,
        writingGoals,
        comparison,
        loading: false,
        lastUpdated: new Date().toISOString()
      })
    } catch (error) {
      console.error('计算统计数据失败:', error)
      set({ loading: false })
    }
  },

  // 刷新统计数据
  refreshStats: () => {
    get().calculateAllStats()
  },

  // 获取过滤后的数据
  getFilteredData: () => {
    const { rawData, timeRange } = get()
    return getDataInRange(rawData, timeRange)
  },

  // 获取成就进度
  getAchievementProgress: () => {
    const { achievements } = get()
    if (achievements.length === 0) return 0
    
    const achievedCount = achievements.filter(a => a.achieved).length
    return Math.round((achievedCount / achievements.length) * 100)
  },

  // 获取今日统计
  getTodayStats: () => {
    const { rawData, basicStats } = get()
    const todayData = getDataInRange(rawData, 'day')
    const todayStats = calculateBasicStats(todayData)
    
    return {
      diaries: todayStats.totalDiaries,
      checkIns: todayStats.totalCheckIns,
      words: todayStats.totalWords,
      streak: basicStats?.currentStreak || 0
    }
  },

  // 清空数据
  clearData: () => {
    set({
      rawData: { diaries: [], checkIns: [], mediaFiles: [] },
      basicStats: null,
      trendData: [],
      moodStats: [],
      activityData: [],
      achievements: [],
      writingGoals: [],
      comparison: null,
      loading: false,
      lastUpdated: null
    })
  }
}))

// 导出工具函数用于外部使用
export const analyticsUtils = {
  // 格式化数字
  formatNumber: (num: number): string => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k'
    }
    return num.toString()
  },

  // 格式化百分比
  formatPercentage: (percentage: number): string => {
    return `${Math.round(percentage)}%`
  },

  // 获取时间范围标签
  getTimeRangeLabel: (range: TimeRange): string => {
    const labels = {
      day: '今日',
      week: '本周', 
      month: '本月',
      year: '今年',
      all: '全部'
    }
    return labels[range]
  },

  // 获取成就级别颜色
  getAchievementColor: (achieved: boolean): string => {
    return achieved ? 'text-yellow-500' : 'text-gray-400'
  },

  // 获取趋势变化图标和颜色
  getTrendIcon: (change: number): { icon: string; color: string } => {
    if (change > 0) {
      return { icon: '↗', color: 'text-green-500' }
    } else if (change < 0) {
      return { icon: '↘', color: 'text-red-500' }
    } else {
      return { icon: '→', color: 'text-gray-500' }
    }
  },

  // 获取活跃度级别颜色
  getActivityLevelColor: (level: number): string => {
    const colors = [
      'bg-gray-100', // 0 - 无活动
      'bg-green-100', // 1 - 低活跃
      'bg-green-300', // 2 - 中活跃
      'bg-green-500', // 3 - 高活跃
      'bg-green-700'  // 4 - 极高活跃
    ]
    return colors[level] || colors[0]
  },

  // 获取心情表情大小
  getMoodEmoji: (mood: string): string => {
    const moodEmojis: { [key: string]: string } = {
      'happy': '😊',
      'calm': '😌',
      'excited': '🤩',
      'tired': '😴',
      'sad': '😢',
      'angry': '😠',
      'anxious': '😰',
      'grateful': '🙏'
    }
    return moodEmojis[mood] || '😐'
  },

  // 生成成就徽章样式
  getAchievementBadgeStyle: (achieved: boolean): string => {
    return achieved 
      ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg' 
      : 'bg-gray-200 text-gray-500'
  },

  // 计算目标完成度颜色
  getGoalProgressColor: (percentage: number): string => {
    if (percentage >= 100) return 'bg-green-500'
    if (percentage >= 80) return 'bg-blue-500'
    if (percentage >= 60) return 'bg-yellow-500'
    if (percentage >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }
}
