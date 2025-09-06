import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { CheckIn, CheckInCreate, CheckInUpdate } from '@/types/database'

interface CheckInState {
  checkIns: CheckIn[]
  todayCheckIn: CheckIn | null
  loading: boolean
  error: string | null
}

interface CheckInActions {
  createCheckIn: (data: CheckInCreate) => Promise<{ error: Error | null }>
  updateCheckIn: (id: number, data: CheckInUpdate) => Promise<{ error: Error | null }>
  deleteCheckIn: (id: number) => Promise<{ error: Error | null }>
  getCheckIns: (year?: number, month?: number) => Promise<void>
  getTodayCheckIn: () => Promise<void>
  getCheckInsByDateRange: (startDate: string, endDate: string) => Promise<CheckIn[]>
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

type CheckInStore = CheckInState & CheckInActions

export const useCheckInStore = create<CheckInStore>((set, get) => ({
  // 初始状态
  checkIns: [],
  todayCheckIn: null,
  loading: false,
  error: null,

  // 创建打卡记录
  createCheckIn: async (data: CheckInCreate) => {
    try {
      set({ loading: true, error: null })

      const { data: checkIn, error } = await supabase
        .from('check_ins')
        .insert([data])
        .select()
        .single()

      if (error) {
        set({ error: error.message })
        return { error }
      }

      // 更新状态
      set(state => ({
        checkIns: [checkIn, ...state.checkIns],
        todayCheckIn: checkIn,
      }))

      return { error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '创建打卡记录失败'
      set({ error: errorMessage })
      return { error: error as Error }
    } finally {
      set({ loading: false })
    }
  },

  // 更新打卡记录
  updateCheckIn: async (id: number, data: CheckInUpdate) => {
    try {
      set({ loading: true, error: null })

      const { data: checkIn, error } = await supabase
        .from('check_ins')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        set({ error: error.message })
        return { error }
      }

      // 更新状态
      set(state => ({
        checkIns: state.checkIns.map(item => 
          item.id === id ? checkIn : item
        ),
        todayCheckIn: state.todayCheckIn?.id === id ? checkIn : state.todayCheckIn,
      }))

      return { error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '更新打卡记录失败'
      set({ error: errorMessage })
      return { error: error as Error }
    } finally {
      set({ loading: false })
    }
  },

  // 删除打卡记录
  deleteCheckIn: async (id: number) => {
    try {
      set({ loading: true, error: null })

      const { error } = await supabase
        .from('check_ins')
        .delete()
        .eq('id', id)

      if (error) {
        set({ error: error.message })
        return { error }
      }

      // 更新状态
      set(state => ({
        checkIns: state.checkIns.filter(item => item.id !== id),
        todayCheckIn: state.todayCheckIn?.id === id ? null : state.todayCheckIn,
      }))

      return { error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '删除打卡记录失败'
      set({ error: errorMessage })
      return { error: error as Error }
    } finally {
      set({ loading: false })
    }
  },

  // 获取打卡记录列表
  getCheckIns: async (year?: number, month?: number) => {
    try {
      set({ loading: true, error: null })

      let query = supabase
        .from('check_ins')
        .select('*')
        .order('created_at', { ascending: false })

      // 如果指定了年月，则过滤
      if (year && month) {
        const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
        const endDate = new Date(year, month, 0).toISOString().split('T')[0]
        query = query.gte('created_at', startDate).lte('created_at', endDate)
      }

      const { data, error } = await query

      if (error) {
        set({ error: error.message })
        return
      }

      set({ checkIns: data || [] })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取打卡记录失败'
      set({ error: errorMessage })
    } finally {
      set({ loading: false })
    }
  },

  // 获取今日打卡记录
  getTodayCheckIn: async () => {
    try {
      set({ loading: true, error: null })

      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('check_ins')
        .select('*')
        .eq('created_at', today)
        .single()

      if (error && error.code !== 'PGRST116') {
        set({ error: error.message })
        return
      }

      set({ todayCheckIn: data || null })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取今日打卡记录失败'
      set({ error: errorMessage })
    } finally {
      set({ loading: false })
    }
  },

  // 按日期范围获取打卡记录
  getCheckInsByDateRange: async (startDate: string, endDate: string) => {
    try {
      const { data, error } = await supabase
        .from('check_ins')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error('获取日期范围内的打卡记录失败:', error)
      return []
    }
  },

  // 设置加载状态
  setLoading: (loading: boolean) => set({ loading }),

  // 设置错误信息
  setError: (error: string | null) => set({ error }),
}))

// 导出一些有用的工具函数
export const checkInUtils = {
  // 计算连续打卡天数
  getStreakDays: (checkIns: CheckIn[]): number => {
    if (checkIns.length === 0) return 0

    const sortedCheckIns = [...checkIns].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (const checkIn of sortedCheckIns) {
      const checkInDate = new Date(checkIn.created_at)
      checkInDate.setHours(0, 0, 0, 0)

      const diffDays = Math.floor((currentDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays === streak) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  },

  // 获取本月打卡天数
  getMonthlyCheckIns: (checkIns: CheckIn[], year?: number, month?: number): number => {
    const targetYear = year || new Date().getFullYear()
    const targetMonth = month || new Date().getMonth() + 1

    return checkIns.filter(checkIn => {
      const checkInDate = new Date(checkIn.created_at)
      return checkInDate.getFullYear() === targetYear && 
             checkInDate.getMonth() + 1 === targetMonth
    }).length
  },

  // 获取心情统计
  getMoodStats: (checkIns: CheckIn[]) => {
    const moodCounts: Record<string, number> = {}
    
    checkIns.forEach(checkIn => {
      moodCounts[checkIn.mood] = (moodCounts[checkIn.mood] || 0) + 1
    })

    return moodCounts
  },
}
