'use client'

import { useEffect, useState } from 'react'
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
  const [isRedirecting, setIsRedirecting] = useState(false)


  useEffect(() => {
    if (!initialized || loading) {
      return
    }

    // 获取当前路径
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''

    // 需要认证但用户未登录
    if (requireAuth && !user) {
      setIsRedirecting(true)
      const redirectUrl = currentPath !== '/' ? `${redirectTo}?redirectTo=${encodeURIComponent(currentPath)}` : redirectTo
      router.replace(redirectUrl)
      return
    }

    // 不需要认证但用户已登录，且在认证页面（登录/注册页面）
    if (!requireAuth && user && (currentPath.startsWith('/login') || currentPath.startsWith('/register'))) {
      setIsRedirecting(true)
      router.replace('/dashboard')
      return
    }

    // 其他情况不需要重定向
    setIsRedirecting(false)
  }, [user, loading, initialized, requireAuth, redirectTo, router])

  // 显示加载状态的情况：
  // 1. 未初始化或正在加载
  // 2. 需要认证但用户未登录（即将重定向）
  // 3. 正在重定向
  if (!initialized || loading) {
    return <LoadingPage />
  }

  if (requireAuth && !user) {
    return <LoadingPage />
  }

  if (isRedirecting) {
    return <LoadingPage />
  }

  return <>{children}</>
}
