import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key'

// 在生产环境中检查环境变量
if (process.env.NODE_ENV === 'production' && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
  throw new Error('Missing Supabase environment variables in production')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

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
