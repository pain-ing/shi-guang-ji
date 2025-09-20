// 核心功能类型定义
// 避免代码堆积，采用清晰的类型系统

// ============= 日记相关 =============
export interface DiaryEntry {
  id: string;
  userId: string;
  title?: string;
  content: string;
  contentType: 'text' | 'markdown' | 'richtext';
  media?: MediaAttachment[];
  tags: string[];
  emotion?: EmotionData;
  location?: LocationData;
  weather?: WeatherData;
  isEncrypted: boolean;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
  scheduledFor?: Date; // 时间胶囊
  metadata?: Record<string, any>;
}

// ============= 媒体相关 =============
export interface MediaAttachment {
  id: string;
  type: 'image' | 'audio' | 'video' | 'drawing';
  url: string;
  thumbnailUrl?: string;
  duration?: number; // 音频/视频时长
  metadata?: {
    width?: number;
    height?: number;
    size?: number;
    mimeType?: string;
  };
}

// ============= 情绪分析 =============
export interface EmotionData {
  primary: EmotionType;
  confidence: number;
  secondary?: EmotionType[];
  analysis?: string;
}

export type EmotionType = 
  | 'happy' | 'sad' | 'angry' | 'fear' 
  | 'surprise' | 'disgust' | 'neutral'
  | 'excited' | 'calm' | 'grateful';

// ============= 位置信息 =============
export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  placeName?: string;
  city?: string;
  country?: string;
}

// ============= 天气信息 =============
export interface WeatherData {
  temperature: number;
  condition: string;
  icon?: string;
  humidity?: number;
}

// ============= 习惯追踪 =============
export interface HabitTracking {
  userId: string;
  streakDays: number;
  totalEntries: number;
  lastEntryDate: Date;
  achievements: Achievement[];
  statistics: WritingStatistics;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress?: number;
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface WritingStatistics {
  totalWords: number;
  averageWordsPerEntry: number;
  favoriteWritingTime: string;
  mostProductiveDay: string;
  topTags: string[];
  emotionDistribution: Record<EmotionType, number>;
}

// ============= 主题系统 =============
export interface Theme {
  id: string;
  name: string;
  type: 'preset' | 'custom' | 'dynamic';
  colors: ThemeColors;
  fonts?: ThemeFonts;
  animations?: boolean;
  preview?: string;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  accent: string;
  error: string;
  warning: string;
  success: string;
}

export interface ThemeFonts {
  heading: string;
  body: string;
  mono: string;
  size: {
    base: number;
    scale: number;
  };
}

// ============= 时间胶囊 =============
export interface TimeCapsule {
  id: string;
  diaryId: string;
  openDate: Date;
  isOpened: boolean;
  reminderSent: boolean;
  recipientEmail?: string;
  message?: string;
}

// ============= 社交功能 =============
export interface SharingSettings {
  allowAnonymousShare: boolean;
  familyGroupId?: string;
  friendConnections: string[];
  sharePreferences: {
    includeLocation: boolean;
    includeWeather: boolean;
    includeEmotion: boolean;
    blurImages: boolean;
  };
}

export interface FamilyGroup {
  id: string;
  name: string;
  members: FamilyMember[];
  sharedDiaries: string[];
  createdAt: Date;
}

export interface FamilyMember {
  userId: string;
  name: string;
  role: 'admin' | 'member';
  avatar?: string;
  joinedAt: Date;
}

// ============= AI 功能 =============
export interface AIServiceConfig {
  provider: 'openai' | 'anthropic' | 'gemini' | 'local';
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  text?: string;
  tags?: string[];
  emotion?: EmotionData;
  suggestions?: string[];
  error?: string;
}

// ============= 加密配置 =============
export interface EncryptionConfig {
  algorithm: 'AES-256-GCM' | 'AES-256-CBC';
  keyDerivation: 'PBKDF2' | 'scrypt' | 'argon2';
  iterations: number;
  saltLength: number;
}

// ============= 导出配置 =============
export interface ExportOptions {
  format: 'pdf' | 'markdown' | 'json' | 'html' | 'epub';
  dateRange?: {
    start: Date;
    end: Date;
  };
  includeMedia: boolean;
  includeStatistics: boolean;
  template?: string;
  encryption?: boolean;
}

// ============= 通知设置 =============
export interface NotificationSettings {
  enabled: boolean;
  dailyReminder?: {
    time: string;
    message?: string;
  };
  achievementAlerts: boolean;
  timeCapsuleAlerts: boolean;
  weeklyReport: boolean;
  pushNotifications?: boolean;
}

// ============= 用户偏好 =============
export interface UserPreferences {
  theme: string;
  language: string;
  fontSize: 'small' | 'medium' | 'large';
  autoSave: boolean;
  autoSaveInterval: number;
  defaultView: 'timeline' | 'calendar' | 'map';
  privacyMode: boolean;
  biometricLock: boolean;
  offlineMode: boolean;
}

// ============= 同步状态 =============
export interface SyncStatus {
  lastSync: Date;
  pendingChanges: number;
  syncInProgress: boolean;
  conflicts: SyncConflict[];
  deviceId: string;
}

export interface SyncConflict {
  entryId: string;
  localVersion: Date;
  remoteVersion: Date;
  resolved: boolean;
  resolution?: 'local' | 'remote' | 'merge';
}

// ============= 性能指标 =============
export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  cacheSize: number;
  apiCalls: number;
  errors: ErrorLog[];
}

export interface ErrorLog {
  timestamp: Date;
  message: string;
  stack?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}