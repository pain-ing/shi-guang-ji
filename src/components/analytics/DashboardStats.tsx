'use client';

import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  BookOpen, 
  Heart, 
  Camera, 
  TrendingUp,
  Calendar,
  Target
} from 'lucide-react';

interface StatsData {
  totalEntries: number;
  avgMood: number;
  totalPhotos: number;
  streakDays: number;
  monthlyGrowth: number;
  completionRate: number;
}

interface DashboardStatsProps {
  data: StatsData;
}

const StatCard = memo<{
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ElementType;
  iconColor: string;
}>(({ title, value, change, changeType = 'neutral', icon: Icon, iconColor }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {change && (
            <div className={`flex items-center text-sm mt-1 ${
              changeType === 'positive' ? 'text-green-500' : 
              changeType === 'negative' ? 'text-red-500' : 
              'text-gray-500'
            }`}>
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>{change}</span>
            </div>
          )}
        </div>
        <Icon className={`w-8 h-8 ${iconColor}`} />
      </div>
    </CardContent>
  </Card>
));

StatCard.displayName = 'StatCard';

export const DashboardStats = memo<DashboardStatsProps>(({ data }) => {
  const stats = [
    {
      title: '总日记数',
      value: data.totalEntries,
      change: `+${data.monthlyGrowth}%`,
      changeType: 'positive' as const,
      icon: BookOpen,
      iconColor: 'text-blue-500'
    },
    {
      title: '平均心情',
      value: `${data.avgMood}/10`,
      change: data.avgMood >= 7 ? '心情不错' : '需要关注',
      changeType: data.avgMood >= 7 ? 'positive' as const : 'neutral' as const,
      icon: Heart,
      iconColor: 'text-red-500'
    },
    {
      title: '照片记录',
      value: data.totalPhotos,
      change: '本月新增',
      changeType: 'neutral' as const,
      icon: Camera,
      iconColor: 'text-green-500'
    },
    {
      title: '连续天数',
      value: `${data.streakDays}天`,
      change: data.streakDays >= 7 ? '坚持得很好' : '继续加油',
      changeType: data.streakDays >= 7 ? 'positive' as const : 'neutral' as const,
      icon: Calendar,
      iconColor: 'text-purple-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          changeType={stat.changeType}
          icon={stat.icon}
          iconColor={stat.iconColor}
        />
      ))}
    </div>
  );
});

DashboardStats.displayName = 'DashboardStats';
