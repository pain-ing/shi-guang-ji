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
  fetchProfile: () => Promise<void>
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

  // 用户注册（优先经由服务端 API，避免直连邮箱验证造成的 504）
  signUp: async (email: string, password: string, username?: string) => {
    try {
      set({ loading: true })

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
      })

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        return { error: new Error(payload?.error || `注册失败（${res.status}）`) }
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    } finally {
      set({ loading: false })
    }
  },

  // 用户登录（前置限流校验 + 成功/失败审计）
  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true })

      // 1) 前置限流校验
      const pre = await fetch('/api/security/login-precheck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!pre.ok) {
        return { error: new Error('登录失败') }
      }

      // 2) 真正登录（由客户端建立会话）
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      // 调试日志
      if (error) {
        console.error('Supabase 登录错误:', {
          message: error.message,
          status: error.status,
          code: (error as any).code,
          details: error
        })
      } else {
        console.log('登录成功:', {
          userId: data?.user?.id,
          email: data?.user?.email,
          emailConfirmed: data?.user?.email_confirmed_at,
          userConfirmed: data?.user?.confirmed_at
        })
      }

      // 3) 审计上报（不影响主流程返回）
      try {
        await fetch('/api/security/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: error ? 'login_failed' : 'login_success',
            success: !error,
            userId: data?.user?.id ?? null,
            details: { email },
          }),
        })
      } catch {}

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

  // 用户登出（记录审计日志）
  signOut: async () => {
    try {
      set({ loading: true })
      const { user } = get()

      const { error } = await supabase.auth.signOut()

      try {
        await fetch('/api/security/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventType: 'logout', success: !error, userId: user?.id ?? null }),
        })
      } catch {}

      if (error) {
        console.error('登出失败:', error)
      }

      set({ user: null, session: null, profile: null })
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
