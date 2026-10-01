'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

type DashItem = { title: string; total: number; href?: string }

export function AdminDashboard() {
  const [items, setItems] = useState<DashItem[]>([])

  useEffect(() => {
    void fetch('/api/admin?resource=dashboard')
      .then((r) => r.json())
      .then((json) => setItems(json?.data ?? []))
  }, [])

  const pendingVideos = items.find((i) => i.title.includes('待审') || i.href?.includes('status=pending'))
  const videoTotal = items.find((i) => i.title.includes('视频') && !i.title.includes('待审'))
  const users = items.find((i) => i.title.includes('用户'))
  const comments = items.find((i) => i.title.includes('评论'))
  const danmakus = items.find((i) => i.title.includes('弹幕'))

  const kpis = [
    {
      label: '视频总量',
      value: videoTotal?.total ?? items[0]?.total ?? '—',
      delta: '点击查看',
      href: videoTotal?.href || '/admin/videos',
      spark: 'M2 28 L14 22 L26 24 L38 14 L50 16 L62 8 L70 10',
      sparkClass: 'stroke-[var(--vh-ok)]',
    },
    {
      label: '用户',
      value: users?.total ?? '—',
      delta: '账号管理',
      href: users?.href || '/admin/users',
      spark: 'M2 24 L14 20 L26 26 L38 18 L50 12 L62 14 L70 8',
      sparkClass: 'stroke-[var(--vh-accent)]',
    },
    {
      label: '评论',
      value: comments?.total ?? '—',
      delta: '需关注队列',
      href: comments?.href || '/admin/comments',
      spark: 'M2 12 L14 18 L26 10 L38 22 L50 16 L62 28 L70 20',
      sparkClass: 'stroke-[var(--vh-warn)]',
    },
    {
      label: '弹幕',
      value: danmakus?.total ?? '—',
      delta: '内容安全',
      href: danmakus?.href || '/admin/danmakus',
      spark: 'M2 30 L14 26 L26 20 L38 22 L50 12 L62 10 L70 6',
      sparkClass: 'stroke-[var(--vh-accent)]',
    },
  ]

  const bars = [
    [18, 52],
    [22, 64],
    [16, 48],
    [28, 72],
    [20, 58],
    [34, 80],
    [24, 68],
  ]
  const days = ['一', '二', '三', '四', '五', '六', '日']

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[var(--vh-admin-fg)]">仪表盘</h1>
          <p className="mt-1 text-[15px] text-[var(--vh-admin-secondary)]">
            运营概览 · SaaS 工作台
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-lg bg-[var(--vh-accent)] px-3 py-1.5 text-[13px] font-medium text-white">
            近 7 天
          </span>
          <span className="rounded-lg border border-[var(--vh-admin-hairline-strong)] px-3 py-1.5 text-[13px] font-medium text-[var(--vh-admin-secondary)]">
            近 30 天
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={pendingVideos?.href || '/admin/videos?status=pending'}
          className="rounded-full border border-[var(--vh-admin-hairline-strong)] bg-white px-3.5 py-1.5 text-[13px] font-medium hover:border-[var(--vh-accent)] hover:text-[var(--vh-accent)]"
        >
          待审视频 · {pendingVideos?.total ?? '—'}
        </Link>
        <Link
          href="/admin/comments"
          className="rounded-full border border-[var(--vh-admin-hairline-strong)] bg-white px-3.5 py-1.5 text-[13px] font-medium hover:border-[var(--vh-accent)] hover:text-[var(--vh-accent)]"
        >
          评论 · {comments?.total ?? '—'}
        </Link>
        <Link
          href="/admin/danmakus"
          className="rounded-full border border-[var(--vh-admin-hairline-strong)] bg-white px-3.5 py-1.5 text-[13px] font-medium hover:border-[var(--vh-accent)] hover:text-[var(--vh-accent)]"
        >
          弹幕 · {danmakus?.total ?? '—'}
        </Link>
        <Link
          href="/admin/users"
          className="rounded-full border border-[var(--vh-admin-hairline-strong)] bg-white px-3.5 py-1.5 text-[13px] font-medium hover:border-[var(--vh-accent)] hover:text-[var(--vh-accent)]"
        >
          用户 · {users?.total ?? '—'}
        </Link>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Link
            key={k.label}
            href={k.href}
            className="grid grid-cols-[1fr_auto] rounded-[14px] border border-[var(--vh-admin-hairline)] bg-[var(--vh-admin-glass)] p-4 shadow-[var(--vh-shadow-card)] backdrop-blur transition hover:shadow-[var(--vh-shadow-card-hover)]"
          >
            <div>
              <p className="text-[12px] font-medium text-[var(--vh-admin-tertiary)]">{k.label}</p>
              <p className="mt-2 text-[28px] font-bold tabular-nums tracking-tight">{k.value}</p>
              <p className="mt-1 text-[12px] font-medium text-[var(--vh-ok)]">{k.delta}</p>
            </div>
            <svg viewBox="0 0 72 36" className="h-9 w-[72px] self-center" aria-hidden>
              <path
                d={k.spark}
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={k.sparkClass}
              />
            </svg>
          </Link>
        ))}
      </div>

      <div className="grid gap-3.5 lg:grid-cols-[1.55fr_1fr]">
        <div className="rounded-[14px] border border-[var(--vh-admin-hairline)] bg-[var(--vh-admin-glass)] p-4 shadow-[var(--vh-shadow-card)] backdrop-blur">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold">播放量 vs 投稿</h2>
            <div className="flex gap-3 text-[12px] text-[var(--vh-admin-secondary)]">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[var(--vh-accent)]" />
                播放
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#c7c7cc]" />
                投稿
              </span>
            </div>
          </div>
          <div className="grid h-[140px] grid-cols-7 items-end gap-2.5 px-1">
            {bars.map(([sec, pri], i) => (
              <div key={days[i]} className="flex h-full flex-col items-center justify-end gap-2">
                <div className="flex w-full max-w-7 flex-1 flex-col justify-end gap-1">
                  <div className="w-full rounded-t-[5px] bg-[#e5e5ea]" style={{ height: `${sec}%` }} />
                  <div
                    className="w-full rounded-t-[5px] bg-gradient-to-b from-[#4da3ff] to-[var(--vh-accent)]"
                    style={{ height: `${pri}%` }}
                  />
                </div>
                <span className="text-[11px] text-[var(--vh-admin-tertiary)]">{days[i]}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[12px] text-[var(--vh-admin-tertiary)]">
            示意趋势（原型视觉）；真实统计可后续接 API。
          </p>
        </div>

        <div className="overflow-hidden rounded-[14px] border border-[var(--vh-admin-hairline)] bg-[var(--vh-admin-glass)] shadow-[var(--vh-shadow-card)] backdrop-blur">
          <div className="flex items-center justify-between border-b border-[var(--vh-admin-hairline)] px-4 py-3.5">
            <h2 className="text-[15px] font-semibold">快捷入口</h2>
            <Link href="/admin/videos" className="text-[13px] font-medium text-[var(--vh-accent)]">
              全部
            </Link>
          </div>
          <ul className="divide-y divide-[var(--vh-admin-hairline)]">
            {items.slice(0, 5).map((item) => (
              <li key={item.title}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className="flex items-center justify-between px-4 py-3 text-[13px] transition hover:bg-[rgba(0,113,227,0.04)]"
                  >
                    <span className="font-medium">{item.title}</span>
                    <span className="tabular-nums text-[var(--vh-admin-secondary)]">{item.total}</span>
                  </Link>
                ) : (
                  <div className="flex items-center justify-between px-4 py-3 text-[13px]">
                    <span className="font-medium">{item.title}</span>
                    <span className="tabular-nums text-[var(--vh-admin-secondary)]">{item.total}</span>
                  </div>
                )}
              </li>
            ))}
            {items.length === 0 ? (
              <li className="px-4 py-8 text-center text-[13px] text-[var(--vh-admin-tertiary)]">
                加载中…
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-[var(--vh-admin-hairline)] bg-[var(--vh-admin-glass)] shadow-[var(--vh-shadow-card)] backdrop-blur">
        <div className="flex items-center justify-between border-b border-[var(--vh-admin-hairline)] px-4 py-3.5">
          <h2 className="text-[15px] font-semibold">资源总览</h2>
        </div>
        <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const card = (
              <div className="border-b border-[var(--vh-admin-hairline)] p-4 transition hover:bg-[rgba(0,113,227,0.04)] sm:border-r">
                <p className="text-[12px] text-[var(--vh-admin-tertiary)]">{item.title}</p>
                <p className="mt-2 text-2xl font-semibold tabular-nums">{item.total}</p>
              </div>
            )
            return item.href ? (
              <Link key={item.title} href={item.href}>
                {card}
              </Link>
            ) : (
              <div key={item.title}>{card}</div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
