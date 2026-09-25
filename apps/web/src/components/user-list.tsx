'use client'

import Link from 'next/link'

export function UserList({
  users,
}: {
  users: Array<{ id: number; username: string; avatar: string | null }>
}) {
  if (users.length === 0) {
    return <p className="text-sm text-zinc-500">暂无数据</p>
  }
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {users.map((u) => (
        <li key={u.id}>
          <Link
            href={`/channel/${u.id}`}
            className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-zinc-200 hover:bg-zinc-50"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={u.avatar || '/next.svg'}
              alt=""
              className="h-10 w-10 rounded-full bg-zinc-100 object-cover"
            />
            <span className="font-medium">{u.username}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}