"use client"

import { useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { isAdminUser } from '@/lib/security/rbac'

export default function AdminPage() {
  const { user, initialized, loading } = useAuthStore()
  const isAdmin = useMemo(() => isAdminUser(user), [user])
  const [logs, setLogs] = useState<Array<{
    id: string
    created_at: string
    event_type: string
    user_id: string | null
    ip: string | null
    success: boolean
  }>>([])
  const [users, setUsers] = useState<Array<{
    id: string
    email: string
    role: string
  }>>([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!initialized || loading) return
    if (!isAdmin) return
    ;(async () => {
      try {
        const [logsRes, usersRes] = await Promise.all([
          fetch('/api/admin/audit-logs?limit=50'),
          fetch('/api/admin/users?page=1&per_page=20'),
        ])
        const logsJson = await logsRes.json()
        const usersJson = await usersRes.json()
        setLogs(logsJson.items || [])
        setUsers(usersJson.users || [])
      } catch {
        // 静默处理错误
      }
    })()
  }, [initialized, loading, isAdmin])

  if (!initialized || loading) return <div className="p-6">加载中…</div>
  if (!isAdmin) return <div className="p-6 text-red-600">403 仅管理员可访问</div>

  const toggleRole = async (id: string, role: string) => {
    setBusy(true)
    try {
      const next = role === 'admin' ? 'user' : 'admin'
      const res = await fetch(`/api/admin/users/${id}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: next }),
      })
      if (res.ok) {
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: next } : u)))
      }
    } finally {
      setBusy(false)
    }
  }

  function getEventTypeDisplay(eventType: string): string {
    const eventMap: Record<string, string> = {
      'sign_up_success': '注册成功',
      'sign_up_failed': '注册失败', 
      'login_success': '登录成功',
      'login_failed': '登录失败',
      'login_rate_limited': '登录限流',
      'logout': '登出',
      'role_changed': '角色变更'
    }
    return eventMap[eventType] || eventType
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">系统管理</h1>
        <p className="text-muted-foreground mt-2">管理用户权限和查看系统安全日志</p>
      </div>
      
      <div className="grid gap-8">
        {/* 系统统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">总用户数</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">👥</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">管理员数</p>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">👑</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">安全事件</p>
                <p className="text-2xl font-bold">{logs.length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 text-xl">🔒</span>
              </div>
            </div>
          </div>
        </div>

        {/* 用户管理区域 */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">用户管理</h2>
            <p className="text-sm text-muted-foreground mt-1">管理用户角色和权限</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left">
                  <th className="p-4 text-sm font-medium text-gray-600">邮箱</th>
                  <th className="p-4 text-sm font-medium text-gray-600">角色</th>
                  <th className="p-4 text-sm font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-muted-foreground">
                      暂无用户数据
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="border-t hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-medium">{u.email}</div>
                        <div className="text-sm text-muted-foreground">{u.id.substring(0, 8)}...</div>
                      </td>
                      <td className="p-4">
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            u.role === 'admin' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {u.role === 'admin' ? '管理员' : '普通用户'}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          onClick={() => toggleRole(u.id, u.role)}
                          disabled={busy}
                        >
                          {busy ? '处理中...' : `切换为${u.role === 'admin' ? '普通用户' : '管理员'}`}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 审计日志区域 */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">安全审计日志</h2>
            <p className="text-sm text-muted-foreground mt-1">系统安全事件记录（最近50条）</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left">
                  <th className="p-4 text-sm font-medium text-gray-600">时间</th>
                  <th className="p-4 text-sm font-medium text-gray-600">事件类型</th>
                  <th className="p-4 text-sm font-medium text-gray-600">用户ID</th>
                  <th className="p-4 text-sm font-medium text-gray-600">IP地址</th>
                  <th className="p-4 text-sm font-medium text-gray-600">状态</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      暂无审计日志
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="border-t hover:bg-gray-50">
                      <td className="p-4 text-sm">
                        {new Date(log.created_at).toLocaleString('zh-CN')}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          log.event_type.includes('success') 
                            ? 'bg-green-100 text-green-800'
                            : log.event_type.includes('failed') || log.event_type.includes('rate_limited')
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {getEventTypeDisplay(log.event_type)}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-mono">
                        {log.user_id ? log.user_id.substring(0, 8) + '...' : '-'}
                      </td>
                      <td className="p-4 text-sm">{log.ip || '-'}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          log.success 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {log.success ? '✓ 成功' : '✗ 失败'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}