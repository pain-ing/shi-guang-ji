'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { WifiOff, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function OfflinePage() {
  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-purple-50 to-cyan-50 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-primary opacity-10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-secondary opacity-10 blur-3xl" />
      </div>
      
      <Card className="w-full max-w-md glassmorphism card-gradient-shadow border-0 text-center">
        <CardHeader className="pb-4">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
              <WifiOff className="h-12 w-12 text-gray-600" />
            </div>
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
            网络连接中断
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            您当前处于离线状态，请检查网络连接后重试
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              • 检查WiFi或移动数据连接
            </p>
            <p className="text-sm text-muted-foreground">
              • 确保网络信号良好
            </p>
            <p className="text-sm text-muted-foreground">
              • 尝试切换网络或重新连接
            </p>
          </div>
          
          <div className="flex space-x-2 pt-4">
            <Button 
              onClick={handleRefresh}
              className="flex-1 bg-gradient-primary hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              重新加载
            </Button>
            <Button 
              variant="outline" 
              className="border-gradient hover:bg-gradient-secondary hover:text-white transition-all duration-300"
              asChild
            >
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                返回首页
              </Link>
            </Button>
          </div>
          
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-gradient-primary" />
              <span>拾光集 - 即使离线也能记录美好时光</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
