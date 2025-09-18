'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import { ShareCardConfigPanel, ShareCardConfig, PRESET_THEMES } from './ShareCardConfig';
import { ShareCardPreview } from './ShareCardPreview';
import { ShareActions } from './ShareActions';

// 分享平台类型
type SharePlatform = 'wechat' | 'weibo' | 'twitter' | 'facebook' | 'instagram' | 'link';

interface ShareCardGeneratorProps {
  initialContent?: string;
  initialTitle?: string;
  onShare?: (platform: SharePlatform, imageUrl: string) => void;
}

const ShareCardGenerator: React.FC<ShareCardGeneratorProps> = ({
  initialContent = '',
  initialTitle = '',
  onShare
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  // 卡片配置状态
  const [config, setConfig] = useState<ShareCardConfig>({
    template: 'classic',
    title: initialTitle || '时光记忆',
    content: initialContent || '记录生活中的美好瞬间，让每一个时刻都值得珍藏。',
    author: '拾光集',
    date: new Date().toLocaleDateString('zh-CN'),
    location: '上海',
    weather: '晴天',
    mood: '开心',
    tags: ['日记', '生活', '记录'],
    backgroundColor: PRESET_THEMES.sunrise.backgroundColor,
    textColor: PRESET_THEMES.sunrise.textColor,
    accentColor: PRESET_THEMES.sunrise.accentColor,
    fontFamily: 'serif',
    fontSize: 'medium',
    showQRCode: false,
    showLogo: true
  });

  // 生成二维码
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const url = window.location.href;
        const qrUrl = await QRCode.toDataURL(url, {
          width: 128,
          margin: 1,
          color: {
            dark: config.textColor,
            light: '#00000000'
          }
        });
        setQrCodeUrl(qrUrl);
      } catch (error) {
        console.error('生成二维码失败:', error);
      }
    };
    
    if (config.showQRCode) {
      generateQRCode();
    }
  }, [config.showQRCode, config.textColor]);

  // 应用预设主题
  const applyTheme = useCallback((themeName: keyof typeof PRESET_THEMES) => {
    const theme = PRESET_THEMES[themeName];
    setConfig(prev => ({
      ...prev,
      backgroundColor: theme.backgroundColor,
      textColor: theme.textColor,
      accentColor: theme.accentColor
    }));
  }, []);



  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              🌟
            </motion.div>
            分享卡片生成器
          </CardTitle>
          <CardDescription>
            创建精美的分享卡片，记录生活中的美好瞬间
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="edit" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit">编辑</TabsTrigger>
              <TabsTrigger value="preview">预览</TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <ShareCardConfigPanel
                    config={config}
                    onConfigChange={setConfig}
                    onApplyTheme={applyTheme}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">预览</h3>
                  <ShareCardPreview
                    ref={cardRef}
                    config={config}
                    qrCodeUrl={qrCodeUrl}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="flex justify-center">
                  <ShareCardPreview
                    ref={cardRef}
                    config={config}
                    qrCodeUrl={qrCodeUrl}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">分享操作</h3>
                  <ShareActions
                    cardRef={cardRef}
                    onShare={onShare}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShareCardGenerator;