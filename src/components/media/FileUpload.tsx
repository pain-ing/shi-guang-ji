'use client'

import { useState, useRef } from 'react'
import { useMediaStore } from '@/stores/mediaStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { Upload, X, File, Image, Video, Music } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MediaFile } from '@/types/database'

interface FileUploadProps {
  onUploadComplete?: (files: MediaFile[]) => void
  maxFiles?: number
  acceptedTypes?: string[]
  className?: string
}

export function FileUpload({
  onUploadComplete,
  maxFiles = 10,
  acceptedTypes = ['image/*', 'video/*', 'audio/*', 'application/pdf', '.doc', '.docx'],
  className,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const { uploadMultipleFiles, uploading } = useMediaStore()
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }

  const handleFiles = (files: File[]) => {
    // 验证文件数量
    if (selectedFiles.length + files.length > maxFiles) {
      toast({
        title: '文件数量超限',
        description: `最多只能选择 ${maxFiles} 个文件`,
        variant: 'destructive',
      })
      return
    }

    // 验证文件类型
    const validFiles = files.filter(file => {
      const isValid = acceptedTypes.some(type => {
        if (type.includes('*')) {
          return file.type.startsWith(type.replace('*', ''))
        }
        return file.type === type || file.name.toLowerCase().endsWith(type)
      })

      if (!isValid) {
        toast({
          title: '文件类型不支持',
          description: `文件 ${file.name} 的类型不被支持`,
          variant: 'destructive',
        })
      }

      return isValid
    })

    // 验证文件大小
    const maxSize = 10 * 1024 * 1024 // 10MB
    const sizeValidFiles = validFiles.filter(file => {
      if (file.size > maxSize) {
        toast({
          title: '文件过大',
          description: `文件 ${file.name} 超过10MB限制`,
          variant: 'destructive',
        })
        return false
      }
      return true
    })

    setSelectedFiles(prev => [...prev, ...sizeValidFiles])
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    try {
      // 模拟上传进度
      selectedFiles.forEach((file, index) => {
        const fileKey = `${file.name}-${index}`
        setUploadProgress(prev => ({ ...prev, [fileKey]: 0 }))
        
        // 模拟进度更新
        const interval = setInterval(() => {
          setUploadProgress(prev => {
            const current = prev[fileKey] || 0
            if (current >= 90) {
              clearInterval(interval)
              return prev
            }
            return { ...prev, [fileKey]: current + 10 }
          })
        }, 200)
      })

      const { data, errors } = await uploadMultipleFiles(selectedFiles)

      // 完成上传进度
      selectedFiles.forEach((file, index) => {
        const fileKey = `${file.name}-${index}`
        setUploadProgress(prev => ({ ...prev, [fileKey]: 100 }))
      })

      if (errors.length > 0) {
        toast({
          title: '部分文件上传失败',
          description: `${errors.length} 个文件上传失败`,
          variant: 'destructive',
        })
      }

      if (data.length > 0) {
        toast({
          title: '上传成功',
          description: `成功上传 ${data.length} 个文件`,
        })
        
        onUploadComplete?.(data)
        setSelectedFiles([])
        setUploadProgress({})
      }
    } catch {
      toast({
        title: '上传失败',
        description: '文件上传时出现错误',
        variant: 'destructive',
      })
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-4 w-4" alt="" />
    if (file.type.startsWith('video/')) return <Video className="h-4 w-4" />
    if (file.type.startsWith('audio/')) return <Music className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* 拖拽上传区域 */}
      <Card
        className={cn(
          'border-2 border-dashed transition-colors cursor-pointer',
          dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
          uploading && 'pointer-events-none opacity-50'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Upload className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">上传文件</h3>
          <p className="text-muted-foreground text-center mb-4">
            拖拽文件到此处或点击选择文件
          </p>
          <p className="text-xs text-muted-foreground">
            支持图片、视频、音频和文档，单个文件最大10MB
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* 选中的文件列表 */}
      {selectedFiles.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">选中的文件 ({selectedFiles.length})</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedFiles([])}
                  disabled={uploading}
                >
                  清空
                </Button>
              </div>
              
              <div className="space-y-2">
                {selectedFiles.map((file, index) => {
                  const fileKey = `${file.name}-${index}`
                  const progress = uploadProgress[fileKey] || 0
                  
                  return (
                    <div key={fileKey} className="flex items-center space-x-3 p-2 border rounded">
                      {getFileIcon(file)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                        {uploading && progress > 0 && (
                          <Progress value={progress} className="h-1 mt-1" />
                        )}
                      </div>
                      {!uploading && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>

              <Button
                onClick={handleUpload}
                disabled={uploading || selectedFiles.length === 0}
                className="w-full"
              >
                {uploading ? '上传中...' : `上传 ${selectedFiles.length} 个文件`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
