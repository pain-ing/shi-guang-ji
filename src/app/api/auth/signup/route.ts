import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isStrongPassword, passwordIssue } from '@/lib/security/password'
import { logEvent } from '@/lib/security/logger'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ error: 'Server is not configured' }, { status: 500 })
  }

  try {
    const { email, password, username } = await req.json()

    if (!email || !password) {
      await logEvent({ req, eventType: 'sign_up_failed', success: false, details: { reason: 'missing_email_or_password' } })
      return NextResponse.json({ error: '注册失败' }, { status: 400 })
    }

    if (!isStrongPassword(password)) {
      await logEvent({ req, eventType: 'sign_up_failed', success: false, details: { reason: 'weak_password', issue: passwordIssue(password) } })
      return NextResponse.json({ error: '注册失败' }, { status: 400 })
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || ''
    const emailRedirectTo = origin ? `${origin}/login` : undefined

    const client = createClient(supabaseUrl, anonKey, { auth: { autoRefreshToken: false, persistSession: false } })

    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: { username: username || (email as string).split('@')[0] },
        emailRedirectTo,
      },
    })

    if (error) {
      await logEvent({ req, eventType: 'sign_up_failed', success: false, details: { reason: 'supabase_error' } })
      return NextResponse.json({ error: '注册失败' }, { status: 400 })
    }

    await logEvent({ req, userId: data.user?.id ?? null, eventType: 'sign_up_success', success: true, details: { email } })
    return NextResponse.json({ userId: data.user?.id ?? null }, { status: 200 })
  } catch {
    await logEvent({ req, eventType: 'sign_up_failed', success: false, details: { reason: 'exception' } })
    return NextResponse.json({ error: '注册失败' }, { status: 500 })
  }
}
