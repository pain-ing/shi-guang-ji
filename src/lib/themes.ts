// 主题系统配置
export interface Theme {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: 'light' | 'dark' | 'colorful' | 'nature' | 'elegant';
  colors: {
    // 基础颜色
    background: string;
    foreground: string;
    
    // 卡片和表面
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    
    // 主要色彩
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    
    // 状态颜色
    destructive: string;
    destructiveForeground: string;
    success: string;
    successForeground: string;
    warning: string;
    warningForeground: string;
    info: string;
    infoForeground: string;
    
    // 边框和输入
    border: string;
    input: string;
    ring: string;
    
    // 渐变色
    gradientFrom: string;
    gradientTo: string;
    
    // 心情颜色映射
    moods: {
      happy: string;
      excited: string;
      peaceful: string;
      thoughtful: string;
      nostalgic: string;
      sad: string;
      angry: string;
      worried: string;
    };
  };
  fonts: {
    sans: string[];
    serif: string[];
    mono: string[];
  };
}

// 预设主题数据
export const themes: Theme[] = [
  {
    id: 'default',
    name: 'default',
    displayName: '默认',
    description: '经典的青紫渐变主题，适合日常使用',
    category: 'light',
    colors: {
      background: '210 40% 98%',
      foreground: '222.2 84% 4.9%',
      card: '0 0% 100%',
      cardForeground: '222.2 84% 4.9%',
      popover: '0 0% 100%',
      popoverForeground: '222.2 84% 4.9%',
      primary: '249 95% 63%',
      primaryForeground: '210 40% 98%',
      secondary: '210 40% 96%',
      secondaryForeground: '222.2 47.4% 11.2%',
      muted: '210 40% 96%',
      mutedForeground: '215.4 16.3% 46.9%',
      accent: '279 95% 75%',
      accentForeground: '222.2 84% 4.9%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '210 40% 98%',
      success: '142.1 76.2% 36.3%',
      successForeground: '355.7 100% 97.3%',
      warning: '32.5 94.6% 43.7%',
      warningForeground: '355.7 100% 97.3%',
      info: '249 95% 63%',
      infoForeground: '210 40% 98%',
      border: '214.3 31.8% 91.4%',
      input: '214.3 31.8% 91.4%',
      ring: '249 95% 63%',
      gradientFrom: '249 95% 63%',
      gradientTo: '279 95% 75%',
      moods: {
        happy: '45 93% 47%',
        excited: '12 76% 61%',
        peaceful: '142 71% 45%',
        thoughtful: '249 95% 63%',
        nostalgic: '279 95% 75%',
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
  },
  {
    id: 'dark',
    name: 'dark',
    displayName: '深夜',
    description: '深色护眼主题，适合夜晚书写',
    category: 'dark',
    colors: {
      background: '222.2 84% 4.9%',
      foreground: '210 40% 98%',
      card: '222.2 84% 4.9%',
      cardForeground: '210 40% 98%',
      popover: '222.2 84% 4.9%',
      popoverForeground: '210 40% 98%',
      primary: '217.2 91.2% 59.8%',
      primaryForeground: '222.2 84% 4.9%',
      secondary: '217.2 32.6% 17.5%',
      secondaryForeground: '210 40% 98%',
      muted: '217.2 32.6% 17.5%',
      mutedForeground: '215 20.2% 65.1%',
      accent: '217.2 32.6% 17.5%',
      accentForeground: '210 40% 98%',
      destructive: '0 62.8% 30.6%',
      destructiveForeground: '210 40% 98%',
      success: '142.1 70.6% 45.3%',
      successForeground: '144.9 80.4% 10%',
      warning: '35.5 91.7% 32.9%',
      warningForeground: '355.7 100% 97.3%',
      info: '217.2 91.2% 59.8%',
      infoForeground: '222.2 84% 4.9%',
      border: '217.2 32.6% 17.5%',
      input: '217.2 32.6% 17.5%',
      ring: '224.3 76.3% 48%',
      gradientFrom: '217.2 91.2% 59.8%',
      gradientTo: '262.1 83.3% 57.8%',
      moods: {
        happy: '45 93% 57%',
        excited: '12 76% 71%',
        peaceful: '142 71% 55%',
        thoughtful: '217 91% 60%',
        nostalgic: '280 100% 80%',
        sad: '221 39% 21%',
        angry: '0 84% 70%',
        worried: '25 95% 63%'
      }
    },
    fonts: {
      sans: ['"Inter"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
      serif: ['"Noto Serif SC"', '"Times New Roman"', 'serif'],
      mono: ['"JetBrains Mono"', '"SF Mono"', 'monospace']
    }
  },
  {
    id: 'sunset',
    name: 'sunset',
    displayName: '夕阳',
    description: '温暖的日落色调，营造浪漫氛围',
    category: 'colorful',
    colors: {
      background: '39 100% 97%',
      foreground: '20 14.3% 4.1%',
      card: '0 0% 100%',
      cardForeground: '20 14.3% 4.1%',
      popover: '0 0% 100%',
      popoverForeground: '20 14.3% 4.1%',
      primary: '24.6 95% 53.1%',
      primaryForeground: '60 9.1% 97.8%',
      secondary: '60 4.8% 95.9%',
      secondaryForeground: '24 9.8% 10%',
      muted: '60 4.8% 95.9%',
      mutedForeground: '25 5.3% 44.7%',
      accent: '60 4.8% 95.9%',
      accentForeground: '24 9.8% 10%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '60 9.1% 97.8%',
      success: '142.1 76.2% 36.3%',
      successForeground: '355.7 100% 97.3%',
      warning: '32.5 94.6% 43.7%',
      warningForeground: '355.7 100% 97.3%',
      info: '24.6 95% 53.1%',
      infoForeground: '60 9.1% 97.8%',
      border: '20 5.9% 90%',
      input: '20 5.9% 90%',
      ring: '24.6 95% 53.1%',
      gradientFrom: '24.6 95% 53.1%',
      gradientTo: '346.8 77.2% 49.8%',
      moods: {
        happy: '45 100% 51%',
        excited: '12 100% 61%',
        peaceful: '142 71% 45%',
        thoughtful: '24 95% 53%',
        nostalgic: '347 77% 50%',
        sad: '221 39% 21%',
        angry: '0 84% 60%',
        worried: '25 95% 53%'
      }
    },
    fonts: {
      sans: ['"Inter"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
      serif: ['"Noto Serif SC"', '"Times New Roman"', 'serif'],
      mono: ['"JetBrains Mono"', '"SF Mono"', 'monospace']
    }
  },
  {
    id: 'forest',
    name: 'forest',
    displayName: '森林',
    description: '自然绿色主题，清新护眼',
    category: 'nature',
    colors: {
      background: '138 76% 97%',
      foreground: '155 43% 15%',
      card: '0 0% 100%',
      cardForeground: '155 43% 15%',
      popover: '0 0% 100%',
      popoverForeground: '155 43% 15%',
      primary: '142.1 76.2% 36.3%',
      primaryForeground: '355.7 100% 97.3%',
      secondary: '138 76% 90%',
      secondaryForeground: '155 43% 15%',
      muted: '138 76% 90%',
      mutedForeground: '155 20% 50%',
      accent: '138 76% 90%',
      accentForeground: '155 43% 15%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '355.7 100% 97.3%',
      success: '142.1 76.2% 36.3%',
      successForeground: '355.7 100% 97.3%',
      warning: '32.5 94.6% 43.7%',
      warningForeground: '355.7 100% 97.3%',
      info: '142.1 76.2% 36.3%',
      infoForeground: '355.7 100% 97.3%',
      border: '138 30% 85%',
      input: '138 30% 85%',
      ring: '142.1 76.2% 36.3%',
      gradientFrom: '142.1 76.2% 36.3%',
      gradientTo: '158.1 76.2% 36.3%',
      moods: {
        happy: '45 93% 47%',
        excited: '12 76% 61%',
        peaceful: '142 76% 36%',
        thoughtful: '158 76% 36%',
        nostalgic: '280 100% 70%',
        sad: '198 39% 31%',
        angry: '0 84% 60%',
        worried: '25 95% 53%'
      }
    },
    fonts: {
      sans: ['"Inter"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
      serif: ['"Noto Serif SC"', '"Times New Roman"', 'serif'],
      mono: ['"JetBrains Mono"', '"SF Mono"', 'monospace']
    }
  },
  {
    id: 'ocean',
    name: 'ocean',
    displayName: '深海',
    description: '深蓝海洋主题，宁静致远',
    category: 'nature',
    colors: {
      background: '210 100% 97%',
      foreground: '215 25% 15%',
      card: '0 0% 100%',
      cardForeground: '215 25% 15%',
      popover: '0 0% 100%',
      popoverForeground: '215 25% 15%',
      primary: '207 90% 54%',
      primaryForeground: '210 40% 98%',
      secondary: '210 40% 92%',
      secondaryForeground: '215 25% 15%',
      muted: '210 40% 92%',
      mutedForeground: '215 16% 47%',
      accent: '210 40% 92%',
      accentForeground: '215 25% 15%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '210 40% 98%',
      success: '142.1 76.2% 36.3%',
      successForeground: '355.7 100% 97.3%',
      warning: '32.5 94.6% 43.7%',
      warningForeground: '355.7 100% 97.3%',
      info: '207 90% 54%',
      infoForeground: '210 40% 98%',
      border: '210 30% 88%',
      input: '210 30% 88%',
      ring: '207 90% 54%',
      gradientFrom: '207 90% 54%',
      gradientTo: '199 89% 48%',
      moods: {
        happy: '45 93% 47%',
        excited: '12 76% 61%',
        peaceful: '207 90% 54%',
        thoughtful: '199 89% 48%',
        nostalgic: '280 100% 70%',
        sad: '215 39% 25%',
        angry: '0 84% 60%',
        worried: '25 95% 53%'
      }
    },
    fonts: {
      sans: ['"Inter"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
      serif: ['"Noto Serif SC"', '"Times New Roman"', 'serif'],
      mono: ['"JetBrains Mono"', '"SF Mono"', 'monospace']
    }
  },
  {
    id: 'cherry',
    name: 'cherry',
    displayName: '樱花',
    description: '温柔粉色主题，浪漫唯美',
    category: 'colorful',
    colors: {
      background: '330 100% 98%',
      foreground: '330 25% 15%',
      card: '0 0% 100%',
      cardForeground: '330 25% 15%',
      popover: '0 0% 100%',
      popoverForeground: '330 25% 15%',
      primary: '346.8 77.2% 49.8%',
      primaryForeground: '355.7 100% 97.3%',
      secondary: '330 40% 95%',
      secondaryForeground: '330 25% 15%',
      muted: '330 40% 95%',
      mutedForeground: '330 16% 47%',
      accent: '330 40% 95%',
      accentForeground: '330 25% 15%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '355.7 100% 97.3%',
      success: '142.1 76.2% 36.3%',
      successForeground: '355.7 100% 97.3%',
      warning: '32.5 94.6% 43.7%',
      warningForeground: '355.7 100% 97.3%',
      info: '346.8 77.2% 49.8%',
      infoForeground: '355.7 100% 97.3%',
      border: '330 30% 90%',
      input: '330 30% 90%',
      ring: '346.8 77.2% 49.8%',
      gradientFrom: '346.8 77.2% 49.8%',
      gradientTo: '315.4 100% 69.4%',
      moods: {
        happy: '45 93% 47%',
        excited: '347 77% 50%',
        peaceful: '315 100% 69%',
        thoughtful: '346 77% 50%',
        nostalgic: '315 100% 69%',
        sad: '330 39% 25%',
        angry: '0 84% 60%',
        worried: '25 95% 53%'
      }
    },
    fonts: {
      sans: ['"Inter"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
      serif: ['"Noto Serif SC"', '"Times New Roman"', 'serif'],
      mono: ['"JetBrains Mono"', '"SF Mono"', 'monospace']
    }
  },
  {
    id: 'minimal',
    name: 'minimal',
    displayName: '极简',
    description: '黑白极简主题，专注内容',
    category: 'elegant',
    colors: {
      background: '0 0% 100%',
      foreground: '0 0% 10%',
      card: '0 0% 100%',
      cardForeground: '0 0% 10%',
      popover: '0 0% 100%',
      popoverForeground: '0 0% 10%',
      primary: '0 0% 20%',
      primaryForeground: '0 0% 95%',
      secondary: '0 0% 96%',
      secondaryForeground: '0 0% 20%',
      muted: '0 0% 96%',
      mutedForeground: '0 0% 45%',
      accent: '0 0% 96%',
      accentForeground: '0 0% 20%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '0 0% 95%',
      success: '142.1 76.2% 36.3%',
      successForeground: '355.7 100% 97.3%',
      warning: '32.5 94.6% 43.7%',
      warningForeground: '355.7 100% 97.3%',
      info: '0 0% 20%',
      infoForeground: '0 0% 95%',
      border: '0 0% 90%',
      input: '0 0% 90%',
      ring: '0 0% 20%',
      gradientFrom: '0 0% 20%',
      gradientTo: '0 0% 40%',
      moods: {
        happy: '45 93% 47%',
        excited: '12 76% 61%',
        peaceful: '0 0% 60%',
        thoughtful: '0 0% 40%',
        nostalgic: '0 0% 50%',
        sad: '0 0% 30%',
        angry: '0 84% 60%',
        worried: '25 95% 53%'
      }
    },
    fonts: {
      sans: ['"Inter"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
      serif: ['"Noto Serif SC"', '"Times New Roman"', 'serif'],
      mono: ['"JetBrains Mono"', '"SF Mono"', 'monospace']
    }
  }
];

// 主题分类
export const themeCategories = {
  light: '浅色',
  dark: '深色',
  colorful: '彩色',
  nature: '自然',
  elegant: '优雅'
};

// 获取主题
export const getTheme = (themeId: string): Theme => {
  return themes.find(theme => theme.id === themeId) || themes[0];
};

// 应用主题到 CSS 变量
export const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  
  // 应用颜色变量
  Object.entries(theme.colors).forEach(([key, value]) => {
    if (key === 'moods') {
      // 处理心情颜色
      Object.entries(value as Record<string, string>).forEach(([moodKey, moodValue]) => {
        root.style.setProperty(`--mood-${moodKey}`, `hsl(${moodValue})`);
      });
    } else {
      // 转换驼峰命名为 kebab-case
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--${cssKey}`, `hsl(${value})`);
    }
  });
  
  // 应用字体变量
  root.style.setProperty('--font-sans', theme.fonts.sans.join(', '));
  root.style.setProperty('--font-serif', theme.fonts.serif.join(', '));
  root.style.setProperty('--font-mono', theme.fonts.mono.join(', '));
  
  // 保存主题 ID 到 data 属性
  root.setAttribute('data-theme', theme.id);
};

// 获取当前主题
export const getCurrentTheme = (): string => {
  return document.documentElement.getAttribute('data-theme') || 'default';
};
