'use client';

import React, { useState } from 'react';
import { Check, Palette, Sun, Moon, Sparkles, Leaf, Crown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useThemeStore } from '@/stores/themeStore';
import { themes, themeCategories, Theme } from '@/lib/themes';

interface ThemeSelectorProps {
  showCustomization?: boolean;
  compact?: boolean;
  className?: string;
}

const categoryIcons = {
  light: Sun,
  dark: Moon,
  colorful: Sparkles,
  nature: Leaf,
  elegant: Crown
};

const ThemePreview: React.FC<{ theme: Theme; isSelected: boolean; onSelect: () => void }> = ({
  theme,
  isSelected,
  onSelect
}) => {
  const gradientStyle = {
    background: `linear-gradient(135deg, hsl(${theme.colors.gradientFrom}), hsl(${theme.colors.gradientTo}))`
  };

  return (
    <div
      className={`relative cursor-pointer rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
        isSelected 
          ? 'border-primary shadow-lg' 
          : 'border-border hover:border-primary/50'
      }`}
      onClick={onSelect}
    >
      <div className="p-3">
        {/* 主题预览色块 */}
        <div className="relative h-16 rounded-md overflow-hidden mb-2">
          <div 
            className="absolute inset-0" 
            style={{ backgroundColor: `hsl(${theme.colors.background})` }}
          />
          <div 
            className="absolute top-0 left-0 w-full h-8"
            style={gradientStyle}
          />
          <div 
            className="absolute bottom-0 left-0 w-8 h-8 rounded-full"
            style={{ backgroundColor: `hsl(${theme.colors.primary})` }}
          />
          <div 
            className="absolute bottom-0 right-0 w-6 h-6 rounded-full"
            style={{ backgroundColor: `hsl(${theme.colors.secondary})` }}
          />
          <div 
            className="absolute top-2 right-2 w-4 h-4 rounded-full"
            style={{ backgroundColor: `hsl(${theme.colors.accent})` }}
          />
        </div>

        {/* 主题信息 */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">{theme.displayName}</h3>
            {isSelected && (
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary">
                <Check className="w-3 h-3 text-primary-foreground" />
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {theme.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  showCustomization = false,
  compact = false,
  className = ''
}) => {
  const { currentThemeId, setTheme, getAllThemes, getThemesByCategory } = useThemeStore();
  const allThemes = getAllThemes();
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [customTheme, setCustomTheme] = useState({
    name: '',
    primary: '#3b82f6',
    secondary: '#6b7280',
    background: '#ffffff',
    foreground: '#000000',
    accent: '#f3f4f6'
  });

  if (compact) {
    return (
      <div className={`grid grid-cols-2 gap-3 ${className}`}>
        {allThemes.slice(0, 4).map((theme) => (
          <ThemePreview
            key={theme.id}
            theme={theme}
            isSelected={currentThemeId === theme.id}
            onSelect={() => setTheme(theme.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        {Object.entries(themeCategories).map(([categoryKey, categoryName]) => {
          const categoryThemes = getThemesByCategory(categoryKey);
          if (categoryThemes.length === 0) return null;

          const IconComponent = categoryIcons[categoryKey as keyof typeof categoryIcons];

          return (
            <div key={categoryKey}>
              <div className="flex items-center gap-2 mb-4">
                <IconComponent className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold text-lg">{categoryName}</h3>
                <Badge variant="secondary" className="ml-auto">
                  {categoryThemes.length}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categoryThemes.map((theme) => (
                  <ThemePreview
                    key={theme.id}
                    theme={theme}
                    isSelected={currentThemeId === theme.id}
                    onSelect={() => setTheme(theme.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {showCustomization && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold text-lg">自定义主题</h3>
            </div>
            
            <Card className="border-dashed">
              <CardHeader className="text-center">
                <CardTitle className="text-base">创建自定义主题</CardTitle>
                <CardDescription>
                  根据个人喜好定制专属主题
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowCustomDialog(true)}
                >
                  <Palette className="w-4 h-4 mr-2" />
                  开始创建
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* 自定义主题对话框 */}
      <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              创建自定义主题
            </DialogTitle>
            <DialogDescription>
              设计属于您的专属主题配色方案
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="theme-name">主题名称</Label>
              <Input
                id="theme-name"
                placeholder="输入主题名称"
                value={customTheme.name}
                onChange={(e) => setCustomTheme(prev => ({...prev, name: e.target.value}))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primary-color">主色调</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="primary-color"
                    type="color"
                    className="w-12 h-10 p-1 border rounded"
                    value={customTheme.primary}
                    onChange={(e) => setCustomTheme(prev => ({...prev, primary: e.target.value}))}
                  />
                  <Input
                    placeholder="#3b82f6"
                    value={customTheme.primary}
                    onChange={(e) => setCustomTheme(prev => ({...prev, primary: e.target.value}))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="secondary-color">辅助色</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="secondary-color"
                    type="color"
                    className="w-12 h-10 p-1 border rounded"
                    value={customTheme.secondary}
                    onChange={(e) => setCustomTheme(prev => ({...prev, secondary: e.target.value}))}
                  />
                  <Input
                    placeholder="#6b7280"
                    value={customTheme.secondary}
                    onChange={(e) => setCustomTheme(prev => ({...prev, secondary: e.target.value}))}
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="background-color">背景色</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="background-color"
                    type="color"
                    className="w-12 h-10 p-1 border rounded"
                    value={customTheme.background}
                    onChange={(e) => setCustomTheme(prev => ({...prev, background: e.target.value}))}
                  />
                  <Input
                    placeholder="#ffffff"
                    value={customTheme.background}
                    onChange={(e) => setCustomTheme(prev => ({...prev, background: e.target.value}))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="accent-color">强调色</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="accent-color"
                    type="color"
                    className="w-12 h-10 p-1 border rounded"
                    value={customTheme.accent}
                    onChange={(e) => setCustomTheme(prev => ({...prev, accent: e.target.value}))}
                  />
                  <Input
                    placeholder="#f3f4f6"
                    value={customTheme.accent}
                    onChange={(e) => setCustomTheme(prev => ({...prev, accent: e.target.value}))}
                  />
                </div>
              </div>
            </div>
            
            {/* 预览区域 */}
            <div className="p-4 rounded-lg border" style={{
              backgroundColor: customTheme.background,
              color: customTheme.foreground,
              borderColor: customTheme.accent
            }}>
              <div className="text-sm font-medium mb-2">主题预览</div>
              <div className="flex gap-2">
                <div 
                  className="w-6 h-6 rounded" 
                  style={{backgroundColor: customTheme.primary}}
                ></div>
                <div 
                  className="w-6 h-6 rounded" 
                  style={{backgroundColor: customTheme.secondary}}
                ></div>
                <div 
                  className="w-6 h-6 rounded" 
                  style={{backgroundColor: customTheme.accent}}
                ></div>
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowCustomDialog(false)}
              >
                取消
              </Button>
              <Button 
                className="flex-1"
                onClick={() => {
                  if (customTheme.name.trim()) {
                    // 这里可以保存自定义主题到本地存储或用户偏好
                    console.log('保存自定义主题:', customTheme);
                    setShowCustomDialog(false);
                    // 重置表单
                    setCustomTheme({
                      name: '',
                      primary: '#3b82f6',
                      secondary: '#6b7280',
                      background: '#ffffff',
                      foreground: '#000000',
                      accent: '#f3f4f6'
                    });
                  }
                }}
                disabled={!customTheme.name.trim()}
              >
                保存主题
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ThemeSelector;
