'use client'

import { useState } from 'react'
import { MediaFile } from '@/types/database'
import { mediaUtils } from '@/stores/mediaStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useToast } from '@/hooks/use-toast'
import { 
  MoreVertical, 
  Download, 
  Trash2, 
  Eye, 
  Copy,
  Calendar,
  FileText
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface MediaGridProps {
  files: MediaFile[]
  onFileSelect?: (file: MediaFile) => void
  onFileDelete?: (file: MediaFile) => void
  selectable?: boolean
  selectedFiles?: MediaFile[]
  onSelectionChange?: (files: MediaFile[]) => void
}

export function MediaGrid({
  files,
  onFileSelect,
  onFileDelete,
  selectable = false,
  selectedFiles = [],
  onSelectionChange,
}: MediaGridProps) {
  const [deleteFile, setDeleteFile] = useState<MediaFile | null>(null)
  const { toast } = useToast()

  const handleFileClick = (file: MediaFile) => {
    if (selectable) {
      const isSelected = selectedFiles.some(f => f.id === file.id)
      if (isSelected) {
        onSelectionChange?.(selectedFiles.filter(f => f.id !== file.id))
      } else {
        onSelectionChange?.([...selectedFiles, file])
      }
    } else {
      onFileSelect?.(file)
    }
  }

  const handleDownload = async (file: MediaFile) => {
    try {
      const response = await fetch(file.file_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: '下载成功',
        description: `文件 ${file.filename} 已开始下载`,
      })
    } catch (error) {
      toast({
        title: '下载失败',
        description: '下载文件时出现错误',
        variant: 'destructive',
      })
    }
  }

  const handleCopyUrl = async (file: MediaFile) => {
    try {
      await navigator.clipboard.writeText(file.file_url)
      toast({
        title: '链接已复制',
        description: '文件链接已复制到剪贴板',
      })
    } catch (error) {
      toast({
        title: '复制失败',
        description: '复制链接时出现错误',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = (file: MediaFile) => {
    setDeleteFile(file)
  }

  const confirmDelete = () => {
    if (deleteFile) {
      onFileDelete?.(deleteFile)
      setDeleteFile(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const renderFilePreview = (file: MediaFile) => {
    if (mediaUtils.isImage(file.mime_type)) {
      return (
        <img
          src={file.file_url}
          alt={file.filename}
          className="w-full h-32 object-cover rounded-t-lg"
          loading="lazy"
        />
      )
    }

    if (mediaUtils.isVideo(file.mime_type)) {
      return (
        <div className="w-full h-32 bg-gray-100 rounded-t-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl mb-2">🎥</div>
            <p className="text-xs text-muted-foreground">视频文件</p>
          </div>
        </div>
      )
    }

    if (mediaUtils.isAudio(file.mime_type)) {
      return (
        <div className="w-full h-32 bg-gray-100 rounded-t-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl mb-2">🎵</div>
            <p className="text-xs text-muted-foreground">音频文件</p>
          </div>
        </div>
      )
    }

    return (
      <div className="w-full h-32 bg-gray-100 rounded-t-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2">{mediaUtils.getFileTypeIcon(file.mime_type)}</div>
          <p className="text-xs text-muted-foreground">
            {mediaUtils.getFileExtension(file.filename).toUpperCase()}
          </p>
        </div>
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">暂无文件</h3>
        <p className="text-muted-foreground">
          上传一些文件来开始管理您的媒体库
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {files.map((file) => {
          const isSelected = selectedFiles.some(f => f.id === file.id)
          
          return (
            <Card
              key={file.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleFileClick(file)}
            >
              <div className="relative">
                {renderFilePreview(file)}
                
                {/* 选择指示器 */}
                {selectable && (
                  <div className="absolute top-2 left-2">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      isSelected 
                        ? 'bg-primary border-primary' 
                        : 'bg-white border-gray-300'
                    }`}>
                      {isSelected && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 操作菜单 */}
                <div className="absolute top-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onFileSelect?.(file)}>
                        <Eye className="mr-2 h-4 w-4" />
                        查看
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload(file)}>
                        <Download className="mr-2 h-4 w-4" />
                        下载
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCopyUrl(file)}>
                        <Copy className="mr-2 h-4 w-4" />
                        复制链接
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDelete(file)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <CardContent className="p-3">
                <h4 className="font-medium text-sm truncate mb-1">
                  {file.filename}
                </h4>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{mediaUtils.formatFileSize(file.file_size || 0)}</span>
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{formatDate(file.created_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        open={!!deleteFile}
        onOpenChange={() => setDeleteFile(null)}
        title="删除文件"
        description={`确定要删除文件"${deleteFile?.filename}"吗？此操作无法撤销。`}
        confirmText="删除"
        cancelText="取消"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </>
  )
}
