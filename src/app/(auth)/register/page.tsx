'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
// AuthGuard已移除，直接在组件内处理重定向
import { Eye, EyeOff, Loader2 } from 'lucide-react'

const registerSchema = z.object({
  username: z.string().min(2, '用户名至少需要2个字符').max(50, '用户名不能超过50个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string()
    .min(10, '密码至少需要10个字符')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/,
      '密码必须包含大小写字母、数字和特殊字符'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { signUp, loading, user, initialized } = useAuthStore()
  const { toast } = useToast()
  const router = useRouter()

  // 如果用户已登录，直接重定向
  useEffect(() => {
    if (initialized && user) {
      router.replace('/dashboard')
    }
  }, [initialized, user, router])

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: RegisterForm) => {
    const { error } = await signUp(data.email, data.password, data.username)
    
    if (error) {
      toast({
        title: '注册失败',
        description: error.message || '注册过程中出现错误，请稍后重试',
        variant: 'destructive',
      })
    } else {
      toast({
        title: '注册成功',
        description: '账户创建成功，现在可以直接登录了！',
      })
      router.push('/login')
    }
  }

  // 如果还在初始化，显示加载状态
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">初始化中...</p>
        </div>
      </div>
    )
  }

  // 如果用户已登录，显示重定向提示
  if (user) {
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-cyan-50 to-primary-50 py-12 px-4 sm:px-6 lg:px-8">
        {/* 背景装饰元素 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-gradient-accent opacity-10 blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-gradient-primary opacity-10 blur-3xl animate-pulse" />
        </div>
        
        <Card className="w-full max-w-md glassmorphism card-gradient-shadow hover-lift border-0">
          <CardHeader className="space-y-1 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="h-12 w-12 rounded-full bg-gradient-accent animate-gradient" />
                <div className="absolute inset-0 h-12 w-12 rounded-full bg-gradient-accent opacity-75 animate-ping" />
              </div>
              <span className="ml-3 text-2xl font-bold text-gradient-primary">拾光集</span>
            </div>
            <CardTitle className="text-3xl text-center bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
              创建账户
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              加入拾光集，开始记录美好时光 🌟
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>用户名</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="请输入用户名"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                            placeholder="请输入密码（至少10个字符，包含大小写字母、数字和特殊字符）"
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
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>确认密码</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="请再次输入密码"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
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
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-accent hover:shadow-lg hover:shadow-purple/25 transition-all duration-300 text-white font-medium py-2.5" 
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? '注册中...' : '创建账户'}
                </Button>
              </form>
            </Form>
            <div className="mt-8 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gradient" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-card text-muted-foreground font-medium">已有账户？</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full border-gradient hover:bg-gradient-accent hover:text-white transition-all duration-300 font-medium py-2.5" 
                asChild
              >
                <Link href="/login">
                  <span className="flex items-center">
                    立即登录
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
