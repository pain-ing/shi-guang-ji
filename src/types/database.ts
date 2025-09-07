// 数据库表类型定义

export interface Profile {
  id: string
  username: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

export interface CheckIn {
  id: number
  user_id: string
  mood: string
  note: string | null
  created_at: string
}

export interface Diary {
  id: number
  user_id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

export interface MediaFile {
  id: number
  user_id: string
  file_path: string
  file_type: 'image' | 'video'
  file_size: number | null
  created_at: string
}

export interface Tag {
  id: number
  name: string
  created_at: string
}

export interface DiaryTag {
  diary_id: number
  tag_id: number
}

// 创建和更新类型
export type ProfileCreate = Omit<Profile, 'id' | 'created_at' | 'updated_at'>
export type ProfileUpdate = Partial<ProfileCreate>

export type CheckInCreate = Omit<CheckIn, 'id' | 'created_at'>
export type CheckInUpdate = Partial<Omit<CheckIn, 'id' | 'user_id'>>

export type DiaryCreate = Omit<Diary, 'id' | 'created_at' | 'updated_at'>
export type DiaryUpdate = Partial<Omit<Diary, 'id' | 'user_id' | 'created_at' | 'updated_at'>>

export type MediaFileCreate = Omit<MediaFile, 'id' | 'created_at'>
export type MediaFileUpdate = Partial<Omit<MediaFile, 'id' | 'user_id' | 'created_at'>>

export type TagCreate = Omit<Tag, 'id' | 'created_at'>

// 心情选项
export const MOOD_OPTIONS = [
  { value: 'happy', label: '开心', emoji: '😊' },
  { value: 'calm', label: '平静', emoji: '😌' },
  { value: 'excited', label: '兴奋', emoji: '🤩' },
  { value: 'tired', label: '疲惫', emoji: '😴' },
  { value: 'sad', label: '难过', emoji: '😢' },
  { value: 'angry', label: '生气', emoji: '😠' },
  { value: 'anxious', label: '焦虑', emoji: '😰' },
  { value: 'grateful', label: '感恩', emoji: '🙏' },
] as const

export type MoodType = typeof MOOD_OPTIONS[number]['value']
