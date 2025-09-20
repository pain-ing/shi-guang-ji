import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { logEvent } from '@/lib/security/logger'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getSSRClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set() {},
        remove() {},
      },
    }
  )
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = getSSRClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    if ((user.app_metadata as { role?: string })?.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

    const body = await req.json()
    const role = String(body?.role || '').toLowerCase()
    if (!['admin', 'user'].includes(role)) return NextResponse.json({ error: 'bad_role' }, { status: 400 })

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })

    const { error } = await admin.auth.admin.updateUserById(params.id, { app_metadata: { role } })
    if (error) return NextResponse.json({ error: 'update_failed' }, { status: 400 })

    await logEvent({ req, userId: user.id, eventType: 'role_changed', success: true, details: { target: params.id, role } })
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

