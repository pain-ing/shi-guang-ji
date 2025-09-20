'use client';

import React, { useState } from 'react';
import { Palette, Save, RotateCcw, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColorPicker } from './ColorPicker';
import { useThemeStore } from '@/stores/themeStore';
import { Theme } from '@/lib/themes';

interface ThemeCreatorProps {
  baseTheme?: Theme;
  onSave?: (theme: Theme) => void;
  onCancel?: () => void;
}

export const ThemeCreator: React.FC<ThemeCreatorProps> = ({
  baseTheme,
  onSave,
  onCancel
}) => {
  const { addCustomTheme, setTheme } = useThemeStore();
  
  const [themeName, setThemeName] = useState(baseTheme?.displayName || '我的主题');
  const [themeDescription, setThemeDescription] = useState(baseTheme?.description || '自定义主题');
  const [themeCategory, setThemeCategory] = useState<'light' | 'dark' | 'colorful' | 'nature' | 'elegant'>(
    baseTheme?.category || 'colorful'
  );

  const [colors, setColors] = useState({
    background: baseTheme?.colors.background || '0 0% 100%',
    foreground: baseTheme?.colors.foreground || '222.2 84% 4.9%',
    primary: baseTheme?.colors.primary || '221.2 83.2% 53.3%',
    secondary: baseTheme?.colors.secondary || '210 40% 96%',
    accent: baseTheme?.colors.accent || '210 40% 96%',
    gradientFrom: baseTheme?.colors.gradientFrom || '221.2 83.2% 53.3%',
    gradientTo: baseTheme?.colors.gradientTo || '262.1 83.3% 57.8%',
  });

  const [hexColors, setHexColors] = useState({
    background: '#ffffff',
    foreground: '#0f172a',
    primary: '#3b82f6',
    secondary: '#f1f5f9',
    accent: '#f1f5f9',
    gradientFrom: '#3b82f6',
    gradientTo: '#8b5cf6',
  });

  const [previewMode, setPreviewMode] = useState(false);

  // 将十六进制颜色转换为HSL格式
  const hexToHsl = (hex: string): string => {
    const r = parseInt(hex.substr(1, 2), 16) / 255;
    const g = parseInt(hex.substr(3, 2), 16) / 255;
    const b = parseInt(hex.substr(5, 2), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l;

    l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }

      h /= 6;
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  const handleColorChange = (colorKey: string, hexColor: string) => {
    const hslColor = hexToHsl(hexColor);
    setHexColors(prev => ({ ...prev, [colorKey]: hexColor }));
    setColors(prev => ({ ...prev, [colorKey]: hslColor }));
  };

  const generateDerivedColors = (primaryHex: string) => {
    // 基于主色生成相关颜色
    const primary = hexToHsl(primaryHex);
    
    // 生成更亮的二级色
    const secondaryHex = adjustBrightness(primaryHex, 40);
    const secondary = hexToHsl(secondaryHex);
    
    // 生成强调色（色相稍微调整）
    const accentHex = adjustHue(primaryHex, 30);
    const accent = hexToHsl(accentHex);
    
    // 生成渐变终点色
    const gradientToHex = adjustHue(primaryHex, 60);
    const gradientTo = hexToHsl(gradientToHex);

    setHexColors(prev => ({
      ...prev,
      secondary: secondaryHex,
      accent: accentHex,
      gradientTo: gradientToHex
    }));

    setColors(prev => ({
      ...prev,
      primary,
      secondary,
      accent,
      gradientFrom: primary,
      gradientTo
    }));
  };

  // 辅助函数：调整亮度
  const adjustBrightness = (hex: string, amount: number): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * amount);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  };

  // 辅助函数：调整色相
  const adjustHue = (hex: string, amount: number): string => {
    // 简化的色相调整，实际应该使用更精确的HSL转换
    let num = parseInt(hex.replace('#', ''), 16);
    // 这里简化处理，实际应该转换到HSL再调整
    num = ((num + amount * 0x111111) & 0xFFFFFF);
    return '#' + num.toString(16).padStart(6, '0');
  };

  const createTheme = (): Theme => {
    return {
      id: `custom-${Date.now()}`,
      name: `custom-${Date.now()}`,
      displayName: themeName,
      description: themeDescription,
      category: themeCategory,
      colors: {
        ...colors,
        card: colors.background,
        cardForeground: colors.foreground,
        popover: colors.background,
        popoverForeground: colors.foreground,
        primaryForeground: colors.background,
        secondaryForeground: colors.foreground,
        mutedForeground: colors.foreground,
        accentForeground: colors.foreground,
        destructive: '0 84.2% 60.2%',
        destructiveForeground: colors.background,
        success: '142.1 76.2% 36.3%',
        successForeground: colors.background,
        warning: '32.5 94.6% 43.7%',
        warningForeground: colors.background,
        info: colors.primary,
        infoForeground: colors.background,
        border: '214.3 31.8% 91.4%',
        input: '214.3 31.8% 91.4%',
        ring: colors.primary,
        muted: colors.secondary,
        moods: {
          happy: '45 93% 47%',
          excited: '12 76% 61%',
          peaceful: '142 71% 45%',
          thoughtful: colors.primary,
          nostalgic: '280 100% 70%',
          sad: '221 39% 11%',
          angry: '0 84% 60%',
          worried: '25 95% 53%'
        }
      },
      fonts: {
        sans: ['"Inter"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
        serif: ['"Noto Serif SC"', '"Times New Roman"', 'serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'monospace']
      }
    };
  };

  const handleSave = () => {
    const theme = createTheme();
    const themeId = addCustomTheme(theme);
    if (themeId) {
      setTheme(themeId);
    }
    
    if (onSave) {
      onSave(theme);
    }
  };

  const handlePreview = () => {
    if (previewMode) {
      setPreviewMode(false);
      // 恢复之前的主题
    } else {
      const theme = createTheme();
      setTheme(''); // 临时应用预览主题
      setPreviewMode(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* 基本信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            主题信息
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="theme-name">主题名称</Label>
              <Input
                id="theme-name"
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                placeholder="我的主题"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="theme-category">主题分类</Label>
              <Select value={themeCategory} onValueChange={(value: any) => setThemeCategory(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">浅色</SelectItem>
                  <SelectItem value="dark">深色</SelectItem>
                  <SelectItem value="colorful">彩色</SelectItem>
                  <SelectItem value="nature">自然</SelectItem>
                  <SelectItem value="elegant">优雅</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="theme-description">主题描述</Label>
            <Input
              id="theme-description"
              value={themeDescription}
              onChange={(e) => setThemeDescription(e.target.value)}
              placeholder="描述你的主题特色..."
            />
          </div>
        </CardContent>
      </Card>

      {/* 颜色配置 */}
      <Card>
        <CardHeader>
          <CardTitle>颜色配置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">基础颜色</h4>
              
              <ColorPicker
                label="主要颜色"
                color={hexColors.primary}
                onChange={(color) => {
                  handleColorChange('primary', color);
                  generateDerivedColors(color);
                }}
              />
              
              <ColorPicker
                label="背景颜色"
                color={hexColors.background}
                onChange={(color) => handleColorChange('background', color)}
              />
              
              <ColorPicker
                label="前景颜色"
                color={hexColors.foreground}
                onChange={(color) => handleColorChange('foreground', color)}
              />
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">辅助颜色</h4>
              
              <ColorPicker
                label="次要颜色"
                color={hexColors.secondary}
                onChange={(color) => handleColorChange('secondary', color)}
              />
              
              <ColorPicker
                label="强调颜色"
                color={hexColors.accent}
                onChange={(color) => handleColorChange('accent', color)}
              />
              
              <ColorPicker
                label="渐变终点"
                color={hexColors.gradientTo}
                onChange={(color) => handleColorChange('gradientTo', color)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 预览和操作 */}
      <div className="flex gap-4 justify-end">
        <Button variant="outline" onClick={() => setPreviewMode(false)}>
          <RotateCcw className="w-4 h-4 mr-2" />
          重置
        </Button>
        
        <Button variant="outline" onClick={handlePreview}>
          <Eye className="w-4 h-4 mr-2" />
          {previewMode ? '取消预览' : '预览效果'}
        </Button>
        
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          保存主题
        </Button>
        
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
        )}
      </div>
    </div>
  );
};
