'use client';

import React, { memo, forwardRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Cloud, Heart } from 'lucide-react';
import { ShareCardConfig } from './ShareCardConfig';

interface ShareCardPreviewProps {
  config: ShareCardConfig;
  qrCodeUrl?: string;
}

export const ShareCardPreview = memo(forwardRef<HTMLDivElement, ShareCardPreviewProps>(
  ({ config, qrCodeUrl }, ref) => {
    const getFontSizeClass = () => {
      switch (config.fontSize) {
        case 'small': return 'text-sm';
        case 'large': return 'text-lg';
        default: return 'text-base';
      }
    };

    const renderTemplate = () => {
      const baseClasses = `relative overflow-hidden rounded-lg shadow-lg ${getFontSizeClass()}`;
      
      switch (config.template) {
        case 'modern':
          return (
            <div 
              className={`${baseClasses} p-8 min-h-[400px]`}
              style={{ 
                background: config.backgroundColor,
                color: config.textColor 
              }}
            >
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold mb-4" style={{ color: config.accentColor }}>
                    {config.title}
                  </h1>
                  <p className="leading-relaxed mb-6">{config.content}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm opacity-80">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {config.date}
                    </span>
                    {config.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {config.location}
                      </span>
                    )}
                  </div>
                  
                  {config.showQRCode && qrCodeUrl && (
                    <img src={qrCodeUrl} alt="QR Code" className="w-16 h-16" />
                  )}
                </div>
              </div>
            </div>
          );

        case 'minimal':
          return (
            <div 
              className={`${baseClasses} p-8 min-h-[400px] border-l-4`}
              style={{ 
                background: config.backgroundColor,
                color: config.textColor,
                borderLeftColor: config.accentColor
              }}
            >
              <div className="space-y-6">
                <h1 className="text-xl font-light">{config.title}</h1>
                <p className="leading-relaxed text-gray-600">{config.content}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-500">— {config.author}</span>
                  <span className="text-sm text-gray-500">{config.date}</span>
                </div>
              </div>
            </div>
          );

        case 'gradient':
          return (
            <div 
              className={`${baseClasses} p-8 min-h-[400px] text-white`}
              style={{ background: config.backgroundColor }}
            >
              <div className="relative z-10">
                <div className="absolute inset-0 bg-black/20 rounded-lg"></div>
                <div className="relative space-y-6">
                  <h1 className="text-3xl font-bold">{config.title}</h1>
                  <p className="text-lg leading-relaxed">{config.content}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {config.tags?.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-white/20 text-white">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );

        case 'quote':
          return (
            <div 
              className={`${baseClasses} p-8 min-h-[400px] flex items-center justify-center`}
              style={{ 
                background: config.backgroundColor,
                color: config.textColor 
              }}
            >
              <div className="text-center space-y-6">
                <div className="text-6xl opacity-20" style={{ color: config.accentColor }}>
                  "
                </div>
                <blockquote className="text-xl italic leading-relaxed max-w-md">
                  {config.content}
                </blockquote>
                <cite className="text-sm opacity-70">— {config.author}</cite>
              </div>
            </div>
          );

        default: // classic
          return (
            <div 
              className={`${baseClasses} p-8 min-h-[400px]`}
              style={{ 
                background: config.backgroundColor,
                color: config.textColor 
              }}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">{config.title}</h1>
                  {config.showLogo && (
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-lg font-bold">拾</span>
                    </div>
                  )}
                </div>
                
                <p className="leading-relaxed">{config.content}</p>
                
                <div className="flex items-center gap-4 text-sm opacity-80">
                  {config.weather && (
                    <span className="flex items-center gap-1">
                      <Cloud className="w-4 h-4" />
                      {config.weather}
                    </span>
                  )}
                  {config.mood && (
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {config.mood}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/20">
                  <span className="text-sm">{config.author}</span>
                  <span className="text-sm">{config.date}</span>
                </div>
              </div>
            </div>
          );
      }
    };

    return (
      <div ref={ref} className="w-full max-w-md mx-auto">
        {renderTemplate()}
      </div>
    );
  }
));

ShareCardPreview.displayName = 'ShareCardPreview';
