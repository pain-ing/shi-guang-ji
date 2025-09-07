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
    return NextResponse.json({ error: '服务端未配置 Supabase 环境变量' }, { status: 500 })
  }

  try {
    const { email, password, username } = await req.json()

    if (!email || !password) {
      await logEvent({ req, eventType: 'sign_up_failed', success: false, details: { reason: 'missing_email_or_password' } })
      return NextResponse.json({ error: '邮箱与密码为必填' }, { status: 400 })
    }

    if (!isStrongPassword(password)) {
      const issue = passwordIssue(password)
      await logEvent({ req, eventType: 'sign_up_failed', success: false, details: { reason: 'weak_password', issue } })
      return NextResponse.json({ error: `密码不符合要求：${issue}` }, { status: 400 })
    }

    const client = createClient(supabaseUrl, anonKey, { auth: { autoRefreshToken: false, persistSession: false } })

    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: { username: username || (email as string).split('@')[0] },
      },
    })

    if (error) {
      let message = '注册失败'
      const code = (error as any).code || error.message
      if (code === 'user_already_exists' || /User already registered/i.test(error.message)) {
        message = '该邮箱已注册'
      } else if (/rate/i.test(error.message)) {
        message = '请求过于频繁，请稍后再试'
      }
      await logEvent({ req, eventType: 'sign_up_failed', success: false, details: { reason: 'supabase_error', code, msg: error.message } })
      return NextResponse.json({ error: message }, { status: 400 })
    }

    await logEvent({ req, userId: data.user?.id ?? null, eventType: 'sign_up_success', success: true, details: { email } })
    return NextResponse.json({ userId: data.user?.id ?? null }, { status: 200 })
  } catch {
    await logEvent({ req, eventType: 'sign_up_failed', success: false, details: { reason: 'exception' } })
    return NextResponse.json({ error: '注册失败' }, { status: 500 })
  }
}
