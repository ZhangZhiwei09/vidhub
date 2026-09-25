import Link from 'next/link'
import { ReactNode } from 'react'

const tabs = [
  { href: 'works', label: '作品' },
  { href: 'collect', label: '收藏' },
  { href: 'following', label: '关注' },
  { href: 'fans', label: '粉丝' },
] as const

export function ProfileTabs({
  basePath,
  active,
}: {
  basePath: string
  active: string
}) {
  return (
    <nav className="mb-6 flex gap-2 border-b border-zinc-200 pb-2 text-sm">
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={`${basePath}/${t.href}`}
          className={`rounded-md px-3 py-1.5 ${active === t.href ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'}`}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  )
}

export function ProfileHeader({
  user,
  actions,
}: {
  user: {
    username: string
    avatar: string | null
    sign: string | null
    followingCount: number
    fansCount: number
  }
  actions?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-5 ring-1 ring-zinc-200">
      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={user.avatar || '/next.svg'}
          alt=""
          className="h-16 w-16 rounded-full bg-zinc-100 object-cover"
        />
        <div>
          <h1 className="text-xl font-semibold">{user.username}</h1>
          <p className="mt-1 text-sm text-zinc-500">{user.sign || '这个人很懒，什么都没写'}</p>
          <p className="mt-2 text-xs text-zinc-500">
            关注 {user.followingCount} · 粉丝 {user.fansCount}
          </p>
        </div>
      </div>
      {actions}
    </div>
  )
}