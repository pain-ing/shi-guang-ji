// 主题服务 - 管理应用主题和样式
import { Theme, ThemeColors, ThemeFonts } from '@/types/features';

// 预设主题
export const PRESET_THEMES: Record<string, Theme> = {
  default: {
    id: 'default',
    name: '默认主题',
    type: 'preset',
    colors: {
      primary: '#3B82F6',
      secondary: '#10B981',
      background: '#FFFFFF',
      surface: '#F9FAFB',
      text: '#111827',
      textSecondary: '#6B7280',
      accent: '#8B5CF6',
      error: '#EF4444',
      warning: '#F59E0B',
      success: '#10B981'
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
      mono: 'JetBrains Mono',
      size: { base: 16, scale: 1.25 }
    },
    animations: true
  },
  dark: {
    id: 'dark',
    name: '暗黑模式',
    type: 'preset',
    colors: {
      primary: '#60A5FA',
      secondary: '#34D399',
      background: '#111827',
      surface: '#1F2937',
      text: '#F9FAFB',
      textSecondary: '#9CA3AF',
      accent: '#A78BFA',
      error: '#F87171',
      warning: '#FBBF24',
      success: '#34D399'
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
      mono: 'JetBrains Mono',
      size: { base: 16, scale: 1.25 }
    },
    animations: true
  },
  nature: {
    id: 'nature',
    name: '自然',
    type: 'preset',
    colors: {
      primary: '#059669',
      secondary: '#84CC16',
      background: '#F0FDF4',
      surface: '#DCFCE7',
      text: '#14532D',
      textSecondary: '#166534',
      accent: '#65A30D',
      error: '#DC2626',
      warning: '#EA580C',
      success: '#16A34A'
    },
    fonts: {
      heading: 'Merriweather',
      body: 'Source Sans Pro',
      mono: 'Fira Code',
      size: { base: 16, scale: 1.3 }
    },
    animations: true
  },
  ocean: {
    id: 'ocean',
    name: '海洋',
    type: 'preset',
    colors: {
      primary: '#0891B2',
      secondary: '#0E7490',
      background: '#F0F9FF',
      surface: '#E0F2FE',
      text: '#0C4A6E',
      textSecondary: '#075985',
      accent: '#0284C7',
      error: '#E11D48',
      warning: '#F97316',
      success: '#14B8A6'
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Open Sans',
      mono: 'Source Code Pro',
      size: { base: 16, scale: 1.25 }
    },
    animations: true
  },
  sunset: {
    id: 'sunset',
    name: '日落',
    type: 'preset',
    colors: {
      primary: '#F97316',
      secondary: '#FB923C',
      background: '#FFF7ED',
      surface: '#FED7AA',
      text: '#7C2D12',
      textSecondary: '#9A3412',
      accent: '#DC2626',
      error: '#B91C1C',
      warning: '#D97706',
      success: '#059669'
    },
    fonts: {
      heading: 'Bebas Neue',
      body: 'Roboto',
      mono: 'Roboto Mono',
      size: { base: 16, scale: 1.35 }
    },
    animations: true
  },
  minimalist: {
    id: 'minimalist',
    name: '极简',
    type: 'preset',
    colors: {
      primary: '#000000',
      secondary: '#4B5563',
      background: '#FFFFFF',
      surface: '#F9FAFB',
      text: '#000000',
      textSecondary: '#4B5563',
      accent: '#000000',
      error: '#DC2626',
      warning: '#F59E0B',
      success: '#10B981'
    },
    fonts: {
      heading: 'Helvetica',
      body: 'Helvetica',
      mono: 'Monaco',
      size: { base: 15, scale: 1.2 }
    },
    animations: false
  },
  vintage: {
    id: 'vintage',
    name: '复古',
    type: 'preset',
    colors: {
      primary: '#92400E',
      secondary: '#78350F',
      background: '#FEF3C7',
      surface: '#FDE68A',
      text: '#451A03',
      textSecondary: '#78350F',
      accent: '#B45309',
      error: '#991B1B',
      warning: '#B45309',
      success: '#166534'
    },
    fonts: {
      heading: 'Crimson Text',
      body: 'Lora',
      mono: 'Courier New',
      size: { base: 17, scale: 1.4 }
    },
    animations: true
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: '赛博朋克',
    type: 'preset',
    colors: {
      primary: '#F0ABFC',
      secondary: '#00F0FF',
      background: '#0F0F23',
      surface: '#1A1A2E',
      text: '#F0ABFC',
      textSecondary: '#00F0FF',
      accent: '#FFFF00',
      error: '#FF0080',
      warning: '#FFB800',
      success: '#00FF88'
    },
    fonts: {
      heading: 'Orbitron',
      body: 'Rajdhani',
      mono: 'Space Mono',
      size: { base: 16, scale: 1.3 }
    },
    animations: true
  }
};

export class ThemeService {
  private readonly STORAGE_KEY = 'app_theme';
  private readonly CUSTOM_THEMES_KEY = 'custom_themes';
  private currentTheme: Theme = PRESET_THEMES.default;
  private dynamicThemeInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.loadTheme();
  }

  // 加载主题
  loadTheme(): Theme {
    const storedThemeId = localStorage.getItem(this.STORAGE_KEY);
    if (storedThemeId) {
      // 检查预设主题
      if (PRESET_THEMES[storedThemeId]) {
        this.currentTheme = PRESET_THEMES[storedThemeId];
      } else {
        // 检查自定义主题
        const customThemes = this.getCustomThemes();
        const customTheme = customThemes.find(t => t.id === storedThemeId);
        if (customTheme) {
          this.currentTheme = customTheme;
        }
      }
    }
    this.applyTheme(this.currentTheme);
    return this.currentTheme;
  }

  // 获取当前主题
  getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  // 设置主题
  setTheme(themeId: string): boolean {
    let theme: Theme | undefined;

    // 查找预设主题
    if (PRESET_THEMES[themeId]) {
      theme = PRESET_THEMES[themeId];
    } else {
      // 查找自定义主题
      const customThemes = this.getCustomThemes();
      theme = customThemes.find(t => t.id === themeId);
    }

    if (theme) {
      this.currentTheme = theme;
      this.applyTheme(theme);
      localStorage.setItem(this.STORAGE_KEY, themeId);
      return true;
    }
    return false;
  }

  // 应用主题到页面
  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    
    // 应用颜色
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${this.kebabCase(key)}`, value);
    });

    // 应用字体
    if (theme.fonts) {
      root.style.setProperty('--font-heading', theme.fonts.heading);
      root.style.setProperty('--font-body', theme.fonts.body);
      root.style.setProperty('--font-mono', theme.fonts.mono);
      root.style.setProperty('--font-size-base', `${theme.fonts.size.base}px`);
      root.style.setProperty('--font-size-scale', `${theme.fonts.size.scale}`);
    }

    // 应用动画设置
    if (theme.animations === false) {
      root.classList.add('no-animations');
    } else {
      root.classList.remove('no-animations');
    }

    // 应用暗色模式类
    if (theme.id === 'dark' || this.isDarkTheme(theme)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  // 创建自定义主题
  createCustomTheme(name: string, baseThemeId: string, customizations: Partial<Theme>): Theme {
    const baseTheme = PRESET_THEMES[baseThemeId] || this.currentTheme;
    const customTheme: Theme = {
      ...baseTheme,
      ...customizations,
      id: `custom_${Date.now()}`,
      name,
      type: 'custom',
      colors: { ...baseTheme.colors, ...(customizations.colors || {}) },
      fonts: customizations.fonts ? { ...baseTheme.fonts, ...customizations.fonts } : baseTheme.fonts
    };

    // 保存自定义主题
    const customThemes = this.getCustomThemes();
    customThemes.push(customTheme);
    localStorage.setItem(this.CUSTOM_THEMES_KEY, JSON.stringify(customThemes));

    return customTheme;
  }

  // 获取自定义主题列表
  getCustomThemes(): Theme[] {
    const stored = localStorage.getItem(this.CUSTOM_THEMES_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  // 删除自定义主题
  deleteCustomTheme(themeId: string): boolean {
    const customThemes = this.getCustomThemes();
    const index = customThemes.findIndex(t => t.id === themeId);
    if (index !== -1) {
      customThemes.splice(index, 1);
      localStorage.setItem(this.CUSTOM_THEMES_KEY, JSON.stringify(customThemes));
      
      // 如果删除的是当前主题，切换到默认主题
      if (this.currentTheme.id === themeId) {
        this.setTheme('default');
      }
      return true;
    }
    return false;
  }

  // 获取所有可用主题
  getAllThemes(): Theme[] {
    return [...Object.values(PRESET_THEMES), ...this.getCustomThemes()];
  }

  // 启用动态主题
  enableDynamicTheme(factors: string[]): void {
    // 停止现有的动态主题
    this.disableDynamicTheme();

    // 每小时检查一次
    this.dynamicThemeInterval = setInterval(() => {
      this.applyDynamicTheme(factors);
    }, 3600000);

    // 立即应用
    this.applyDynamicTheme(factors);
  }

  // 禁用动态主题
  disableDynamicTheme(): void {
    if (this.dynamicThemeInterval) {
      clearInterval(this.dynamicThemeInterval);
      this.dynamicThemeInterval = null;
    }
  }

  // 应用动态主题规则
  private applyDynamicTheme(factors: string[]): void {
    const hour = new Date().getHours();

    if (factors.includes('time')) {
      // 根据时间切换主题
      if (hour >= 6 && hour < 12) {
        // 早晨 - 自然主题
        this.setTheme('nature');
      } else if (hour >= 12 && hour < 18) {
        // 下午 - 默认主题
        this.setTheme('default');
      } else if (hour >= 18 && hour < 21) {
        // 傍晚 - 日落主题
        this.setTheme('sunset');
      } else {
        // 夜晚 - 暗黑主题
        this.setTheme('dark');
      }
    }

    // 可以根据其他因素（天气、季节、心情）进一步调整
  }

  // 导出主题配置
  exportTheme(themeId: string): string {
    const theme = this.getAllThemes().find(t => t.id === themeId);
    if (theme) {
      return JSON.stringify(theme, null, 2);
    }
    throw new Error('主题不存在');
  }

  // 导入主题配置
  importTheme(themeJson: string): Theme {
    try {
      const theme = JSON.parse(themeJson) as Theme;
      theme.id = `imported_${Date.now()}`;
      theme.type = 'custom';
      
      // 保存导入的主题
      const customThemes = this.getCustomThemes();
      customThemes.push(theme);
      localStorage.setItem(this.CUSTOM_THEMES_KEY, JSON.stringify(customThemes));
      
      return theme;
    } catch (error) {
      throw new Error('无效的主题配置');
    }
  }

  // 辅助函数：转换为 kebab-case
  private kebabCase(str: string): string {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase();
  }

  // 判断是否为暗色主题
  private isDarkTheme(theme: Theme): boolean {
    const bg = theme.colors.background;
    // 简单判断：如果背景色的亮度较低，则认为是暗色主题
    const rgb = this.hexToRgb(bg);
    if (rgb) {
      const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
      return brightness < 128;
    }
    return false;
  }

  // 辅助函数：HEX 转 RGB
  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
}

// 导出单例实例
export const themeService = new ThemeService();