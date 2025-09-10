import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const IDLE_MINUTES = 30
const ABSOLUTE_HOURS = 24
const LAST_ACTIVITY_COOKIE = 'last_activity'
const SESSION_STARTED_COOKIE = 'session_started_at'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const protectedRoutes = ['/dashboard', '/diary', '/media', '/profile', '/check-in', '/admin']
  const authRoutes = ['/login', '/register']

  const isProtectedRoute = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

  // 会话超时控制（仅对已登录用户生效）
  if (session) {
    const now = Date.now()
    const nowISO = new Date(now).toISOString()

    const lastActivityStr = req.cookies.get(LAST_ACTIVITY_COOKIE)?.value
    const startedAtStr = req.cookies.get(SESSION_STARTED_COOKIE)?.value

    const lastActivity = lastActivityStr ? Date.parse(lastActivityStr) : NaN
    const startedAt = startedAtStr ? Date.parse(startedAtStr) : NaN

    const idleExceeded = Number.isFinite(lastActivity) && now - lastActivity > IDLE_MINUTES * 60 * 1000
    const absExceeded = Number.isFinite(startedAt) && now - startedAt > ABSOLUTE_HOURS * 60 * 60 * 1000

    // 对受保护路由或根路由进行空闲检测，超时则要求重新登录
    if ((isProtectedRoute || req.nextUrl.pathname === '/') && (idleExceeded || absExceeded)) {
      // 清理本地跟踪 Cookie（不会直接登出 Supabase，会在后续请求中被认定无效）
      res.cookies.set(LAST_ACTIVITY_COOKIE, '', { maxAge: 0 })
      res.cookies.set(SESSION_STARTED_COOKIE, '', { maxAge: 0 })

      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // 更新活动时间，仅在受保护路由上更新以减少写入
    if (isProtectedRoute) {
      const common = { httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', path: '/' }
      res.cookies.set(LAST_ACTIVITY_COOKIE, nowISO, { ...common, maxAge: 60 * 60 * 24 * 7 })
      if (!Number.isFinite(startedAt)) {
        res.cookies.set(SESSION_STARTED_COOKIE, nowISO, { ...common, maxAge: 60 * 60 * 24 * 7 })
      }
    }
  }

  // 访问控制与重定向
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  if (req.nextUrl.pathname === '/') {
    if (session) return NextResponse.redirect(new URL('/dashboard', req.url))
    else return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: [
    // 排除静态资源与公开文件
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

