'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Camera, Loader2, X } from 'lucide-react'

interface AvatarUploadProps {
  currentAvatarUrl?: string | null
  username?: string | null
  onAvatarUpdate?: (avatarUrl: string) => void
  size?: 'sm' | 'md' | 'lg'
  editable?: boolean
}

export function AvatarUpload({
  currentAvatarUrl,
  username,
  onAvatarUpdate,
  size = 'md',
  editable = true,
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const { user, updateProfile } = useAuthStore()
  const { toast } = useToast()

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  }

  const getInitials = (name: string | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const uploadAvatar = async (file: File) => {
    if (!user) return

    try {
      setUploading(true)

      // 验证文件
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('文件大小不能超过5MB')
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('请选择图片文件')
      }

      // 生成唯一文件名
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/avatar.${fileExt}`

      // 上传到 Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          upsert: true, // 覆盖已存在的文件
        })

      if (uploadError) {
        throw uploadError
      }

      // 获取公共URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // 更新用户资料
      const { error: updateError } = await updateProfile({
        avatar_url: publicUrl,
      })

      if (updateError) {
        throw updateError
      }

      // 通知父组件
      onAvatarUpdate?.(publicUrl)
      setPreviewUrl(null)

      toast({
        title: '头像更新成功',
        description: '您的头像已更新',
      })
    } catch (error) {
      toast({
        title: '上传失败',
        description: error instanceof Error ? error.message : '上传头像时出现错误',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // 显示预览
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // 上传文件
      uploadAvatar(file)
    }
  }

  const clearPreview = () => {
    setPreviewUrl(null)
  }

  return (
    <div className="relative inline-block">
      <Avatar className={sizeClasses[size]}>
        <AvatarImage 
          src={previewUrl || currentAvatarUrl || ''} 
          alt={username || '用户头像'} 
        />
        <AvatarFallback className={size === 'lg' ? 'text-lg' : size === 'sm' ? 'text-xs' : 'text-sm'}>
          {getInitials(username || null)}
        </AvatarFallback>
      </Avatar>

      {editable && (
        <>
          {/* 上传按钮覆盖层 */}
          <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
            {uploading ? (
              <Loader2 className="h-4 w-4 text-white animate-spin" />
            ) : (
              <Camera className="h-4 w-4 text-white" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
          </label>

          {/* 预览时的清除按钮 */}
          {previewUrl && !uploading && (
            <Button
              size="sm"
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
              onClick={clearPreview}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </>
      )}

      {/* 上传状态指示器 */}
      {uploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
          <Loader2 className="h-4 w-4 text-white animate-spin" />
        </div>
      )}
    </div>
  )
}
