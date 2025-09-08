'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
// 移除AuthGuard，避免重定向循环
import { Eye, EyeOff, Loader2 } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
})

type LoginForm = z.infer<typeof loginSchema>

function LoginInner() {
  const [showPassword, setShowPassword] = useState(false)
  const { signIn, loading, user, initialized } = useAuthStore()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'

  // 如果用户已登录，直接重定向
  useEffect(() => {
    if (initialized && user) {
      console.log('用户已登录，重定向到:', redirectTo)
      router.replace(redirectTo)
    }
  }, [initialized, user, redirectTo, router])

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginForm) => {
    const { error } = await signIn(data.email, data.password)

    if (error) {
      console.error('登录错误详情:', error)
      toast({
        title: '登录失败',
        description: error.message || '请检查您的邮箱和密码',
        variant: 'destructive',
      })
    } else {
      toast({
        title: '登录成功',
        description: '欢迎回到拾光集！',
      })
      // 登录成功后重定向
      console.log('登录成功，重定向到:', redirectTo)
      router.replace(redirectTo)
    }
  }

  // 如果还在初始化，不阻塞页面渲染
  // 让用户可以看到登录表单

  // 如果用户已登录且初始化完成，显示重定向提示
  if (initialized && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">正在跳转...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-purple-50 to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* 背景装饰元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-primary opacity-10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-secondary opacity-10 blur-3xl animate-pulse" />
      </div>
      
        <Card className="w-full max-w-md glassmorphism card-gradient-shadow hover-lift border-0">
          <CardHeader className="space-y-1 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="h-12 w-12 rounded-full bg-gradient-primary animate-gradient" />
                <div className="absolute inset-0 h-12 w-12 rounded-full bg-gradient-primary opacity-75 animate-ping" />
              </div>
              <span className="ml-3 text-2xl font-bold text-gradient-primary">拾光集</span>
            </div>
            <CardTitle className="text-3xl text-center bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              欢迎回来
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              登录您的账户，继续记录美好时光 ✨
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>邮箱</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="请输入您的邮箱"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>密码</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="请输入您的密码"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center justify-between">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    忘记密码？
                  </Link>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 text-white font-medium py-2.5" 
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? '登录中...' : '登录账户'}
                </Button>
              </form>
            </Form>
            <div className="mt-8 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gradient" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-card text-muted-foreground font-medium">还没有账户？</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full border-gradient hover:bg-gradient-primary hover:text-white transition-all duration-300 font-medium py-2.5" 
                asChild
              >
                <Link href="/register">
                  <span className="flex items-center">
                    注册新账户
                    <span className="ml-2">→</span>
                  </span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center text-sm text-muted-foreground">加载中...</div>}>
      <LoginInner />
    </Suspense>
  )
}

