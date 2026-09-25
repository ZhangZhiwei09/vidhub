'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type VideoRow = {
  id: number
  title: string
  status: string
  clicks: number
}

export function AdminVideos() {
  const [list, setList] = useState<VideoRow[]>([])
  const [status, setStatus] = useState('')

  async function load(nextStatus = status) {
    const q = nextStatus ? `&status=${nextStatus}` : ''
    const res = await fetch(`/api/admin?resource=videos${q}`)
    const json = await res.json()
    setList(json?.data?.list ?? [])
  }

  useEffect(() => {
    void load()
  }, [])

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
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-sm text-zinc-500">
          ← 仪表盘
        </Link>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            void load(e.target.value)
          }}
          className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
        >
          <option value="">全部</option>
          <option value="pending">待审</option>
          <option value="approved">已通过</option>
          <option value="rejected">已拒绝</option>
        </select>
      </div>
      <table className="w-full overflow-hidden rounded-xl bg-white text-left text-sm ring-1 ring-zinc-200">
        <thead className="bg-zinc-50 text-zinc-500">
          <tr>
            <th className="px-3 py-2">ID</th>
            <th className="px-3 py-2">标题</th>
            <th className="px-3 py-2">状态</th>
            <th className="px-3 py-2">播放</th>
            <th className="px-3 py-2">操作</th>
          </tr>
        </thead>
        <tbody>
          {list.map((v) => (
            <tr key={v.id} className="border-t border-zinc-100">
              <td className="px-3 py-2">{v.id}</td>
              <td className="px-3 py-2">{v.title}</td>
              <td className="px-3 py-2">{v.status}</td>
              <td className="px-3 py-2">{v.clicks}</td>
              <td className="space-x-2 px-3 py-2">
                <button type="button" onClick={() => void setVideoStatus(v.id, 'approved')}>
                  通过
                </button>
                <button type="button" onClick={() => void setVideoStatus(v.id, 'rejected')}>
                  拒绝
                </button>
                <button type="button" className="text-red-600" onClick={() => void remove(v.id)}>
                  删除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}