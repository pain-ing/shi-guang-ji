import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getSSRClient() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set() {},
        remove() {},
      },
    }
  )
  return supabase
}

export async function GET(req: Request) {
  try {
    const supabase = getSSRClient()
    const { searchParams } = new URL(req.url)
    const limit = Number(searchParams.get('limit') || 50)
    const offset = Number(searchParams.get('offset') || 0)
    const eventType = searchParams.get('event_type') || undefined
    const userId = searchParams.get('user_id') || undefined
    const ip = searchParams.get('ip') || undefined

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    const role = (user.app_metadata as { role?: string })?.role
    if (role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (eventType) query = query.eq('event_type', eventType)
    if (userId) query = query.eq('user_id', userId)
    if (ip) query = query.eq('ip', ip)

    const { data, error, count } = await query
    if (error) return NextResponse.json({ error: 'query_failed' }, { status: 400 })

    return NextResponse.json({ items: data ?? [], total: count ?? 0 }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

