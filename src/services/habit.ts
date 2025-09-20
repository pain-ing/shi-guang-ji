// 习惯追踪服务 - 管理写作习惯、成就和统计
import { HabitTracking, Achievement, WritingStatistics, EmotionType } from '@/types/features';

export class HabitTrackingService {
  private readonly STORAGE_KEY = 'habit_tracking_data';
  private readonly ACHIEVEMENT_DEFINITIONS: Achievement[] = [
    // 连续写作成就
    { id: 'streak_3', name: '初心者', description: '连续写作3天', icon: '🌱', tier: 'bronze' },
    { id: 'streak_7', name: '坚持者', description: '连续写作7天', icon: '🌿', tier: 'bronze' },
    { id: 'streak_30', name: '习惯养成', description: '连续写作30天', icon: '🌳', tier: 'silver' },
    { id: 'streak_100', name: '百日坚持', description: '连续写作100天', icon: '🏆', tier: 'gold' },
    { id: 'streak_365', name: '年度作家', description: '连续写作365天', icon: '👑', tier: 'platinum' },
    
    // 总数成就
    { id: 'total_10', name: '起步者', description: '写了10篇日记', icon: '📝', tier: 'bronze' },
    { id: 'total_50', name: '记录者', description: '写了50篇日记', icon: '📚', tier: 'silver' },
    { id: 'total_100', name: '百篇故事', description: '写了100篇日记', icon: '📖', tier: 'gold' },
    { id: 'total_500', name: '生活史官', description: '写了500篇日记', icon: '📜', tier: 'platinum' },
    
    // 字数成就
    { id: 'words_1k', name: '千字文', description: '累计写了1000字', icon: '✍️', tier: 'bronze' },
    { id: 'words_10k', name: '万言书', description: '累计写了10000字', icon: '🖋️', tier: 'silver' },
    { id: 'words_100k', name: '著作等身', description: '累计写了100000字', icon: '📑', tier: 'gold' },
    
    // 特殊成就
    { id: 'early_bird', name: '早起鸟', description: '早上6点前写日记', icon: '🌅', tier: 'bronze' },
    { id: 'night_owl', name: '夜猫子', description: '深夜12点后写日记', icon: '🌙', tier: 'bronze' },
    { id: 'weekend_warrior', name: '周末战士', description: '连续4个周末都写日记', icon: '🎯', tier: 'silver' },
    { id: 'emotion_master', name: '情绪大师', description: '记录了10种不同的情绪', icon: '🎭', tier: 'silver' },
    { id: 'photo_lover', name: '摄影爱好者', description: '添加了50张照片', icon: '📸', tier: 'silver' },
    { id: 'audio_pioneer', name: '声音记录者', description: '录制了10段音频', icon: '🎙️', tier: 'silver' },
  ];

  // 获取习惯追踪数据
  async getTrackingData(userId: string): Promise<HabitTracking> {
    const stored = localStorage.getItem(`${this.STORAGE_KEY}_${userId}`);
    if (stored) {
      const data = JSON.parse(stored);
      // 转换日期字符串为 Date 对象
      data.lastEntryDate = new Date(data.lastEntryDate);
      data.achievements = data.achievements.map((a: any) => ({
        ...a,
        unlockedAt: a.unlockedAt ? new Date(a.unlockedAt) : undefined
      }));
      return data;
    }

    // 返回初始数据
    return {
      userId,
      streakDays: 0,
      totalEntries: 0,
      lastEntryDate: new Date(),
      achievements: [],
      statistics: {
        totalWords: 0,
        averageWordsPerEntry: 0,
        favoriteWritingTime: '未知',
        mostProductiveDay: '未知',
        topTags: [],
        emotionDistribution: {} as Record<EmotionType, number>
      }
    };
  }

  // 更新习惯追踪数据
  async updateTracking(
    userId: string,
    entryData: {
      wordCount: number;
      tags: string[];
      emotion?: EmotionType;
      hasPhoto?: boolean;
      hasAudio?: boolean;
      createdAt: Date;
    }
  ): Promise<HabitTracking> {
    const tracking = await this.getTrackingData(userId);
    const now = new Date();
    const lastEntry = new Date(tracking.lastEntryDate);

    // 更新连续天数
    const daysDiff = this.getDaysDifference(lastEntry, now);
    if (daysDiff === 0) {
      // 同一天的多次写作
    } else if (daysDiff === 1) {
      // 连续写作
      tracking.streakDays++;
    } else {
      // 中断了，重新计算
      tracking.streakDays = 1;
    }

    // 更新统计
    tracking.totalEntries++;
    tracking.lastEntryDate = now;
    tracking.statistics.totalWords += entryData.wordCount;
    tracking.statistics.averageWordsPerEntry = Math.round(
      tracking.statistics.totalWords / tracking.totalEntries
    );

    // 更新写作时间统计
    const hour = entryData.createdAt.getHours();
    tracking.statistics.favoriteWritingTime = this.getTimeOfDay(hour);

    // 更新最高产的星期几
    const dayOfWeek = entryData.createdAt.toLocaleDateString('zh-CN', { weekday: 'long' });
    tracking.statistics.mostProductiveDay = dayOfWeek;

    // 更新标签统计
    this.updateTopTags(tracking.statistics, entryData.tags);

    // 更新情绪分布
    if (entryData.emotion) {
      if (!tracking.statistics.emotionDistribution[entryData.emotion]) {
        tracking.statistics.emotionDistribution[entryData.emotion] = 0;
      }
      tracking.statistics.emotionDistribution[entryData.emotion]++;
    }

    // 检查并解锁成就
    const newAchievements = this.checkAchievements(tracking, entryData);
    tracking.achievements = [...tracking.achievements, ...newAchievements];

    // 保存数据
    this.saveTrackingData(userId, tracking);

    return tracking;
  }

  // 获取今日写作状态
  async getTodayStatus(userId: string): Promise<{
    hasWrittenToday: boolean;
    currentStreak: number;
    nextMilestone: number;
  }> {
    const tracking = await this.getTrackingData(userId);
    const today = new Date();
    const lastEntry = new Date(tracking.lastEntryDate);
    const daysDiff = this.getDaysDifference(lastEntry, today);

    const hasWrittenToday = daysDiff === 0;
    const currentStreak = daysDiff <= 1 ? tracking.streakDays : 0;

    // 计算下一个里程碑
    const milestones = [3, 7, 30, 100, 365];
    const nextMilestone = milestones.find(m => m > currentStreak) || 365;

    return {
      hasWrittenToday,
      currentStreak,
      nextMilestone
    };
  }

  // 获取成就进度
  getAchievementProgress(tracking: HabitTracking): Map<string, number> {
    const progress = new Map<string, number>();

    // 连续天数进度
    progress.set('streak_3', Math.min(tracking.streakDays / 3, 1));
    progress.set('streak_7', Math.min(tracking.streakDays / 7, 1));
    progress.set('streak_30', Math.min(tracking.streakDays / 30, 1));
    progress.set('streak_100', Math.min(tracking.streakDays / 100, 1));
    progress.set('streak_365', Math.min(tracking.streakDays / 365, 1));

    // 总数进度
    progress.set('total_10', Math.min(tracking.totalEntries / 10, 1));
    progress.set('total_50', Math.min(tracking.totalEntries / 50, 1));
    progress.set('total_100', Math.min(tracking.totalEntries / 100, 1));
    progress.set('total_500', Math.min(tracking.totalEntries / 500, 1));

    // 字数进度
    progress.set('words_1k', Math.min(tracking.statistics.totalWords / 1000, 1));
    progress.set('words_10k', Math.min(tracking.statistics.totalWords / 10000, 1));
    progress.set('words_100k', Math.min(tracking.statistics.totalWords / 100000, 1));

    return progress;
  }

  // 私有方法：计算两个日期相差的天数
  private getDaysDifference(date1: Date, date2: Date): number {
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  // 私有方法：获取时间段描述
  private getTimeOfDay(hour: number): string {
    if (hour < 6) return '凌晨';
    if (hour < 12) return '上午';
    if (hour < 14) return '中午';
    if (hour < 18) return '下午';
    if (hour < 22) return '晚上';
    return '深夜';
  }

  // 私有方法：更新热门标签
  private updateTopTags(statistics: WritingStatistics, tags: string[]) {
    const tagCount = new Map<string, number>();
    
    // 统计现有标签
    statistics.topTags.forEach(tag => {
      tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
    });

    // 添加新标签
    tags.forEach(tag => {
      tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
    });

    // 排序并取前10个
    statistics.topTags = Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);
  }

  // 私有方法：检查成就解锁
  private checkAchievements(
    tracking: HabitTracking,
    entryData: any
  ): Achievement[] {
    const newAchievements: Achievement[] = [];
    const unlockedIds = new Set(tracking.achievements.map(a => a.id));

    // 检查连续天数成就
    const streakAchievements = [
      { days: 3, id: 'streak_3' },
      { days: 7, id: 'streak_7' },
      { days: 30, id: 'streak_30' },
      { days: 100, id: 'streak_100' },
      { days: 365, id: 'streak_365' }
    ];

    streakAchievements.forEach(({ days, id }) => {
      if (tracking.streakDays >= days && !unlockedIds.has(id)) {
        const achievement = this.ACHIEVEMENT_DEFINITIONS.find(a => a.id === id);
        if (achievement) {
          newAchievements.push({ ...achievement, unlockedAt: new Date() });
        }
      }
    });

    // 检查总数成就
    const totalAchievements = [
      { count: 10, id: 'total_10' },
      { count: 50, id: 'total_50' },
      { count: 100, id: 'total_100' },
      { count: 500, id: 'total_500' }
    ];

    totalAchievements.forEach(({ count, id }) => {
      if (tracking.totalEntries >= count && !unlockedIds.has(id)) {
        const achievement = this.ACHIEVEMENT_DEFINITIONS.find(a => a.id === id);
        if (achievement) {
          newAchievements.push({ ...achievement, unlockedAt: new Date() });
        }
      }
    });

    // 检查字数成就
    const wordAchievements = [
      { words: 1000, id: 'words_1k' },
      { words: 10000, id: 'words_10k' },
      { words: 100000, id: 'words_100k' }
    ];

    wordAchievements.forEach(({ words, id }) => {
      if (tracking.statistics.totalWords >= words && !unlockedIds.has(id)) {
        const achievement = this.ACHIEVEMENT_DEFINITIONS.find(a => a.id === id);
        if (achievement) {
          newAchievements.push({ ...achievement, unlockedAt: new Date() });
        }
      }
    });

    // 检查时间相关成就
    const hour = entryData.createdAt.getHours();
    if (hour < 6 && !unlockedIds.has('early_bird')) {
      const achievement = this.ACHIEVEMENT_DEFINITIONS.find(a => a.id === 'early_bird');
      if (achievement) {
        newAchievements.push({ ...achievement, unlockedAt: new Date() });
      }
    }
    if (hour >= 24 || hour < 1 && !unlockedIds.has('night_owl')) {
      const achievement = this.ACHIEVEMENT_DEFINITIONS.find(a => a.id === 'night_owl');
      if (achievement) {
        newAchievements.push({ ...achievement, unlockedAt: new Date() });
      }
    }

    return newAchievements;
  }

  // 私有方法：保存数据
  private saveTrackingData(userId: string, tracking: HabitTracking): void {
    localStorage.setItem(`${this.STORAGE_KEY}_${userId}`, JSON.stringify(tracking));
  }

  // 重置连续天数（用于测试或特殊情况）
  async resetStreak(userId: string): Promise<void> {
    const tracking = await this.getTrackingData(userId);
    tracking.streakDays = 0;
    this.saveTrackingData(userId, tracking);
  }

  // 获取排行榜数据（如果实现多用户）
  async getLeaderboard(): Promise<Array<{
    userId: string;
    streak: number;
    totalEntries: number;
    totalWords: number;
  }>> {
    // 这里可以从服务器获取排行榜数据
    // 现在返回模拟数据
    return [];
  }
}

// 导出单例实例
export const habitTrackingService = new HabitTrackingService();