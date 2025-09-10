'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import { useDiaryStore } from '@/stores/diaryStore'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
// AuthGuard已通过中间件处理，不需要重复导入
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import dynamic from 'next/dynamic'

// 动态导入Markdown编辑器，减少首屏加载
const MarkdownEditor = dynamic(
  () => import('@/components/diary/MarkdownEditor').then(mod => mod.MarkdownEditor),
  { 
    loading: () => <div className="h-96 bg-muted animate-pulse rounded" />,
    ssr: false 
  }
)
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'

const diarySchema = z.object({
  title: z.string().min(1, '请输入日记标题').max(100, '标题不能超过100个字符'),
  content: z.string().min(1, '请输入日记内容'),
})

type DiaryForm = z.infer<typeof diarySchema>

export default function EditDiaryPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const { 
    currentDiary, 
    loading, 
    error, 
    getDiary, 
    updateDiary,
    setError 
  } = useDiaryStore()
  const { toast } = useToast()
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const diaryId = parseInt(params.id as string)

  const form = useForm<DiaryForm>({
    resolver: zodResolver(diarySchema),
    defaultValues: {
      title: '',
      content: '',
    },
  })

  // 加载日记数据
  useEffect(() => {
    if (user && diaryId) {
      getDiary(diaryId)
    }
  }, [user, diaryId, getDiary])

  // 填充表单数据
  useEffect(() => {
    if (currentDiary) {
      form.setValue('title', currentDiary.title)
      form.setValue('content', currentDiary.content)
      setContent(currentDiary.content)
    }
  }, [currentDiary, form])

  // 错误处理
  useEffect(() => {
    if (error) {
      toast({
        title: '加载失败',
        description: error,
        variant: 'destructive',
      })
      setError(null)
    }
  }, [error, toast, setError])

  // 自动保存草稿
  const handleAutoSave = async (content: string) => {
    if (!user || !currentDiary) return

    try {
      // 保存到本地存储作为草稿
      localStorage.setItem(`diary_edit_draft_${currentDiary.id}`, JSON.stringify({
        title: form.getValues('title'),
        content,
        updatedAt: new Date().toISOString(),
      }))
    } catch (error) {
      console.error('自动保存草稿失败:', error)
    }
  }

  const onSubmit = async (data: DiaryForm) => {
    if (!currentDiary) return

    try {
      setIsSaving(true)

      const { error } = await updateDiary(currentDiary.id, {
        title: data.title,
        content: data.content,
      })

      if (error) {
        toast({
          title: '保存失败',
          description: error.message || '保存日记时出现错误',
          variant: 'destructive',
        })
      } else {
        // 清除草稿
        localStorage.removeItem(`diary_edit_draft_${currentDiary.id}`)

        toast({
          title: '保存成功',
          description: '您的日记已成功更新',
        })

        router.push(`/diary/${currentDiary.id}`)
      }
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

  if (loading) {
    return (
      <DashboardLayout>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Button variant="outline" asChild>
                <Link href="/diary">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  返回日记列表
                </Link>
              </Button>
            </div>
            <Card>
              <CardHeader>
                <div className="animate-pulse space-y-2">
                  <div className="h-6 bg-muted rounded w-1/3" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="animate-pulse space-y-4">
                  <div className="h-10 bg-muted rounded" />
                  <div className="h-40 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          </div>
      </DashboardLayout>
    )
  }

  if (!currentDiary) {
    return (
      <DashboardLayout>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Button variant="outline" asChild>
                <Link href="/diary">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  返回日记列表
                </Link>
              </Button>
            </div>
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <h3 className="text-lg font-semibold mb-2">日记不存在</h3>
                <p className="text-muted-foreground text-center mb-4">
                  您要编辑的日记可能已被删除或不存在
                </p>
                <Button asChild>
                  <Link href="/diary">返回日记列表</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">编辑日记</h1>
              <p className="text-muted-foreground">
                修改您的日记内容
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" asChild>
                <Link href={`/diary/${currentDiary.id}`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  取消编辑
                </Link>
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>编辑日记</CardTitle>
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
                            placeholder="给日记起个标题..."
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
                            placeholder="编辑您的日记内容..."
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
                      onClick={() => router.push(`/diary/${currentDiary.id}`)}
                    >
                      取消
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Save className="mr-2 h-4 w-4" />
                      保存更改
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
    </DashboardLayout>
  )
}
