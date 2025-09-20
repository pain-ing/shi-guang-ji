'use client';

import React, { 
  useState, 
  useEffect, 
  useRef, 
  useMemo, 
  useCallback,
  memo
} from 'react';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number | ((index: number, item: T) => number);
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number; // 预渲染的额外项目数量
  onScroll?: (scrollTop: number) => void;
  className?: string;
  loadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
  threshold?: number; // 触发加载更多的阈值
}

interface ItemInfo {
  index: number;
  top: number;
  height: number;
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  onScroll,
  className = '',
  loadMore,
  hasMore = false,
  loading = false,
  threshold = 200
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollElementRef = useRef<HTMLDivElement>(null);
  
  // 计算项目高度的函数
  const getItemHeight = useCallback((index: number): number => {
    if (typeof itemHeight === 'function') {
      return itemHeight(index, items[index]);
    }
    return itemHeight;
  }, [itemHeight, items]);

  // 计算所有项目的位置信息
  const itemInfos = useMemo((): ItemInfo[] => {
    const infos: ItemInfo[] = [];
    let top = 0;
    
    for (let i = 0; i < items.length; i++) {
      const height = getItemHeight(i);
      infos.push({
        index: i,
        top,
        height
      });
      top += height;
    }
    
    return infos;
  }, [items, getItemHeight]);

  // 计算总高度
  const totalHeight = useMemo(() => {
    return itemInfos.length > 0 
      ? itemInfos[itemInfos.length - 1].top + itemInfos[itemInfos.length - 1].height
      : 0;
  }, [itemInfos]);

  // 二分查找找到第一个可见项目
  const findStartIndex = useCallback((scrollTop: number): number => {
    let left = 0;
    let right = itemInfos.length - 1;
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const item = itemInfos[mid];
      
      if (item.top <= scrollTop && item.top + item.height > scrollTop) {
        return mid;
      } else if (item.top < scrollTop) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    
    return Math.max(0, Math.min(left, itemInfos.length - 1));
  }, [itemInfos]);

  // 计算可见项目范围
  const visibleRange = useMemo(() => {
    if (itemInfos.length === 0) {
      return { start: 0, end: 0 };
    }
    
    const startIndex = findStartIndex(scrollTop);
    let endIndex = startIndex;
    let currentTop = itemInfos[startIndex].top;
    
    // 找到最后一个可见项目
    while (endIndex < itemInfos.length && currentTop < scrollTop + containerHeight) {
      currentTop += itemInfos[endIndex].height;
      endIndex++;
    }
    
    // 添加 overscan
    const start = Math.max(0, startIndex - overscan);
    const end = Math.min(itemInfos.length, endIndex + overscan);
    
    return { start, end };
  }, [scrollTop, containerHeight, itemInfos, findStartIndex, overscan]);

  // 渲染的项目列表
  const visibleItems = useMemo(() => {
    const items_to_render = [];
    
    for (let i = visibleRange.start; i < visibleRange.end; i++) {
      const item = items[i];
      const info = itemInfos[i];
      
      if (item && info) {
        items_to_render.push({
          item,
          index: i,
          top: info.top,
          height: info.height
        });
      }
    }
    
    return items_to_render;
  }, [items, itemInfos, visibleRange]);

  // 滚动处理
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
    
    // 检查是否需要加载更多
    if (loadMore && hasMore && !loading) {
      const scrollHeight = e.currentTarget.scrollHeight;
      const clientHeight = e.currentTarget.clientHeight;
      const scrollBottom = scrollHeight - newScrollTop - clientHeight;
      
      if (scrollBottom < threshold) {
        loadMore();
      }
    }
  }, [onScroll, loadMore, hasMore, loading, threshold]);

  // 滚动到指定项目
  const scrollToItem = useCallback((index: number, align: 'start' | 'center' | 'end' = 'start') => {
    if (!scrollElementRef.current || index < 0 || index >= itemInfos.length) {
      return;
    }
    
    const item = itemInfos[index];
    let scrollTop = item.top;
    
    if (align === 'center') {
      scrollTop = item.top - (containerHeight - item.height) / 2;
    } else if (align === 'end') {
      scrollTop = item.top - containerHeight + item.height;
    }
    
    scrollTop = Math.max(0, Math.min(scrollTop, totalHeight - containerHeight));
    scrollElementRef.current.scrollTop = scrollTop;
  }, [itemInfos, containerHeight, totalHeight]);

  // 获取当前可见项目的索引范围
  const getVisibleRange = useCallback(() => {
    return visibleRange;
  }, [visibleRange]);

  return (
    <div 
      ref={containerRef}
      className={`virtual-list-container ${className}`}
      style={{ height: containerHeight, overflow: 'hidden' }}
    >
      <div
        ref={scrollElementRef}
        className="virtual-list-scroll"
        style={{ 
          height: '100%', 
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch' // iOS 平滑滚动
        }}
        onScroll={handleScroll}
      >
        {/* 总高度占位符 */}
        <div style={{ height: totalHeight, position: 'relative' }}>
          {/* 渲染可见项目 */}
          {visibleItems.map(({ item, index, top, height }) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                top,
                left: 0,
                right: 0,
                height,
                overflow: 'hidden'
              }}
            >
              {renderItem(item, index)}
            </div>
          ))}
          
          {/* 加载更多指示器 */}
          {loading && (
            <div
              style={{
                position: 'absolute',
                top: totalHeight,
                left: 0,
                right: 0,
                height: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div className="loading-spinner">加载中...</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 高阶组件版本，用于包装现有列表组件
export function withVirtualization<T, P extends { items: T[] }>(
  ListComponent: React.ComponentType<P>,
  options: {
    itemHeight: number | ((index: number, item: T) => number);
    containerHeight: number;
    overscan?: number;
  }
) {
  return memo((props: P) => {
    const renderItem = useCallback((item: T, index: number) => {
      // 这里需要根据具体的 ListComponent 来调整
      return <ListComponent {...props} items={[item]} />;
    }, [props]);

    return (
      <VirtualList
        items={props.items}
        itemHeight={options.itemHeight}
        containerHeight={options.containerHeight}
        overscan={options.overscan}
        renderItem={renderItem}
      />
    );
  });
}

// Hook 版本，用于在组件中使用虚拟滚动逻辑
export function useVirtualList<T>(
  items: T[],
  itemHeight: number | ((index: number, item: T) => number),
  containerHeight: number,
  overscan = 5
) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const getItemHeight = useCallback((index: number): number => {
    if (typeof itemHeight === 'function') {
      return itemHeight(index, items[index]);
    }
    return itemHeight;
  }, [itemHeight, items]);

  const itemInfos = useMemo((): ItemInfo[] => {
    const infos: ItemInfo[] = [];
    let top = 0;
    
    for (let i = 0; i < items.length; i++) {
      const height = getItemHeight(i);
      infos.push({ index: i, top, height });
      top += height;
    }
    
    return infos;
  }, [items, getItemHeight]);

  const totalHeight = useMemo(() => {
    return itemInfos.length > 0 
      ? itemInfos[itemInfos.length - 1].top + itemInfos[itemInfos.length - 1].height
      : 0;
  }, [itemInfos]);

  const findStartIndex = useCallback((scrollTop: number): number => {
    let left = 0;
    let right = itemInfos.length - 1;
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const item = itemInfos[mid];
      
      if (item.top <= scrollTop && item.top + item.height > scrollTop) {
        return mid;
      } else if (item.top < scrollTop) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    
    return Math.max(0, Math.min(left, itemInfos.length - 1));
  }, [itemInfos]);

  const visibleRange = useMemo(() => {
    if (itemInfos.length === 0) {
      return { start: 0, end: 0 };
    }
    
    const startIndex = findStartIndex(scrollTop);
    let endIndex = startIndex;
    let currentTop = itemInfos[startIndex].top;
    
    while (endIndex < itemInfos.length && currentTop < scrollTop + containerHeight) {
      currentTop += itemInfos[endIndex].height;
      endIndex++;
    }
    
    const start = Math.max(0, startIndex - overscan);
    const end = Math.min(itemInfos.length, endIndex + overscan);
    
    return { start, end };
  }, [scrollTop, containerHeight, itemInfos, findStartIndex, overscan]);

  return {
    totalHeight,
    visibleRange,
    setScrollTop,
    itemInfos
  };
}

export default VirtualList;
