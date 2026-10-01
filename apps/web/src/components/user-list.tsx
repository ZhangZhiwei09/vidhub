'use client'

import Link from 'next/link'

export function UserList({
  users,
}: {
  users: Array<{ id: number; username: string; avatar: string | null }>
}) {
  if (users.length === 0) {
    return <p className="text-sm text-white/45">暂无数据</p>
  }
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {users.map((u) => (
        <li key={u.id}>
          <Link
            href={`/channel/${u.id}`}
            className="flex items-center gap-3 rounded-[14px] border border-white/10 bg-white/[0.04] p-3 transition hover:bg-white/[0.08]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={u.avatar || '/next.svg'}
              alt=""
              className="h-10 w-10 rounded-full bg-white/10 object-cover"
            />
            <span className="font-medium text-white">{u.username}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
