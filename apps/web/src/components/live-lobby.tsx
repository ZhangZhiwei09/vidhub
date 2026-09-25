'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

type LiveRoom = {
  id: number
  title: string
  cover: string | null
  username: string
  playUrl: string
}

export function LiveLobby() {
  const [list, setList] = useState<LiveRoom[]>([])
  const [title, setTitle] = useState('我的直播间')
  const [mine, setMine] = useState<{
    id: number
    status: number
    publicUrl: string
    playUrl: string
  } | null>(null)
  const [msg, setMsg] = useState('')

  async function load() {
    const res = await fetch('/api/lives')
    const json = await res.json()
    setList(json?.data?.list ?? [])
  }

  async function ensure() {
    const res = await fetch('/api/lives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'ensure' }),
    })
    const json = await res.json()
    if (json.code !== 0) {
      setMsg(json.message || '请先登录')
      return
    }
    setMine(json.data)
  }

  async function toggle(status: number) {
    const res = await fetch('/api/lives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'switch', title, status }),
    })
    const json = await res.json()
    if (json.code !== 0) {
      setMsg(json.message || '操作失败')
      return
    }
    setMine(json.data)
    await load()
  }

  useEffect(() => {
    void load()
    void ensure()
  }, [])

  return (
    <div className="space-y-8">
      <section className="rounded-xl bg-white p-4 ring-1 ring-zinc-200">
        <h2 className="font-semibold">我的开播</h2>
        <p className="mt-2 text-sm text-zinc-500">
          使用 OBS 推流到 RTMP，流名为你的用户 id。需先启动 media 服务（端口 1935/8000）。
        </p>
        {mine ? (
          <div className="mt-3 space-y-2 text-sm">
            <p>
              推流地址：<code className="rounded bg-zinc-100 px-1">{mine.publicUrl}</code>
            </p>
            <p>
              播放地址：<code className="rounded bg-zinc-100 px-1">{mine.playUrl}</code>
            </p>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full max-w-md rounded-md border border-zinc-300 px-3 py-2"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void toggle(1)}
                className="rounded-md bg-zinc-900 px-3 py-1.5 text-white"
              >
                开播
              </button>
              <button
                type="button"
                onClick={() => void toggle(0)}
                className="rounded-md border border-zinc-300 px-3 py-1.5"
              >
                关播
              </button>
              {mine.status === 1 ? (
                <Link href={`/live/${mine.id}`} className="rounded-md bg-emerald-700 px-3 py-1.5 text-white">
                  进入直播间
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}
        {msg ? <p className="mt-2 text-sm text-red-600">{msg}</p> : null}
      </section>

      <section>
        <h2 className="mb-3 font-semibold">正在直播</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((room) => (
            <Link
              key={room.id}
              href={`/live/${room.id}`}
              className="overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200"
            >
              <div className="aspect-video bg-zinc-200">
                {room.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={room.cover} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="p-3">
                <p className="font-medium">{room.title || '未命名直播'}</p>
                <p className="text-xs text-zinc-500">{room.username}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}