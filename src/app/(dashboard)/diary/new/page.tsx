'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuthStore } from '@/stores/authStore'
import { useDiaryStore } from '@/stores/diaryStore'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { MarkdownEditor } from '@/components/diary/MarkdownEditor'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'

const diarySchema = z.object({
  title: z.string().min(1, '请输入日记标题').max(100, '标题不能超过100个字符'),
  content: z.string().min(1, '请输入日记内容'),
})

type DiaryForm = z.infer<typeof diarySchema>

export default function NewDiaryPage() {
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const { user } = useAuthStore()
  const { createDiary } = useDiaryStore()
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<DiaryForm>({
    resolver: zodResolver(diarySchema),
    defaultValues: {
      title: '',
      content: '',
    },
  })

  // 自动保存草稿
  const handleAutoSave = async (content: string) => {
    if (!user || !content.trim()) return

    try {
      // 这里可以保存到草稿表或本地存储
      localStorage.setItem(`diary_draft_${user.id}`, JSON.stringify({
        title: form.getValues('title'),
        content,
        updatedAt: new Date().toISOString(),
      }))
    } catch (error) {
      console.error('自动保存草稿失败:', error)
    }
  }

  const onSubmit = async (data: DiaryForm) => {
    if (!user) return

    try {
      setIsSaving(true)

      const { data: diary, error } = await createDiary({
        user_id: user.id,
        title: data.title,
        content: data.content,
      })

      if (error) {
        toast({
          title: '保存失败',
          description: error.message || '保存日记时出现错误',
          variant: 'destructive',
        })
        return
      }

      // 清除草稿
      localStorage.removeItem(`diary_draft_${user.id}`)

      toast({
        title: '日记保存成功',
        description: '您的日记已成功保存',
      })

      router.push(`/diary/${diary!.id}`)
    } catch (error) {
      toast({
        title: '保存失败',
        description: error instanceof Error ? error.message : '保存日记时出现错误',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  // 处理内容变化
  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    form.setValue('content', newContent)
  }

  return (
    <AuthGuard requireAuth={true}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">写新日记</h1>
              <p className="text-muted-foreground">
                记录今天发生的有趣事情
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/diary">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回日记列表
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>新日记</CardTitle>
              <CardDescription>
                支持 Markdown 语法，内容会自动保存草稿
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>标题</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="给今天的日记起个标题..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={() => (
                      <FormItem>
                        <FormLabel>内容</FormLabel>
                        <FormControl>
                          <MarkdownEditor
                            content={content}
                            onChange={handleContentChange}
                            onSave={handleAutoSave}
                            placeholder="开始写下今天的故事..."
                            autoSave={true}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                    >
                      取消
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Save className="mr-2 h-4 w-4" />
                      发布日记
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
