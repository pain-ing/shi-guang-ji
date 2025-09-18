import type { Diary } from '@/types/diary';

export const diaryUtils = {
  /**
   * 格式化日期
   */
  formatDate: (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  },

  /**
   * 获取日记摘要
   */
  getExcerpt: (content: string, maxLength: number = 150): string => {
    if (!content) return '';
    
    // 移除 HTML 标签和 Markdown 语法
    const plainText = content
      .replace(/<[^>]*>/g, '') // 移除 HTML 标签
      .replace(/[#*`_~]/g, '') // 移除 Markdown 语法
      .replace(/\n+/g, ' ') // 将换行符替换为空格
      .trim();
    
    if (plainText.length <= maxLength) {
      return plainText;
    }
    
    return plainText.substring(0, maxLength) + '...';
  },

  /**
   * 计算阅读时间（分钟）
   */
  getReadingTime: (content: string): number => {
    if (!content) return 0;
    
    const wordsPerMinute = 200; // 平均阅读速度
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    
    return Math.max(1, readingTime);
  },

  /**
   * 获取心情表情符号
   */
  getMoodEmoji: (mood?: string): string => {
    const moodMap: Record<string, string> = {
      'happy': '😊',
      'sad': '😢',
      'excited': '🤩',
      'calm': '😌',
      'angry': '😠',
      'grateful': '🙏',
      'anxious': '😰',
      'content': '😌',
      'tired': '😴',
      'energetic': '⚡'
    };
    
    return moodMap[mood || ''] || '😐';
  },

  /**
   * 获取天气表情符号
   */
  getWeatherEmoji: (weather?: string): string => {
    const weatherMap: Record<string, string> = {
      'sunny': '☀️',
      'cloudy': '☁️',
      'rainy': '🌧️',
      'snowy': '❄️',
      'windy': '💨',
      'stormy': '⛈️',
      'foggy': '🌫️'
    };
    
    return weatherMap[weather || ''] || '🌤️';
  },

  /**
   * 验证日记数据
   */
  validateDiary: (diary: Partial<Diary>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!diary.title || diary.title.trim().length === 0) {
      errors.push('标题不能为空');
    }
    
    if (!diary.content || diary.content.trim().length === 0) {
      errors.push('内容不能为空');
    }
    
    if (diary.title && diary.title.length > 100) {
      errors.push('标题长度不能超过100个字符');
    }
    
    if (diary.content && diary.content.length > 10000) {
      errors.push('内容长度不能超过10000个字符');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * 搜索日记
   */
  searchDiaries: (diaries: Diary[], query: string): Diary[] => {
    if (!query.trim()) return diaries;
    
    const searchTerm = query.toLowerCase();
    
    return diaries.filter(diary => 
      diary.title.toLowerCase().includes(searchTerm) ||
      diary.content.toLowerCase().includes(searchTerm) ||
      diary.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  },

  /**
   * 按日期排序日记
   */
  sortDiariesByDate: (diaries: Diary[], order: 'asc' | 'desc' = 'desc'): Diary[] => {
    return [...diaries].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      
      return order === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }
};
