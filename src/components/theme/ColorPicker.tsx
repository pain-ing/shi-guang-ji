'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
  presets?: string[];
}

const defaultPresets = [
  '#3b82f6', // blue
  '#8b5cf6', // violet  
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#6b7280', // gray
  '#1f2937', // gray-800
  '#000000', // black
];

// 将颜色转换为HSL格式的CSS变量值
const colorToHsl = (color: string): string => {
  // 简化处理，实际应用中应该有更完整的颜色转换
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l;

  l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
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

export const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  onChange,
  label,
  presets = defaultPresets
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputColor, setInputColor] = useState(color);

  useEffect(() => {
    setInputColor(color);
  }, [color]);

  const handleColorChange = (newColor: string) => {
    setInputColor(newColor);
    onChange(newColor);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setInputColor(newColor);
    
    // 验证颜色格式
    if (/^#[0-9A-F]{6}$/i.test(newColor)) {
      onChange(newColor);
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full h-10 p-1 justify-start"
          >
            <div
              className="w-8 h-8 rounded border mr-2 flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="flex-1 text-left font-mono text-sm">
              {color.toUpperCase()}
            </span>
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-64" align="start">
          <div className="space-y-4">
            {/* 颜色输入 */}
            <div className="space-y-2">
              <Label>十六进制颜色值</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={inputColor}
                  onChange={handleInputChange}
                  placeholder="#000000"
                  className="font-mono"
                />
                <div
                  className="w-10 h-10 rounded border flex-shrink-0"
                  style={{ backgroundColor: inputColor }}
                />
              </div>
            </div>

            {/* 原生颜色选择器 */}
            <div className="space-y-2">
              <Label>颜色选择器</Label>
              <input
                type="color"
                value={color}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-full h-10 border border-input rounded cursor-pointer"
              />
            </div>

            {/* 预设颜色 */}
            <div className="space-y-2">
              <Label>预设颜色</Label>
              <div className="grid grid-cols-5 gap-2">
                {presets.map((presetColor) => (
                  <button
                    key={presetColor}
                    className={`w-8 h-8 rounded border-2 transition-all ${
                      color === presetColor
                        ? 'border-primary scale-110'
                        : 'border-gray-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: presetColor }}
                    onClick={() => handleColorChange(presetColor)}
                    title={presetColor}
                  />
                ))}
              </div>
            </div>

            {/* HSL值显示 */}
            <div className="pt-2 border-t text-xs text-muted-foreground">
              <div>HSL: {colorToHsl(color)}</div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
