'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export function SiteNav({
  loggedIn,
  isAdmin,
  userName,
  notifySlot,
  signOutAction,
}: {
  loggedIn: boolean
  isAdmin?: boolean
  userName?: string | null
  notifySlot?: React.ReactNode
  signOutAction: () => Promise<void>
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const links = [
    { href: '/', label: '首页' },
    { href: '/popular', label: '热门' },
    { href: '/search', label: '搜索' },
    { href: '/upload', label: '投稿' },
    { href: '/live', label: '直播' },
    { href: '/message', label: '消息' },
  ]

  function linkClass(href: string) {
    const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
    return `text-[13px] transition ${
      active ? 'text-white' : 'text-white/55 hover:text-white'
    }`
  }

  return (
    <>
      <div className="hidden min-w-0 flex-1 items-center justify-between gap-6 md:flex">
        <nav className="flex items-center gap-6">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass(l.href)}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          {loggedIn ? (
            <>
              {notifySlot}
              <Link href="/studio/works" className={linkClass('/studio')}>
                空间
              </Link>
              <Link href="/settings" className={linkClass('/settings')}>
                设置
              </Link>
              {isAdmin ? (
                <Link href="/admin" className={linkClass('/admin')}>
                  管理
                </Link>
              ) : null}
              <span className="max-w-[8rem] truncate text-[13px] text-white/40">{userName}</span>
              <form action={signOutAction}>
                <button type="submit" className="text-[13px] text-white/45 hover:text-white">
                  退出
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="vh-btn-accent !px-4 !py-1.5 text-[13px]">
              登录
            </Link>
          )}
        </div>
      </div>

      <button
        type="button"
        className="rounded-lg border border-white/20 px-2.5 py-1 text-sm text-white md:hidden"
        onClick={() => setOpen((v) => !v)}
        aria-label="菜单"
      >
        菜单
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-14 border-b border-white/10 bg-black/90 px-4 py-3 backdrop-blur-xl md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 text-sm text-white">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            {loggedIn ? (
              <>
                <Link href="/notifications" onClick={() => setOpen(false)}>
                  通知
                </Link>
                <Link href="/studio/works" onClick={() => setOpen(false)}>
                  空间
                </Link>
                <Link href="/settings" onClick={() => setOpen(false)}>
                  设置
                </Link>
                {isAdmin ? (
                  <Link href="/admin" onClick={() => setOpen(false)}>
                    管理
                  </Link>
                ) : null}
                <form action={signOutAction}>
                  <button type="submit">退出（{userName}）</button>
                </form>
              </>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)}>
                登录
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </>
  )
}
