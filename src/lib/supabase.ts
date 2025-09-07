import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const supabase = createClientComponentClient<Database>()

// 数据库类型定义
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      check_ins: {
        Row: {
          id: number
          user_id: string
          mood: string
          note: string | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          mood: string
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          mood?: string
          note?: string | null
          created_at?: string
        }
      }
      diaries: {
        Row: {
          id: number
          user_id: string
          title: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          title: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          title?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      media: {
        Row: {
          id: number
          user_id: string
          file_path: string
          file_type: 'image' | 'video'
          file_size: number | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          file_path: string
          file_type: 'image' | 'video'
          file_size?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          file_path?: string
          file_type?: 'image' | 'video'
          file_size?: number | null
          created_at?: string
        }
      }
      tags: {
        Row: {
          id: number
          name: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          created_at?: string
        }
      }
      diary_tags: {
        Row: {
          diary_id: number
          tag_id: number
        }
        Insert: {
          diary_id: number
          tag_id: number
        }
        Update: {
          diary_id?: number
          tag_id?: number
        }
      }
    }
  }
}
