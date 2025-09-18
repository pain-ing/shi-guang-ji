import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Number(searchParams.get('page') || 1)
    const perPage = Number(searchParams.get('per_page') || 20)
    const supabase = getSSRClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    if ((user.app_metadata as { role?: string })?.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!serviceKey || !url) return NextResponse.json({ error: 'server_misconfigured' }, { status: 500 })

    const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
    if (error) return NextResponse.json({ error: 'list_failed' }, { status: 400 })

    const users = (data?.users || []).map(u => ({ id: u.id, email: u.email, role: (u.app_metadata as { role?: string })?.role || 'user' }))
    const total = (data as any)?.total || users.length
    return NextResponse.json({ users, page, perPage, total }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

