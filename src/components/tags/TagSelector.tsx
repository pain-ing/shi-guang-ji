'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { 
  Plus, 
  X, 
  Hash, 
  Check,
  Palette
} from 'lucide-react'
import { useTagStore, Tag, TAG_COLORS, tagUtils } from '@/stores/tagStore'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

interface TagSelectorProps {
  selectedTags: Tag[]
  onTagsChange: (tags: Tag[]) => void
  maxTags?: number
  placeholder?: string
  className?: string
  size?: 'sm' | 'default' | 'lg'
}

export function TagSelector({
  selectedTags,
  onTagsChange,
  maxTags = 10,
  placeholder = "添加标签...",
  className,
  size = 'default'
}: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0])
  
  const { user } = useAuthStore()
  const { tags, createTag, getTags, searchTags } = useTagStore()

  // 搜索标签
  const filteredTags = searchValue ? searchTags(searchValue) : tags

  // 可选标签（排除已选择的）
  const availableTags = filteredTags.filter(tag => 
    !selectedTags.some(selected => selected.id === tag.id)
  )

  // 处理标签选择
  const handleTagSelect = (tag: Tag) => {
    if (selectedTags.length >= maxTags) return
    
    const newTags = [...selectedTags, tag]
    onTagsChange(newTags)
    setSearchValue('')
  }

  // 处理标签移除
  const handleTagRemove = (tagToRemove: Tag) => {
    const newTags = selectedTags.filter(tag => tag.id !== tagToRemove.id)
    onTagsChange(newTags)
  }

  // 处理创建新标签
  const handleCreateTag = async (name: string) => {
    if (!user || !name.trim()) return

    setIsCreating(true)
    try {
      const { data: newTag, error } = await createTag({
        name: name.trim(),
        color: newTagColor,
        user_id: user.id,
      })

      if (newTag && !error) {
        handleTagSelect(newTag)
        setSearchValue('')
        setNewTagColor(tagUtils.getRandomColor())
      }
    } catch (error) {
      console.error('创建标签失败:', error)
    } finally {
      setIsCreating(false)
    }
  }

  // 检查是否可以创建新标签
  const canCreateNewTag = searchValue.trim() && 
    !availableTags.some(tag => tag.name.toLowerCase() === searchValue.toLowerCase()) &&
    selectedTags.length < maxTags

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    default: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-2'
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* 已选标签 */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTags.map(tag => (
            <Badge
              key={tag.id}
              variant="secondary"
              className={cn(
                "flex items-center gap-1 transition-all hover:shadow-sm",
                sizeClasses[size]
              )}
              style={{ backgroundColor: `${tag.color}15`, borderColor: tag.color }}
            >
              <Hash 
                className="h-3 w-3" 
                style={{ color: tag.color }} 
              />
              {tag.name}
              <button
                onClick={() => handleTagRemove(tag)}
                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* 标签选择器 */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              "justify-start text-left font-normal border-dashed",
              selectedTags.length >= maxTags && "opacity-50 cursor-not-allowed"
            )}
            disabled={selectedTags.length >= maxTags}
          >
            <Plus className="mr-2 h-4 w-4" />
            {selectedTags.length >= maxTags 
              ? `最多选择 ${maxTags} 个标签` 
              : placeholder
            }
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <Command>
            <CommandInput
              placeholder="搜索或创建标签..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>
                {searchValue ? (
                  canCreateNewTag ? (
                    <div className="p-4 space-y-3">
                      <p className="text-sm text-muted-foreground">
                        未找到标签 "{searchValue}"
                      </p>
                      
                      {/* 颜色选择器 */}
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">选择颜色：</p>
                        <div className="flex flex-wrap gap-1">
                          {TAG_COLORS.map(color => (
                            <button
                              key={color}
                              onClick={() => setNewTagColor(color)}
                              className={cn(
                                "w-6 h-6 rounded-full border-2 transition-all",
                                color === newTagColor 
                                  ? "border-foreground scale-110" 
                                  : "border-border hover:scale-105"
                              )}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleCreateTag(searchValue)}
                        disabled={isCreating}
                        className="w-full"
                        size="sm"
                      >
                        <Plus className="mr-2 h-3 w-3" />
                        {isCreating ? '创建中...' : `创建标签 "${searchValue}"`}
                      </Button>
                    </div>
                  ) : (
                    <p className="p-4 text-sm text-muted-foreground">
                      未找到相关标签
                    </p>
                  )
                ) : (
                  <p className="p-4 text-sm text-muted-foreground">
                    输入关键词搜索标签
                  </p>
                )}
              </CommandEmpty>

              {availableTags.length > 0 && (
                <CommandGroup heading="选择标签">
                  {availableTags.map(tag => (
                    <CommandItem
                      key={tag.id}
                      onSelect={() => handleTagSelect(tag)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center">
                        <Hash 
                          className="mr-2 h-3 w-3" 
                          style={{ color: tag.color }} 
                        />
                        <span>{tag.name}</span>
                        {tag.usage_count && tag.usage_count > 0 && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {tag.usage_count}
                          </Badge>
                        )}
                      </div>
                      <Check className="h-4 w-4 opacity-0" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* 标签统计 */}
      {selectedTags.length > 0 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>已选择 {selectedTags.length} 个标签</span>
          {selectedTags.length >= maxTags && (
            <span className="text-warning">已达到最大数量</span>
          )}
        </div>
      )}
    </div>
  )
}

// 标签显示组件
interface TagDisplayProps {
  tags: Tag[]
  maxDisplay?: number
  size?: 'sm' | 'default' | 'lg'
  showUsageCount?: boolean
  className?: string
}

export function TagDisplay({ 
  tags, 
  maxDisplay = 5, 
  size = 'default',
  showUsageCount = false,
  className 
}: TagDisplayProps) {
  const displayTags = tags.slice(0, maxDisplay)
  const remainingCount = Math.max(0, tags.length - maxDisplay)

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    default: 'text-sm px-2 py-1',
    lg: 'text-base px-2.5 py-1.5'
  }

  if (tags.length === 0) return null

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {displayTags.map(tag => (
        <Badge
          key={tag.id}
          variant="secondary"
          className={cn(
            "flex items-center gap-1",
            sizeClasses[size]
          )}
          style={{ backgroundColor: `${tag.color}15`, borderColor: tag.color }}
        >
          <Hash 
            className="h-3 w-3" 
            style={{ color: tag.color }} 
          />
          {tag.name}
          {showUsageCount && tag.usage_count && (
            <span className="text-xs opacity-70">({tag.usage_count})</span>
          )}
        </Badge>
      ))}
      
      {remainingCount > 0 && (
        <Badge variant="outline" className={sizeClasses[size]}>
          +{remainingCount} 更多
        </Badge>
      )}
    </div>
  )
}
