'use client'

import { useAuthStore } from '@/stores/authStore'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestAuthPage() {
  const { user, session, profile, loading, initialized, signOut } = useAuthStore()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>认证状态测试</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold">基本状态</h3>
                <p>初始化: {initialized ? '✅' : '❌'}</p>
                <p>加载中: {loading ? '⏳' : '✅'}</p>
                <p>用户状态: {user ? '✅ 已登录' : '❌ 未登录'}</p>
                <p>会话状态: {session ? '✅ 有会话' : '❌ 无会话'}</p>
                <p>用户资料: {profile ? '✅ 已加载' : '❌ 未加载'}</p>
              </div>

              {user && (
                <div>
                  <h3 className="font-semibold">用户信息</h3>
                  <p>ID: {user.id}</p>
                  <p>邮箱: {user.email}</p>
                  <p>邮箱确认: {user.email_confirmed_at ? '✅' : '❌'}</p>
                </div>
              )}

              {profile && (
                <div>
                  <h3 className="font-semibold">用户资料</h3>
                  <p>用户名: {profile.username}</p>
                  <p>头像: {profile.avatar_url || '无'}</p>
                  <p>简介: {profile.bio || '无'}</p>
                </div>
              )}

              <div className="pt-4">
                <Button onClick={handleSignOut} variant="outline" className="w-full">
                  登出
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}
