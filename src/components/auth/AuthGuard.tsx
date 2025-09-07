'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { LoadingPage } from '@/components/common/Loading'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export function AuthGuard({
  children,
  requireAuth = true,
  redirectTo = '/login'
}: AuthGuardProps) {
  const { user, loading, initialized } = useAuthStore()
  const router = useRouter()

  // 调试日志
  console.log('AuthGuard 状态:', {
    requireAuth,
    user: user ? '已登录' : '未登录',
    loading,
    initialized,
    redirectTo
  })

  useEffect(() => {
    if (!initialized || loading) {
      console.log('AuthGuard: 等待初始化或加载中')
      return
    }

    if (requireAuth && !user) {
      console.log('AuthGuard: 需要认证但用户未登录，重定向到', redirectTo)
      router.replace(redirectTo)
    } else if (!requireAuth && user) {
      console.log('AuthGuard: 不需要认证但用户已登录，重定向到 dashboard')
      // 使用 replace 而不是 push，避免重定向循环
      router.replace('/dashboard')
    } else {
      console.log('AuthGuard: 认证状态正确，显示内容')
    }
  }, [user, loading, initialized, requireAuth, redirectTo, router])

  // 显示加载状态
  if (!initialized || loading) {
    console.log('AuthGuard: 显示加载页面 - initialized:', initialized, 'loading:', loading)
    return <LoadingPage />
  }

  // 如果需要认证但用户未登录，显示加载状态（即将重定向）
  if (requireAuth && !user) {
    console.log('AuthGuard: 需要认证但用户未登录，显示加载页面')
    return <LoadingPage />
  }

  // 如果不需要认证但用户已登录，显示加载状态（即将重定向）
  if (!requireAuth && user) {
    console.log('AuthGuard: 不需要认证但用户已登录，显示加载页面')
    return <LoadingPage />
  }

  console.log('AuthGuard: 渲染子组件')
  return <>{children}</>
}
