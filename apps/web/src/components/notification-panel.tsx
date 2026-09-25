'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

type Item = {
  id: number
  type: string
  content: string | null
  readStatus: boolean
  createdAt: string
}

export function NotificationPanel() {
  const [list, setList] = useState<Item[]>([])
  const [unread, setUnread] = useState(0)

  async function load() {
    const [listRes, countRes] = await Promise.all([
      fetch('/api/notifications'),
      fetch('/api/notifications?unreadCount=1'),
    ])
    const listJson = await listRes.json()
    const countJson = await countRes.json()
    setList(listJson?.data?.list ?? [])
    setUnread(countJson?.data?.unread ?? 0)
  }

  useEffect(() => {
    void load()
  }, [])

  async function readAll() {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'read-all' }),
    })
    await load()
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">通知 {unread > 0 ? `(${unread})` : ''}</h1>
        <button type="button" onClick={() => void readAll()} className="text-sm text-zinc-600">
          全部已读
        </button>
      </div>
      <ul className="space-y-2">
        {list.length === 0 ? (
          <li className="text-sm text-zinc-500">暂无通知</li>
        ) : (
          list.map((n) => (
            <li
              key={n.id}
              className={`rounded-xl px-4 py-3 ring-1 ring-zinc-200 ${n.readStatus ? 'bg-white' : 'bg-amber-50'}`}
            >
              <p className="text-sm text-zinc-800">{n.content}</p>
              <p className="mt-1 text-xs text-zinc-500">
                {n.type} · {new Date(n.createdAt).toLocaleString()}
              </p>
            </li>
          ))
        )}
      </ul>
      <p className="mt-6 text-sm">
        <Link href="/message" className="text-zinc-600 underline">
          去私信
        </Link>
      </p>
    </main>
  )
}