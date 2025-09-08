import { Metadata } from 'next';
import { ThemeSettingsPage } from '@/components/theme/ThemeSettingsPage';

export const metadata: Metadata = {
  title: '主题设置 - 时光记',
  description: '个性化定制你的时光记主题，支持多种预设主题和自定义颜色',
  keywords: ['主题', '设置', '个性化', '外观'],
  openGraph: {
    title: '主题设置 - 时光记',
    description: '个性化定制你的时光记主题',
    type: 'website',
  },
};

export default function ThemesPage() {
  return <ThemeSettingsPage />;
}
