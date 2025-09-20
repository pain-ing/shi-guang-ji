'use client';

import React, { memo } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Palette, Type } from 'lucide-react';

export interface ShareCardConfig {
  template: 'classic' | 'modern' | 'minimal' | 'gradient' | 'photo' | 'quote';
  title: string;
  content: string;
  author: string;
  date: string;
  location?: string;
  weather?: string;
  mood?: string;
  tags?: string[];
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: 'small' | 'medium' | 'large';
  showQRCode: boolean;
  showLogo: boolean;
  imageUrl?: string;
}

export const PRESET_THEMES = {
  sunrise: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textColor: '#ffffff',
    accentColor: '#ffd93d'
  },
  ocean: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #48b1bf 100%)',
    textColor: '#ffffff',
    accentColor: '#00d4ff'
  },
  forest: {
    backgroundColor: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    textColor: '#ffffff',
    accentColor: '#2d5016'
  },
  sunset: {
    backgroundColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    textColor: '#ffffff',
    accentColor: '#4a0e4e'
  },
  minimal: {
    backgroundColor: '#ffffff',
    textColor: '#333333',
    accentColor: '#0066cc'
  },
  dark: {
    backgroundColor: '#1a1a1a',
    textColor: '#e0e0e0',
    accentColor: '#ff6b6b'
  }
};

interface ShareCardConfigProps {
  config: ShareCardConfig;
  onConfigChange: (config: ShareCardConfig) => void;
  onApplyTheme: (themeName: keyof typeof PRESET_THEMES) => void;
}

export const ShareCardConfigPanel = memo<ShareCardConfigProps>(({ 
  config, 
  onConfigChange, 
  onApplyTheme 
}) => {
  const updateConfig = (updates: Partial<ShareCardConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-6">
      {/* 基本信息 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Type className="w-5 h-5" />
          基本信息
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">标题</Label>
            <Input
              id="title"
              value={config.title}
              onChange={(e) => updateConfig({ title: e.target.value })}
              placeholder="输入卡片标题"
            />
          </div>
          
          <div>
            <Label htmlFor="author">作者</Label>
            <Input
              id="author"
              value={config.author}
              onChange={(e) => updateConfig({ author: e.target.value })}
              placeholder="输入作者名称"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="content">内容</Label>
          <Textarea
            id="content"
            value={config.content}
            onChange={(e) => updateConfig({ content: e.target.value })}
            placeholder="输入卡片内容"
            rows={4}
          />
        </div>
      </div>

      {/* 样式设置 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Palette className="w-5 h-5" />
          样式设置
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {Object.entries(PRESET_THEMES).map(([name, theme]) => (
            <Button
              key={name}
              variant="outline"
              size="sm"
              onClick={() => onApplyTheme(name as keyof typeof PRESET_THEMES)}
              className="h-12"
              style={{ 
                background: theme.backgroundColor,
                color: theme.textColor,
                borderColor: theme.accentColor
              }}
            >
              {name}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="template">模板</Label>
            <Select value={config.template} onValueChange={(value) => updateConfig({ template: value as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="classic">经典</SelectItem>
                <SelectItem value="modern">现代</SelectItem>
                <SelectItem value="minimal">简约</SelectItem>
                <SelectItem value="gradient">渐变</SelectItem>
                <SelectItem value="photo">照片</SelectItem>
                <SelectItem value="quote">引用</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="fontSize">字体大小</Label>
            <Select value={config.fontSize} onValueChange={(value) => updateConfig({ fontSize: value as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">小</SelectItem>
                <SelectItem value="medium">中</SelectItem>
                <SelectItem value="large">大</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              id="showQRCode"
              checked={config.showQRCode}
              onCheckedChange={(checked) => updateConfig({ showQRCode: checked })}
            />
            <Label htmlFor="showQRCode">显示二维码</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="showLogo"
              checked={config.showLogo}
              onCheckedChange={(checked) => updateConfig({ showLogo: checked })}
            />
            <Label htmlFor="showLogo">显示Logo</Label>
          </div>
        </div>
      </div>
    </div>
  );
});

ShareCardConfigPanel.displayName = 'ShareCardConfigPanel';
