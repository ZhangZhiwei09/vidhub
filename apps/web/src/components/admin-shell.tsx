'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const browse = [
  { href: '/', label: '首页' },
  { href: '/popular', label: '热门' },
  { href: '/search', label: '搜索' },
  { href: '/upload', label: '投稿' },
  { href: '/live', label: '直播' },
  { href: '/message', label: '消息' },
]

const manage = [
  { href: '/admin', label: '仪表盘', exact: true },
  { href: '/admin/videos', label: '视频' },
  { href: '/admin/users', label: '用户' },
  { href: '/admin/comments', label: '评论' },
  { href: '/admin/danmakus', label: '弹幕' },
]

function NavItem({
  href,
  label,
  active,
}: {
  href: string
  label: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex items-center rounded-[10px] px-3 py-2 text-[13px] font-medium transition ${
        active
          ? 'bg-[rgba(0,113,227,0.12)] text-[var(--vh-accent)]'
          : 'text-[var(--vh-admin-fg)] hover:bg-black/[0.04]'
      }`}
    >
      {label}
    </Link>
  )
}

export function AdminShell({
  userName,
  children,
}: {
  userName?: string | null
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-[var(--vh-admin-bg)] text-[var(--vh-admin-fg)]">
      <aside
        className="sticky top-0 flex h-screen w-[var(--vh-admin-sidebar)] shrink-0 flex-col border-r border-[var(--vh-admin-hairline)] bg-[var(--vh-admin-glass)] px-3 py-5 backdrop-blur-xl backdrop-saturate-150"
        aria-label="管理导航"
      >
        <Link href="/" className="mb-5 flex items-center gap-2.5 px-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-[8px] bg-[var(--vh-accent)] text-white">
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
              <path d="M4 3.5v9l9-4.5-9-4.5z" fill="currentColor" />
            </svg>
          </span>
          <span className="text-[17px] font-bold tracking-tight">VidHub</span>
        </Link>

        <p className="mb-1.5 px-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--vh-admin-tertiary)]">
          浏览
        </p>
        <nav className="mb-4 flex flex-col gap-0.5">
          {browse.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              active={item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)}
            />
          ))}
        </nav>

        <p className="mb-1.5 px-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--vh-admin-tertiary)]">
          管理
        </p>
        <nav className="flex flex-col gap-0.5">
          {manage.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`)
            return <NavItem key={item.href} href={item.href} label={item.label} active={active} />
          })}
        </nav>

        <div className="mt-auto rounded-[14px] border border-[var(--vh-admin-hairline)] bg-white/80 p-3 shadow-[var(--vh-shadow-card)]">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-[rgba(0,113,227,0.12)] text-sm font-semibold text-[var(--vh-accent)]">
              {(userName || '管').slice(0, 1)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold">{userName || '管理员'}</p>
              <p className="text-[11px] text-[var(--vh-admin-tertiary)]">创作者 · 管理员</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1 overflow-x-auto">
        <div className="mx-auto max-w-6xl px-6 py-8 md:px-9">{children}</div>
      </div>
    </div>
  )
}
