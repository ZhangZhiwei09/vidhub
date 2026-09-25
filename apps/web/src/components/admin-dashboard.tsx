'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

type DashItem = { title: string; total: number }

export function AdminDashboard() {
  const [items, setItems] = useState<DashItem[]>([])

  useEffect(() => {
    void fetch('/api/admin?resource=dashboard')
      .then((r) => r.json())
      .then((json) => setItems(json?.data ?? []))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 text-sm">
        <Link className="rounded-md bg-zinc-900 px-3 py-1.5 text-white" href="/admin">
          仪表盘
        </Link>
        <Link className="rounded-md border border-zinc-300 px-3 py-1.5" href="/admin/videos">
          视频
        </Link>
        <Link className="rounded-md border border-zinc-300 px-3 py-1.5" href="/admin/users">
          用户
        </Link>
        <Link className="rounded-md border border-zinc-300 px-3 py-1.5" href="/admin/comments">
          评论
        </Link>
        <Link className="rounded-md border border-zinc-300 px-3 py-1.5" href="/admin/danmakus">
          弹幕
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.title} className="rounded-xl bg-white p-4 ring-1 ring-zinc-200">
            <p className="text-sm text-zinc-500">{item.title}</p>
            <p className="mt-2 text-3xl font-semibold">{item.total}</p>
          </div>
        ))}
      </div>
    </div>
  )
}