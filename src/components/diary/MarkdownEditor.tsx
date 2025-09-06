'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { DiaryEditor } from './DiaryEditor'
import { useAutoSave } from '@/hooks/useAutoSave'
import { Eye, Edit, Save, Loader2 } from 'lucide-react'

interface MarkdownEditorProps {
  content: string
  onChange: (content: string) => void
  onSave?: (content: string) => Promise<void>
  placeholder?: string
  autoSave?: boolean
  className?: string
}

export function MarkdownEditor({
  content,
  onChange,
  onSave,
  placeholder = '开始写下今天的故事...',
  autoSave = true,
  className,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const [isSaving, setIsSaving] = useState(false)

  // 自动保存功能
  const { manualSave } = useAutoSave({
    data: content,
    onSave: async (data) => {
      if (onSave) {
        await onSave(data)
      }
    },
    delay: 30000, // 30秒自动保存
    enabled: autoSave && !!onSave,
  })

  // 手动保存
  const handleManualSave = async () => {
    if (!onSave) return

    try {
      setIsSaving(true)
      await onSave(content)
    } catch (error) {
      console.error('保存失败:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // 将 Markdown 转换为 HTML（简单实现）
  const markdownToHtml = (markdown: string) => {
    return markdown
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/!\[([^\]]*)\]\(([^\)]*)\)/gim, '<img alt="$1" src="$2" class="rounded-lg max-w-full h-auto" />')
      .replace(/\[([^\]]*)\]\(([^\)]*)\)/gim, '<a href="$2" class="text-primary underline">$1</a>')
      .replace(/\n/gim, '<br>')
  }

  return (
    <div className={className}>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'edit' | 'preview')}>
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
          <div className="space-y-4">
            {/* 富文本编辑器 */}
            <DiaryEditor
              content={content}
              onChange={onChange}
              placeholder={placeholder}
              editable={true}
            />

            {/* Markdown 源码编辑器 */}
            <details className="border rounded-lg">
              <summary className="p-3 cursor-pointer text-sm font-medium bg-muted/50 rounded-t-lg">
                Markdown 源码编辑
              </summary>
              <div className="p-3">
                <Textarea
                  value={content}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="支持 Markdown 语法..."
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
            </details>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="mt-0">
          <div className="border rounded-lg p-6 min-h-[400px] bg-background">
            {content ? (
              <div
                className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto max-w-none"
                dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
              />
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <Edit className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>开始编写内容以查看预览</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* 编辑提示 */}
      {autoSave && onSave && (
        <div className="mt-4 text-xs text-muted-foreground">
          <p>💡 支持 Markdown 语法，内容会自动保存</p>
          <p>快捷键：**粗体**、*斜体*、# 标题、[链接](URL)、![图片](URL)</p>
        </div>
      )}
    </div>
  )
}
