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

  useEffect(() => {
    if (!initialized || loading) return

    if (requireAuth && !user) {
      router.push(redirectTo)
    } else if (!requireAuth && user) {
      router.push('/dashboard')
    }
  }, [user, loading, initialized, requireAuth, redirectTo, router])

  // 显示加载状态
  if (!initialized || loading) {
    return <LoadingPage />
  }

  // 如果需要认证但用户未登录，显示加载状态（即将重定向）
  if (requireAuth && !user) {
    return <LoadingPage />
  }

  // 如果不需要认证但用户已登录，显示加载状态（即将重定向）
  if (!requireAuth && user) {
    return <LoadingPage />
  }

  return <>{children}</>
}
