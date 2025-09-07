import { NextResponse } from 'next/server'
import { logEvent } from '@/lib/security/logger'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED = new Set([
  'sign_up_success','sign_up_failed','login_success','login_failed','login_rate_limited','logout'
])

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const eventType = body?.eventType as string
    const success = !!body?.success
    const userId = (body?.userId as string) || null
    const details = (body?.details as Record<string, unknown>) || null

    if (!ALLOWED.has(eventType)) {
      return NextResponse.json({ error: 'bad_request' }, { status: 400 })
    }

    await logEvent({ req, userId, eventType: eventType as 'login_success' | 'login_failed' | 'logout' | 'sign_up_success' | 'sign_up_failed', success, details: details || undefined })
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch {
    return NextResponse.json({ ok: true }, { status: 200 })
  }
}

