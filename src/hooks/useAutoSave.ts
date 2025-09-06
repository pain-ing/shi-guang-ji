import { useEffect, useRef, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'

interface UseAutoSaveOptions {
  data: any
  onSave: (data: any) => Promise<void>
  delay?: number
  enabled?: boolean
}

export function useAutoSave({
  data,
  onSave,
  delay = 30000, // 30秒
  enabled = true,
}: UseAutoSaveOptions) {
  const { toast } = useToast()
  const timeoutRef = useRef<NodeJS.Timeout>()
  const lastSavedDataRef = useRef<any>()
  const isSavingRef = useRef(false)

  const save = useCallback(async () => {
    if (isSavingRef.current || !enabled) return

    try {
      isSavingRef.current = true
      await onSave(data)
      lastSavedDataRef.current = data
      
      toast({
        title: '自动保存成功',
        description: '您的内容已自动保存',
        duration: 2000,
      })
    } catch (error) {
      console.error('自动保存失败:', error)
      toast({
        title: '自动保存失败',
        description: '请手动保存您的内容',
        variant: 'destructive',
        duration: 3000,
      })
    } finally {
      isSavingRef.current = false
    }
  }, [data, onSave, enabled, toast])

  useEffect(() => {
    if (!enabled) return

    // 检查数据是否有变化
    const hasChanged = JSON.stringify(data) !== JSON.stringify(lastSavedDataRef.current)
    
    if (hasChanged && data) {
      // 清除之前的定时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // 设置新的定时器
      timeoutRef.current = setTimeout(save, delay)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, delay, enabled, save])

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // 手动保存
  const manualSave = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    await save()
  }, [save])

  return {
    manualSave,
    isSaving: isSavingRef.current,
  }
}
