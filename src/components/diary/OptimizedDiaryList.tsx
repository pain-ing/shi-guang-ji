'use client';

import React, { memo, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Edit } from 'lucide-react';
import { VirtualList } from '@/components/common/VirtualList';
import { diaryUtils } from '@/utils/diary';
import type { Diary } from '@/types/diary';

interface OptimizedDiaryListProps {
  diaries: Diary[];
  containerHeight?: number;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
}

// 单个日记项组件
const DiaryItem = memo<{ diary: Diary; index: number }>(({ diary }) => {
  return (
    <Card className="hover:shadow-md transition-shadow mx-4 mb-4">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="line-clamp-1">
              <Link
                href={`/diary/${diary.id}`}
                className="hover:text-primary transition-colors"
              >
                {diary.title}
              </Link>
            </CardTitle>
            <CardDescription className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>{diaryUtils.formatDate(diary.created_at)}</span>
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/diary/${diary.id}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground line-clamp-3">
          {diaryUtils.getExcerpt(diary.content)}
        </p>
      </CardContent>
    </Card>
  );
});

DiaryItem.displayName = 'DiaryItem';

export const OptimizedDiaryList = memo<OptimizedDiaryListProps>(({
  diaries,
  containerHeight = 600,
  onLoadMore,
  hasMore = false,
  loading = false
}) => {
  // 渲染单个日记项
  const renderDiaryItem = useCallback((diary: Diary, index: number) => {
    return <DiaryItem diary={diary} index={index} />;
  }, []);

  // 计算项目高度（动态高度基于内容）
  const getItemHeight = useCallback((index: number, diary: Diary) => {
    // 基础高度 + 内容长度影响的高度
    const baseHeight = 180; // Card 的基础高度
    const contentLength = diaryUtils.getExcerpt(diary.content).length;
    const extraHeight = Math.min(contentLength / 10, 60); // 最多增加60px
    return baseHeight + extraHeight;
  }, []);

  if (diaries.length === 0) {
    return null; // 空状态由父组件处理
  }

  return (
    <VirtualList
      items={diaries}
      itemHeight={getItemHeight}
      containerHeight={containerHeight}
      renderItem={renderDiaryItem}
      overscan={3}
      loadMore={onLoadMore}
      hasMore={hasMore}
      loading={loading}
      threshold={100}
      className="diary-virtual-list"
    />
  );
});

OptimizedDiaryList.displayName = 'OptimizedDiaryList';
