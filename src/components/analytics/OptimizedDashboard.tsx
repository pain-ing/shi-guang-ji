'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Download,
  Share2,
  Filter
} from 'lucide-react';
import { DashboardStats } from './DashboardStats';
import { DashboardCharts } from './DashboardCharts';
import { DashboardInsights } from './DashboardInsights';

interface DashboardProps {
  userId: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

interface DashboardData {
  emotionData: Array<{ name: string; value: number; percentage: number }>;
  dailyData: Array<{ date: string; entries: number; mood: number; words: number }>;
  timeDistribution: Array<{ time: string; count: number }>;
  tags: Array<{ name: string; count: number }>;
  mediaStats: {
    photos: number;
    videos: number;
    audio: number;
  };
  weatherMood: Array<{ weather: string; avgMood: number; count: number }>;
}

// 生成模拟数据的 hook
const useDashboardData = (userId: string, selectedPeriod: string) => {
  return useMemo(() => {
    // 情绪数据
    const emotionData = [
      { name: '开心', value: 45, percentage: 35 },
      { name: '平静', value: 30, percentage: 25 },
      { name: '兴奋', value: 25, percentage: 20 },
      { name: '焦虑', value: 15, percentage: 12 },
      { name: '悲伤', value: 8, percentage: 6 },
      { name: '愤怒', value: 2, percentage: 2 }
    ];

    // 每日数据
    const dailyData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        entries: Math.floor(Math.random() * 3) + 1,
        mood: Math.floor(Math.random() * 4) + 6,
        words: Math.floor(Math.random() * 400) + 100
      };
    });

    // 时间分布
    const timeDistribution = [
      { time: '早晨', count: 25 },
      { time: '上午', count: 15 },
      { time: '下午', count: 20 },
      { time: '傍晚', count: 35 },
      { time: '夜晚', count: 30 }
    ];

    // 标签数据
    const tags = [
      { name: '工作', count: 45 },
      { name: '生活', count: 38 },
      { name: '学习', count: 32 },
      { name: '旅行', count: 28 },
      { name: '健康', count: 25 },
      { name: '家庭', count: 22 },
      { name: '朋友', count: 18 },
      { name: '爱好', count: 15 }
    ];

    // 媒体统计
    const mediaStats = {
      photos: 156,
      videos: 23,
      audio: 8
    };

    // 天气心情关联
    const weatherMood = [
      { weather: '晴天', avgMood: 8.5, count: 45 },
      { weather: '多云', avgMood: 7.2, count: 30 },
      { weather: '雨天', avgMood: 6.8, count: 20 },
      { weather: '雪天', avgMood: 8.0, count: 5 }
    ];

    return {
      emotionData,
      dailyData,
      timeDistribution,
      tags,
      mediaStats,
      weatherMood
    };
  }, [userId, selectedPeriod]);
};

// 统计数据计算 hook
const useStatsData = (data: DashboardData) => {
  return useMemo(() => {
    const totalEntries = data.dailyData.reduce((sum, day) => sum + day.entries, 0);
    const avgMood = data.dailyData.reduce((sum, day) => sum + day.mood, 0) / data.dailyData.length;
    const totalPhotos = data.mediaStats.photos;
    
    // 计算连续天数
    let streakDays = 0;
    for (let i = data.dailyData.length - 1; i >= 0; i--) {
      if (data.dailyData[i].entries > 0) {
        streakDays++;
      } else {
        break;
      }
    }

    return {
      totalEntries,
      avgMood: Math.round(avgMood * 10) / 10,
      totalPhotos,
      streakDays,
      monthlyGrowth: 12, // 模拟数据
      completionRate: 85 // 模拟数据
    };
  }, [data]);
};

export const OptimizedDashboard: React.FC<DashboardProps> = ({ userId, dateRange }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [activeTab, setActiveTab] = useState('overview');

  // 使用优化的数据获取
  const dashboardData = useDashboardData(userId, selectedPeriod);
  const statsData = useStatsData(dashboardData);

  // 导出数据处理
  const handleExportData = useCallback(() => {
    const dataToExport = {
      period: selectedPeriod,
      exportDate: new Date().toISOString(),
      stats: statsData,
      data: dashboardData
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-data-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [selectedPeriod, statsData, dashboardData]);

  // 分享数据处理
  const handleShareData = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '我的日记数据分析',
          text: `我在过去${selectedPeriod === 'week' ? '一周' : selectedPeriod === 'month' ? '一个月' : '一年'}写了${statsData.totalEntries}篇日记，平均心情指数${statsData.avgMood}/10`,
          url: window.location.href
        });
      } catch (error) {
        console.log('分享失败:', error);
      }
    } else {
      // 降级到复制链接
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
    }
  }, [selectedPeriod, statsData]);

  return (
    <div className="space-y-6">
      {/* 顶部控制栏 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">本周</SelectItem>
              <SelectItem value="month">本月</SelectItem>
              <SelectItem value="year">本年</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            筛选
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportData}>
            <Download className="w-4 h-4 mr-2" />
            导出
          </Button>
          <Button variant="outline" size="sm" onClick={handleShareData}>
            <Share2 className="w-4 h-4 mr-2" />
            分享
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <DashboardStats data={statsData} />

      {/* 标签页内容 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="charts">图表</TabsTrigger>
          <TabsTrigger value="insights">洞察</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <DashboardCharts 
            emotionData={dashboardData.emotionData}
            dailyData={dashboardData.dailyData}
            timeDistribution={dashboardData.timeDistribution}
          />
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          <DashboardCharts 
            emotionData={dashboardData.emotionData}
            dailyData={dashboardData.dailyData}
            timeDistribution={dashboardData.timeDistribution}
          />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <DashboardInsights data={dashboardData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OptimizedDashboard;
