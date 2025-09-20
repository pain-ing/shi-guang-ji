'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

export default function AuthDebugPage() {
  const authStore = useAuthStore()
  const router = useRouter()
  const [sessionInfo, setSessionInfo] = useState<{ user?: { id: string; email?: string }; expires_at?: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true)
        setError(null)

        // 获取 Supabase 会话
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          setError(`获取会话失败: ${sessionError.message}`)
        }

        setSessionInfo(session)

        // 获取用户信息
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          console.error('获取用户失败:', userError)
        }

        console.log('调试信息:', {
          session,
          user,
          authStore: {
            initialized: authStore.initialized,
            user: authStore.user,
            session: authStore.session,
            profile: authStore.profile,
            loading: authStore.loading
          }
        })
      } catch (err) {
        console.error('认证检查异常:', err)
        setError(`认证检查异常: ${err}`)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [authStore])

  const handleClearSession = async () => {
    try {
      // 清除 Supabase 会话
      await supabase.auth.signOut()
      
      // 清除 localStorage
      if (typeof window !== 'undefined') {
        localStorage.clear()
      }
      
      // 清除 cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      })

      alert('会话已清除，请刷新页面')
      window.location.reload()
    } catch (err) {
      console.error('清除会话失败:', err)
      alert(`清除会话失败: ${err}`)
    }
  }

  const handleForceLogin = () => {
    router.push('/emergency-login')
  }

  const handleRetryInit = async () => {
    try {
      setLoading(true)
      await authStore.initialize()
      alert('重新初始化完成')
      window.location.reload()
    } catch (err) {
      console.error('重新初始化失败:', err)
      alert(`重新初始化失败: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>认证调试工具</CardTitle>
            <CardDescription>
              用于诊断和解决认证相关问题
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">检查认证状态...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="font-semibold">AuthStore 状态</h3>
              <div className="bg-gray-100 rounded-md p-3 text-sm font-mono">
                <div>initialized: {String(authStore.initialized)}</div>
                <div>loading: {String(authStore.loading)}</div>
                <div>user: {authStore.user ? authStore.user.email : 'null'}</div>
                <div>profile: {authStore.profile ? authStore.profile.username : 'null'}</div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Supabase 会话</h3>
              <div className="bg-gray-100 rounded-md p-3 text-sm font-mono">
                {sessionInfo ? (
                  <>
                    <div>user.id: {sessionInfo.user?.id}</div>
                    <div>user.email: {sessionInfo.user?.email}</div>
                    <div>expires_at: {sessionInfo.expires_at ? new Date(sessionInfo.expires_at * 1000).toLocaleString() : 'N/A'}</div>
                  </>
                ) : (
                  <div>无会话</div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">localStorage 数据</h3>
              <div className="bg-gray-100 rounded-md p-3 text-sm font-mono max-h-40 overflow-auto">
                {typeof window !== 'undefined' ? (
                  Object.keys(localStorage).map(key => (
                    <div key={key} className="truncate">
                      {key}: {localStorage.getItem(key)?.substring(0, 50)}...
                    </div>
                  ))
                ) : (
                  <div>服务端渲染中，localStorage 不可用</div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-4">
              <Button onClick={handleClearSession} variant="destructive">
                清除所有会话
              </Button>
              <Button onClick={handleRetryInit} variant="outline">
                重新初始化
              </Button>
              <Button onClick={handleForceLogin} variant="outline">
                紧急登录
              </Button>
              <Button onClick={() => router.push('/login')} variant="outline">
                返回登录页
              </Button>
              <Button onClick={() => router.push('/dashboard')} variant="outline">
                尝试访问 Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>解决方案</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>如果遇到无限加载问题，请尝试以下步骤：</p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>点击&quot;清除所有会话&quot;按钮</li>
              <li>刷新页面</li>
              <li>重新登录</li>
              <li>如果问题依然存在，点击&quot;紧急登录&quot;</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
