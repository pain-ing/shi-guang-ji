'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { initialize, initialized } = useAuthStore()
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      if (!initialized) {
        console.log('AuthProvider: 开始初始化认证状态')
        try {
          await initialize()
          console.log('AuthProvider: 认证状态初始化完成')
        } catch (error) {
          console.error('AuthProvider: 认证初始化失败:', error)
        }
      }
      setIsInitializing(false)
    }

    initAuth()
  }, [initialize, initialized])

  // 在初始化完成前显示加载状态
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">初始化应用...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
