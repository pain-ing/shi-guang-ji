'use client'

import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { Toaster } from '@/components/ui/toaster'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <aside className="hidden lg:block fixed left-0 top-14 h-[calc(100vh-3.5rem)] border-r">
          <Sidebar />
        </aside>
        <main className="flex-1 lg:ml-64">
          <div className="container py-6">
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  )
}
