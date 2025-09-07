'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const initialize = useAuthStore(state => state.initialize)
  const initialized = useAuthStore(state => state.initialized)

  useEffect(() => {
    // 只在未初始化时执行
    if (!initialized) {
      console.log('AuthProvider: 开始初始化认证状态')
      initialize().then(() => {
        console.log('AuthProvider: 认证状态初始化完成')
      }).catch(error => {
        console.error('AuthProvider: 认证初始化失败:', error)
      })
    }
  }, [initialized, initialize])

  // 不再在这里显示加载状态，让子组件自己处理
  return <>{children}</>
}
