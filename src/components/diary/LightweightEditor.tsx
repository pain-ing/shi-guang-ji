'use client'

import React, { memo, useCallback, useMemo, useRef, useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import {
  Bold,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Image as ImageIcon,
  Eye,
  Edit,
  Save,
  Loader2
} from 'lucide-react'

interface LightweightEditorProps {
  content: string
  onChange: (content: string) => void
  onSave?: (content: string) => Promise<void>
  placeholder?: string
  autoSave?: boolean
  className?: string
}

// 轻量级Markdown转HTML函数
const markdownToHtml = (text: string): string => {
  if (!text) return ''
  
  let html = text
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
    // Bold & Italic
    .replace(/\*\*\*(.*)\*\*\*/gim, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    // Lists
    .replace(/^\* (.+)$/gim, '<li class="ml-4">$1</li>')
    .replace(/^\d+\. (.+)$/gim, '<li class="ml-4 list-decimal">$1</li>')
    // Blockquotes
    .replace(/^> (.+)$/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 italic">$1</blockquote>')
    // Links and Images
    .replace(/!\[([^\]]*)\]\(([^\)]*)\)/gim, '<img src="$2" alt="$1" class="rounded-lg max-w-full h-auto my-4" loading="lazy" />')
    .replace(/\[([^\]]*)\]\(([^\)]*)\)/gim, '<a href="$2" class="text-primary underline hover:text-primary/80" target="_blank" rel="noopener">$1</a>')
    // Line breaks
    .replace(/\n\n/gim, '</p><p class="mb-4">')
    .replace(/\n/gim, '<br />')
  
  // Wrap in paragraph tags
  html = `<p class="mb-4">${html}</p>`
  
  // Clean up list items
  html = html.replace(/(<li[^>]*>.*<\/li>)/gim, (match) => {
    return `<ul class="list-disc ml-4 mb-4">${match}</ul>`
  })
  
  return html
}

export const LightweightEditor = memo(function LightweightEditor({
  content,
  onChange,
  onSave,
  placeholder = '开始写下今天的故事...',
  autoSave = false,
  className
}: LightweightEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const [isSaving, setIsSaving] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout>()

  // 插入文本到光标位置
  const insertAtCursor = useCallback((before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end)
    
    onChange(newText)
    
    // 恢复光标位置
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + before.length + selectedText.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }, [content, onChange])

  // 工具栏按钮
  const toolbarButtons = useMemo(() => [
    { icon: Heading1, label: '标题1', action: () => insertAtCursor('# ', '\n') },
    { icon: Heading2, label: '标题2', action: () => insertAtCursor('## ', '\n') },
    { icon: Bold, label: '粗体', action: () => insertAtCursor('**', '**') },
    { icon: Italic, label: '斜体', action: () => insertAtCursor('*', '*') },
    { icon: Quote, label: '引用', action: () => insertAtCursor('> ', '\n') },
    { icon: List, label: '无序列表', action: () => insertAtCursor('* ', '\n') },
    { icon: ListOrdered, label: '有序列表', action: () => insertAtCursor('1. ', '\n') },
    { 
      icon: Link, 
      label: '链接', 
      action: () => {
        const url = prompt('请输入链接地址:')
        if (url) insertAtCursor('[', `](${url})`)
      }
    },
    { 
      icon: ImageIcon, 
      label: '图片', 
      action: () => {
        const url = prompt('请输入图片地址:')
        if (url) insertAtCursor(`![图片](${url})`, '\n')
      }
    }
  ], [insertAtCursor])

  // 自动保存
  const handleContentChange = useCallback((value: string) => {
    onChange(value)
    
    if (autoSave && onSave) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          setIsSaving(true)
          await onSave(value)
        } catch (error) {
          console.error('Auto-save failed:', error)
        } finally {
          setIsSaving(false)
        }
      }, 30000) // 30秒自动保存
    }
  }, [onChange, onSave, autoSave])

  // 手动保存
  const handleManualSave = useCallback(async () => {
    if (!onSave) return
    
    try {
      setIsSaving(true)
      await onSave(content)
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }, [content, onSave])

  // 预览HTML
  const previewHtml = useMemo(() => markdownToHtml(content), [content])

  return (
    <div className={cn('space-y-4', className)}>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'edit' | 'preview')}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="edit" className="flex items-center space-x-2">
              <Edit className="h-4 w-4" />
              <span>编辑</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>预览</span>
            </TabsTrigger>
          </TabsList>
          
          {onSave && (
            <Button
              onClick={handleManualSave}
              disabled={isSaving}
              size="sm"
              variant="outline"
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              保存
            </Button>
          )}
        </div>

        <TabsContent value="edit" className="mt-0">
          <div className="space-y-2">
            {/* 简化的工具栏 */}
            <div className="flex flex-wrap gap-1 p-2 border rounded-lg bg-muted/50">
              {toolbarButtons.map((btn, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={btn.action}
                  title={btn.label}
                  className="h-8 w-8 p-0"
                >
                  <btn.icon className="h-4 w-4" />
                </Button>
              ))}
            </div>

            {/* 文本编辑器 */}
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder={placeholder}
              className="min-h-[400px] font-mono text-sm resize-none"
              style={{ lineHeight: '1.6' }}
            />

            {/* Markdown 提示 */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>💡 Markdown 语法提示：</p>
              <p className="font-mono">
                # 标题 | **粗体** | *斜体* | [链接](url) | ![图片](url) | {'>'}  引用 | * 列表
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="mt-0">
          <div className="border rounded-lg p-6 min-h-[400px] bg-background">
            {content ? (
              <div 
                className="prose prose-sm sm:prose max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
                <Edit className="h-12 w-12 mb-4 opacity-50" />
                <p>开始编写内容以查看预览</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
})

// 导出一个懒加载版本
export default LightweightEditor