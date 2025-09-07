'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'

interface SimpleAuthProviderProps {
  children: React.ReactNode
}

export function SimpleAuthProvider({ children }: SimpleAuthProviderProps) {
  const initialize = useAuthStore(state => state.initialize)

  useEffect(() => {
    // 直接初始化，不管状态
    console.log('SimpleAuthProvider: 开始初始化')
    initialize().catch(error => {
      console.error('SimpleAuthProvider: 初始化失败:', error)
    })
  }, []) // 空依赖数组，只执行一次

  // 直接渲染子组件，不等待
  return <>{children}</>
}
