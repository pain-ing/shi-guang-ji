'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuthStore } from '@/stores/authStore'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { CheckInCalendar } from '@/components/check-in/CheckInCalendar'
import { MoodSelector } from '@/components/check-in/MoodSelector'
import { CheckInStats } from '@/components/check-in/CheckInStats'
import { useCheckInStore } from '@/stores/checkInStore'
import { MOOD_OPTIONS, type MoodType } from '@/types/database'
import { Loader2, Calendar, Heart, Sparkles } from 'lucide-react'

const checkInSchema = z.object({
  mood: z.string().min(1, '请选择今天的心情'),
  note: z.string().max(200, '小记不能超过200个字符').optional(),
})

type CheckInForm = z.infer<typeof checkInSchema>

export default function CheckInPage() {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null)
  const { user } = useAuthStore()
  const { 
    todayCheckIn, 
    checkIns, 
    loading, 
    createCheckIn, 
    getTodayCheckIn, 
    getCheckIns 
  } = useCheckInStore()
  const { toast } = useToast()

  const form = useForm<CheckInForm>({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      mood: '',
      note: '',
    },
  })

  useEffect(() => {
    if (user) {
      getTodayCheckIn()
      getCheckIns()
    }
  }, [user, getTodayCheckIn, getCheckIns])

  useEffect(() => {
    if (todayCheckIn) {
      setSelectedMood(todayCheckIn.mood as MoodType)
      form.setValue('mood', todayCheckIn.mood)
      form.setValue('note', todayCheckIn.note || '')
    }
  }, [todayCheckIn, form])

  const onSubmit = async (data: CheckInForm) => {
    if (!user) return

    const { error } = await createCheckIn({
      user_id: user.id,
      mood: data.mood,
      note: data.note || null,
    })

    if (error) {
      toast({
        title: '打卡失败',
        description: error.message || '打卡时出现错误，请稍后重试',
        variant: 'destructive',
      })
    } else {
      toast({
        title: '打卡成功！',
        description: '今天的心情已记录，继续保持美好的一天！',
      })
      // 重新获取今日打卡和统计数据
      getTodayCheckIn()
      getCheckIns()
    }
  }

  const handleMoodSelect = (mood: MoodType) => {
    setSelectedMood(mood)
    form.setValue('mood', mood)
  }

  const getMoodEmoji = (mood: string) => {
    const moodOption = MOOD_OPTIONS.find(option => option.value === mood)
    return moodOption?.emoji || '😊'
  }

  const getMoodLabel = (mood: string) => {
    const moodOption = MOOD_OPTIONS.find(option => option.value === mood)
    return moodOption?.label || mood
  }

  const isToday = new Date().toDateString() === new Date(todayCheckIn?.created_at || '').toDateString()
  const hasCheckedInToday = todayCheckIn && isToday

  return (
    <AuthGuard requireAuth={true}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">每日打卡</h1>
            <p className="text-muted-foreground">
              记录今天的心情，让每一天都有意义
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* 打卡表单 */}
            <div className="lg:col-span-2 space-y-6">
              {hasCheckedInToday ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Sparkles className="mr-2 h-5 w-5 text-yellow-500" />
                      今日已打卡
                    </CardTitle>
                    <CardDescription>
                      您今天已经完成打卡了，明天再来记录新的心情吧！
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
                      <div className="text-3xl">
                        {getMoodEmoji(todayCheckIn.mood)}
                      </div>
                      <div>
                        <p className="font-medium">
                          今天的心情：{getMoodLabel(todayCheckIn.mood)}
                        </p>
                        {todayCheckIn.note && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {todayCheckIn.note}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          打卡时间：{new Date(todayCheckIn.created_at).toLocaleString('zh-CN')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Heart className="mr-2 h-5 w-5 text-red-500" />
                      今日打卡
                    </CardTitle>
                    <CardDescription>
                      选择今天的心情，记录这一刻的感受
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="mood"
                          render={() => (
                            <FormItem>
                              <FormLabel>今天的心情</FormLabel>
                              <FormControl>
                                <MoodSelector
                                  selectedMood={selectedMood}
                                  onMoodSelect={handleMoodSelect}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="note"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>一句话小记 (可选)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="记录今天发生的有趣事情..."
                                  rows={3}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={loading || !selectedMood}
                        >
                          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          完成打卡
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}

              {/* 打卡日历 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    打卡日历
                  </CardTitle>
                  <CardDescription>
                    查看您的打卡历史记录
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CheckInCalendar checkIns={checkIns} />
                </CardContent>
              </Card>
            </div>

            {/* 统计信息 */}
            <div className="space-y-6">
              <CheckInStats checkIns={checkIns} />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
