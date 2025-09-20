// 时间胶囊服务 - 管理未来信件、定时开启和提醒
import { TimeCapsule, DiaryEntry } from '@/types/features';

export interface TimeCapsuleData extends TimeCapsule {
  title: string;
  content: string;
  media?: string[];
  createdAt: Date;
  type: 'future-letter' | 'milestone' | 'anniversary' | 'custom';
  notificationSettings: {
    email: boolean;
    push: boolean;
    reminderDays: number[];
  };
}

export class TimeCapsuleService {
  private readonly STORAGE_KEY = 'time_capsules';
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    // 启动定时检查
    this.startPeriodicCheck();
  }

  // 创建时间胶囊
  async createCapsule(data: {
    userId: string;
    diaryId?: string;
    title: string;
    content: string;
    openDate: Date;
    type: TimeCapsuleData['type'];
    recipientEmail?: string;
    message?: string;
    media?: string[];
  }): Promise<TimeCapsuleData> {
    const capsule: TimeCapsuleData = {
      id: this.generateId(),
      diaryId: data.diaryId || this.generateId(),
      title: data.title,
      content: data.content,
      openDate: data.openDate,
      isOpened: false,
      reminderSent: false,
      recipientEmail: data.recipientEmail,
      message: data.message,
      media: data.media,
      createdAt: new Date(),
      type: data.type,
      notificationSettings: {
        email: !!data.recipientEmail,
        push: true,
        reminderDays: [30, 7, 1] // 提前30天、7天、1天提醒
      }
    };

    // 验证开启日期
    if (capsule.openDate <= new Date()) {
      throw new Error('开启日期必须是未来的时间');
    }

    // 保存到存储
    const capsules = await this.getAllCapsules(data.userId);
    capsules.push(capsule);
    this.saveCapsules(data.userId, capsules);

    // 设置提醒
    this.scheduleReminders(capsule);

    return capsule;
  }

  // 获取所有时间胶囊
  async getAllCapsules(userId: string): Promise<TimeCapsuleData[]> {
    const stored = localStorage.getItem(`${this.STORAGE_KEY}_${userId}`);
    if (stored) {
      const capsules = JSON.parse(stored);
      // 转换日期字符串
      return capsules.map((c: any) => ({
        ...c,
        openDate: new Date(c.openDate),
        createdAt: new Date(c.createdAt)
      }));
    }
    return [];
  }

  // 获取可以打开的胶囊
  async getOpenableCapsules(userId: string): Promise<TimeCapsuleData[]> {
    const capsules = await this.getAllCapsules(userId);
    const now = new Date();
    return capsules.filter(c => !c.isOpened && new Date(c.openDate) <= now);
  }

  // 获取即将开启的胶囊
  async getUpcomingCapsules(userId: string, days: number = 30): Promise<TimeCapsuleData[]> {
    const capsules = await this.getAllCapsules(userId);
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return capsules.filter(c => {
      const openDate = new Date(c.openDate);
      return !c.isOpened && openDate > now && openDate <= futureDate;
    }).sort((a, b) => new Date(a.openDate).getTime() - new Date(b.openDate).getTime());
  }

  // 打开时间胶囊
  async openCapsule(userId: string, capsuleId: string): Promise<TimeCapsuleData | null> {
    const capsules = await this.getAllCapsules(userId);
    const capsule = capsules.find(c => c.id === capsuleId);
    
    if (!capsule) {
      return null;
    }

    // 检查是否可以打开
    if (new Date(capsule.openDate) > new Date() && !this.isDebugMode()) {
      throw new Error('还没到开启时间');
    }

    if (capsule.isOpened) {
      throw new Error('这个时间胶囊已经打开过了');
    }

    // 标记为已打开
    capsule.isOpened = true;
    this.saveCapsules(userId, capsules);

    // 触发开启事件
    this.onCapsuleOpened(capsule);

    return capsule;
  }

  // 删除时间胶囊
  async deleteCapsule(userId: string, capsuleId: string): Promise<boolean> {
    const capsules = await this.getAllCapsules(userId);
    const index = capsules.findIndex(c => c.id === capsuleId);
    
    if (index === -1) {
      return false;
    }

    // 不能删除已经打开的胶囊
    if (capsules[index].isOpened) {
      throw new Error('不能删除已经打开的时间胶囊');
    }

    capsules.splice(index, 1);
    this.saveCapsules(userId, capsules);
    return true;
  }

  // 获取时间胶囊统计
  async getStatistics(userId: string): Promise<{
    total: number;
    opened: number;
    pending: number;
    upcoming30Days: number;
    typeDistribution: Record<string, number>;
    averageDaysToOpen: number;
  }> {
    const capsules = await this.getAllCapsules(userId);
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const opened = capsules.filter(c => c.isOpened);
    const pending = capsules.filter(c => !c.isOpened);
    const upcoming = pending.filter(c => {
      const openDate = new Date(c.openDate);
      return openDate <= thirtyDaysFromNow;
    });

    // 类型分布
    const typeDistribution: Record<string, number> = {};
    capsules.forEach(c => {
      typeDistribution[c.type] = (typeDistribution[c.type] || 0) + 1;
    });

    // 平均等待天数
    let totalDays = 0;
    let count = 0;
    capsules.forEach(c => {
      const created = new Date(c.createdAt);
      const open = new Date(c.openDate);
      const days = Math.floor((open.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      totalDays += days;
      count++;
    });

    return {
      total: capsules.length,
      opened: opened.length,
      pending: pending.length,
      upcoming30Days: upcoming.length,
      typeDistribution,
      averageDaysToOpen: count > 0 ? Math.round(totalDays / count) : 0
    };
  }

  // 设置提醒
  private scheduleReminders(capsule: TimeCapsuleData) {
    // 这里可以集成真实的通知服务
    // 现在使用本地存储记录提醒状态
    const reminders = this.getReminders();
    
    capsule.notificationSettings.reminderDays.forEach(days => {
      const reminderDate = new Date(capsule.openDate);
      reminderDate.setDate(reminderDate.getDate() - days);
      
      if (reminderDate > new Date()) {
        reminders.push({
          capsuleId: capsule.id,
          date: reminderDate.toISOString(),
          days,
          sent: false
        });
      }
    });

    localStorage.setItem('time_capsule_reminders', JSON.stringify(reminders));
  }

  // 获取所有提醒
  private getReminders(): any[] {
    const stored = localStorage.getItem('time_capsule_reminders');
    return stored ? JSON.parse(stored) : [];
  }

  // 检查并发送提醒
  private async checkAndSendReminders() {
    const reminders = this.getReminders();
    const now = new Date();
    let updated = false;

    reminders.forEach((reminder: any) => {
      if (!reminder.sent && new Date(reminder.date) <= now) {
        // 发送提醒（这里可以调用实际的通知API）
        console.log(`提醒：时间胶囊将在 ${reminder.days} 天后开启`);
        reminder.sent = true;
        updated = true;
      }
    });

    if (updated) {
      localStorage.setItem('time_capsule_reminders', JSON.stringify(reminders));
    }
  }

  // 定期检查
  private startPeriodicCheck() {
    // 清理现有定时器
    this.stopPeriodicCheck();

    // 每小时检查一次
    this.checkInterval = setInterval(() => {
      this.checkAndSendReminders();
      this.checkOpenableCapsules();
    }, 60 * 60 * 1000);

    // 立即执行一次
    this.checkAndSendReminders();
    this.checkOpenableCapsules();
  }

  // 停止定期检查
  private stopPeriodicCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // 清理资源
  public cleanup() {
    this.stopPeriodicCheck();
  }

  // 检查可打开的胶囊
  private async checkOpenableCapsules() {
    // 获取所有用户ID（实际应用中从认证系统获取）
    const userIds = this.getAllUserIds();
    
    for (const userId of userIds) {
      const openable = await this.getOpenableCapsules(userId);
      if (openable.length > 0) {
        // 发送通知
        this.notifyOpenableCapsules(userId, openable);
      }
    }
  }

  // 获取所有用户ID（模拟）
  private getAllUserIds(): string[] {
    // 实际应用中应该从数据库获取
    return ['demo-user'];
  }

  // 通知可打开的胶囊
  private notifyOpenableCapsules(userId: string, capsules: TimeCapsuleData[]) {
    capsules.forEach(capsule => {
      if (!capsule.reminderSent) {
        console.log(`用户 ${userId} 的时间胶囊 "${capsule.title}" 可以打开了！`);
        // 标记为已发送提醒
        capsule.reminderSent = true;
      }
    });

    // 保存更新
    this.getAllCapsules(userId).then(allCapsules => {
      const updated = allCapsules.map(c => {
        const openable = capsules.find(oc => oc.id === c.id);
        if (openable) {
          c.reminderSent = true;
        }
        return c;
      });
      this.saveCapsules(userId, updated);
    });
  }

  // 胶囊打开事件
  private onCapsuleOpened(capsule: TimeCapsuleData) {
    // 可以在这里添加统计、分析等逻辑
    console.log(`时间胶囊 "${capsule.title}" 已打开`);
    
    // 触发成就检查等
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('timeCapsuleOpened', { 
        detail: capsule 
      }));
    }
  }

  // 保存胶囊数据
  private saveCapsules(userId: string, capsules: TimeCapsuleData[]): void {
    localStorage.setItem(`${this.STORAGE_KEY}_${userId}`, JSON.stringify(capsules));
  }

  // 生成唯一ID
  private generateId(): string {
    return `capsule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 调试模式
  private isDebugMode(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  // 清理服务
  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }
}

// 导出单例实例
export const timeCapsuleService = new TimeCapsuleService();