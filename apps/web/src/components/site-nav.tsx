'use client'

import Link from 'next/link'
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
  const [open, setOpen] = useState(false)
  const links = [
    { href: '/', label: '首页' },
    { href: '/popular', label: '热门' },
    { href: '/search', label: '搜索' },
    { href: '/upload', label: '投稿' },
    { href: '/live', label: '直播' },
    { href: '/message', label: '消息' },
  ]

  return (
    <>
      <nav className="hidden items-center gap-4 text-sm text-zinc-700 md:flex">
        {links.map((l) => (
          <Link key={l.href} href={l.href}>
            {l.label}
          </Link>
        ))}
        {loggedIn ? (
          <>
            {notifySlot}
            <Link href="/studio/works">空间</Link>
            {isAdmin ? <Link href="/admin">管理</Link> : null}
            <span className="max-w-[8rem] truncate text-zinc-500">{userName}</span>
            <form action={signOutAction}>
              <button type="submit" className="text-zinc-500 hover:text-zinc-900">
                退出
              </button>
            </form>
          </>
        ) : (
          <Link href="/login">登录</Link>
        )}
      </nav>

      <button
        type="button"
        className="rounded-md border border-zinc-300 px-2 py-1 text-sm md:hidden"
        onClick={() => setOpen((v) => !v)}
        aria-label="菜单"
      >
        菜单
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-14 border-b border-zinc-200 bg-white px-4 py-3 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 text-sm">
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