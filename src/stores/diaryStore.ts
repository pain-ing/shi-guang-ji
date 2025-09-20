import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { Diary, DiaryCreate, DiaryUpdate } from '@/types/database'

interface DiaryState {
  diaries: Diary[]
  currentDiary: Diary | null
  loading: boolean
  error: string | null
  searchQuery: string
  totalCount: number
  currentPage: number
  pageSize: number
}

interface DiaryActions {
  // CRUD 操作
  createDiary: (data: DiaryCreate) => Promise<{ data: Diary | null; error: Error | null }>
  updateDiary: (id: number, data: DiaryUpdate) => Promise<{ data: Diary | null; error: Error | null }>
  deleteDiary: (id: number) => Promise<{ error: Error | null }>
  
  // 查询操作
  getDiaries: (page?: number, search?: string) => Promise<void>
  getDiary: (id: number) => Promise<void>
  searchDiaries: (query: string) => Promise<void>
  
  // 状态管理
  setCurrentDiary: (diary: Diary | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSearchQuery: (query: string) => void
  clearDiaries: () => void
  
  // 分页
  nextPage: () => void
  prevPage: () => void
  setPage: (page: number) => void
}

type DiaryStore = DiaryState & DiaryActions

export const useDiaryStore = create<DiaryStore>((set, get) => ({
  // 初始状态
  diaries: [],
  currentDiary: null,
  loading: false,
  error: null,
  searchQuery: '',
  totalCount: 0,
  currentPage: 1,
  pageSize: 10,

  // 创建日记
  createDiary: async (data: DiaryCreate) => {
    try {
      set({ loading: true, error: null })

      const { data: diary, error } = await supabase
        .from('diaries')
        .insert([data])
        .select()
        .single()

      if (error) {
        set({ error: error.message })
        return { data: null, error }
      }

      // 更新状态
      set(state => ({
        diaries: [diary, ...state.diaries],
        totalCount: state.totalCount + 1,
      }))

      return { data: diary, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '创建日记失败'
      set({ error: errorMessage })
      return { data: null, error: error as Error }
    } finally {
      set({ loading: false })
    }
  },

  // 更新日记
  updateDiary: async (id: number, data: DiaryUpdate) => {
    try {
      set({ loading: true, error: null })

      const { data: diary, error } = await supabase
        .from('diaries')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        set({ error: error.message })
        return { data: null, error }
      }

      // 更新状态
      set(state => ({
        diaries: state.diaries.map(item => 
          item.id === id ? diary : item
        ),
        currentDiary: state.currentDiary?.id === id ? diary : state.currentDiary,
      }))

      return { data: diary, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '更新日记失败'
      set({ error: errorMessage })
      return { data: null, error: error as Error }
    } finally {
      set({ loading: false })
    }
  },

  // 删除日记
  deleteDiary: async (id: number) => {
    try {
      set({ loading: true, error: null })

      const { error } = await supabase
        .from('diaries')
        .delete()
        .eq('id', id)

      if (error) {
        set({ error: error.message })
        return { error }
      }

      // 更新状态
      set(state => ({
        diaries: state.diaries.filter(item => item.id !== id),
        currentDiary: state.currentDiary?.id === id ? null : state.currentDiary,
        totalCount: Math.max(0, state.totalCount - 1),
      }))

      return { error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '删除日记失败'
      set({ error: errorMessage })
      return { error: error as Error }
    } finally {
      set({ loading: false })
    }
  },

  // 获取日记列表
  getDiaries: async (page = 1, search = '') => {
    try {
      set({ loading: true, error: null })

      const { pageSize } = get()
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      let query = supabase
        .from('diaries')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

      // 添加搜索条件
      if (search.trim()) {
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
      }

      const { data, error, count } = await query

      if (error) {
        set({ error: error.message })
        return
      }

      set({
        diaries: data || [],
        totalCount: count || 0,
        currentPage: page,
        searchQuery: search,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取日记列表失败'
      set({ error: errorMessage })
    } finally {
      set({ loading: false })
    }
  },

  // 获取单篇日记
  getDiary: async (id: number) => {
    try {
      set({ loading: true, error: null })

      const { data, error } = await supabase
        .from('diaries')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        set({ error: error.message })
        return
      }

      set({ currentDiary: data })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取日记详情失败'
      set({ error: errorMessage })
    } finally {
      set({ loading: false })
    }
  },

  // 搜索日记
  searchDiaries: async (query: string) => {
    await get().getDiaries(1, query)
  },

  // 设置当前日记
  setCurrentDiary: (diary: Diary | null) => set({ currentDiary: diary }),

  // 设置加载状态
  setLoading: (loading: boolean) => set({ loading }),

  // 设置错误信息
  setError: (error: string | null) => set({ error }),

  // 设置搜索查询
  setSearchQuery: (query: string) => set({ searchQuery: query }),

  // 清空日记列表
  clearDiaries: () => set({ 
    diaries: [], 
    currentDiary: null, 
    totalCount: 0, 
    currentPage: 1,
    searchQuery: '',
  }),

  // 下一页
  nextPage: () => {
    const { currentPage, totalCount, pageSize } = get()
    const totalPages = Math.ceil(totalCount / pageSize)
    if (currentPage < totalPages) {
      get().getDiaries(currentPage + 1, get().searchQuery)
    }
  },

  // 上一页
  prevPage: () => {
    const { currentPage } = get()
    if (currentPage > 1) {
      get().getDiaries(currentPage - 1, get().searchQuery)
    }
  },

  // 设置页码
  setPage: (page: number) => {
    get().getDiaries(page, get().searchQuery)
  },
}))

// 导出一些有用的工具函数
export const diaryUtils = {
  // 格式化日期
  formatDate: (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    })
  },

  // 获取摘要
  getExcerpt: (content: string, maxLength = 100) => {
    // 移除 HTML 标签
    const text = content.replace(/<[^>]*>/g, '')
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
  },

  // 计算阅读时间
  getReadingTime: (content: string) => {
    const wordsPerMinute = 200
    const words = content.replace(/<[^>]*>/g, '').length
    const minutes = Math.ceil(words / wordsPerMinute)
    return minutes
  },

  // 获取字数统计
  getWordCount: (content: string) => {
    return content.replace(/<[^>]*>/g, '').length
  },
}
