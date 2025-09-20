'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Flame, 
  Calendar,
  TrendingUp,
  Award,
  Target,
  Star,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { habitTrackingService } from '@/services/habit';
import { HabitTracking, Achievement } from '@/types/features';

interface HabitTrackerProps {
  userId: string;
  onWriteEntry?: () => void;
}

export const HabitTracker: React.FC<HabitTrackerProps> = ({ 
  userId,
  onWriteEntry 
}) => {
  const [tracking, setTracking] = useState<HabitTracking | null>(null);
  const [todayStatus, setTodayStatus] = useState<{
    hasWrittenToday: boolean;
    currentStreak: number;
    nextMilestone: number;
  } | null>(null);
  const [achievementProgress, setAchievementProgress] = useState<Map<string, number>>(new Map());
  const [selectedTab, setSelectedTab] = useState<'overview' | 'achievements' | 'statistics'>('overview');
  const [showCelebration, setShowCelebration] = useState(false);

  // 加载习惯数据
  useEffect(() => {
    loadTrackingData();
  }, [userId]);

  const loadTrackingData = async () => {
    const data = await habitTrackingService.getTrackingData(userId);
    const status = await habitTrackingService.getTodayStatus(userId);
    const progress = habitTrackingService.getAchievementProgress(data);
    
    setTracking(data);
    setTodayStatus(status);
    setAchievementProgress(progress);
  };

  // 模拟写入日记（实际使用时应该在真实写入后调用）
  const handleSimulateEntry = async () => {
    const newTracking = await habitTrackingService.updateTracking(userId, {
      wordCount: Math.floor(Math.random() * 500) + 100,
      tags: ['日常', '思考'],
      emotion: 'happy',
      createdAt: new Date()
    });

    // 检查是否有新成就
    if (newTracking.achievements.length > (tracking?.achievements.length || 0)) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }

    await loadTrackingData();
    onWriteEntry?.();
  };

  if (!tracking || !todayStatus) {
    return <div>加载中...</div>;
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* 今日状态卡片 */}
      <Card className={todayStatus.hasWrittenToday ? 'border-green-500' : 'border-yellow-500'}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>今日状态</span>
            {todayStatus.hasWrittenToday ? (
              <Badge className="bg-green-500 text-white">
                <CheckCircle className="w-4 h-4 mr-1" />
                已完成
              </Badge>
            ) : (
              <Badge className="bg-yellow-500 text-white">
                待写作
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <Flame className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold">{todayStatus.currentStreak}</div>
              <div className="text-sm text-gray-500">连续天数</div>
            </div>
            <div className="text-center">
              <Target className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{todayStatus.nextMilestone}</div>
              <div className="text-sm text-gray-500">下个目标</div>
            </div>
          </div>
          
          {/* 进度条 */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>距离下个里程碑</span>
              <span>{todayStatus.currentStreak} / {todayStatus.nextMilestone}</span>
            </div>
            <Progress 
              value={(todayStatus.currentStreak / todayStatus.nextMilestone) * 100} 
              className="h-2"
            />
          </div>

          {!todayStatus.hasWrittenToday && (
            <Button 
              onClick={handleSimulateEntry}
              className="w-full mt-4"
            >
              开始今日写作
            </Button>
          )}
        </CardContent>
      </Card>

      {/* 统计概览 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{tracking.totalEntries}</div>
            <div className="text-sm text-gray-500">总篇数</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {Math.round(tracking.statistics.totalWords / 1000)}k
            </div>
            <div className="text-sm text-gray-500">总字数</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {tracking.statistics.averageWordsPerEntry}
            </div>
            <div className="text-sm text-gray-500">平均字数</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{tracking.achievements.length}</div>
            <div className="text-sm text-gray-500">成就数</div>
          </CardContent>
        </Card>
      </div>

      {/* 写作习惯 */}
      <Card>
        <CardHeader>
          <CardTitle>写作习惯</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">最爱写作时间</span>
              <Badge variant="outline">{tracking.statistics.favoriteWritingTime}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">最高产日期</span>
              <Badge variant="outline">{tracking.statistics.mostProductiveDay}</Badge>
            </div>
            <div>
              <span className="text-sm">热门标签</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {tracking.statistics.topTags.slice(0, 5).map(tag => (
                  <Badge key={tag} variant="secondary">#{tag}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAchievements = () => {
    const tierColors = {
      bronze: 'bg-orange-100 text-orange-800 border-orange-300',
      silver: 'bg-gray-100 text-gray-800 border-gray-300',
      gold: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      platinum: 'bg-purple-100 text-purple-800 border-purple-300'
    };

    // 分组成就
    const unlockedAchievements = tracking.achievements;
    const allAchievements = [
      { category: '连续写作', ids: ['streak_3', 'streak_7', 'streak_30', 'streak_100', 'streak_365'] },
      { category: '总数成就', ids: ['total_10', 'total_50', 'total_100', 'total_500'] },
      { category: '字数成就', ids: ['words_1k', 'words_10k', 'words_100k'] }
    ];

    return (
      <div className="space-y-6">
        {allAchievements.map(({ category, ids }) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-lg">{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {ids.map(id => {
                  const achievement = unlockedAchievements.find(a => a.id === id);
                  const progress = achievementProgress.get(id) || 0;
                  const isUnlocked = !!achievement;

                  return (
                    <motion.div
                      key={id}
                      whileHover={{ scale: 1.05 }}
                      className={`
                        p-4 rounded-lg border-2 text-center
                        ${isUnlocked 
                          ? tierColors[achievement.tier || 'bronze']
                          : 'bg-gray-50 border-gray-200 opacity-60'
                        }
                      `}
                    >
                      <div className="text-3xl mb-2">
                        {isUnlocked ? achievement.icon : '🔒'}
                      </div>
                      <div className="font-semibold text-sm">
                        {achievement?.name || '未解锁'}
                      </div>
                      {!isUnlocked && (
                        <Progress 
                          value={progress * 100} 
                          className="h-1 mt-2"
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderStatistics = () => {
    const emotions = Object.entries(tracking.statistics.emotionDistribution || {});
    const maxEmotion = Math.max(...emotions.map(([_, count]) => count), 1);

    return (
      <div className="space-y-6">
        {/* 情绪分布 */}
        <Card>
          <CardHeader>
            <CardTitle>情绪记录</CardTitle>
            <CardDescription>你的情绪变化趋势</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {emotions.map(([emotion, count]) => (
                <div key={emotion} className="flex items-center gap-3">
                  <span className="w-20 text-sm">{emotion}</span>
                  <div className="flex-1">
                    <div 
                      className="h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded"
                      style={{ width: `${(count / maxEmotion) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 月度热力图 */}
        <Card>
          <CardHeader>
            <CardTitle>写作热力图</CardTitle>
            <CardDescription>最近30天的写作记录</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 30 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (29 - i));
                const hasEntry = Math.random() > 0.3; // 模拟数据
                
                return (
                  <div
                    key={i}
                    className={`
                      aspect-square rounded
                      ${hasEntry 
                        ? 'bg-green-500' 
                        : 'bg-gray-200 dark:bg-gray-700'
                      }
                    `}
                    title={date.toLocaleDateString()}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-end gap-2 mt-4 text-xs">
              <span>少</span>
              <div className="flex gap-1">
                <div className="w-4 h-4 bg-gray-200 rounded" />
                <div className="w-4 h-4 bg-green-200 rounded" />
                <div className="w-4 h-4 bg-green-400 rounded" />
                <div className="w-4 h-4 bg-green-600 rounded" />
              </div>
              <span>多</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">习惯追踪</h2>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={selectedTab === 'overview' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('overview')}
          >
            <TrendingUp className="w-4 h-4 mr-1" />
            概览
          </Button>
          <Button
            size="sm"
            variant={selectedTab === 'achievements' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('achievements')}
          >
            <Trophy className="w-4 h-4 mr-1" />
            成就
          </Button>
          <Button
            size="sm"
            variant={selectedTab === 'statistics' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('statistics')}
          >
            <Award className="w-4 h-4 mr-1" />
            统计
          </Button>
        </div>
      </div>

      {/* 内容区域 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {selectedTab === 'overview' && renderOverview()}
          {selectedTab === 'achievements' && renderAchievements()}
          {selectedTab === 'statistics' && renderStatistics()}
        </motion.div>
      </AnimatePresence>

      {/* 成就解锁庆祝动画 */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
              <h3 className="text-2xl font-bold text-center">成就解锁！</h3>
              <p className="text-gray-500 text-center mt-2">继续加油！</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HabitTracker;