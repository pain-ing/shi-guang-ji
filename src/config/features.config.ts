// 功能配置中心 - 统一管理所有功能的配置
// 避免配置分散，便于维护和调整

export const FEATURES_CONFIG = {
  // AI 功能配置
  ai: {
    enabled: true,
    provider: process.env.NEXT_PUBLIC_AI_PROVIDER || 'openai',
    apiKey: process.env.NEXT_PUBLIC_AI_API_KEY,
    model: process.env.NEXT_PUBLIC_AI_MODEL || 'gpt-3.5-turbo',
    maxTokens: 2000,
    temperature: 0.7,
    features: {
      writingAssistant: true,
      emotionDetection: true,
      tagGeneration: true,
      voiceInput: true,
      smartSummary: true,
      translation: false
    }
  },

  // 加密配置
  encryption: {
    enabled: true,
    algorithm: 'AES-256-GCM' as const,
    pbkdf2Iterations: 100000,
    saltLength: 16,
    biometric: {
      enabled: true,
      fallbackToPassword: true
    }
  },

  // 媒体配置
  media: {
    audio: {
      enabled: true,
      maxDuration: 300, // 5分钟
      format: 'webm',
      quality: 'high',
      backgroundMusic: true
    },
    video: {
      enabled: true,
      maxDuration: 180, // 3分钟
      resolution: '720p',
      format: 'webm'
    },
    image: {
      maxSize: 10 * 1024 * 1024, // 10MB
      compression: {
        enabled: true,
        quality: 0.9,
        maxWidth: 1920,
        maxHeight: 1080
      },
      editing: {
        filters: true,
        crop: true,
        draw: true,
        stickers: true
      }
    },
    drawing: {
      enabled: true,
      canvasSize: { width: 800, height: 600 },
      tools: ['pen', 'brush', 'eraser', 'shape', 'text'],
      colors: ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF']
    }
  },

  // 分析功能配置
  analytics: {
    enabled: true,
    emotion: {
      tracking: true,
      chart: true,
      insights: true
    },
    habit: {
      tracking: true,
      streaks: true,
      reminders: true,
      achievements: true
    },
    statistics: {
      wordCount: true,
      entryFrequency: true,
      topTags: true,
      yearlyReport: true
    }
  },

  // 时间胶囊配置
  timeCapsule: {
    enabled: true,
    maxFutureYears: 10,
    reminderDays: [30, 7, 1], // 提前提醒天数
    allowEdit: false, // 创建后不可编辑
    notifications: {
      email: true,
      push: true,
      inApp: true
    }
  },

  // 地理功能配置
  location: {
    enabled: true,
    tracking: 'manual', // 'auto' | 'manual' | 'disabled'
    mapProvider: 'mapbox', // 'mapbox' | 'google' | 'openstreetmap'
    features: {
      currentLocation: true,
      travelMap: true,
      placeMemories: true,
      geoTagging: true
    },
    privacy: {
      fuzzyLocation: true, // 模糊化精确位置
      shareLocation: false // 默认不分享位置
    }
  },

  // 社交功能配置
  social: {
    enabled: true,
    sharing: {
      anonymous: true,
      cards: true,
      watermark: true
    },
    family: {
      enabled: true,
      maxMembers: 10,
      sharedAlbum: true
    },
    friends: {
      enabled: true,
      exchange: true,
      maxConnections: 50
    }
  },

  // 主题配置
  theme: {
    customization: true,
    presets: [
      'default',
      'dark',
      'nature',
      'ocean',
      'sunset',
      'minimalist',
      'vintage',
      'cyberpunk'
    ],
    dynamic: {
      enabled: true,
      factors: ['time', 'weather', 'season', 'mood']
    },
    animations: true,
    sounds: false
  },

  // 导出配置
  export: {
    formats: ['pdf', 'markdown', 'html', 'json', 'epub'],
    templates: {
      pdf: ['simple', 'elegant', 'photo-album', 'timeline'],
      html: ['blog', 'portfolio', 'scrapbook']
    },
    options: {
      includeMedia: true,
      includeStatistics: true,
      watermark: false,
      encryption: true
    }
  },

  // 通知配置
  notifications: {
    enabled: true,
    channels: {
      inApp: true,
      push: true,
      email: false,
      sms: false
    },
    types: {
      dailyReminder: true,
      achievement: true,
      timeCapsule: true,
      weeklyReport: true,
      backup: true
    },
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '08:00'
    }
  },

  // 离线功能配置
  offline: {
    enabled: true,
    sync: {
      auto: true,
      interval: 300000, // 5分钟
      onWifi: true,
      onMobile: false
    },
    storage: {
      maxSize: 100 * 1024 * 1024, // 100MB
      cleanupThreshold: 0.9, // 90%使用率时清理
      priority: ['recent', 'starred', 'encrypted']
    }
  },

  // 性能配置
  performance: {
    lazyLoading: true,
    virtualScroll: true,
    imageOptimization: true,
    caching: {
      enabled: true,
      ttl: 3600000, // 1小时
      maxSize: 50 * 1024 * 1024 // 50MB
    },
    monitoring: {
      enabled: true,
      sentry: process.env.NEXT_PUBLIC_SENTRY_DSN,
      analytics: process.env.NEXT_PUBLIC_ANALYTICS_ID
    }
  },

  // 实验性功能
  experimental: {
    ar: false, // AR 日记
    blockchain: false, // 区块链存证
    ai3d: false, // AI 3D 场景生成
    voiceClone: false // 声音克隆
  },

  // 订阅配置
  subscription: {
    enabled: false,
    plans: {
      free: {
        features: ['basic_diary', 'local_storage', 'basic_themes'],
        limits: {
          entriesPerMonth: 100,
          mediaUploadSize: 5 * 1024 * 1024,
          aiRequestsPerDay: 10
        }
      },
      pro: {
        price: 18,
        currency: 'CNY',
        features: ['all'],
        limits: {
          entriesPerMonth: -1, // 无限制
          mediaUploadSize: 100 * 1024 * 1024,
          aiRequestsPerDay: 1000
        }
      },
      lifetime: {
        price: 599,
        currency: 'CNY',
        features: ['all'],
        limits: 'unlimited'
      }
    }
  }
};

// 功能开关
export const isFeatureEnabled = (feature: string): boolean => {
  const path = feature.split('.');
  let config: any = FEATURES_CONFIG;
  
  for (const key of path) {
    if (config[key] === undefined) return false;
    config = config[key];
  }
  
  return config === true || (typeof config === 'object' && config.enabled === true);
};

// 获取功能配置
export const getFeatureConfig = (feature: string): any => {
  const path = feature.split('.');
  let config: any = FEATURES_CONFIG;
  
  for (const key of path) {
    if (config[key] === undefined) return null;
    config = config[key];
  }
  
  return config;
};

// 导出类型
export type FeaturesConfig = typeof FEATURES_CONFIG;