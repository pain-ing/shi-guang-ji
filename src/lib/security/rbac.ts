import { Session, User } from '@supabase/supabase-js'

export function getRoleFromUser(user: User | null | undefined): string | null {
  return (user?.app_metadata as { role?: string })?.role ?? null
}

export function isAdminUser(user: User | null | undefined): boolean {
  return getRoleFromUser(user) === 'admin'
}

export function isAdminSession(session: Session | null | undefined): boolean {
  return isAdminUser(session?.user ?? null)
}

