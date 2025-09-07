'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Home,
  Calendar,
  BookOpen,
  Camera,
  User,
  Heart,
} from 'lucide-react'

const navigation = [
  {
    name: '首页',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: '每日打卡',
    href: '/check-in',
    icon: Calendar,
  },
  {
    name: '我的日记',
    href: '/diary',
    icon: BookOpen,
  },
  {
    name: '媒体库',
    href: '/media',
    icon: Camera,
  },
  {
    name: '个人资料',
    href: '/profile',
    icon: User,
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn('pb-12 w-64', className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              拾光集
            </h2>
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Button
                    key={item.href}
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start',
                      isActive && 'bg-secondary'
                    )}
                    asChild
                  >
                    <Link href={item.href}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </Link>
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
        
        {/* Quick stats or info section */}
        <div className="px-3 py-2">
          <div className="space-y-1">
            <h2 className="mb-2 px-4 text-sm font-semibold tracking-tight text-muted-foreground">
              快速统计
            </h2>
            <div className="space-y-2 px-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">本月打卡</span>
                <span className="font-medium">15 天</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">日记数量</span>
                <span className="font-medium">42 篇</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">照片数量</span>
                <span className="font-medium">128 张</span>
              </div>
            </div>
          </div>
        </div>

        {/* Motivational section */}
        <div className="px-3 py-2">
          <div className="rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">今日心情</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              记录每一个美好瞬间，让生活更有意义
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
