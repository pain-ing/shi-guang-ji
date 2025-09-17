'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Share2, 
  Download, 
  Copy, 
  Palette, 
  Type,
  Image as ImageIcon,
  Sparkles,
  Heart,
  Calendar,
  MapPin,
  Cloud,
  Quote,
  Camera,
  Instagram,
  Twitter,
  Facebook,
  Link2,
  QrCode,
  Loader2,
  Check,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';

// 分享卡片模板类型
type CardTemplate = 'classic' | 'modern' | 'minimal' | 'gradient' | 'photo' | 'quote';

// 分享平台类型
type SharePlatform = 'wechat' | 'weibo' | 'twitter' | 'facebook' | 'instagram' | 'link';

// 卡片配置接口
interface ShareCardConfig {
  template: CardTemplate;
  title: string;
  content: string;
  author: string;
  date: string;
  location?: string;
  weather?: string;
  mood?: string;
  tags?: string[];
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: 'small' | 'medium' | 'large';
  showQRCode: boolean;
  showLogo: boolean;
  imageUrl?: string;
}

// 预设主题
const PRESET_THEMES = {
  sunrise: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textColor: '#ffffff',
    accentColor: '#ffd93d'
  },
  ocean: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #48b1bf 100%)',
    textColor: '#ffffff',
    accentColor: '#00d4ff'
  },
  forest: {
    backgroundColor: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    textColor: '#ffffff',
    accentColor: '#2d5016'
  },
  sunset: {
    backgroundColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    textColor: '#ffffff',
    accentColor: '#4a0e4e'
  },
  minimal: {
    backgroundColor: '#ffffff',
    textColor: '#333333',
    accentColor: '#0066cc'
  },
  dark: {
    backgroundColor: '#1a1a1a',
    textColor: '#e0e0e0',
    accentColor: '#ff6b6b'
  }
};

interface ShareCardGeneratorProps {
  initialContent?: string;
  initialTitle?: string;
  onShare?: (platform: SharePlatform, imageUrl: string) => void;
}

export const ShareCardGenerator: React.FC<ShareCardGeneratorProps> = ({
  initialContent = '',
  initialTitle = '',
  onShare
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
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

  // 更新配置
  const updateConfig = (key: keyof ShareCardConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  // 应用预设主题
  const applyTheme = (themeName: keyof typeof PRESET_THEMES) => {
    const theme = PRESET_THEMES[themeName];
    setConfig(prev => ({
      ...prev,
      backgroundColor: theme.backgroundColor,
      textColor: theme.textColor,
      accentColor: theme.accentColor
    }));
  };

  // 生成分享卡片图片
  const generateImage = async () => {
    if (!cardRef.current) return;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true
      });
      
      const imageUrl = canvas.toDataURL('image/png');
      setGeneratedImage(imageUrl);
    } catch (error) {
      console.error('生成图片失败:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // 下载图片
  const downloadImage = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.download = `share-card-${Date.now()}.png`;
    link.href = generatedImage;
    link.click();
  };

  // 复制链接
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 分享到不同平台
  const shareToPlatform = (platform: SharePlatform) => {
    if (!generatedImage) {
      generateImage().then(() => {
        if (generatedImage && onShare) {
          onShare(platform, generatedImage);
        }
      });
    } else if (onShare) {
      onShare(platform, generatedImage);
    }

    // 这里可以添加实际的分享逻辑
    const shareUrls: Record<SharePlatform, string> = {
      wechat: '#', // 微信分享需要使用JSSDK
      weibo: `https://service.weibo.com/share/share.php?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(config.title)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(config.title)}&url=${encodeURIComponent(window.location.href)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
      instagram: '#', // Instagram不支持网页分享
      link: window.location.href
    };

    const url = shareUrls[platform];
    if (url && url !== '#') {
      window.open(url, '_blank');
    }
  };

  // 获取字体大小样式
  const getFontSize = () => {
    const sizes = {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg'
    };
    return sizes[config.fontSize];
  };

  // 渲染卡片预览
  const renderCardPreview = () => {
    const templates: Record<CardTemplate, JSX.Element> = {
      classic: (
        <div 
          className="w-full h-full p-8 flex flex-col justify-between"
          style={{
            background: config.backgroundColor,
            color: config.textColor,
            fontFamily: config.fontFamily
          }}
        >
          {config.showLogo && (
            <div className="text-2xl font-bold mb-4">拾光集</div>
          )}
          
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-4">{config.title}</h2>
            <p className={`${getFontSize()} leading-relaxed mb-6`}>
              {config.content}
            </p>
            
            {config.tags && config.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {config.tags.map(tag => (
                  <span 
                    key={tag}
                    className="px-2 py-1 rounded text-sm"
                    style={{ backgroundColor: config.accentColor }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-sm opacity-80">
            <div className="flex items-center gap-4">
              {config.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {config.location}
                </span>
              )}
              {config.weather && (
                <span className="flex items-center gap-1">
                  ☀️ {config.weather}
                </span>
              )}
            </div>
            <div>
              {config.date} · {config.author}
            </div>
          </div>

          {config.showQRCode && qrCodeUrl && (
            <div className="absolute bottom-4 right-4">
              <img src={qrCodeUrl} alt="QR Code" className="w-20 h-20" />
            </div>
          )}
        </div>
      ),
      
      modern: (
        <div 
          className="w-full h-full relative overflow-hidden"
          style={{ backgroundColor: config.backgroundColor }}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="w-96 h-96 rounded-full bg-white blur-3xl -top-20 -left-20" />
            <div className="w-96 h-96 rounded-full bg-white blur-3xl -bottom-20 -right-20" />
          </div>
          
          <div 
            className="relative h-full p-8 flex flex-col justify-between"
            style={{ color: config.textColor }}
          >
            <div>
              <div className="text-5xl font-bold mb-2" style={{ color: config.accentColor }}>
                "
              </div>
              <h2 className="text-2xl font-bold mb-4">{config.title}</h2>
              <p className={`${getFontSize()} leading-relaxed`}>
                {config.content}
              </p>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span>{config.author}</span>
              <span>{config.date}</span>
            </div>
          </div>
        </div>
      ),

      minimal: (
        <div className="w-full h-full bg-white p-12">
          <div className="h-full flex flex-col justify-between">
            <div className="text-center">
              <h2 className="text-2xl font-light mb-8 text-gray-800">
                {config.title}
              </h2>
              <div className="w-16 h-px bg-gray-300 mx-auto mb-8" />
              <p className="text-gray-600 leading-relaxed max-w-md mx-auto">
                {config.content}
              </p>
            </div>
            
            <div className="text-center text-sm text-gray-400">
              {config.date}
            </div>
          </div>
        </div>
      ),

      gradient: (
        <div 
          className="w-full h-full p-8"
          style={{
            background: `linear-gradient(135deg, ${config.backgroundColor} 0%, ${config.accentColor} 100%)`,
            color: config.textColor
          }}
        >
          <div className="h-full flex flex-col justify-center text-center">
            <h2 className="text-3xl font-bold mb-6">{config.title}</h2>
            <p className={`${getFontSize()} leading-relaxed mb-8`}>
              {config.content}
            </p>
            <div className="text-sm opacity-80">
              —— {config.author} · {config.date}
            </div>
          </div>
        </div>
      ),

      photo: (
        <div className="w-full h-full relative">
          {config.imageUrl ? (
            <img 
              src={config.imageUrl} 
              alt="" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600" />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-40" />
          <div className="relative h-full p-8 flex flex-col justify-end text-white">
            <h2 className="text-2xl font-bold mb-3">{config.title}</h2>
            <p className={`${getFontSize()} mb-4`}>
              {config.content}
            </p>
            <div className="text-sm opacity-80">
              {config.date} · {config.location}
            </div>
          </div>
        </div>
      ),

      quote: (
        <div 
          className="w-full h-full flex items-center justify-center p-12"
          style={{
            backgroundColor: config.backgroundColor,
            color: config.textColor
          }}
        >
          <div className="text-center max-w-lg">
            <Quote className="w-12 h-12 mx-auto mb-6 opacity-20" />
            <p className="text-xl italic mb-6 leading-relaxed">
              "{config.content}"
            </p>
            <div className="text-sm">
              <div className="font-semibold">{config.title}</div>
              <div className="opacity-60 mt-1">
                {config.author} · {config.date}
              </div>
            </div>
          </div>
        </div>
      )
    };

    return templates[config.template];
  };

  return (
    <div className="space-y-6">
      {/* 配置面板 */}
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="content">内容</TabsTrigger>
          <TabsTrigger value="style">样式</TabsTrigger>
          <TabsTrigger value="template">模板</TabsTrigger>
          <TabsTrigger value="share">分享</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <div>
            <Label htmlFor="title">标题</Label>
            <Input
              id="title"
              value={config.title}
              onChange={(e) => updateConfig('title', e.target.value)}
              placeholder="输入标题"
            />
          </div>
          
          <div>
            <Label htmlFor="content">内容</Label>
            <Textarea
              id="content"
              value={config.content}
              onChange={(e) => updateConfig('content', e.target.value)}
              placeholder="输入内容"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="author">作者</Label>
              <Input
                id="author"
                value={config.author}
                onChange={(e) => updateConfig('author', e.target.value)}
                placeholder="作者名称"
              />
            </div>
            
            <div>
              <Label htmlFor="date">日期</Label>
              <Input
                id="date"
                value={config.date}
                onChange={(e) => updateConfig('date', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">地点</Label>
              <Input
                id="location"
                value={config.location}
                onChange={(e) => updateConfig('location', e.target.value)}
                placeholder="添加地点"
              />
            </div>
            
            <div>
              <Label htmlFor="weather">天气</Label>
              <Input
                id="weather"
                value={config.weather}
                onChange={(e) => updateConfig('weather', e.target.value)}
                placeholder="天气状况"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="style" className="space-y-4">
          <div>
            <Label>预设主题</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {Object.keys(PRESET_THEMES).map(theme => (
                <Button
                  key={theme}
                  variant="outline"
                  size="sm"
                  onClick={() => applyTheme(theme as keyof typeof PRESET_THEMES)}
                  className="capitalize"
                >
                  {theme}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="fontSize">字体大小</Label>
            <Select value={config.fontSize} onValueChange={(value: any) => updateConfig('fontSize', value)}>
              <SelectTrigger id="fontSize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">小</SelectItem>
                <SelectItem value="medium">中</SelectItem>
                <SelectItem value="large">大</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="fontFamily">字体</Label>
            <Select value={config.fontFamily} onValueChange={(value) => updateConfig('fontFamily', value)}>
              <SelectTrigger id="fontFamily">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="serif">衬线字体</SelectItem>
                <SelectItem value="sans-serif">无衬线字体</SelectItem>
                <SelectItem value="monospace">等宽字体</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="showQRCode">显示二维码</Label>
            <Switch
              id="showQRCode"
              checked={config.showQRCode}
              onCheckedChange={(checked) => updateConfig('showQRCode', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="showLogo">显示Logo</Label>
            <Switch
              id="showLogo"
              checked={config.showLogo}
              onCheckedChange={(checked) => updateConfig('showLogo', checked)}
            />
          </div>
        </TabsContent>

        <TabsContent value="template" className="space-y-4">
          <div>
            <Label>选择模板</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {(['classic', 'modern', 'minimal', 'gradient', 'photo', 'quote'] as CardTemplate[]).map(template => (
                <motion.div
                  key={template}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card 
                    className={`cursor-pointer ${config.template === template ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => updateConfig('template', template)}
                  >
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl mb-2">
                          {template === 'classic' && '📜'}
                          {template === 'modern' && '🎨'}
                          {template === 'minimal' && '⚪'}
                          {template === 'gradient' && '🌈'}
                          {template === 'photo' && '📷'}
                          {template === 'quote' && '💬'}
                        </div>
                        <p className="text-sm font-medium capitalize">{template}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="share" className="space-y-4">
          <div>
            <Label>分享到</Label>
            <div className="grid grid-cols-3 gap-3 mt-2">
              <Button
                variant="outline"
                onClick={() => shareToPlatform('wechat')}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                微信
              </Button>
              <Button
                variant="outline"
                onClick={() => shareToPlatform('weibo')}
              >
                <Share2 className="w-4 h-4 mr-2" />
                微博
              </Button>
              <Button
                variant="outline"
                onClick={() => shareToPlatform('twitter')}
              >
                <Twitter className="w-4 h-4 mr-2" />
                Twitter
              </Button>
              <Button
                variant="outline"
                onClick={() => shareToPlatform('facebook')}
              >
                <Facebook className="w-4 h-4 mr-2" />
                Facebook
              </Button>
              <Button
                variant="outline"
                onClick={() => shareToPlatform('instagram')}
              >
                <Instagram className="w-4 h-4 mr-2" />
                Instagram
              </Button>
              <Button
                variant="outline"
                onClick={copyLink}
              >
                {copied ? (
                  <Check className="w-4 h-4 mr-2" />
                ) : (
                  <Link2 className="w-4 h-4 mr-2" />
                )}
                {copied ? '已复制' : '复制链接'}
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={generateImage}
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  生成卡片
                </>
              )}
            </Button>
            
            {generatedImage && (
              <Button onClick={downloadImage} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                下载
              </Button>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* 预览区域 */}
      <Card>
        <CardHeader>
          <CardTitle>卡片预览</CardTitle>
          <CardDescription>实时预览分享卡片效果</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div 
              ref={cardRef}
              className="w-full aspect-[3/4] md:aspect-[4/3] rounded-lg overflow-hidden shadow-lg"
            >
              {renderCardPreview()}
            </div>
            
            {generatedImage && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <Badge className="bg-green-500 text-white">
                  <Check className="w-4 h-4 mr-1" />
                  已生成
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShareCardGenerator;