'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import { useDiaryStore, diaryUtils } from '@/stores/diaryStore'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, BookOpen, Calendar, Edit, Search, ChevronLeft, ChevronRight } from 'lucide-react'

export default function DiaryPage() {
  const { user } = useAuthStore()
  const {
    diaries,
    loading,
    searchQuery,
    currentPage,
    totalCount,
    pageSize,
    getDiaries,
    searchDiaries,
    setSearchQuery,
    nextPage,
    prevPage
  } = useDiaryStore()
  const [localSearchQuery, setLocalSearchQuery] = useState('')

  useEffect(() => {
    if (user) {
      getDiaries()
    }
  }, [user, getDiaries])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(localSearchQuery)
    searchDiaries(localSearchQuery)
  }

  const clearSearch = () => {
    setLocalSearchQuery('')
    setSearchQuery('')
    getDiaries()
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  if (loading) {
    return (
      <AuthGuard requireAuth={true}>
        <DashboardLayout>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">我的日记</h1>
            </div>
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-1/3" />
                    <div className="h-4 bg-muted rounded w-1/4" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded" />
                      <div className="h-4 bg-muted rounded w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requireAuth={true}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">我的日记</h1>
              <p className="text-muted-foreground">
                记录生活中的美好时光
              </p>
            </div>
            <Button asChild>
              <Link href="/diary/new">
                <Plus className="mr-2 h-4 w-4" />
                写新日记
              </Link>
            </Button>
          </div>

          {/* 搜索栏 */}
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="flex space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索日记标题或内容..."
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
              {searchQuery && (
                <div className="mt-2 text-sm text-muted-foreground">
                  搜索"{searchQuery}"，找到 {totalCount} 条结果
                </div>
              )}
            </CardContent>
          </Card>

          {diaries.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">还没有日记</h3>
                <p className="text-muted-foreground text-center mb-4">
                  开始记录您的第一篇日记，留下美好的回忆
                </p>
                <Button asChild>
                  <Link href="/diary/new">
                    <Plus className="mr-2 h-4 w-4" />
                    写第一篇日记
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4">
                {diaries.map((diary) => (
                  <Card key={diary.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="line-clamp-1">
                            <Link
                              href={`/diary/${diary.id}`}
                              className="hover:text-primary transition-colors"
                            >
                              {diary.title}
                            </Link>
                          </CardTitle>
                          <CardDescription className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>{diaryUtils.formatDate(diary.created_at)}</span>
                          </CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/diary/${diary.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-3">
                        {diaryUtils.getExcerpt(diary.content)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    第 {currentPage} 页，共 {totalPages} 页，总计 {totalCount} 条记录
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
            </>
          )}

          {/* 统计信息 */}
          {diaries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">写作统计</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{diaries.length}</div>
                    <div className="text-sm text-muted-foreground">总日记数</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {diaries.filter(d => 
                        new Date(d.created_at).getMonth() === new Date().getMonth()
                      ).length}
                    </div>
                    <div className="text-sm text-muted-foreground">本月日记</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(diaries.reduce((acc, d) => acc + d.content.length, 0) / diaries.length)}
                    </div>
                    <div className="text-sm text-muted-foreground">平均字数</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {diaries.length > 0 ? Math.ceil((Date.now() - new Date(diaries[diaries.length - 1].created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0}
                    </div>
                    <div className="text-sm text-muted-foreground">写作天数</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
