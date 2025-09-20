'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useMediaStore, mediaUtils } from '@/stores/mediaStore'
import { MediaFile } from '@/types/database'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
// AuthGuard已通过中间件处理，不需要重复导入
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUpload } from '@/components/media/FileUpload'
import { MediaGrid } from '@/components/media/MediaGrid'
import { useToast } from '@/hooks/use-toast'
import { 
  Upload, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Image,
  Video,
  Music,
  FileText,
  Trash2
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function MediaPage() {
  const { user } = useAuthStore()
  const { 
    mediaFiles, 
    loading, 
    searchQuery, 
    selectedType, 
    currentPage, 
    totalCount, 
    pageSize,
    getMediaFiles, 
    searchFiles, 
    filterByType,
    deleteFile,
    setSearchQuery,
    nextPage,
    prevPage 
  } = useMediaStore()
  const { toast } = useToast()
  
  const [localSearchQuery, setLocalSearchQuery] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([])
  const [selectionMode, setSelectionMode] = useState(false)

  useEffect(() => {
    if (user) {
      getMediaFiles()
    }
  }, [user, getMediaFiles])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(localSearchQuery)
    searchFiles(localSearchQuery)
  }

  const clearSearch = () => {
    setLocalSearchQuery('')
    setSearchQuery('')
    getMediaFiles()
  }

  const handleTypeFilter = (type: string) => {
    filterByType(type)
  }

  const handleUploadComplete = () => {
    setShowUpload(false)
    getMediaFiles() // 刷新文件列表
  }

  const handleFileDelete = async (file: MediaFile) => {
    const { error } = await deleteFile(file.id)
    if (error) {
      toast({
        title: '删除失败',
        description: error.message || '删除文件时出现错误',
        variant: 'destructive',
      })
    } else {
      toast({
        title: '删除成功',
        description: '文件已成功删除',
      })
    }
  }

  const handleBatchDelete = async () => {
    if (selectedFiles.length === 0) return

    const results = await Promise.allSettled(
      selectedFiles.map(file => deleteFile(file.id))
    )

    const successCount = results.filter(r => r.status === 'fulfilled').length
    const errorCount = results.length - successCount

    if (successCount > 0) {
      toast({
        title: '批量删除完成',
        description: `成功删除 ${successCount} 个文件${errorCount > 0 ? `，${errorCount} 个文件删除失败` : ''}`,
      })
    }

    setSelectedFiles([])
    setSelectionMode(false)
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  const typeOptions = [
    { value: 'all', label: '全部文件', icon: FileText },
    { value: 'image', label: '图片', icon: Image },
    { value: 'video', label: '视频', icon: Video },
    { value: 'audio', label: '音频', icon: Music },
    { value: 'document', label: '文档', icon: FileText },
  ]

  if (loading && mediaFiles.length === 0) {
    return (
      <DashboardLayout>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">媒体库</h1>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-32 bg-muted rounded-t-lg" />
                  <CardContent className="p-3">
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
        <div className="space-y-6">
          {/* 头部 */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">媒体库</h1>
              <p className="text-muted-foreground">
                管理您的图片、视频、音频和文档
              </p>
            </div>
            <div className="flex space-x-2">
              {selectionMode && selectedFiles.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={handleBatchDelete}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  删除选中 ({selectedFiles.length})
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setSelectionMode(!selectionMode)}
              >
                {selectionMode ? '取消选择' : '批量选择'}
              </Button>
              <Button onClick={() => setShowUpload(!showUpload)}>
                <Upload className="mr-2 h-4 w-4" />
                上传文件
              </Button>
            </div>
          </div>

          {/* 上传区域 */}
          {showUpload && (
            <FileUpload
              onUploadComplete={handleUploadComplete}
              maxFiles={20}
            />
          )}

          {/* 搜索和筛选 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex flex-1 space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索文件名..."
                      value={localSearchQuery}
                      onChange={(e) => setLocalSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button type="submit">搜索</Button>
                  {searchQuery && (
                    <Button type="button" variant="outline" onClick={clearSearch}>
                      清除
                    </Button>
                  )}
                </form>
                
                <Select value={selectedType} onValueChange={handleTypeFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="文件类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center">
                          <option.icon className="mr-2 h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {(searchQuery || selectedType !== 'all') && (
                <div className="mt-4 text-sm text-muted-foreground">
                  {searchQuery && `搜索"${searchQuery}"`}
                  {searchQuery && selectedType !== 'all' && '，'}
                  {selectedType !== 'all' && `筛选"${typeOptions.find(t => t.value === selectedType)?.label}"`}
                  ，找到 {totalCount} 个文件
                </div>
              )}
            </CardContent>
          </Card>

          {/* 文件网格 */}
          <MediaGrid
            files={mediaFiles}
            onFileDelete={handleFileDelete}
            selectable={selectionMode}
            selectedFiles={selectedFiles}
            onSelectionChange={setSelectedFiles}
          />

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                第 {currentPage} 页，共 {totalPages} 页，总计 {totalCount} 个文件
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                >
                  下一页
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* 统计信息 */}
          {mediaFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">存储统计</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{totalCount}</div>
                    <div className="text-sm text-muted-foreground">总文件数</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {mediaFiles.filter(f => mediaUtils.isImage(f.mime_type)).length}
                    </div>
                    <div className="text-sm text-muted-foreground">图片</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {mediaFiles.filter(f => mediaUtils.isVideo(f.mime_type)).length}
                    </div>
                    <div className="text-sm text-muted-foreground">视频</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {mediaUtils.formatFileSize(
                        mediaFiles.reduce((acc, f) => acc + (f.file_size || 0), 0)
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">总大小</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
    </DashboardLayout>
  )
}
