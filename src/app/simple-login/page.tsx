'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function SimpleLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { signIn, loading, user, initialized } = useAuthStore()
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // 如果用户已登录，直接重定向
  useEffect(() => {
    if (initialized && user) {
      console.log('SimpleLogin: 用户已登录，重定向到 dashboard')
      window.location.href = '/dashboard'
    }
  }, [initialized, user])

  const onSubmit = async (values: LoginForm) => {
    console.log('SimpleLogin: 开始登录', values.email)
    
    const { error } = await signIn(values.email, values.password)
    
    if (error) {
      console.error('SimpleLogin: 登录失败', error)
      toast({
        variant: 'destructive',
        title: '登录失败',
        description: error.message || '登录时发生错误，请重试',
      })
    } else {
      console.log('SimpleLogin: 登录成功，准备跳转')
      toast({
        title: '登录成功',
        description: '欢迎回到拾光集！',
      })
      // 使用 window.location.href 强制跳转，避免路由问题
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 1000)
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
          <p className="text-sm text-muted-foreground">正在跳转到控制台...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="h-8 w-8 rounded-full bg-primary" />
            <span className="ml-2 text-xl font-bold">拾光集</span>
          </div>
          <CardTitle className="text-2xl text-center">简化登录</CardTitle>
          <CardDescription className="text-center">
            测试版本 - 避免重定向问题
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
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                登录
              </Button>
            </form>
          </Form>
          
          <div className="mt-4 text-center text-sm text-muted-foreground">
            这是一个简化的登录页面，用于测试和避免重定向问题
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
