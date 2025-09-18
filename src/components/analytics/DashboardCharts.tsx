'use client';

import React, { memo, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ResponsiveContainer, 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';

interface EmotionData {
  name: string;
  value: number;
  percentage: number;
}

interface DailyData {
  date: string;
  entries: number;
  mood: number;
  words: number;
}

interface TimeDistribution {
  time: string;
  count: number;
}

interface DashboardChartsProps {
  emotionData: EmotionData[];
  dailyData: DailyData[];
  timeDistribution: TimeDistribution[];
}

const emotionColors = {
  '开心': '#10B981',
  '平静': '#3B82F6', 
  '兴奋': '#F59E0B',
  '焦虑': '#EF4444',
  '悲伤': '#6B7280',
  '愤怒': '#DC2626'
};

// 情绪分布饼图
const EmotionChart = memo<{ data: EmotionData[] }>(({ data }) => {
  const chartData = useMemo(() => data, [data]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>情绪分布</CardTitle>
        <CardDescription>最近30天的情绪记录</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RePieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name} ${percentage}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={emotionColors[entry.name as keyof typeof emotionColors] || '#8884d8'} 
                />
              ))}
            </Pie>
            <Tooltip />
          </RePieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});

// 每日趋势图
const DailyTrendChart = memo<{ data: DailyData[] }>(({ data }) => {
  const chartData = useMemo(() => 
    data.slice(-14), // 只显示最近14天
    [data]
  );
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>写作趋势</CardTitle>
        <CardDescription>最近两周的日记记录</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <Line 
              type="monotone" 
              dataKey="entries" 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={{ r: 4 }}
              name="日记数量"
            />
            <Line 
              type="monotone" 
              dataKey="mood" 
              stroke="#10B981" 
              strokeWidth={2}
              dot={{ r: 4 }}
              name="心情指数"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});

// 时间分布图
const TimeDistributionChart = memo<{ data: TimeDistribution[] }>(({ data }) => {
  const chartData = useMemo(() => data, [data]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>写作时间偏好</CardTitle>
        <CardDescription>不同时间段的写作频率</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Bar 
              dataKey="count" 
              fill="#8B5CF6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});

EmotionChart.displayName = 'EmotionChart';
DailyTrendChart.displayName = 'DailyTrendChart';
TimeDistributionChart.displayName = 'TimeDistributionChart';

export const DashboardCharts = memo<DashboardChartsProps>(({ 
  emotionData, 
  dailyData, 
  timeDistribution 
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <EmotionChart data={emotionData} />
      <DailyTrendChart data={dailyData} />
      <div className="lg:col-span-2">
        <TimeDistributionChart data={timeDistribution} />
      </div>
    </div>
  );
});

DashboardCharts.displayName = 'DashboardCharts';
