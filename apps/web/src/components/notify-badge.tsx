'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export function NotifyBadge() {
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    void fetch('/api/notifications?unreadCount=1')
      .then((r) => r.json())
      .then((json) => setUnread(json?.data?.unread ?? 0))
      .catch(() => undefined)
  }, [])

  return (
    <Link href="/notifications" className="relative">
      通知
      {unread > 0 ? (
        <span className="absolute -right-3 -top-2 rounded-full bg-red-500 px-1.5 text-[10px] leading-4 text-white">
          {unread > 99 ? '99+' : unread}
        </span>
      ) : null}
    </Link>
  )
}