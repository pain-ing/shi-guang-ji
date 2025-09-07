'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function EmergencyLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // 使用项目中统一的supabase客户端

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      console.log('Emergency Login: 开始登录', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Emergency Login: 登录失败', error)
        setError(`登录失败: ${error.message}`)
      } else {
        console.log('Emergency Login: 登录成功', data)
        setMessage('登录成功！正在跳转...')
        
        // 等待一秒后强制跳转
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 1000)
      }
    } catch (err) {
      console.error('Emergency Login: 异常', err)
      setError('登录时发生异常，请重试')
    } finally {
      setLoading(false)
    }
  }

  const checkAuthStatus = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      console.log('Emergency Login: 当前会话状态', { session, error })
      
      if (session) {
        setMessage(`当前已登录: ${session.user.email}`)
      } else {
        setMessage('当前未登录')
      }
    } catch (err) {
      console.error('Emergency Login: 检查状态异常', err)
      setError('检查状态时发生异常')
    }
  }

  const forceLogout = async () => {
    try {
      await supabase.auth.signOut()
      setMessage('已强制登出')
      setEmail('')
      setPassword('')
    } catch (err) {
      console.error('Emergency Login: 登出异常', err)
      setError('登出时发生异常')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="h-8 w-8 rounded-full bg-red-500" />
            <span className="ml-2 text-xl font-bold">紧急登录</span>
          </div>
          <CardTitle className="text-2xl text-center">应急登录页面</CardTitle>
          <CardDescription className="text-center">
            绕过所有中间件和路由保护
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium">邮箱</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入邮箱"
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">密码</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              紧急登录
            </Button>
          </form>

          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={checkAuthStatus}
              type="button"
            >
              检查认证状态
            </Button>
            
            <Button 
              variant="destructive" 
              className="w-full" 
              onClick={forceLogout}
              type="button"
            >
              强制登出
            </Button>
          </div>

          {message && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">{message}</p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="text-xs text-gray-500 space-y-1">
            <p>• 这个页面直接使用 Supabase 客户端，不依赖任何中间件</p>
            <p>• 使用 window.location.href 强制跳转</p>
            <p>• 可以检查和重置认证状态</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
