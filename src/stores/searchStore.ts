import { create } from 'zustand'
import Fuse, { FuseResultMatch } from 'fuse.js'
import { CheckIn } from '@/types/database'
import { Diary } from '@/types/database'
import { MediaFile } from '@/types/database'

export interface SearchResult {
  type: 'diary' | 'checkin' | 'media'
  item: Diary | CheckIn | MediaFile
  score?: number
  matches?: readonly FuseResultMatch[]
}

export interface SearchFilters {
  types: ('diary' | 'checkin' | 'media')[]
  dateRange?: {
    start: Date
    end: Date
  }
  tags?: string[]
  mood?: string[]
}

interface SearchState {
  query: string
  results: SearchResult[]
  filters: SearchFilters
  searchHistory: string[]
  loading: boolean
  recentSearches: string[]
}

interface SearchActions {
  // 搜索操作
  search: (query: string, data: {
    diaries: Diary[]
    checkIns: CheckIn[]
    mediaFiles: MediaFile[]
  }) => void
  
  // 过滤操作
  setFilters: (filters: Partial<SearchFilters>) => void
  clearFilters: () => void
  
  // 历史记录
  addToHistory: (query: string) => void
  clearHistory: () => void
  removeFromHistory: (query: string) => void
  
  // 状态管理
  setQuery: (query: string) => void
  setResults: (results: SearchResult[]) => void
  setLoading: (loading: boolean) => void
  clearSearch: () => void
}

type SearchStore = SearchState & SearchActions

export const useSearchStore = create<SearchStore>((set, get) => ({
  // 初始状态
  query: '',
  results: [],
  filters: {
    types: ['diary', 'checkin', 'media'],
  },
  searchHistory: [],
  loading: false,
  recentSearches: [],

  // 执行搜索
  search: (query: string, data) => {
    if (!query.trim()) {
      set({ results: [], query: '' })
      return
    }

    set({ loading: true, query })

    try {
      const { filters } = get()
      let allResults: SearchResult[] = []

      // 搜索日记
      if (filters.types.includes('diary')) {
        const diaryFuse = new Fuse(data.diaries, {
          keys: [
            { name: 'title', weight: 0.4 },
            { name: 'content', weight: 0.3 },
            { name: 'tags', weight: 0.2 },
            { name: 'mood', weight: 0.1 },
          ],
          threshold: 0.4,
          includeMatches: true,
          includeScore: true,
        })

        const diaryResults = diaryFuse.search(query).map(result => ({
          type: 'diary' as const,
          item: result.item,
          score: result.score,
          matches: result.matches,
        }))

        allResults = [...allResults, ...diaryResults]
      }

      // 搜索打卡记录
      if (filters.types.includes('checkin')) {
        const checkinFuse = new Fuse(data.checkIns, {
          keys: [
            { name: 'mood', weight: 0.5 },
            { name: 'note', weight: 0.4 },
            { name: 'tags', weight: 0.1 },
          ],
          threshold: 0.5,
          includeMatches: true,
          includeScore: true,
        })

        const checkinResults = checkinFuse.search(query).map(result => ({
          type: 'checkin' as const,
          item: result.item,
          score: result.score,
          matches: result.matches,
        }))

        allResults = [...allResults, ...checkinResults]
      }

      // 搜索媒体文件
      if (filters.types.includes('media')) {
        const mediaFuse = new Fuse(data.mediaFiles, {
          keys: [
            { name: 'filename', weight: 0.4 },
            { name: 'description', weight: 0.3 },
            { name: 'tags', weight: 0.2 },
            { name: 'alt_text', weight: 0.1 },
          ],
          threshold: 0.4,
          includeMatches: true,
          includeScore: true,
        })

        const mediaResults = mediaFuse.search(query).map(result => ({
          type: 'media' as const,
          item: result.item,
          score: result.score,
          matches: result.matches,
        }))

        allResults = [...allResults, ...mediaResults]
      }

      // 应用日期过滤
      if (filters.dateRange) {
        allResults = allResults.filter(result => {
          const itemDate = new Date(result.item.created_at)
          return itemDate >= filters.dateRange!.start && itemDate <= filters.dateRange!.end
        })
      }

      // 按分数排序
      allResults.sort((a, b) => (a.score || 0) - (b.score || 0))

      set({ results: allResults })
      get().addToHistory(query)
    } catch (error) {
      console.error('搜索失败:', error)
      set({ results: [] })
    } finally {
      set({ loading: false })
    }
  },

  // 设置过滤器
  setFilters: (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }))
  },

  // 清空过滤器
  clearFilters: () => {
    set({
      filters: {
        types: ['diary', 'checkin', 'media'],
      }
    })
  },

  // 添加到搜索历史
  addToHistory: (query: string) => {
    if (!query.trim()) return

    set(state => {
      const newHistory = [query, ...state.searchHistory.filter(h => h !== query)].slice(0, 10)
      
      // 同时更新最近搜索
      const newRecentSearches = [query, ...state.recentSearches.filter(h => h !== query)].slice(0, 5)
      
      return {
        searchHistory: newHistory,
        recentSearches: newRecentSearches,
      }
    })
  },

  // 清空搜索历史
  clearHistory: () => {
    set({ searchHistory: [], recentSearches: [] })
  },

  // 从历史中移除
  removeFromHistory: (query: string) => {
    set(state => ({
      searchHistory: state.searchHistory.filter(h => h !== query),
      recentSearches: state.recentSearches.filter(h => h !== query),
    }))
  },

  // 设置搜索查询
  setQuery: (query: string) => {
    set({ query })
  },

  // 设置搜索结果
  setResults: (results: SearchResult[]) => {
    set({ results })
  },

  // 设置加载状态
  setLoading: (loading: boolean) => {
    set({ loading })
  },

  // 清空搜索
  clearSearch: () => {
    set({ query: '', results: [] })
  },
}))

// 搜索工具函数
export const searchUtils = {
  // 高亮匹配文本
  highlightMatches: (text: string, matches: readonly FuseResultMatch[] = []) => {
    if (!matches.length) return text

    let highlightedText = text
    const sortedMatches = matches
      .filter(match => match.key && match.indices)
      .sort((a, b) => b.indices[0][0] - a.indices[0][0])

    sortedMatches.forEach(match => {
      match.indices.forEach(([start, end]) => {
        const before = highlightedText.slice(0, start)
        const highlighted = highlightedText.slice(start, end + 1)
        const after = highlightedText.slice(end + 1)
        highlightedText = `${before}<mark class="bg-yellow-200 px-1 rounded">${highlighted}</mark>${after}`
      })
    })

    return highlightedText
  },

  // 获取搜索结果摘要
  getResultSummary: (results: SearchResult[]) => {
    const summary = results.reduce((acc, result) => {
      acc[result.type] = (acc[result.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total: results.length,
      diary: summary.diary || 0,
      checkin: summary.checkin || 0,
      media: summary.media || 0,
    }
  },

  // 格式化搜索建议
  formatSuggestions: (suggestions: string[]) => {
    return suggestions.map(suggestion => ({
      text: suggestion,
      type: 'history' as const,
    }))
  },

  // 获取热门搜索词
  getPopularSearches: (history: string[]) => {
    const counts = history.reduce((acc, query) => {
      acc[query] = (acc[query] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([query]) => query)
  },
}
