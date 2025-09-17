'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  BarChart3,
  PieChart,
  Brain,
  Heart,
  BookOpen,
  Camera,
  Music,
  MapPin,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  Sparkles
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Area,
  AreaChart
} from 'recharts';
import { motion } from 'framer-motion';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subDays, startOfMonth } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface DashboardProps {
  userId: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// 模拟数据生成
const generateMockData = () => {
  // 情绪数据
  const emotions = ['快乐', '平静', '感恩', '忧伤', '焦虑', '兴奋'];
  const emotionData = emotions.map(emotion => ({
    name: emotion,
    value: Math.floor(Math.random() * 30) + 10,
    percentage: 0
  }));
  const total = emotionData.reduce((sum, item) => sum + item.value, 0);
  emotionData.forEach(item => {
    item.percentage = Math.round((item.value / total) * 100);
  });

  // 每日写作趋势（最近30天）
  const dailyData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: format(date, 'MM-dd'),
      fullDate: date,
      entries: Math.random() > 0.3 ? Math.floor(Math.random() * 3) + 1 : 0,
      words: Math.floor(Math.random() * 1000) + 200,
      mood: Math.floor(Math.random() * 10) + 1
    };
  });

  // 写作时段分布
  const timeDistribution = [
    { time: '凌晨', hours: '00-06', count: 5 },
    { time: '早晨', hours: '06-09', count: 25 },
    { time: '上午', hours: '09-12', count: 30 },
    { time: '下午', hours: '12-18', count: 45 },
    { time: '晚上', hours: '18-22', count: 60 },
    { time: '深夜', hours: '22-24', count: 20 }
  ];

  // 标签云数据
  const tags = [
    { text: '工作', value: 35 },
    { text: '生活', value: 30 },
    { text: '学习', value: 25 },
    { text: '旅行', value: 20 },
    { text: '美食', value: 18 },
    { text: '运动', value: 15 },
    { text: '读书', value: 12 },
    { text: '电影', value: 10 },
    { text: '音乐', value: 8 },
    { text: '朋友', value: 8 }
  ];

  // 媒体统计
  const mediaStats = {
    photos: 156,
    audios: 23,
    videos: 8,
    drawings: 12
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
};

export const Dashboard: React.FC<DashboardProps> = ({ userId, dateRange }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [data, setData] = useState<any>(null);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    // 加载数据
    const mockData = generateMockData();
    setData(mockData);
    
    // 生成洞察
    generateInsights(mockData);
  }, [selectedPeriod]);

  // 生成智能洞察
  const generateInsights = (data: any) => {
    const newInsights = [];
    
    // 情绪洞察
    const dominantEmotion = data.emotionData.reduce((max: any, item: any) => 
      item.value > (max?.value || 0) ? item : max, null);
    if (dominantEmotion) {
      newInsights.push(`最近你的主要情绪是${dominantEmotion.name}，占比${dominantEmotion.percentage}%`);
    }

    // 写作习惯洞察
    const avgWords = Math.round(data.dailyData.reduce((sum: number, day: any) => 
      sum + day.words, 0) / data.dailyData.length);
    newInsights.push(`你平均每天写${avgWords}字，保持得不错！`);

    // 时间偏好洞察
    const preferredTime = data.timeDistribution.reduce((max: any, item: any) => 
      item.count > (max?.count || 0) ? item : max, null);
    if (preferredTime) {
      newInsights.push(`你最喜欢在${preferredTime.time}写日记`);
    }

    // 连续写作洞察
    let maxStreak = 0;
    let currentStreak = 0;
    data.dailyData.forEach((day: any) => {
      if (day.entries > 0) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });
    if (maxStreak > 3) {
      newInsights.push(`最近30天最长连续写作${maxStreak}天，继续加油！`);
    }

    setInsights(newInsights);
  };

  if (!data) {
    return <div>加载中...</div>;
  }

  // 情绪配色
  const emotionColors = {
    '快乐': '#FFD93D',
    '平静': '#6BCF7E',
    '感恩': '#FF6B6B',
    '忧伤': '#4ECDC4',
    '焦虑': '#95A5A6',
    '兴奋': '#FFA502'
  };

  return (
    <div className="space-y-6">
      {/* 顶部统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">总日记数</p>
                <p className="text-2xl font-bold">342</p>
                <div className="flex items-center text-green-500 text-sm mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>+12%</span>
                </div>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">总字数</p>
                <p className="text-2xl font-bold">128.5k</p>
                <div className="flex items-center text-green-500 text-sm mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>+8%</span>
                </div>
              </div>
              <Activity className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">平均心情</p>
                <p className="text-2xl font-bold">8.2/10</p>
                <div className="flex items-center text-green-500 text-sm mt-1">
                  <Heart className="w-4 h-4 mr-1" />
                  <span>积极</span>
                </div>
              </div>
              <Heart className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">连续天数</p>
                <p className="text-2xl font-bold">15天</p>
                <Progress value={50} className="h-1 mt-2" />
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI 洞察 */}
      {insights.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI 洞察
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-2"
                >
                  <Sparkles className="w-4 h-4 text-purple-500 mt-0.5" />
                  <p className="text-sm">{insight}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 情绪分布饼图 */}
        <Card>
          <CardHeader>
            <CardTitle>情绪分布</CardTitle>
            <CardDescription>最近30天的情绪记录</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={data.emotionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.emotionData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={emotionColors[entry.name as keyof typeof emotionColors] || '#8884d8'} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 写作趋势折线图 */}
        <Card>
          <CardHeader>
            <CardTitle>写作趋势</CardTitle>
            <CardDescription>每日写作字数变化</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="words" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 写作时段分布 */}
        <Card>
          <CardHeader>
            <CardTitle>写作时段分布</CardTitle>
            <CardDescription>你在一天中不同时段的写作频率</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.timeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 媒体使用统计 */}
        <Card>
          <CardHeader>
            <CardTitle>媒体使用统计</CardTitle>
            <CardDescription>日记中包含的媒体类型</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-500" />
                  <span>照片</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{data.mediaStats.photos}</span>
                  <Progress value={75} className="w-20 h-2" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music className="w-5 h-5 text-green-500" />
                  <span>音频</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{data.mediaStats.audios}</span>
                  <Progress value={25} className="w-20 h-2" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-500" />
                  <span>视频</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{data.mediaStats.videos}</span>
                  <Progress value={10} className="w-20 h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 标签云 */}
      <Card>
        <CardHeader>
          <CardTitle>热门标签</CardTitle>
          <CardDescription>你最常使用的标签</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {data.tags.map((tag: any) => {
              const size = tag.value > 25 ? 'lg' : tag.value > 15 ? 'default' : 'sm';
              const opacity = tag.value / 35; // 根据值调整透明度
              return (
                <Badge
                  key={tag.text}
                  variant="secondary"
                  className={`
                    ${size === 'lg' ? 'text-lg px-4 py-2' : size === 'default' ? 'text-base px-3 py-1' : 'text-sm px-2 py-1'}
                    hover:scale-110 transition-transform cursor-pointer
                  `}
                  style={{ opacity: 0.5 + opacity * 0.5 }}
                >
                  #{tag.text}
                  <span className="ml-1 text-xs">({tag.value})</span>
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 天气与心情关联 */}
      <Card>
        <CardHeader>
          <CardTitle>天气与心情</CardTitle>
          <CardDescription>不同天气下的平均心情指数</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.weatherMood.map((item: any) => {
              const WeatherIcon = 
                item.weather === '晴天' ? Sun :
                item.weather === '多云' ? Cloud :
                item.weather === '雨天' ? CloudRain : Cloud;
              
              return (
                <div key={item.weather} className="text-center">
                  <WeatherIcon className="w-12 h-12 mx-auto mb-2 text-blue-500" />
                  <p className="font-semibold">{item.weather}</p>
                  <p className="text-2xl font-bold">{item.avgMood}</p>
                  <p className="text-sm text-gray-500">{item.count}天</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;