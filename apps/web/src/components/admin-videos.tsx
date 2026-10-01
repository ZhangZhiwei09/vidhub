'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

type VideoRow = {
  id: number
  title: string
  status: string
  clicks: number
}

export function AdminVideos() {
  const searchParams = useSearchParams()
  const initialStatus = searchParams.get('status') || ''
  const [list, setList] = useState<VideoRow[]>([])
  const [status, setStatus] = useState(initialStatus)

  async function load(nextStatus = status) {
    const q = nextStatus ? `&status=${nextStatus}` : ''
    const res = await fetch(`/api/admin?resource=videos${q}`)
    const json = await res.json()
    setList(json?.data?.list ?? [])
  }

  useEffect(() => {
    setStatus(initialStatus)
    void load(initialStatus)
  }, [initialStatus])

  async function setVideoStatus(id: number, next: 'pending' | 'approved' | 'rejected') {
    await fetch('/api/admin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'video-status', id, status: next }),
    })
    await load()
  }

  async function remove(id: number) {
    if (!confirm('确认删除？')) return
    await fetch('/api/admin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete-video', id }),
    })
    await load()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin" className="text-[13px] font-medium text-[var(--vh-accent)]">
          ← 仪表盘
        </Link>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            void load(e.target.value)
          }}
          className="rounded-lg border border-[var(--vh-admin-hairline-strong)] bg-white px-2.5 py-1.5 text-[13px]"
        >
          <option value="">全部</option>
          <option value="pending">待审</option>
          <option value="approved">已通过</option>
          <option value="rejected">已拒绝</option>
        </select>
      </div>
      <div className="overflow-hidden rounded-[14px] border border-[var(--vh-admin-hairline)] bg-white shadow-[var(--vh-shadow-card)]">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-[var(--vh-admin-hairline)] bg-black/[0.015] text-[11px] font-semibold uppercase tracking-[0.03em] text-[var(--vh-admin-tertiary)]">
              <th className="px-5 py-2.5">ID</th>
              <th className="px-5 py-2.5">标题</th>
              <th className="px-5 py-2.5">状态</th>
              <th className="px-5 py-2.5">播放</th>
              <th className="px-5 py-2.5">操作</th>
            </tr>
          </thead>
          <tbody>
            {list.map((v) => (
              <tr
                key={v.id}
                className="border-b border-[var(--vh-admin-hairline)] last:border-0 hover:bg-[rgba(0,113,227,0.04)]"
              >
                <td className="px-5 py-3 tabular-nums">{v.id}</td>
                <td className="px-5 py-3 font-medium">{v.title}</td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex h-[22px] items-center rounded-md px-2 text-[11px] font-semibold ${
                      v.status === 'approved'
                        ? 'bg-[rgba(52,199,89,0.12)] text-[#248A3D]'
                        : v.status === 'pending'
                          ? 'bg-[rgba(255,149,0,0.12)] text-[#C93400]'
                          : 'bg-black/[0.06] text-[var(--vh-admin-secondary)]'
                    }`}
                  >
                    {v.status}
                  </span>
                </td>
                <td className="px-5 py-3 tabular-nums">{v.clicks}</td>
                <td className="space-x-3 px-5 py-3">
                  <button
                    type="button"
                    className="font-medium text-[var(--vh-accent)]"
                    onClick={() => void setVideoStatus(v.id, 'approved')}
                  >
                    通过
                  </button>
                  <button
                    type="button"
                    className="font-medium text-[var(--vh-admin-secondary)]"
                    onClick={() => void setVideoStatus(v.id, 'rejected')}
                  >
                    拒绝
                  </button>
                  <button
                    type="button"
                    className="font-medium text-red-600"
                    onClick={() => void remove(v.id)}
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}