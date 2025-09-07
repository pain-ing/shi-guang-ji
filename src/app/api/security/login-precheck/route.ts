import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getRequestInfo, logEvent } from '@/lib/security/logger'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const WINDOW_MINUTES = 10
const MAX_FAILS = 5

export async function POST(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Server is not configured' }, { status: 500 })
  }

  try {
    const { email } = await req.json()
    const { ip } = getRequestInfo(req)
    const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })

    const since = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString()

    const { data, error } = await admin
      .from('audit_logs')
      .select('id')
      .gte('created_at', since)
      .eq('event_type', 'login_failed')
      .or(`details->>email.eq.${email},ip.eq.${ip}`)

    if (error) {
      // 
      return NextResponse.json({ error: '登录失败' }, { status: 200 })
    }

    const fails = (data?.length ?? 0)
    if (fails >= MAX_FAILS) {
      await logEvent({ req, eventType: 'login_rate_limited', success: false, details: { email, ip, windowMinutes: WINDOW_MINUTES } })
      return NextResponse.json({ error: '登录失败' }, { status: 429 })
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch {
    return NextResponse.json({ error: '登录失败' }, { status: 200 })
  }
}

