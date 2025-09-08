'use client';

import React, { useState } from 'react';
import { Palette, Moon, Sun, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from '@/components/ui/dropdown-menu';
import { useThemeStore } from '@/stores/themeStore';
import { themes, themeCategories } from '@/lib/themes';

interface ThemeSwitcherProps {
  variant?: 'button' | 'icon';
  showLabel?: boolean;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  variant = 'icon',
  showLabel = false
}) => {
  const { currentThemeId, setTheme, getAllThemes, getThemesByCategory, currentTheme } = useThemeStore();
  const [open, setOpen] = useState(false);

  const allThemes = getAllThemes();
  const isDark = currentTheme.category === 'dark';

  const handleThemeSelect = (themeId: string) => {
    setTheme(themeId);
    setOpen(false);
  };

  const triggerButton = variant === 'button' ? (
    <Button variant="outline" size="sm">
      <Palette className="w-4 h-4 mr-2" />
      {showLabel && '主题'}
    </Button>
  ) : (
    <Button variant="ghost" size="sm">
      {isDark ? (
        <Moon className="w-4 h-4" />
      ) : (
        <Sun className="w-4 h-4" />
      )}
      {showLabel && <span className="ml-2">主题</span>}
    </Button>
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        {triggerButton}
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Palette className="w-4 h-4" />
          选择主题
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* 快速切换 */}
        <DropdownMenuItem onClick={() => handleThemeSelect('default')}>
          <Sun className="w-4 h-4 mr-2" />
          <span className="flex-1">默认</span>
          {currentThemeId === 'default' && <div className="w-2 h-2 rounded-full bg-primary" />}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleThemeSelect('dark')}>
          <Moon className="w-4 h-4 mr-2" />
          <span className="flex-1">深夜</span>
          {currentThemeId === 'dark' && <div className="w-2 h-2 rounded-full bg-primary" />}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* 分类主题 */}
        {Object.entries(themeCategories).map(([categoryKey, categoryName]) => {
          const categoryThemes = getThemesByCategory(categoryKey);
          if (categoryThemes.length === 0) return null;

          return (
            <DropdownMenuSub key={categoryKey}>
              <DropdownMenuSubTrigger>
                <span className="flex items-center gap-2">
                  {categoryKey === 'colorful' && <Palette className="w-4 h-4" />}
                  {categoryKey === 'nature' && <div className="w-4 h-4 rounded-full bg-green-500" />}
                  {categoryKey === 'elegant' && <div className="w-4 h-4 rounded-full bg-gray-500" />}
                  {categoryName}
                </span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-48">
                {categoryThemes.map((theme) => (
                  <DropdownMenuItem
                    key={theme.id}
                    onClick={() => handleThemeSelect(theme.id)}
                  >
                    <div 
                      className="w-4 h-4 rounded-full mr-2 border border-gray-200"
                      style={{
                        background: `linear-gradient(135deg, hsl(${theme.colors.primary}), hsl(${theme.colors.secondary}))`
                      }}
                    />
                    <span className="flex-1">{theme.displayName}</span>
                    {currentThemeId === theme.id && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          );
        })}

        <DropdownMenuSeparator />
        
        <DropdownMenuItem>
          <Settings className="w-4 h-4 mr-2" />
          主题设置
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
