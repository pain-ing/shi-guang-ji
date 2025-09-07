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

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">管理员控制台</h1>

      <section>
        <h2 className="text-xl font-semibold mb-2">审计日志（最近50条）</h2>
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">时间</th>
                <th className="p-2 text-left">事件</th>
                <th className="p-2 text-left">用户</th>
                <th className="p-2 text-left">IP</th>
                <th className="p-2 text-left">成功</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-t">
                  <td className="p-2 whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</td>
                  <td className="p-2">{l.event_type}</td>
                  <td className="p-2">{l.user_id || '-'}</td>
                  <td className="p-2">{l.ip || '-'}</td>
                  <td className="p-2">{l.success ? '✓' : '✗'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">用户与角色</h2>
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">ID</th>
                <th className="p-2 text-left">邮箱</th>
                <th className="p-2 text-left">角色</th>
                <th className="p-2 text-left">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-2">{u.id}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.role}</td>
                  <td className="p-2">
                    <button
                      className="px-3 py-1 rounded border disabled:opacity-50"
                      disabled={busy}
                      onClick={() => toggleRole(u.id, u.role)}
                    >
                      切换为 {u.role === 'admin' ? 'user' : 'admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

