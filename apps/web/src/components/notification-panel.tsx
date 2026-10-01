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
    <main className="vh-page max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          通知 {unread > 0 ? `(${unread})` : ''}
        </h1>
        <button
          type="button"
          onClick={() => void readAll()}
          className="text-sm text-white/55 hover:text-white"
        >
          全部已读
        </button>
      </div>
      <ul className="space-y-2">
        {list.length === 0 ? (
          <li className="text-sm text-white/45">暂无通知</li>
        ) : (
          list.map((n) => (
            <li
              key={n.id}
              className={`rounded-[14px] border px-4 py-3 ${
                n.readStatus
                  ? 'border-white/10 bg-white/[0.04]'
                  : 'border-[rgba(0,113,227,0.35)] bg-[rgba(0,113,227,0.12)]'
              }`}
            >
              <p className="text-sm text-white/85">{n.content}</p>
              <p className="mt-1 text-xs text-white/40">
                {n.type} · {new Date(n.createdAt).toLocaleString()}
              </p>
            </li>
          ))
        )}
      </ul>
      <p className="mt-6 text-sm">
        <Link href="/message" className="text-[var(--vh-accent)] hover:underline">
          去私信
        </Link>
      </p>
    </main>
  )
}
