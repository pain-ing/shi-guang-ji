'use client';

import React, { useState } from 'react';
import { 
  Palette, 
  Clock, 
  Download, 
  Upload, 
  RefreshCw, 
  Settings2,
  Sun,
  Moon,
  Sparkles,
  Leaf,
  Crown,
  Eye,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ThemeSelector } from './ThemeSelector';
import { ThemeSwitcher } from './ThemeSwitcher';
import { ThemeCreator } from './ThemeCreator';
import { useThemeStore } from '@/stores/themeStore';

const categoryIcons = {
  light: Sun,
  dark: Moon,
  colorful: Sparkles,
  nature: Leaf,
  elegant: Crown
};

export const ThemeSettingsPage: React.FC = () => {
  const {
    currentTheme,
    autoSwitchEnabled,
    darkModeSchedule,
    customThemes,
    toggleAutoSwitch,
    setDarkModeSchedule,
    deleteCustomTheme,
    decorations,
    setSakuraEnabled,
    setSakuraDensity,
    setSakuraSpeed,
  } = useThemeStore();

  const [previewMode, setPreviewMode] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [startTime, setStartTime] = useState(darkModeSchedule.startTime);
  const [endTime, setEndTime] = useState(darkModeSchedule.endTime);

  const handleScheduleUpdate = () => {
    setDarkModeSchedule(startTime, endTime);
  };

  const exportTheme = () => {
    const themeData = {
      theme: currentTheme,
      customThemes,
      settings: {
        autoSwitchEnabled,
        darkModeSchedule
      },
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(themeData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `时光记主题配置-${new Date().toLocaleDateString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const IconComponent = categoryIcons[currentTheme.category];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* 页面标题 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Palette className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">主题设置</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          个性化定制你的时光记外观，让记录体验更符合你的品味
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧：当前主题信息 */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            {/* 当前主题预览 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <IconComponent className="w-5 h-5" />
                  <CardTitle className="text-lg">当前主题</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 主题预览 */}
                <div className="relative h-32 rounded-lg overflow-hidden border">
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(135deg, hsl(${currentTheme.colors.gradientFrom}), hsl(${currentTheme.colors.gradientTo}))`
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-white/20" />
                  <div className="absolute bottom-3 left-3">
                    <Badge variant="secondary" className="backdrop-blur-sm">
                      {currentTheme.displayName}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{currentTheme.displayName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentTheme.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-4 h-4" />
                    <span className="text-sm capitalize">{currentTheme.category}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <ThemeSwitcher variant="button" showLabel />
                </div>
              </CardContent>
            </Card>

            {/* 自动切换设置 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <CardTitle className="text-lg">自动切换</CardTitle>
                </div>
                <CardDescription>
                  在指定时间自动切换到深色主题
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-switch">启用自动切换</Label>
                  <Switch
                    id="auto-switch"
                    checked={autoSwitchEnabled}
                    onCheckedChange={toggleAutoSwitch}
                  />
                </div>

                {autoSwitchEnabled && (
                  <div className="space-y-3 pt-2 border-t">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="start-time">开始时间</Label>
                        <Input
                          id="start-time"
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end-time">结束时间</Label>
                        <Input
                          id="end-time"
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={handleScheduleUpdate}
                      className="w-full"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      更新时间设置
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 氛围特效：樱花飘落 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <CardTitle className="text-lg">氛围特效</CardTitle>
                </div>
                <CardDescription>
                  为界面增添浪漫的樱花飘落效果
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sakura-enabled">启用樱花飘落</Label>
                  <Switch
                    id="sakura-enabled"
                    checked={decorations.sakuraEnabled}
                    onCheckedChange={setSakuraEnabled}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sakura-density">樱花密度</Label>
                    <span className="text-xs text-muted-foreground">{decorations.sakuraDensity}</span>
                  </div>
                  <input
                    id="sakura-density"
                    type="range"
                    min={10}
                    max={150}
                    step={1}
                    value={decorations.sakuraDensity}
                    onChange={(e) => setSakuraDensity(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sakura-speed">飘落速度</Label>
                    <span className="text-xs text-muted-foreground">{decorations.sakuraSpeed.toFixed(1)}x</span>
                  </div>
                  <input
                    id="sakura-speed"
                    type="range"
                    min={0.5}
                    max={2}
                    step={0.1}
                    value={decorations.sakuraSpeed}
                    onChange={(e) => setSakuraSpeed(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 主题管理工具 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings2 className="w-5 h-5" />
                  <CardTitle className="text-lg">主题管理</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={exportTheme}
                >
                  <Download className="w-4 h-4 mr-2" />
                  导出主题配置
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  导入主题配置
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {previewMode ? '退出预览' : '预览模式'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 右侧：主题选择和设置 */}
        <div className="lg:col-span-2">
          {previewMode && (
            <Alert className="mb-6">
              <Eye className="w-4 h-4" />
              <AlertDescription>
                预览模式已启用。点击任意主题可即时预览效果，再次点击可应用主题。
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="themes" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="themes">主题选择</TabsTrigger>
              <TabsTrigger value="custom">自定义主题</TabsTrigger>
              <TabsTrigger value="manage">主题管理</TabsTrigger>
            </TabsList>

            <TabsContent value="themes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>选择主题</CardTitle>
                  <CardDescription>
                    从精心设计的预设主题中选择一个适合你的风格
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ThemeSelector />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="custom" className="space-y-6">
              {!showCreator ? (
                <Card>
                  <CardHeader>
                    <CardTitle>自定义主题</CardTitle>
                    <CardDescription>
                      创建属于你的专属主题配色方案
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Palette className="w-16 h-16 text-primary mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">自定义主题创建器</h3>
                      <p className="text-muted-foreground mb-6">
                        选择你喜爱的颜色，创建专属于你的主题风格
                      </p>
                      <div className="flex gap-3 justify-center">
                        <Button onClick={() => setShowCreator(true)}>
                          <Sparkles className="w-4 h-4 mr-2" />
                          开始创建
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowCreator(true)}
                        >
                          <Palette className="w-4 h-4 mr-2" />
                          基于当前主题
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>创建自定义主题</CardTitle>
                        <CardDescription>
                          调整颜色和设置创建你的个性化主题
                        </CardDescription>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowCreator(false)}
                      >
                        返回
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ThemeCreator 
                      baseTheme={currentTheme}
                      onSave={(theme) => {
                        setShowCreator(false);
                        // 可以添加保存成功提示
                      }}
                      onCancel={() => setShowCreator(false)}
                    />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="manage" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>主题管理</CardTitle>
                  <CardDescription>
                    管理你的自定义主题和导入的主题
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {customThemes.length > 0 ? (
                    <div className="space-y-4">
                      {customThemes.map((theme) => (
                        <div 
                          key={theme.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-8 h-8 rounded-full border"
                              style={{
                                background: `linear-gradient(135deg, hsl(${theme.colors?.gradientFrom}), hsl(${theme.colors?.gradientTo}))`
                              }}
                            />
                            <div>
                              <h4 className="font-medium">{theme.displayName}</h4>
                              <p className="text-sm text-muted-foreground">
                                {theme.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => theme.id && deleteCustomTheme(theme.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Crown className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">暂无自定义主题</h3>
                      <p className="text-muted-foreground">
                        创建或导入主题后，它们将在这里显示
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
