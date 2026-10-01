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
    <nav className="mb-6 flex flex-wrap gap-2 border-b border-white/10 pb-3 text-sm">
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={`${basePath}/${t.href}`}
          className={`rounded-full px-3.5 py-1.5 font-medium transition ${
            active === t.href
              ? 'bg-white text-black'
              : 'text-white/55 hover:bg-white/10 hover:text-white'
          }`}
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
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[14px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={user.avatar || '/next.svg'}
          alt=""
          className="h-16 w-16 rounded-full bg-white/10 object-cover"
        />
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white">{user.username}</h1>
          <p className="mt-1 text-sm text-white/45">{user.sign || '这个人很懒，什么都没写'}</p>
          <p className="mt-2 text-xs text-white/40">
            关注 {user.followingCount} · 粉丝 {user.fansCount}
          </p>
        </div>
      </div>
      {actions}
    </div>
  )
}
