'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, X, Smartphone } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // 检查是否已安装
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // 检查是否在已安装的PWA中运行
    if (window.navigator && 'serviceWorker' in window.navigator) {
      window.navigator.serviceWorker.ready.then(() => {
        if (window.matchMedia('(display-mode: standalone)').matches) {
          setIsInstalled(true)
        }
      })
    }

    // 监听安装提示事件
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    // 监听应用安装事件
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('用户同意安装PWA')
        setShowInstallPrompt(false)
      } else {
        console.log('用户拒绝安装PWA')
      }
    } catch (error) {
      console.error('安装PWA时出错:', error)
    }
    
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
  }

  // 如果已安装或不显示提示，则不渲染
  if (isInstalled || !showInstallPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <Card className="glassmorphism card-gradient-shadow border-0 animate-in slide-in-from-bottom duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-gradient-primary">
                <Smartphone className="h-4 w-4 text-white" />
              </div>
              <CardTitle className="text-sm">安装拾光集</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-xs">
            将拾光集安装到主屏幕，获得类似原生应用的体验
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex space-x-2">
            <Button
              onClick={handleInstallClick}
              className="flex-1 bg-gradient-primary hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 text-white text-xs py-2"
            >
              <Download className="h-3 w-3 mr-1" />
              立即安装
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="text-xs py-2"
            >
              暂不安装
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// 安装状态检查Hook
export function useIsInstalled() {
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const checkInstallation = () => {
      // 检查显示模式
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      // 检查iOS Safari添加到主屏幕
      const isIOSInstalled = (window.navigator as any)?.standalone === true
      // 检查Chrome添加到主屏幕
      const isAndroidInstalled = document.referrer.includes('android-app://')
      
      setIsInstalled(isStandalone || isIOSInstalled || isAndroidInstalled)
    }

    checkInstallation()
    
    // 监听显示模式变化
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    mediaQuery.addListener(checkInstallation)
    
    return () => mediaQuery.removeListener(checkInstallation)
  }, [])

  return isInstalled
}
