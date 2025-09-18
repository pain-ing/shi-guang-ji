'use client';

import React, { memo, useCallback, useMemo } from 'react';
import { VirtualList } from '@/components/common/VirtualList';
import { MediaFile } from '@/types/media';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Download, Eye } from 'lucide-react';
import Image from 'next/image';

interface OptimizedMediaGridProps {
  files: MediaFile[];
  containerHeight?: number;
  onFileDelete?: (file: MediaFile) => void;
  selectable?: boolean;
  selectedFiles?: MediaFile[];
  onSelectionChange?: (files: MediaFile[]) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
  itemsPerRow?: number;
}

// 单个媒体项组件
const MediaItem = memo<{
  file: MediaFile;
  onDelete?: (file: MediaFile) => void;
  selectable?: boolean;
  selected?: boolean;
  onSelectionChange?: (file: MediaFile, selected: boolean) => void;
}>(({ file, onDelete, selectable, selected, onSelectionChange }) => {
  const handleSelectionChange = useCallback((checked: boolean) => {
    onSelectionChange?.(file, checked);
  }, [file, onSelectionChange]);

  const handleDelete = useCallback(() => {
    onDelete?.(file);
  }, [file, onDelete]);

  const isImage = file.file_type === 'image';
  const fileUrl = file.file_url || file.file_path;

  return (
    <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-200">
      {selectable && (
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            checked={selected}
            onCheckedChange={handleSelectionChange}
            className="bg-white/80 backdrop-blur-sm"
          />
        </div>
      )}
      
      <CardContent className="p-0">
        <div className="aspect-square relative bg-gray-100">
          {isImage ? (
            <Image
              src={fileUrl}
              alt={file.file_name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="text-2xl mb-2">📄</div>
                <div className="text-xs text-gray-500 px-2">
                  {file.file_name}
                </div>
              </div>
            </div>
          )}
          
          {/* 悬停操作按钮 */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-2">
            <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
              <Eye className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
              <Download className="h-4 w-4" />
            </Button>
            {onDelete && (
              <Button 
                size="sm" 
                variant="destructive" 
                className="h-8 w-8 p-0"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* 文件信息 */}
        <div className="p-3">
          <div className="text-sm font-medium truncate" title={file.file_name}>
            {file.file_name}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {file.file_size ? `${(file.file_size / 1024 / 1024).toFixed(1)} MB` : ''}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

MediaItem.displayName = 'MediaItem';

// 媒体行组件（每行显示多个项目）
const MediaRow = memo<{
  files: MediaFile[];
  itemsPerRow: number;
  onFileDelete?: (file: MediaFile) => void;
  selectable?: boolean;
  selectedFiles?: MediaFile[];
  onSelectionChange?: (files: MediaFile[]) => void;
}>(({ files, itemsPerRow, onFileDelete, selectable, selectedFiles, onSelectionChange }) => {
  const handleSelectionChange = useCallback((file: MediaFile, selected: boolean) => {
    if (!onSelectionChange || !selectedFiles) return;
    
    if (selected) {
      onSelectionChange([...selectedFiles, file]);
    } else {
      onSelectionChange(selectedFiles.filter(f => f.id !== file.id));
    }
  }, [selectedFiles, onSelectionChange]);

  return (
    <div className={`grid gap-4 px-4 mb-4`} style={{ gridTemplateColumns: `repeat(${itemsPerRow}, 1fr)` }}>
      {files.map((file) => (
        <MediaItem
          key={file.id}
          file={file}
          onDelete={onFileDelete}
          selectable={selectable}
          selected={selectedFiles?.some(f => f.id === file.id)}
          onSelectionChange={handleSelectionChange}
        />
      ))}
      {/* 填充空白项目以保持网格对齐 */}
      {Array.from({ length: itemsPerRow - files.length }).map((_, index) => (
        <div key={`empty-${index}`} />
      ))}
    </div>
  );
});

MediaRow.displayName = 'MediaRow';

export const OptimizedMediaGrid = memo<OptimizedMediaGridProps>(({
  files,
  containerHeight = 600,
  onFileDelete,
  selectable = false,
  selectedFiles = [],
  onSelectionChange,
  onLoadMore,
  hasMore = false,
  loading = false,
  itemsPerRow = 4
}) => {
  // 将文件分组为行
  const fileRows = useMemo(() => {
    const rows: MediaFile[][] = [];
    for (let i = 0; i < files.length; i += itemsPerRow) {
      rows.push(files.slice(i, i + itemsPerRow));
    }
    return rows;
  }, [files, itemsPerRow]);

  // 渲染单行
  const renderRow = useCallback((row: MediaFile[], index: number) => {
    return (
      <MediaRow
        files={row}
        itemsPerRow={itemsPerRow}
        onFileDelete={onFileDelete}
        selectable={selectable}
        selectedFiles={selectedFiles}
        onSelectionChange={onSelectionChange}
      />
    );
  }, [itemsPerRow, onFileDelete, selectable, selectedFiles, onSelectionChange]);

  // 计算行高度
  const getRowHeight = useCallback(() => {
    // 卡片高度 + 间距 + 文件信息高度
    return 280; // aspect-square + padding + file info
  }, []);

  if (files.length === 0) {
    return null; // 空状态由父组件处理
  }

  return (
    <VirtualList
      items={fileRows}
      itemHeight={getRowHeight}
      containerHeight={containerHeight}
      renderItem={renderRow}
      overscan={2}
      loadMore={onLoadMore}
      hasMore={hasMore}
      loading={loading}
      threshold={200}
      className="media-virtual-grid"
    />
  );
});

OptimizedMediaGrid.displayName = 'OptimizedMediaGrid';
