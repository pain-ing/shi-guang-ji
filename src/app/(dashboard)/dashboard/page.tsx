'use client'

import { useAuthStore } from '@/stores/authStore'
import { useCheckInStore, checkInUtils } from '@/stores/checkInStore'
import { useDiaryStore } from '@/stores/diaryStore'
import { useMediaStore } from '@/stores/mediaStore'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, BookOpen, Camera, Heart, TrendingUp } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { user, profile, initialized } = useAuthStore()
  const { checkIns, getCheckIns } = useCheckInStore()
  const { diaries, getDiaries } = useDiaryStore()
  const { mediaFiles, getMediaFiles } = useMediaStore()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 页面跳转处理函数
  const handleGoToCheckIn = () => {
    router.push('/check-in')
  }

  const handleGoToDiary = () => {
    router.push('/diary/new')
  }

  const handleGoToMedia = () => {
    router.push('/media')
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      // 直接跳转到媒体页面，用户可以在那里上传文件
      router.push('/media')
    }
  }

  // 计算统计数据
  const stats = useMemo(() => {
    // 本月打卡天数
    const monthlyCheckIns = checkInUtils.getMonthlyCheckIns(checkIns)
    // 连续打卡天数
    const streakDays = checkInUtils.getStreakDays(checkIns)
    
    // 日记总数
    const totalDiaries = diaries.length
    // 本月新增日记数量
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() + 1
    const monthlyDiaries = diaries.filter(diary => {
      const diaryDate = new Date(diary.created_at)
      return diaryDate.getFullYear() === currentYear && 
             diaryDate.getMonth() + 1 === currentMonth
    }).length
    
    // 照片总数
    const totalPhotos = mediaFiles.filter(file => file.file_type === 'image').length
    // 本月新增照片数量
    const monthlyPhotos = mediaFiles.filter(file => {
      const fileDate = new Date(file.created_at)
      return file.file_type === 'image' &&
             fileDate.getFullYear() === currentYear && 
             fileDate.getMonth() + 1 === currentMonth
    }).length
    
    // 计算心情指数 (基于最近打卡的积极情绪比例)
    const recentCheckIns = checkIns.slice(0, 30) // 最近30次打卡
    const positiveModesCount = recentCheckIns.filter(checkIn => 
      ['happy', 'excited', 'calm', 'grateful'].includes(checkIn.mood)
    ).length
    const moodIndex = recentCheckIns.length > 0 
      ? Math.round((positiveModesCount / recentCheckIns.length) * 100)
      : 0
    
    return [
      {
        title: '本月打卡',
        value: monthlyCheckIns.toString(),
        description: streakDays > 0 ? `连续打卡 ${streakDays} 天` : '开始您的打卡之旅',
        icon: Calendar,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
      },
      {
        title: '日记数量',
        value: totalDiaries.toString(),
        description: monthlyDiaries > 0 ? `本月新增 ${monthlyDiaries} 篇` : '还没有日记',
        icon: BookOpen,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
      },
      {
        title: '照片数量',
        value: totalPhotos.toString(),
        description: monthlyPhotos > 0 ? `本月新增 ${monthlyPhotos} 张` : '还没有照片',
        icon: Camera,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
      },
      {
        title: '心情指数',
        value: `${moodIndex}%`,
        description: moodIndex > 0 ? '基于最近的心情记录' : '暂无心情数据',
        icon: Heart,
        color: 'text-pink-600',
        bgColor: 'bg-pink-50',
      },
    ]
  }, [checkIns, diaries, mediaFiles])

  // 加载数据
  useEffect(() => {
    if (user) {
      // 加载打卡数据
      getCheckIns()
      // 加载日记数据 (第1页)
      getDiaries(1)
      // 加载媒体文件数据 (第1页)
      getMediaFiles(1)
    }
  }, [user, getCheckIns, getDiaries, getMediaFiles])

  // 等待认证初始化
  useEffect(() => {
    if (initialized && !user) {
      console.log('Dashboard: 用户未登录，重定向到登录页')
      router.push('/login?redirectTo=/dashboard')
    }
  }, [initialized, user, router])

  // 如果认证还未初始化或用户数据未加载，显示加载状态
  if (!initialized || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  // 中间件已经处理了认证保护，不需要再使用AuthGuard包装
  return (
    <DashboardLayout>
      <div className="relative min-h-screen">
        {/* 背景装饰 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gradient-primary opacity-5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-gradient-secondary opacity-5 blur-3xl" />
        </div>
        
        <div className="relative space-y-8">
          {/* 欢迎区域 */}
          <div className="flex items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-purple/10 to-cyan/10 border border-gradient glassmorphism">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                欢迎回来，{profile?.username || user?.email?.split('@')[0]}！
              </h1>
              <p className="text-lg text-muted-foreground flex items-center">
                今天是记录美好时光的好日子 ✨
              </p>
            </div>
            <div className="flex space-x-3">
              <Button 
                onClick={handleGoToCheckIn}
                className="bg-gradient-primary hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 text-white px-6 py-3 rounded-xl font-medium"
              >
                <Calendar className="mr-2 h-5 w-5" />
                今日打卡
              </Button>
              <Button 
                variant="outline" 
                onClick={handleGoToDiary}
                className="border-gradient hover:bg-gradient-secondary hover:text-white transition-all duration-300 px-6 py-3 rounded-xl font-medium"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                写日记
              </Button>
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const gradients = [
                'bg-gradient-to-br from-blue-500 to-cyan-500',
                'bg-gradient-to-br from-green-500 to-emerald-500', 
                'bg-gradient-to-br from-purple-500 to-pink-500',
                'bg-gradient-to-br from-orange-500 to-red-500'
              ];
              return (
                <Card key={stat.title} className="glassmorphism card-gradient-shadow hover-lift border-0 overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <div className={`h-12 w-12 rounded-xl ${gradients[index]} flex items-center justify-center shadow-lg`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* 快速操作 */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="glassmorphism card-gradient-shadow hover-lift border-0 group">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 mr-3">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  今日打卡
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  记录今天的心情和状态 😊
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-lg hover:shadow-blue/25 transition-all duration-300 text-white font-medium py-3 rounded-xl" 
                  onClick={handleGoToCheckIn}
                >
                  立即打卡
                </Button>
              </CardContent>
            </Card>

            <Card className="glassmorphism card-gradient-shadow hover-lift border-0 group">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 mr-3">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  写日记
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  记录今天发生的有趣事情 ✍️
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full border-gradient hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-500 hover:text-white hover:border-transparent transition-all duration-300 font-medium py-3 rounded-xl" 
                  onClick={handleGoToDiary}
                >
                  开始写作
                </Button>
              </CardContent>
            </Card>

            <Card className="glassmorphism card-gradient-shadow hover-lift border-0 group md:col-span-2 lg:col-span-1">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 mr-3">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                  上传照片
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  分享今天拍摄的美好瞬间 📸
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full border-gradient hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white hover:border-transparent transition-all duration-300 font-medium py-3 rounded-xl" 
                  onClick={handleGoToMedia}
                >
                  选择照片
                </Button>
                {/* 隐藏的文件输入框 */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </CardContent>
            </Card>
          </div>

          {/* 最近活动 */}
          <Card className="glassmorphism card-gradient-shadow border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl">
                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 mr-3">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                  最近活动
                </span>
              </CardTitle>
              <CardDescription className="text-muted-foreground ml-11">
                您最近的记录和动态 📈
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* 显示最近的活动 */}
                {(() => {
                  interface Activity {
                    type: string
                    date: Date
                    description: string
                    color: string
                  }
                  
                  const activities: Activity[] = []
                  
                  // 添加最近的打卡记录
                  const recentCheckIns = checkIns.slice(0, 3)
                  recentCheckIns.forEach(checkIn => {
                    activities.push({
                      type: 'checkin',
                      date: new Date(checkIn.created_at),
                      description: `完成了每日打卡`,
                      color: 'bg-blue-500'
                    })
                  })
                  
                  // 添加最近的日记
                  const recentDiaries = diaries.slice(0, 3)
                  recentDiaries.forEach(diary => {
                    activities.push({
                      type: 'diary',
                      date: new Date(diary.created_at),
                      description: `发布了新日记《${diary.title || '无标题'}》`,
                      color: 'bg-green-500'
                    })
                  })
                  
                  // 添加最近的照片
                  const recentPhotos = mediaFiles
                    .filter(file => file.file_type === 'image')
                    .slice(0, 3)
                  recentPhotos.forEach(photo => {
                    activities.push({
                      type: 'photo',
                      date: new Date(photo.created_at),
                      description: `上传了新照片`,
                      color: 'bg-purple-500'
                    })
                  })
                  
                  // 按日期排序并取前5条
                  activities.sort((a, b) => b.date.getTime() - a.date.getTime())
                  const topActivities = activities.slice(0, 5)
                  
                  // 格式化相对时间
                  const getRelativeTime = (date: Date) => {
                    const now = new Date()
                    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
                    
                    if (diffInSeconds < 60) return '刚才'
                    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分钟前`
                    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}小时前`
                    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}天前`
                    return date.toLocaleDateString('zh-CN')
                  }
                  
                  if (topActivities.length === 0) {
                    return (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <span className="text-2xl">🌱</span>
                        </div>
                        <p className="text-muted-foreground font-medium">还没有活动记录</p>
                        <p className="text-sm text-muted-foreground mt-2">开始您的第一次打卡或写日记吧！</p>
                      </div>
                    )
                  }
                  
                  return (
                    <div className="space-y-4">
                      {topActivities.map((activity, index) => (
                        <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-primary/5 transition-colors duration-200">
                          <div className={`h-3 w-3 rounded-full ${activity.color} shadow-sm`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{activity.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">{getRelativeTime(activity.date)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
