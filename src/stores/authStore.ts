import { create } from 'zustand'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types/database'

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  initialized: boolean
}

interface AuthActions {
  signUp: (email: string, password: string, username?: string) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>
  initialize: () => Promise<void>
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>((set, get) => ({
  // 初始状态
  user: null,
  session: null,
  profile: null,
  loading: true,
  initialized: false,

  // 初始化认证状态
  initialize: async () => {
    try {
      set({ loading: true })
      
      // 获取当前会话
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('获取会话失败:', error)
        return
      }

      if (session) {
        set({ 
          user: session.user, 
          session,
        })
        
        // 获取用户资料
        await get().fetchProfile()
      }

      // 监听认证状态变化
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('认证状态变化:', event, session?.user?.email)
        
        set({ 
          user: session?.user ?? null, 
          session,
        })

        if (session?.user) {
          await get().fetchProfile()
        } else {
          set({ profile: null })
        }
      })

    } catch (error) {
      console.error('初始化认证失败:', error)
    } finally {
      set({ loading: false, initialized: true })
    }
  },

  // 获取用户资料
  fetchProfile: async () => {
    const { user } = get()
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('获取用户资料失败:', error)
        return
      }

      set({ profile: data })
    } catch (error) {
      console.error('获取用户资料异常:', error)
    }
  },

  // 用户注册
  signUp: async (email: string, password: string, username?: string) => {
    try {
      set({ loading: true })

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username || email.split('@')[0],
          },
        },
      })

      if (error) {
        return { error }
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    } finally {
      set({ loading: false })
    }
  },

  // 用户登录
  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true })

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error }
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    } finally {
      set({ loading: false })
    }
  },

  // 用户登出
  signOut: async () => {
    try {
      set({ loading: true })
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('登出失败:', error)
      }

      set({ 
        user: null, 
        session: null, 
        profile: null 
      })
    } catch (error) {
      console.error('登出异常:', error)
    } finally {
      set({ loading: false })
    }
  },

  // 重置密码
  resetPassword: async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  },

  // 更新用户资料
  updateProfile: async (updates: Partial<Profile>) => {
    const { user } = get()
    if (!user) {
      return { error: new Error('用户未登录') }
    }

    try {
      set({ loading: true })

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        return { error }
      }

      set({ profile: data })
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    } finally {
      set({ loading: false })
    }
  },

  // 设置状态的辅助方法
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
}))
