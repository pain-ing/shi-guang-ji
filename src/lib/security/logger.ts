import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

function getAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Server is not configured')
  }
  return createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
}

export function getRequestInfo(req: Request) {
  const ip =
    (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    ''
  const userAgent = req.headers.get('user-agent') || ''
  return { ip, userAgent }
}

export async function logEvent(params: {
  req: Request
  userId?: string | null
  eventType: 'sign_up_success' | 'sign_up_failed' | 'login_success' | 'login_failed' | 'login_rate_limited' | 'logout' | 'role_changed'
  success: boolean
  details?: Record<string, unknown>
}) {
  const { req, userId = null, eventType, success, details } = params
  const { ip, userAgent } = getRequestInfo(req)
  const admin = getAdminClient()
  try {
    await admin.from('audit_logs').insert({
      user_id: userId ?? null,
      event_type: eventType,
      success,
      ip,
      user_agent: userAgent,
      details: details ? JSON.parse(JSON.stringify(details)) : null,
    })
  } catch (e) {
    // 避免日志失败影响主流程
    console.error('[audit] failed to insert', e)
  }
}

