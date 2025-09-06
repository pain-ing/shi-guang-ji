'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import { useDiaryStore, diaryUtils } from '@/stores/diaryStore'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useToast } from '@/hooks/use-toast'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar, 
  Clock, 
  FileText,
  Loader2 
} from 'lucide-react'

export default function DiaryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const { 
    currentDiary, 
    loading, 
    error, 
    getDiary, 
    deleteDiary,
    setError 
  } = useDiaryStore()
  const { toast } = useToast()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const diaryId = parseInt(params.id as string)

  useEffect(() => {
    if (user && diaryId) {
      getDiary(diaryId)
    }
  }, [user, diaryId, getDiary])

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

  const handleDelete = async () => {
    if (!currentDiary) return

    try {
      setDeleting(true)
      const { error } = await deleteDiary(currentDiary.id)

      if (error) {
        toast({
          title: '删除失败',
          description: error.message || '删除日记时出现错误',
          variant: 'destructive',
        })
      } else {
        toast({
          title: '删除成功',
          description: '日记已成功删除',
        })
        router.push('/diary')
      }
    } catch (error) {
      toast({
        title: '删除失败',
        description: '删除日记时出现错误',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  if (loading) {
    return (
      <AuthGuard requireAuth={true}>
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
                  <div className="h-8 bg-muted rounded w-2/3" />
                  <div className="h-4 bg-muted rounded w-1/3" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-5/6" />
                  <div className="h-4 bg-muted rounded w-4/6" />
                </div>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  if (!currentDiary) {
    return (
      <AuthGuard requireAuth={true}>
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
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">日记不存在</h3>
                <p className="text-muted-foreground text-center mb-4">
                  您要查看的日记可能已被删除或不存在
                </p>
                <Button asChild>
                  <Link href="/diary">返回日记列表</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requireAuth={true}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* 头部导航 */}
          <div className="flex items-center justify-between">
            <Button variant="outline" asChild>
              <Link href="/diary">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回日记列表
              </Link>
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" asChild>
                <Link href={`/diary/${currentDiary.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  编辑
                </Link>
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteDialog(true)}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                删除
              </Button>
            </div>
          </div>

          {/* 日记内容 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{currentDiary.title}</CardTitle>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{diaryUtils.formatDate(currentDiary.created_at)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>约 {diaryUtils.getReadingTime(currentDiary.content)} 分钟阅读</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FileText className="h-4 w-4" />
                  <span>{diaryUtils.getWordCount(currentDiary.content)} 字</span>
                </div>
              </div>
              {currentDiary.updated_at !== currentDiary.created_at && (
                <div className="text-xs text-muted-foreground">
                  最后更新：{new Date(currentDiary.updated_at).toLocaleString('zh-CN')}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div 
                className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none"
                dangerouslySetInnerHTML={{ __html: currentDiary.content }}
              />
            </CardContent>
          </Card>
        </div>

        {/* 删除确认对话框 */}
        <ConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="删除日记"
          description={`确定要删除日记"${currentDiary.title}"吗？此操作无法撤销。`}
          confirmText="删除"
          cancelText="取消"
          onConfirm={handleDelete}
          variant="destructive"
        />
      </DashboardLayout>
    </AuthGuard>
  )
}
