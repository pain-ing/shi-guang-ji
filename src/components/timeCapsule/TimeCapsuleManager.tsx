'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Clock,
  Mail,
  Lock,
  Unlock,
  Plus,
  Calendar as CalendarIcon,
  Gift,
  Heart,
  Star,
  Trash2,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { timeCapsuleService, TimeCapsuleData } from '@/services/timeCapsule';
import { format, formatDistanceToNow, isPast, isFuture } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface TimeCapsuleManagerProps {
  userId: string;
}

export const TimeCapsuleManager: React.FC<TimeCapsuleManagerProps> = ({ userId }) => {
  const [capsules, setCapsules] = useState<TimeCapsuleData[]>([]);
  const [openableCapsules, setOpenableCapsules] = useState<TimeCapsuleData[]>([]);
  const [upcomingCapsules, setUpcomingCapsules] = useState<TimeCapsuleData[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCapsule, setSelectedCapsule] = useState<TimeCapsuleData | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'openable' | 'upcoming' | 'opened'>('all');

  // 表单状态
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'future-letter' as TimeCapsuleData['type'],
    openDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 默认30天后
    recipientEmail: '',
    message: ''
  });

  // 加载数据
  useEffect(() => {
    loadCapsules();
  }, [userId]);

  const loadCapsules = async () => {
    const all = await timeCapsuleService.getAllCapsules(userId);
    const openable = await timeCapsuleService.getOpenableCapsules(userId);
    const upcoming = await timeCapsuleService.getUpcomingCapsules(userId);
    const stats = await timeCapsuleService.getStatistics(userId);

    setCapsules(all);
    setOpenableCapsules(openable);
    setUpcomingCapsules(upcoming);
    setStatistics(stats);
  };

  // 创建时间胶囊
  const handleCreate = async () => {
    if (!formData.title || !formData.content) {
      alert('请填写标题和内容');
      return;
    }

    try {
      await timeCapsuleService.createCapsule({
        userId,
        ...formData
      });
      
      // 重置表单
      setFormData({
        title: '',
        content: '',
        type: 'future-letter',
        openDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        recipientEmail: '',
        message: ''
      });
      
      setShowCreateForm(false);
      await loadCapsules();
    } catch (error: any) {
      alert(error.message);
    }
  };

  // 打开时间胶囊
  const handleOpen = async (capsuleId: string) => {
    try {
      const opened = await timeCapsuleService.openCapsule(userId, capsuleId);
      if (opened) {
        setSelectedCapsule(opened);
        await loadCapsules();
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  // 删除时间胶囊
  const handleDelete = async (capsuleId: string) => {
    if (!confirm('确定要删除这个时间胶囊吗？')) return;
    
    try {
      await timeCapsuleService.deleteCapsule(userId, capsuleId);
      await loadCapsules();
    } catch (error: any) {
      alert(error.message);
    }
  };

  // 获取类型图标
  const getTypeIcon = (type: TimeCapsuleData['type']) => {
    switch (type) {
      case 'future-letter': return Mail;
      case 'milestone': return Star;
      case 'anniversary': return Heart;
      default: return Gift;
    }
  };

  // 获取类型颜色
  const getTypeColor = (type: TimeCapsuleData['type']) => {
    switch (type) {
      case 'future-letter': return 'bg-blue-500';
      case 'milestone': return 'bg-yellow-500';
      case 'anniversary': return 'bg-pink-500';
      default: return 'bg-purple-500';
    }
  };

  // 过滤胶囊
  const getFilteredCapsules = () => {
    switch (activeTab) {
      case 'openable':
        return openableCapsules;
      case 'upcoming':
        return upcomingCapsules;
      case 'opened':
        return capsules.filter(c => c.isOpened);
      default:
        return capsules;
    }
  };

  // 渲染创建表单
  const renderCreateForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>创建时间胶囊</CardTitle>
          <CardDescription>写一封给未来的信</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">标题</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="给这个时间胶囊起个名字"
            />
          </div>

          <div>
            <label className="text-sm font-medium">内容</label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="写下你想对未来说的话..."
              rows={6}
            />
          </div>

          <div>
            <label className="text-sm font-medium">类型</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              {(['future-letter', 'milestone', 'anniversary', 'custom'] as const).map(type => {
                const Icon = getTypeIcon(type);
                return (
                  <Button
                    key={type}
                    variant={formData.type === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFormData({ ...formData, type })}
                  >
                    <Icon className="w-4 h-4 mr-1" />
                    {type === 'future-letter' ? '未来信' :
                     type === 'milestone' ? '里程碑' :
                     type === 'anniversary' ? '纪念日' : '自定义'}
                  </Button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">开启日期</label>
            <div className="flex items-center gap-2 mt-2">
              <CalendarIcon className="w-4 h-4" />
              <Input
                type="date"
                value={format(formData.openDate, 'yyyy-MM-dd')}
                min={format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd')}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  openDate: new Date(e.target.value) 
                })}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              将在 {formatDistanceToNow(formData.openDate, { addSuffix: true, locale: zhCN })} 开启
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">提醒邮箱（可选）</label>
            <Input
              type="email"
              value={formData.recipientEmail}
              onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
              placeholder="example@email.com"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCreateForm(false)}
            >
              取消
            </Button>
            <Button onClick={handleCreate}>
              <Send className="w-4 h-4 mr-2" />
              创建胶囊
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  // 渲染胶囊卡片
  const renderCapsuleCard = (capsule: TimeCapsuleData) => {
    const Icon = getTypeIcon(capsule.type);
    const isOpenable = isPast(new Date(capsule.openDate)) && !capsule.isOpened;
    const isOpened = capsule.isOpened;
    
    return (
      <motion.div
        key={capsule.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
      >
        <Card className={`relative overflow-hidden ${isOpenable ? 'ring-2 ring-green-500' : ''}`}>
          <div className={`absolute top-0 left-0 w-1 h-full ${getTypeColor(capsule.type)}`} />
          
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${getTypeColor(capsule.type)} text-white`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base">{capsule.title}</CardTitle>
                  <CardDescription className="text-xs">
                    创建于 {format(new Date(capsule.createdAt), 'yyyy年MM月dd日')}
                  </CardDescription>
                </div>
              </div>
              
              {isOpened ? (
                <Badge className="bg-gray-500">
                  <Unlock className="w-3 h-3 mr-1" />
                  已开启
                </Badge>
              ) : isOpenable ? (
                <Badge className="bg-green-500">
                  <Gift className="w-3 h-3 mr-1" />
                  可开启
                </Badge>
              ) : (
                <Badge variant="outline">
                  <Lock className="w-3 h-3 mr-1" />
                  未到期
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                {isOpened ? (
                  <span>已于 {format(new Date(capsule.openDate), 'yyyy年MM月dd日')} 开启</span>
                ) : (
                  <span>
                    {formatDistanceToNow(new Date(capsule.openDate), { 
                      addSuffix: true, 
                      locale: zhCN 
                    })} 开启
                  </span>
                )}
              </div>

              {isOpened && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm line-clamp-3">{capsule.content}</p>
                </div>
              )}

              <div className="flex gap-2 mt-3">
                {isOpenable && !isOpened && (
                  <Button
                    size="sm"
                    onClick={() => handleOpen(capsule.id)}
                  >
                    <Unlock className="w-4 h-4 mr-1" />
                    打开胶囊
                  </Button>
                )}
                
                {isOpened && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedCapsule(capsule)}
                  >
                    查看详情
                  </Button>
                )}
                
                {!isOpened && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(capsule.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{statistics.total}</div>
              <div className="text-sm text-gray-500">总胶囊数</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{statistics.opened}</div>
              <div className="text-sm text-gray-500">已开启</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{statistics.pending}</div>
              <div className="text-sm text-gray-500">等待中</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{statistics.upcoming30Days}</div>
              <div className="text-sm text-gray-500">即将开启</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['all', 'openable', 'upcoming', 'opened'] as const).map(tab => (
            <Button
              key={tab}
              size="sm"
              variant={activeTab === tab ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'all' ? '全部' :
               tab === 'openable' ? '可开启' :
               tab === 'upcoming' ? '即将到期' : '已开启'}
            </Button>
          ))}
        </div>
        
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="w-4 h-4 mr-2" />
          创建胶囊
        </Button>
      </div>

      {/* 创建表单 */}
      <AnimatePresence>
        {showCreateForm && renderCreateForm()}
      </AnimatePresence>

      {/* 胶囊列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {getFilteredCapsules().map(capsule => renderCapsuleCard(capsule))}
      </div>

      {/* 详情弹窗 */}
      <AnimatePresence>
        {selectedCapsule && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedCapsule(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4">{selectedCapsule.title}</h2>
              <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{selectedCapsule.content}</p>
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setSelectedCapsule(null)}>
                  关闭
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimeCapsuleManager;