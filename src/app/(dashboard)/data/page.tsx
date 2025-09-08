import { Metadata } from 'next'
import { DataManager } from '@/components/data/DataManager'

export const metadata: Metadata = {
  title: '数据管理 | 拾光集',
  description: '导出、导入和备份你的拾光集数据',
  themeColor: '#14b8a6',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function DataPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-text mb-4">
            数据管理中心
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            管理你的拾光集数据，支持导出备份、数据导入和完整备份功能
          </p>
        </div>
        
        <DataManager />
      </div>
    </div>
  )
}
