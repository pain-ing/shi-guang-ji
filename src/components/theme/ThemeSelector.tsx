'use client';

import React from 'react';
import { Check, Palette, Sun, Moon, Sparkles, Leaf, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
                  onClick={() => {
                    // TODO: 打开主题自定义对话框
                    console.log('Open theme customization dialog');
                  }}
                >
                  <Palette className="w-4 h-4 mr-2" />
                  开始创建
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
