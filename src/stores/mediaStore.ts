import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { MediaFile, MediaFileCreate, MediaFileUpdate } from '@/types/database'

interface MediaState {
  mediaFiles: MediaFile[]
  currentFile: MediaFile | null
  loading: boolean
  uploading: boolean
  error: string | null
  searchQuery: string
  selectedType: string
  totalCount: number
  currentPage: number
  pageSize: number
}

interface MediaActions {
  // 文件上传
  uploadFile: (file: File, metadata?: Partial<MediaFileCreate>) => Promise<{ data: MediaFile | null; error: Error | null }>
  uploadMultipleFiles: (files: File[], metadata?: Partial<MediaFileCreate>) => Promise<{ data: MediaFile[]; errors: Error[] }>
  
  // CRUD 操作
  updateFile: (id: number, data: MediaFileUpdate) => Promise<{ data: MediaFile | null; error: Error | null }>
  deleteFile: (id: number) => Promise<{ error: Error | null }>
  
  // 查询操作
  getMediaFiles: (page?: number, search?: string, type?: string) => Promise<void>
  getFile: (id: number) => Promise<void>
  searchFiles: (query: string) => Promise<void>
  filterByType: (type: string) => Promise<void>
  
  // 状态管理
  setCurrentFile: (file: MediaFile | null) => void
  setLoading: (loading: boolean) => void
  setUploading: (uploading: boolean) => void
  setError: (error: string | null) => void
  setSearchQuery: (query: string) => void
  setSelectedType: (type: string) => void
  clearFiles: () => void
  
  // 分页
  nextPage: () => void
  prevPage: () => void
  setPage: (page: number) => void
}

type MediaStore = MediaState & MediaActions

export const useMediaStore = create<MediaStore>((set, get) => ({
  // 初始状态
  mediaFiles: [],
  currentFile: null,
  loading: false,
  uploading: false,
  error: null,
  searchQuery: '',
  selectedType: 'all',
  totalCount: 0,
  currentPage: 1,
  pageSize: 20,

  // 上传单个文件
  uploadFile: async (file: File, metadata = {}) => {
    try {
      set({ uploading: true, error: null })

      // 验证文件
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        throw new Error('文件大小不能超过10MB')
      }

      // 获取当前用户
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('用户未登录')
      }

      // 生成文件名
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

      // 上传到 Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, file)

      if (uploadError) {
        throw uploadError
      }

      // 获取文件URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName)

      // 保存文件信息到数据库
      const mediaData: MediaFileCreate = {
        user_id: user.id,
        filename: file.name,
        file_path: fileName,
        file_url: publicUrl,
        file_size: file.size,
        file_type: file.type.split('/')[0], // 'image', 'video', 'audio', etc.
        mime_type: file.type,
        ...metadata,
      }

      const { data: mediaFile, error: dbError } = await supabase
        .from('media_files')
        .insert([mediaData])
        .select()
        .single()

      if (dbError) {
        // 如果数据库保存失败，删除已上传的文件
        await supabase.storage.from('media').remove([fileName])
        throw dbError
      }

      // 更新状态
      set(state => ({
        mediaFiles: [mediaFile, ...state.mediaFiles],
        totalCount: state.totalCount + 1,
      }))

      return { data: mediaFile, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '上传文件失败'
      set({ error: errorMessage })
      return { data: null, error: error as Error }
    } finally {
      set({ uploading: false })
    }
  },

  // 批量上传文件
  uploadMultipleFiles: async (files: File[], metadata = {}) => {
    const results: MediaFile[] = []
    const errors: Error[] = []

    for (const file of files) {
      const { data, error } = await get().uploadFile(file, metadata)
      if (data) {
        results.push(data)
      }
      if (error) {
        errors.push(error)
      }
    }

    return { data: results, errors }
  },

  // 更新文件信息
  updateFile: async (id: number, data: MediaFileUpdate) => {
    try {
      set({ loading: true, error: null })

      const { data: mediaFile, error } = await supabase
        .from('media_files')
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
        mediaFiles: state.mediaFiles.map(item => 
          item.id === id ? mediaFile : item
        ),
        currentFile: state.currentFile?.id === id ? mediaFile : state.currentFile,
      }))

      return { data: mediaFile, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '更新文件失败'
      set({ error: errorMessage })
      return { data: null, error: error as Error }
    } finally {
      set({ loading: false })
    }
  },

  // 删除文件
  deleteFile: async (id: number) => {
    try {
      set({ loading: true, error: null })

      // 获取文件信息
      const file = get().mediaFiles.find(f => f.id === id)
      if (!file) {
        throw new Error('文件不存在')
      }

      // 从数据库删除记录
      const { error: dbError } = await supabase
        .from('media_files')
        .delete()
        .eq('id', id)

      if (dbError) {
        throw dbError
      }

      // 从存储删除文件
      const { error: storageError } = await supabase.storage
        .from('media')
        .remove([file.file_path])

      if (storageError) {
        console.warn('删除存储文件失败:', storageError)
      }

      // 更新状态
      set(state => ({
        mediaFiles: state.mediaFiles.filter(item => item.id !== id),
        currentFile: state.currentFile?.id === id ? null : state.currentFile,
        totalCount: Math.max(0, state.totalCount - 1),
      }))

      return { error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '删除文件失败'
      set({ error: errorMessage })
      return { error: error as Error }
    } finally {
      set({ loading: false })
    }
  },

  // 获取媒体文件列表
  getMediaFiles: async (page = 1, search = '', type = 'all') => {
    try {
      set({ loading: true, error: null })

      const { pageSize } = get()
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      let query = supabase
        .from('media_files')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

      // 添加搜索条件
      if (search.trim()) {
        query = query.ilike('filename', `%${search}%`)
      }

      // 添加类型筛选
      if (type !== 'all') {
        if (type === 'image') {
          query = query.like('mime_type', 'image/%')
        } else if (type === 'video') {
          query = query.like('mime_type', 'video/%')
        } else if (type === 'audio') {
          query = query.like('mime_type', 'audio/%')
        } else if (type === 'document') {
          query = query.not('mime_type', 'like', 'image/%')
            .not('mime_type', 'like', 'video/%')
            .not('mime_type', 'like', 'audio/%')
        }
      }

      const { data, error, count } = await query

      if (error) {
        set({ error: error.message })
        return
      }

      set({
        mediaFiles: data || [],
        totalCount: count || 0,
        currentPage: page,
        searchQuery: search,
        selectedType: type,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取媒体文件失败'
      set({ error: errorMessage })
    } finally {
      set({ loading: false })
    }
  },

  // 获取单个文件
  getFile: async (id: number) => {
    try {
      set({ loading: true, error: null })

      const { data, error } = await supabase
        .from('media_files')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        set({ error: error.message })
        return
      }

      set({ currentFile: data })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取文件详情失败'
      set({ error: errorMessage })
    } finally {
      set({ loading: false })
    }
  },

  // 搜索文件
  searchFiles: async (query: string) => {
    await get().getMediaFiles(1, query, get().selectedType)
  },

  // 按类型筛选
  filterByType: async (type: string) => {
    await get().getMediaFiles(1, get().searchQuery, type)
  },

  // 设置当前文件
  setCurrentFile: (file: MediaFile | null) => set({ currentFile: file }),

  // 设置加载状态
  setLoading: (loading: boolean) => set({ loading }),

  // 设置上传状态
  setUploading: (uploading: boolean) => set({ uploading }),

  // 设置错误信息
  setError: (error: string | null) => set({ error }),

  // 设置搜索查询
  setSearchQuery: (query: string) => set({ searchQuery: query }),

  // 设置选中类型
  setSelectedType: (type: string) => set({ selectedType: type }),

  // 清空文件列表
  clearFiles: () => set({ 
    mediaFiles: [], 
    currentFile: null, 
    totalCount: 0, 
    currentPage: 1,
    searchQuery: '',
    selectedType: 'all',
  }),

  // 下一页
  nextPage: () => {
    const { currentPage, totalCount, pageSize, searchQuery, selectedType } = get()
    const totalPages = Math.ceil(totalCount / pageSize)
    if (currentPage < totalPages) {
      get().getMediaFiles(currentPage + 1, searchQuery, selectedType)
    }
  },

  // 上一页
  prevPage: () => {
    const { currentPage, searchQuery, selectedType } = get()
    if (currentPage > 1) {
      get().getMediaFiles(currentPage - 1, searchQuery, selectedType)
    }
  },

  // 设置页码
  setPage: (page: number) => {
    const { searchQuery, selectedType } = get()
    get().getMediaFiles(page, searchQuery, selectedType)
  },
}))

// 导出一些有用的工具函数
export const mediaUtils = {
  // 格式化文件大小
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  // 获取文件类型图标
  getFileTypeIcon: (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return '🖼️'
    if (mimeType.startsWith('video/')) return '🎥'
    if (mimeType.startsWith('audio/')) return '🎵'
    if (mimeType.includes('pdf')) return '📄'
    if (mimeType.includes('word')) return '📝'
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊'
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📈'
    return '📁'
  },

  // 检查是否为图片
  isImage: (mimeType: string): boolean => {
    return mimeType.startsWith('image/')
  },

  // 检查是否为视频
  isVideo: (mimeType: string): boolean => {
    return mimeType.startsWith('video/')
  },

  // 检查是否为音频
  isAudio: (mimeType: string): boolean => {
    return mimeType.startsWith('audio/')
  },

  // 获取文件扩展名
  getFileExtension: (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || ''
  },
}
