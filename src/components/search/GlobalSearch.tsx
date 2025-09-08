'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  X, 
  Filter, 
  Clock, 
  FileText, 
  Calendar, 
  Camera,
  Loader2,
  ArrowRight,
  Hash
} from 'lucide-react'
import { useSearchStore, searchUtils, SearchResult } from '@/stores/searchStore'
import { useCheckInStore } from '@/stores/checkInStore'
import { useDiaryStore } from '@/stores/diaryStore'
import { useMediaStore } from '@/stores/mediaStore'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface GlobalSearchProps {
  className?: string
  placeholder?: string
  showFilters?: boolean
  onClose?: () => void
}

export function GlobalSearch({ 
  className, 
  placeholder = "搜索日记、打卡、照片...", 
  showFilters = true,
  onClose 
}: GlobalSearchProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [showResults, setShowResults] = useState(false)

  // 状态管理
  const { 
    query, 
    results, 
    loading, 
    recentSearches, 
    search, 
    setQuery, 
    clearSearch,
    addToHistory 
  } = useSearchStore()

  // 数据存储
  const { checkIns } = useCheckInStore()
  const { diaries } = useDiaryStore()
  const { mediaFiles } = useMediaStore()

  // 处理搜索
  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      clearSearch()
      return
    }

    search(searchQuery, {
      diaries,
      checkIns,
      mediaFiles,
    })
    setShowResults(true)
  }

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    
    // 实时搜索（防抖）
    if (value.trim()) {
      const timeoutId = setTimeout(() => {
        handleSearch(value)
      }, 300)
      return () => clearTimeout(timeoutId)
    } else {
      setShowResults(false)
      clearSearch()
    }
  }

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      handleSearch(query)
    } else if (e.key === 'Escape') {
      setShowResults(false)
      inputRef.current?.blur()
      onClose?.()
    }
  }

  // 处理结果点击
  const handleResultClick = (result: SearchResult) => {
    addToHistory(query)
    setShowResults(false)
    
    switch (result.type) {
      case 'diary':
        router.push(`/diary/${result.item.id}`)
        break
      case 'checkin':
        router.push('/check-in')
        break
      case 'media':
        router.push('/media')
        break
    }
  }

  // 处理历史搜索点击
  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery)
    handleSearch(historyQuery)
    inputRef.current?.focus()
  }

  // 清空搜索
  const handleClear = () => {
    setQuery('')
    clearSearch()
    setShowResults(false)
    inputRef.current?.focus()
  }

  // 获取结果摘要
  const resultSummary = searchUtils.getResultSummary(results)

  return (
    <div className={cn("relative w-full", className)}>
      {/* 搜索输入框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowResults(true)}
          className="pl-10 pr-20 h-12 text-base border-gradient hover:border-primary/50 focus:border-primary transition-colors"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
          {loading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {query && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {showFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Filter className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* 搜索结果和历史 */}
      {showResults && (
        <Card className="absolute top-full left-0 right-0 mt-2 max-h-96 overflow-hidden border-0 shadow-lg glassmorphism z-50">
          <CardContent className="p-0">
            {/* 搜索结果 */}
            {query && (
              <>
                {results.length > 0 ? (
                  <>
                    {/* 结果统计 */}
                    <div className="p-4 border-b bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          找到 {resultSummary.total} 条结果
                        </div>
                        <div className="flex items-center space-x-2">
                          {resultSummary.diary > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              <FileText className="h-3 w-3 mr-1" />
                              {resultSummary.diary}
                            </Badge>
                          )}
                          {resultSummary.checkin > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              <Calendar className="h-3 w-3 mr-1" />
                              {resultSummary.checkin}
                            </Badge>
                          )}
                          {resultSummary.media > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              <Camera className="h-3 w-3 mr-1" />
                              {resultSummary.media}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 搜索结果列表 */}
                    <div className="max-h-64 overflow-y-auto">
                      {results.slice(0, 8).map((result, index) => (
                        <SearchResultItem
                          key={`${result.type}-${result.item.id}`}
                          result={result}
                          onClick={() => handleResultClick(result)}
                        />
                      ))}
                    </div>

                    {results.length > 8 && (
                      <div className="p-3 border-t bg-muted/30">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => router.push(`/search?q=${encodeURIComponent(query)}`)}
                        >
                          查看全部 {results.length} 条结果
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">未找到相关结果</p>
                    <p className="text-xs mt-1">尝试使用不同的关键词</p>
                  </div>
                )}
              </>
            )}

            {/* 最近搜索 */}
            {!query && recentSearches.length > 0 && (
              <div className="p-4">
                <div className="flex items-center mb-3">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">最近搜索</span>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((historyQuery, index) => (
                    <button
                      key={index}
                      onClick={() => handleHistoryClick(historyQuery)}
                      className="flex items-center w-full px-2 py-1.5 text-sm text-left rounded hover:bg-muted/50 transition-colors"
                    >
                      <Hash className="h-3 w-3 mr-2 text-muted-foreground" />
                      {historyQuery}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 空状态 */}
            {!query && recentSearches.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">开始搜索您的内容</p>
                <p className="text-xs mt-1">支持搜索日记、打卡记录和照片</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 遮罩层 */}
      {showResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  )
}

// 搜索结果项组件
interface SearchResultItemProps {
  result: SearchResult
  onClick: () => void
}

function SearchResultItem({ result, onClick }: SearchResultItemProps) {
  const getIcon = () => {
    switch (result.type) {
      case 'diary':
        return <FileText className="h-4 w-4 text-green-600" />
      case 'checkin':
        return <Calendar className="h-4 w-4 text-blue-600" />
      case 'media':
        return <Camera className="h-4 w-4 text-purple-600" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getTitle = () => {
    switch (result.type) {
      case 'diary':
        return (result.item as any).title || '无标题日记'
      case 'checkin':
        return `${(result.item as any).mood} - 心情打卡`
      case 'media':
        return (result.item as any).filename || '媒体文件'
      default:
        return '未知内容'
    }
  }

  const getDescription = () => {
    switch (result.type) {
      case 'diary':
        const content = (result.item as any).content || ''
        return content.length > 100 ? content.slice(0, 100) + '...' : content
      case 'checkin':
        return (result.item as any).note || '无备注'
      case 'media':
        return (result.item as any).description || '无描述'
      default:
        return ''
    }
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MM月dd日', { locale: zhCN })
  }

  return (
    <button
      onClick={onClick}
      className="flex items-start w-full p-3 text-left hover:bg-muted/30 transition-colors border-b border-border/50 last:border-0"
    >
      <div className="mr-3 mt-1">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-medium text-sm truncate">{getTitle()}</h4>
          <span className="text-xs text-muted-foreground ml-2">
            {formatDate(result.item.created_at)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {getDescription()}
        </p>
        {result.score && (
          <div className="mt-1">
            <Badge variant="outline" className="text-xs">
              匹配度 {Math.round((1 - result.score) * 100)}%
            </Badge>
          </div>
        )}
      </div>
    </button>
  )
}
