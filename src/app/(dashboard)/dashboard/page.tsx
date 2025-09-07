'use client'

import { useAuthStore } from '@/stores/authStore'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, BookOpen, Camera, Heart, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const { user, profile } = useAuthStore()

  const stats = [
    {
      title: '本月打卡',
      value: '15',
      description: '连续打卡 3 天',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: '日记数量',
      value: '42',
      description: '本月新增 8 篇',
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: '照片数量',
      value: '128',
      description: '本月新增 23 张',
      icon: Camera,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: '心情指数',
      value: '85%',
      description: '比上月提升 12%',
      icon: Heart,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
  ]

  // 中间件已经处理了认证保护，不需要再使用AuthGuard包装
  return (
    <DashboardLayout>
        <div className="space-y-6">
          {/* 欢迎区域 */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                欢迎回来，{profile?.username || user?.email?.split('@')[0]}！
              </h1>
              <p className="text-muted-foreground">
                今天是记录美好时光的好日子
              </p>
            </div>
            <div className="flex space-x-2">
              <Button>
                <Calendar className="mr-2 h-4 w-4" />
                今日打卡
              </Button>
              <Button variant="outline">
                <BookOpen className="mr-2 h-4 w-4" />
                写日记
              </Button>
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`h-8 w-8 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 快速操作 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  今日打卡
                </CardTitle>
                <CardDescription>
                  记录今天的心情和状态
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">立即打卡</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  写日记
                </CardTitle>
                <CardDescription>
                  记录今天发生的有趣事情
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">开始写作</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="mr-2 h-5 w-5" />
                  上传照片
                </CardTitle>
                <CardDescription>
                  分享今天拍摄的美好瞬间
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">选择照片</Button>
              </CardContent>
            </Card>
          </div>

          {/* 最近活动 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                最近活动
              </CardTitle>
              <CardDescription>
                您最近的记录和动态
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">完成了今日打卡</p>
                    <p className="text-xs text-muted-foreground">2小时前</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">发布了新日记《美好的一天》</p>
                    <p className="text-xs text-muted-foreground">昨天</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">上传了 5 张新照片</p>
                    <p className="text-xs text-muted-foreground">2天前</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
    </DashboardLayout>
  )
}
