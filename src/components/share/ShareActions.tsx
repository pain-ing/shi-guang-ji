'use client';

import React, { memo, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Share2, 
  Download, 
  Copy, 
  Instagram,
  Twitter,
  Facebook,
  Link2,
  Loader2,
  Check
} from 'lucide-react';
import html2canvas from 'html2canvas';

type SharePlatform = 'wechat' | 'weibo' | 'twitter' | 'facebook' | 'instagram' | 'link';

interface ShareActionsProps {
  cardRef: React.RefObject<HTMLDivElement>;
  onShare?: (platform: SharePlatform, imageUrl: string) => void;
}

export const ShareActions = memo<ShareActionsProps>(({ cardRef, onShare }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // 生成分享卡片图片
  const generateImage = useCallback(async () => {
    if (!cardRef.current) return null;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: true
      });
      
      const imageUrl = canvas.toDataURL('image/png', 0.9);
      setGeneratedImage(imageUrl);
      return imageUrl;
    } catch (error) {
      console.error('生成图片失败:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [cardRef]);

  // 下载图片
  const downloadImage = useCallback(async () => {
    let imageUrl = generatedImage;
    if (!imageUrl) {
      imageUrl = await generateImage();
    }
    
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.download = `share-card-${Date.now()}.png`;
    link.href = imageUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [generatedImage, generateImage]);

  // 复制链接
  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  }, []);

  // 分享到不同平台
  const shareToPlatform = useCallback(async (platform: SharePlatform) => {
    let imageUrl = generatedImage;
    if (!imageUrl) {
      imageUrl = await generateImage();
    }
    
    if (imageUrl && onShare) {
      onShare(platform, imageUrl);
    }
  }, [generatedImage, generateImage, onShare]);

  const shareButtons = [
    {
      platform: 'twitter' as SharePlatform,
      icon: Twitter,
      label: 'Twitter',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      platform: 'facebook' as SharePlatform,
      icon: Facebook,
      label: 'Facebook',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      platform: 'instagram' as SharePlatform,
      icon: Instagram,
      label: 'Instagram',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
    },
    {
      platform: 'wechat' as SharePlatform,
      icon: Share2,
      label: '微信',
      color: 'bg-green-500 hover:bg-green-600'
    }
  ];

  return (
    <div className="space-y-4">
      {/* 生成和下载按钮 */}
      <div className="flex gap-2">
        <Button
          onClick={generateImage}
          disabled={isGenerating}
          className="flex-1"
          variant="outline"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 mr-2" />
              生成图片
            </>
          )}
        </Button>

        <Button
          onClick={downloadImage}
          disabled={isGenerating}
          variant="outline"
        >
          <Download className="w-4 h-4 mr-2" />
          下载
        </Button>

        <Button
          onClick={copyLink}
          variant="outline"
        >
          {copied ? (
            <Check className="w-4 h-4 mr-2 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 mr-2" />
          )}
          {copied ? '已复制' : '复制链接'}
        </Button>
      </div>

      {/* 分享按钮 */}
      <div className="grid grid-cols-2 gap-2">
        {shareButtons.map(({ platform, icon: Icon, label, color }) => (
          <Button
            key={platform}
            onClick={() => shareToPlatform(platform)}
            disabled={isGenerating}
            className={`text-white ${color}`}
            size="sm"
          >
            <Icon className="w-4 h-4 mr-2" />
            {label}
          </Button>
        ))}
      </div>

      {/* 预览图片 */}
      {generatedImage && (
        <div className="mt-4 p-4 border rounded-lg">
          <p className="text-sm text-gray-600 mb-2">生成的图片预览：</p>
          <img 
            src={generatedImage} 
            alt="Generated share card" 
            className="w-full max-w-xs mx-auto rounded-lg shadow-md"
          />
        </div>
      )}
    </div>
  );
});

ShareActions.displayName = 'ShareActions';
