import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

export interface Tag {
  id: number
  name: string
  color: string
  user_id: string
  created_at: string
  updated_at: string
  usage_count?: number
}

export interface TagCreate {
  name: string
  color: string
  user_id: string
}

export interface TagUpdate {
  name?: string
  color?: string
}

interface TagState {
  tags: Tag[]
  loading: boolean
  error: string | null
}

interface TagActions {
  // CRUD操作
  createTag: (data: TagCreate) => Promise<{ data: Tag | null; error: Error | null }>
  updateTag: (id: number, data: TagUpdate) => Promise<{ data: Tag | null; error: Error | null }>
  deleteTag: (id: number) => Promise<{ error: Error | null }>
  
  // 查询操作
  getTags: () => Promise<void>
  getPopularTags: (limit?: number) => Promise<Tag[]>
  searchTags: (query: string) => Tag[]
  
  // 状态管理
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearTags: () => void
}

type TagStore = TagState & TagActions

export const useTagStore = create<TagStore>((set, get) => ({
  // 初始状态
  tags: [],
  loading: false,
  error: null,

  // 创建标签
  createTag: async (data: TagCreate) => {
    try {
      set({ loading: true, error: null })

      const { data: tag, error } = await supabase
        .from('tags')
        .insert([data])
        .select()
        .single()

      if (error) {
        set({ error: error.message })
        return { data: null, error }
      }

      // 更新状态
      set(state => ({
        tags: [tag, ...state.tags],
      }))

      return { data: tag, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '创建标签失败'
      set({ error: errorMessage })
      return { data: null, error: error as Error }
    } finally {
      set({ loading: false })
    }
  },

  // 更新标签
  updateTag: async (id: number, data: TagUpdate) => {
    try {
      set({ loading: true, error: null })

      const { data: tag, error } = await supabase
        .from('tags')
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
        tags: state.tags.map(item => 
          item.id === id ? tag : item
        ),
      }))

      return { data: tag, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '更新标签失败'
      set({ error: errorMessage })
      return { data: null, error: error as Error }
    } finally {
      set({ loading: false })
    }
  },

  // 删除标签
  deleteTag: async (id: number) => {
    try {
      set({ loading: true, error: null })

      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id)

      if (error) {
        set({ error: error.message })
        return { error }
      }

      // 更新状态
      set(state => ({
        tags: state.tags.filter(item => item.id !== id),
      }))

      return { error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '删除标签失败'
      set({ error: errorMessage })
      return { error: error as Error }
    } finally {
      set({ loading: false })
    }
  },

  // 获取标签列表
  getTags: async () => {
    try {
      set({ loading: true, error: null })

      const { data, error } = await supabase
        .from('tags')
        .select(`
          *,
          diary_tags(count),
          media_tags(count)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        set({ error: error.message })
        return
      }

      // 计算使用次数
      const tagsWithUsageCount = data.map(tag => ({
        ...tag,
        usage_count: (tag.diary_tags?.length || 0) + (tag.media_tags?.length || 0)
      }))

      set({ tags: tagsWithUsageCount || [] })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取标签失败'
      set({ error: errorMessage })
    } finally {
      set({ loading: false })
    }
  },

  // 获取热门标签
  getPopularTags: async (limit = 10) => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select(`
          *,
          diary_tags(count),
          media_tags(count)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      // 计算使用次数并排序
      const tagsWithUsageCount = data.map(tag => ({
        ...tag,
        usage_count: (tag.diary_tags?.length || 0) + (tag.media_tags?.length || 0)
      })).sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))

      return tagsWithUsageCount.slice(0, limit)
    } catch (error) {
      console.error('获取热门标签失败:', error)
      return []
    }
  },

  // 搜索标签
  searchTags: (query: string) => {
    const { tags } = get()
    if (!query.trim()) return tags

    return tags.filter(tag => 
      tag.name.toLowerCase().includes(query.toLowerCase())
    )
  },

  // 设置加载状态
  setLoading: (loading: boolean) => set({ loading }),

  // 设置错误信息
  setError: (error: string | null) => set({ error }),

  // 清空标签列表
  clearTags: () => set({ tags: [], error: null }),
}))

// 标签颜色预设
export const TAG_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#ec4899', // pink
  '#6b7280', // gray
  '#14b8a6', // teal
  '#a855f7', // purple
]

// 工具函数
export const tagUtils = {
  // 获取随机颜色
  getRandomColor: () => {
    return TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)]
  },

  // 格式化标签显示
  formatTagDisplay: (tag: Tag) => {
    const usageText = tag.usage_count ? `(${tag.usage_count})` : ''
    return `${tag.name} ${usageText}`
  },

  // 标签去重
  deduplicateTags: (tags: Tag[]) => {
    const seen = new Set()
    return tags.filter(tag => {
      if (seen.has(tag.name.toLowerCase())) {
        return false
      }
      seen.add(tag.name.toLowerCase())
      return true
    })
  },
}
