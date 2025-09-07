'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuthStore } from '@/stores/authStore'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { AvatarUpload } from '@/components/common/AvatarUpload'
import { Loader2, User, Mail, Calendar } from 'lucide-react'

const profileSchema = z.object({
  username: z.string().min(2, '用户名至少需要2个字符').max(50, '用户名不能超过50个字符'),
  bio: z.string().max(200, '个人简介不能超过200个字符').optional(),
})

type ProfileForm = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const { user, profile, updateProfile, loading } = useAuthStore()
  const { toast } = useToast()

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: profile?.username || '',
      bio: profile?.bio || '',
    },
  })

  const handleAvatarUpdate = (avatarUrl: string) => {
    // 头像更新后的回调，可以在这里做一些额外的处理
    console.log('头像已更新:', avatarUrl)
  }

  const onSubmit = async (data: ProfileForm) => {
    try {
      const { error } = await updateProfile({
        username: data.username,
        bio: data.bio || null,
      })

      if (error) {
        toast({
          title: '更新失败',
          description: error.message || '更新个人资料时出现错误',
          variant: 'destructive',
        })
      } else {
        toast({
          title: '更新成功',
          description: '您的个人资料已更新',
        })
        setIsEditing(false)
      }
    } catch {
      toast({
        title: '更新失败',
        description: '更新个人资料时出现错误',
        variant: 'destructive',
      })
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    form.reset({
      username: profile?.username || '',
      bio: profile?.bio || '',
    })
  }

  return (
    <AuthGuard requireAuth={true}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">个人资料</h1>
            <p className="text-muted-foreground">
              管理您的个人信息和偏好设置
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* 头像和基本信息 */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>头像</CardTitle>
                <CardDescription>
                  点击头像可以更换新的头像图片
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <AvatarUpload
                    currentAvatarUrl={profile?.avatar_url}
                    username={profile?.username}
                    onAvatarUpdate={handleAvatarUpdate}
                    size="lg"
                    editable={isEditing}
                  />
                  <div className="text-center">
                    <p className="font-medium">{profile?.username || '用户'}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 个人信息表单 */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>个人信息</CardTitle>
                <CardDescription>
                  更新您的个人信息，这些信息将在应用中显示
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>用户名</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="请输入用户名"
                                disabled={!isEditing}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="space-y-2">
                        <label className="text-sm font-medium">邮箱</label>
                        <Input
                          value={user?.email || ''}
                          disabled
                          className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">
                          邮箱地址无法修改
                        </p>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>个人简介</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="介绍一下自己吧..."
                              disabled={!isEditing}
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      {isEditing ? (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={loading}
                          >
                            取消
                          </Button>
                          <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            保存更改
                          </Button>
                        </>
                      ) : (
                        <Button
                          type="button"
                          onClick={() => setIsEditing(true)}
                        >
                          编辑资料
                        </Button>
                      )}
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* 账户信息 */}
          <Card>
            <CardHeader>
              <CardTitle>账户信息</CardTitle>
              <CardDescription>
                您的账户详细信息和统计数据
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">用户ID</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.id?.slice(0, 8)}...
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">邮箱验证</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email_confirmed_at ? '已验证' : '未验证'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">注册时间</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN') : '未知'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">最后登录</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('zh-CN') : '未知'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
