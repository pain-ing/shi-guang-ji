'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import dynamic from 'next/dynamic';
import { 
  Sparkles, 
  Lock, 
  Mic, 
  Camera,
  BarChart,
  Clock,
  Map,
  Share,
  Palette,
  Settings
} from 'lucide-react';

// 动态导入组件（避免初始加载过大）
const AIWritingAssistant = dynamic(() => import('@/components/ai/AIWritingAssistant'), {
  loading: () => <div>加载 AI 助手...</div>
});

const AudioRecorder = dynamic(() => import('@/components/media/AudioRecorder'), {
  loading: () => <div>加载音频录制器...</div>
});

const HabitTracker = dynamic(() => import('@/components/analytics/HabitTracker'), {
  loading: () => <div>加载习惯追踪器...</div>
});

const TimeCapsuleManager = dynamic(() => import('@/components/timeCapsule/TimeCapsuleManager'), {
  loading: () => <div>加载时间胶囊...</div>
});

const Dashboard = dynamic(() => import('@/components/analytics/Dashboard'), {
  loading: () => <div>加载分析仪表盘...</div>
});

const ThemeSelector = dynamic(() => import('@/components/theme/ThemeSelector'), {
  loading: () => <div>加载主题选择器...</div>
});

const MapView = dynamic(() => import('@/components/location/MapView'), {
  loading: () => <div>加载地图视图...</div>
});

const ShareCardGenerator = dynamic(() => import('@/components/share/ShareCardGenerator'), {
  loading: () => <div>加载分享卡片生成器...</div>
});

// 功能卡片组件
const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  status, 
  onClick 
}: {
  icon: any;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'planned';
  onClick?: () => void;
}) => {
  const statusColors = {
    'completed': 'bg-green-500',
    'in-progress': 'bg-yellow-500',
    'planned': 'bg-gray-400'
  };

  const statusLabels = {
    'completed': '已完成',
    'in-progress': '开发中',
    'planned': '计划中'
  };

  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <Icon className="w-8 h-8 text-primary" />
          <Badge className={`${statusColors[status]} text-white`}>
            {statusLabels[status]}
          </Badge>
        </div>
        <CardTitle className="mt-4">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );
};

// 定义功能项类型
type FeatureItem = {
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'planned';
  demo?: string;
};

type FeatureCategory = {
  category: string;
  icon: any;
  items: FeatureItem[];
};

export default function FeaturesPage() {
  const [content, setContent] = useState('');
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  const features: FeatureCategory[] = [
    {
      category: 'AI 智能',
      icon: Sparkles,
      items: [
        {
          title: 'AI 写作助手',
          description: '智能续写、情绪识别、标签生成、语音输入',
          status: 'completed' as const,
          demo: 'ai-assistant'
        },
        {
          title: '智能问答',
          description: '基于历史日记的个人助手',
          status: 'planned' as const
        },
        {
          title: 'AI 配图生成',
          description: '根据日记内容生成配图',
          status: 'planned' as const
        }
      ]
    },
    {
      category: '数据安全',
      icon: Lock,
      items: [
        {
          title: '端到端加密',
          description: 'AES-256 加密保护隐私',
          status: 'completed' as const,
          demo: 'encryption'
        },
        {
          title: '生物识别',
          description: '指纹/面部识别解锁',
          status: 'completed' as const
        },
        {
          title: '隐私模式',
          description: '特定日记需密码访问',
          status: 'completed' as const
        }
      ]
    },
    {
      category: '富媒体',
      icon: Camera,
      items: [
        {
          title: '音频录制',
          description: '支持背景音乐的音频日记',
          status: 'completed' as const,
          demo: 'audio-recorder'
        },
        {
          title: '视频日记',
          description: '记录生活片段',
          status: 'in-progress' as const
        },
        {
          title: '图片编辑器',
          description: '滤镜、裁剪、贴纸',
          status: 'in-progress' as const
        },
        {
          title: '手写画板',
          description: '支持手写和绘画',
          status: 'planned' as const
        }
      ]
    },
    {
      category: '智能分析',
      icon: BarChart,
      items: [
        {
          title: '情绪追踪',
          description: '情绪曲线和分析',
          status: 'completed' as const,
          demo: 'dashboard'
        },
        {
          title: '习惯养成',
          description: '打卡和成就系统',
          status: 'completed' as const,
          demo: 'habit-tracker'
        },
        {
          title: '年度报告',
          description: '精美的年度总结',
          status: 'planned' as const
        }
      ]
    },
    {
      category: '时间胶囊',
      icon: Clock,
      items: [
        {
          title: '未来信件',
          description: '写给未来的自己',
          status: 'completed' as const,
          demo: 'time-capsule'
        },
        {
          title: '定时开启',
          description: '特定日期才能查看',
          status: 'in-progress' as const
        },
        {
          title: '里程碑',
          description: '记录重要时刻',
          status: 'planned' as const
        }
      ]
    },
    {
      category: '地理记忆',
      icon: Map,
      items: [
        {
          title: '位置标记',
          description: '记录写作地点',
          status: 'completed' as const,
          demo: 'map-view'
        },
        {
          title: '旅行地图',
          description: '生成足迹地图',
          status: 'planned' as const
        },
        {
          title: '地点聚合',
          description: '按地点查看回忆',
          status: 'planned' as const
        }
      ]
    },
    {
      category: '社交分享',
      icon: Share,
      items: [
        {
          title: '分享卡片',
          description: '生成精美分享卡片',
          status: 'completed' as const,
          demo: 'share-card'
        },
        {
          title: '家庭空间',
          description: '家人共享日记本',
          status: 'planned' as const
        },
        {
          title: '好友交换',
          description: '与好友交换日记',
          status: 'planned' as const
        }
      ]
    },
    {
      category: '个性化',
      icon: Palette,
      items: [
        {
          title: '主题系统',
          description: '多种视觉主题',
          status: 'completed' as const,
          demo: 'theme-selector'
        },
        {
          title: '动态主题',
          description: '根据时间/天气变化',
          status: 'planned' as const
        },
        {
          title: '模板市场',
          description: '丰富的日记模板',
          status: 'planned' as const
        }
      ]
    }
  ];

  const renderDemo = () => {
    switch (activeDemo) {
      case 'ai-assistant':
        return (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>AI 写作助手演示</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full h-32 p-3 border rounded-lg mb-4"
                placeholder="开始写你的日记..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <AIWritingAssistant 
                content={content}
                onContentChange={setContent}
              />
            </CardContent>
          </Card>
        );
      
      case 'audio-recorder':
        return (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>音频录制演示</CardTitle>
            </CardHeader>
            <CardContent>
              <AudioRecorder 
                maxDuration={60}
                withBackgroundMusic={true}
                onRecordingComplete={(blob, duration) => {
                  console.log('录音完成', { blob, duration });
                }}
              />
            </CardContent>
          </Card>
        );

      case 'encryption':
        return (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>加密功能演示</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <h4 className="font-semibold mb-2">✅ 已实现的加密功能：</h4>
                <ul className="space-y-1 text-sm">
                  <li>• AES-256-GCM 加密算法</li>
                  <li>• PBKDF2 密钥派生（100,000 次迭代）</li>
                  <li>• Web Crypto API 原生支持</li>
                  <li>• 生物识别认证（WebAuthn）</li>
                  <li>• 安全的本地存储</li>
                  <li>• 文件加密支持</li>
                </ul>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">测试文本加密</Button>
                <Button variant="outline">测试文件加密</Button>
                <Button variant="outline">测试生物识别</Button>
              </div>
            </CardContent>
          </Card>
        );
      
      case 'habit-tracker':
        return (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>习惯追踪演示</CardTitle>
            </CardHeader>
            <CardContent>
              <HabitTracker 
                userId="demo-user"
                onWriteEntry={() => {
                  console.log('开始写作');
                }}
              />
            </CardContent>
          </Card>
        );
      
      case 'time-capsule':
        return (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>时间胶囊演示</CardTitle>
              <CardDescription>写一封给未来的信，在特定的日子打开</CardDescription>
            </CardHeader>
            <CardContent>
              <TimeCapsuleManager userId="demo-user" />
            </CardContent>
          </Card>
        );
        
      case 'dashboard':
        return (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>智能分析仪表盘</CardTitle>
              <CardDescription>查看您的写作情绪、习惯和趋势分析</CardDescription>
            </CardHeader>
            <CardContent>
              <Dashboard userId="demo-user" />
            </CardContent>
          </Card>
        );
        
      case 'theme-selector':
        return (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>主题定制系统</CardTitle>
              <CardDescription>选择和自定义您喜欢的主题风格</CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeSelector showCustomization={true} />
            </CardContent>
          </Card>
        );
        
      case 'map-view':
        return (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>地理记忆系统</CardTitle>
              <CardDescription>记录和查看您的足迹与回忆</CardDescription>
            </CardHeader>
            <CardContent>
              <MapView 
                userId="demo-user"
                onLocationSelect={(location) => console.log('选择位置:', location)}
                onPlaceClick={(place) => console.log('点击地点:', place)}
              />
            </CardContent>
          </Card>
        );
        
      case 'share-card':
        return (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>分享卡片生成器</CardTitle>
              <CardDescription>创建精美的分享卡片，记录美好时刻</CardDescription>
            </CardHeader>
            <CardContent>
              <ShareCardGenerator 
                initialTitle="今日心情"
                initialContent="生活中的美好瞬间，值得被记录和分享。"
                onShare={(platform, imageUrl) => {
                  console.log(`分享到 ${platform}:`, imageUrl);
                }}
              />
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">功能中心</h1>
        <p className="text-gray-600 dark:text-gray-400">
          探索拾光集的所有功能，体验智能化的日记写作
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="text-2xl">功能统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold">6</div>
                <div className="text-sm opacity-90">已完成</div>
              </div>
              <div>
                <div className="text-3xl font-bold">13</div>
                <div className="text-sm opacity-90">开发中</div>
              </div>
              <div>
                <div className="text-3xl font-bold">12</div>
                <div className="text-sm opacity-90">计划中</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>最新更新</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Badge className="bg-green-500 text-white">新</Badge>
                音频录制功能上线
              </li>
              <li className="flex items-center gap-2">
                <Badge className="bg-green-500 text-white">新</Badge>
                AI 写作助手优化
              </li>
              <li className="flex items-center gap-2">
                <Badge className="bg-green-500 text-white">新</Badge>
                加密服务完成
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>即将推出</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>📹 视频日记录制</li>
              <li>📊 情绪分析图表</li>
              <li>⏰ 时间胶囊系统</li>
              <li>🗺️ 地理位置记忆</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="mb-8">
        <TabsList className="grid grid-cols-5 lg:grid-cols-9 w-full">
          <TabsTrigger value="all">全部</TabsTrigger>
          {features.map((cat) => (
            <TabsTrigger key={cat.category} value={cat.category}>
              {cat.category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.flatMap(cat => 
              cat.items.map(item => (
                <FeatureCard
                  key={item.title}
                  icon={cat.icon}
                  title={item.title}
                  description={item.description}
                  status={item.status}
                  onClick={() => setActiveDemo(item.demo || null)}
                />
              ))
            )}
          </div>
        </TabsContent>

        {features.map((cat) => (
          <TabsContent key={cat.category} value={cat.category} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cat.items.map(item => (
                <FeatureCard
                  key={item.title}
                  icon={cat.icon}
                  title={item.title}
                  description={item.description}
                  status={item.status}
                  onClick={() => setActiveDemo(item.demo || null)}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* 演示区域 */}
      {renderDemo()}

      {/* 功能路线图 */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>开发路线图</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">🚀 第一阶段（当前）</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                核心功能开发：AI 助手、加密系统、媒体支持
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">📈 第二阶段</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                智能分析、习惯养成、时间胶囊
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">🌟 第三阶段</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                社交功能、地理记忆、高级定制
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">🔮 未来展望</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AR 日记、AI 3D 场景、区块链存证
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}