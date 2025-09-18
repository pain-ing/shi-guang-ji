'use client';

import React, { memo, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  TrendingUp, 
  Clock,
  Heart,
  Target,
  Award
} from 'lucide-react';

interface InsightData {
  emotionData: Array<{ name: string; value: number; percentage: number }>;
  dailyData: Array<{ date: string; entries: number; mood: number; words: number }>;
  timeDistribution: Array<{ time: string; count: number }>;
  tags: Array<{ name: string; count: number }>;
}

interface DashboardInsightsProps {
  data: InsightData;
}

interface Insight {
  type: 'emotion' | 'habit' | 'time' | 'streak' | 'achievement';
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  priority: number;
}

export const DashboardInsights = memo<DashboardInsightsProps>(({ data }) => {
  const insights = useMemo(() => {
    const generatedInsights: Insight[] = [];

    // 情绪洞察
    const dominantEmotion = data.emotionData.reduce((max, item) =>
      item.value > (max?.value || 0) ? item : max, data.emotionData[0] || null);
    
    if (dominantEmotion) {
      generatedInsights.push({
        type: 'emotion',
        title: '情绪趋势',
        description: `最近你的主要情绪是${dominantEmotion.name}，占比${dominantEmotion.percentage}%`,
        icon: Heart,
        color: 'text-red-500',
        priority: 1
      });
    }

    // 写作习惯洞察
    const avgWords = Math.round(
      data.dailyData.reduce((sum, day) => sum + day.words, 0) / data.dailyData.length
    );
    
    generatedInsights.push({
      type: 'habit',
      title: '写作习惯',
      description: `你平均每天写${avgWords}字，${avgWords > 200 ? '保持得不错！' : '可以尝试写得更多一些'}`,
      icon: TrendingUp,
      color: 'text-blue-500',
      priority: 2
    });

    // 时间偏好洞察
    const preferredTime = data.timeDistribution.length > 0
      ? data.timeDistribution.reduce((max, item) =>
          item.count > max.count ? item : max)
      : null;
    
    if (preferredTime) {
      generatedInsights.push({
        type: 'time',
        title: '时间偏好',
        description: `你最喜欢在${preferredTime.time}写日记，这是你的黄金时间`,
        icon: Clock,
        color: 'text-purple-500',
        priority: 3
      });
    }

    // 连续写作洞察
    let maxStreak = 0;
    let currentStreak = 0;
    
    data.dailyData.forEach((day) => {
      if (day.entries > 0) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });

    if (maxStreak > 0) {
      generatedInsights.push({
        type: 'streak',
        title: '坚持记录',
        description: `你的最长连续写作记录是${maxStreak}天，${maxStreak >= 7 ? '坚持得很棒！' : '继续努力，目标一周连续写作'}`,
        icon: Target,
        color: 'text-green-500',
        priority: 4
      });
    }

    // 成就洞察
    const totalEntries = data.dailyData.reduce((sum, day) => sum + day.entries, 0);
    const achievements = [];
    
    if (totalEntries >= 100) achievements.push('百篇达人');
    if (maxStreak >= 30) achievements.push('月度坚持者');
    if (avgWords >= 500) achievements.push('文字大师');
    
    if (achievements.length > 0) {
      generatedInsights.push({
        type: 'achievement',
        title: '成就解锁',
        description: `恭喜你获得了：${achievements.join('、')}`,
        icon: Award,
        color: 'text-yellow-500',
        priority: 0
      });
    }

    // 按优先级排序
    return generatedInsights.sort((a, b) => a.priority - b.priority);
  }, [data]);

  const topTags = useMemo(() => 
    data.tags.slice(0, 5), 
    [data.tags]
  );

  return (
    <div className="space-y-6">
      {/* 智能洞察 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            智能洞察
          </CardTitle>
          <CardDescription>基于你的写作数据生成的个性化分析</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <insight.icon className={`w-5 h-5 mt-0.5 ${insight.color}`} />
                <div>
                  <h4 className="font-medium text-sm">{insight.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {insight.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 热门标签 */}
      <Card>
        <CardHeader>
          <CardTitle>热门标签</CardTitle>
          <CardDescription>你最常使用的标签</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {topTags.map((tag, index) => (
              <Badge 
                key={tag.name} 
                variant={index < 3 ? "default" : "secondary"}
                className="text-sm"
              >
                {tag.name} ({tag.count})
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

DashboardInsights.displayName = 'DashboardInsights';
