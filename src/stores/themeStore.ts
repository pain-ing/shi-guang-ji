import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Theme, themes, applyTheme, getTheme } from '@/lib/themes';

interface CustomTheme extends Omit<Theme, 'id' | 'name'> {
  id?: string;
  name?: string;
}

interface ThemeState {
  // 当前主题
  currentThemeId: string;
  currentTheme: Theme;
  
  // 自定义主题
  customThemes: CustomTheme[];
  
  // 主题设置
  autoSwitchEnabled: boolean;
  darkModeSchedule: {
    startTime: string; // "22:00"
    endTime: string;   // "06:00"
  };
  
  // 操作方法
  setTheme: (themeId: string) => void;
  addCustomTheme: (theme: CustomTheme) => string;
  updateCustomTheme: (themeId: string, updates: Partial<CustomTheme>) => void;
  deleteCustomTheme: (themeId: string) => void;
  toggleAutoSwitch: () => void;
  setDarkModeSchedule: (startTime: string, endTime: string) => void;
  
  // 工具方法
  getAllThemes: () => Theme[];
  getThemesByCategory: (category: string) => Theme[];
  initializeTheme: () => void;
  checkAutoSwitch: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      currentThemeId: 'default',
      currentTheme: themes[0],
      customThemes: [],
      autoSwitchEnabled: false,
      darkModeSchedule: {
        startTime: '22:00',
        endTime: '06:00'
      },

      setTheme: (themeId: string) => {
        const allThemes = get().getAllThemes();
        const theme = allThemes.find(t => t.id === themeId) || themes[0];
        
        set({
          currentThemeId: themeId,
          currentTheme: theme
        });

        // 应用主题到 DOM
        if (typeof window !== 'undefined') {
          applyTheme(theme);
        }
      },

      addCustomTheme: (customTheme: CustomTheme) => {
        const id = `custom-${Date.now()}`;
        const name = `custom-${Date.now()}`;
        
        const theme: Theme = {
          id,
          name,
          displayName: customTheme.displayName || '自定义主题',
          description: customTheme.description || '用户自定义主题',
          category: customTheme.category || 'colorful',
          colors: customTheme.colors,
          fonts: customTheme.fonts
        };

        set(state => ({
          customThemes: [...state.customThemes, theme]
        }));

        return id;
      },

      updateCustomTheme: (themeId: string, updates: Partial<CustomTheme>) => {
        set(state => ({
          customThemes: state.customThemes.map(theme => 
            theme.id === themeId 
              ? { ...theme, ...updates }
              : theme
          )
        }));
      },

      deleteCustomTheme: (themeId: string) => {
        set(state => {
          const newCustomThemes = state.customThemes.filter(t => t.id !== themeId);
          
          // 如果删除的是当前主题，切换到默认主题
          if (state.currentThemeId === themeId) {
            const defaultTheme = themes[0];
            if (typeof window !== 'undefined') {
              applyTheme(defaultTheme);
            }
            return {
              customThemes: newCustomThemes,
              currentThemeId: 'default',
              currentTheme: defaultTheme
            };
          }
          
          return {
            customThemes: newCustomThemes
          };
        });
      },

      toggleAutoSwitch: () => {
        set(state => ({
          autoSwitchEnabled: !state.autoSwitchEnabled
        }));
        
        // 如果开启自动切换，立即检查当前时间
        const { autoSwitchEnabled } = get();
        if (autoSwitchEnabled) {
          get().checkAutoSwitch();
        }
      },

      setDarkModeSchedule: (startTime: string, endTime: string) => {
        set({
          darkModeSchedule: { startTime, endTime }
        });
        
        // 如果自动切换已开启，重新检查
        const { autoSwitchEnabled } = get();
        if (autoSwitchEnabled) {
          get().checkAutoSwitch();
        }
      },

      getAllThemes: () => {
        const { customThemes } = get();
        return [...themes, ...customThemes] as Theme[];
      },

      getThemesByCategory: (category: string) => {
        const allThemes = get().getAllThemes();
        return allThemes.filter(theme => theme.category === category);
      },

      initializeTheme: () => {
        const { currentThemeId } = get();
        let theme = getTheme(currentThemeId);
        
        // 如果没有存储的主题ID或主题不存在，使用默认主题
        if (!currentThemeId || currentThemeId === 'default' || !theme) {
          theme = themes[0]; // 确保使用我们定义的默认主题
        }
        
        set({
          currentThemeId: theme.id,
          currentTheme: theme
        });

        if (typeof window !== 'undefined') {
          applyTheme(theme);
          
          // 只有在明确启用自动切换时才检查
          const { autoSwitchEnabled } = get();
          if (autoSwitchEnabled) {
            get().checkAutoSwitch();
          }
        }
      },

      checkAutoSwitch: () => {
        const { autoSwitchEnabled, darkModeSchedule, currentThemeId } = get();
        
        if (!autoSwitchEnabled || typeof window === 'undefined') return;

        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        const isInDarkPeriod = () => {
          const { startTime, endTime } = darkModeSchedule;
          
          // 处理跨天的情况，如 22:00 - 06:00
          if (startTime > endTime) {
            return currentTime >= startTime || currentTime < endTime;
          }
          // 处理同一天的情况，如 18:00 - 20:00
          return currentTime >= startTime && currentTime < endTime;
        };

        const shouldUseDark = isInDarkPeriod();
        const isDarkTheme = currentThemeId === 'dark';

        if (shouldUseDark && !isDarkTheme) {
          get().setTheme('dark');
        } else if (!shouldUseDark && isDarkTheme) {
          get().setTheme('default');
        }
      }
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({
        currentThemeId: state.currentThemeId,
        customThemes: state.customThemes,
        autoSwitchEnabled: state.autoSwitchEnabled,
        darkModeSchedule: state.darkModeSchedule
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // 延迟初始化，确保 DOM 已加载
          setTimeout(() => {
            state.initializeTheme();
          }, 0);
        }
      }
    }
  )
);

// 自动检查主题切换的定时器
if (typeof window !== 'undefined') {
  // 每分钟检查一次自动切换
  setInterval(() => {
    const store = useThemeStore.getState();
    if (store.autoSwitchEnabled) {
      store.checkAutoSwitch();
    }
  }, 60 * 1000);
  
  // 暂时禁用系统主题自动跟随，让用户完全控制主题
  // 如果需要可以在主题设置中添加一个开关来启用此功能
}
