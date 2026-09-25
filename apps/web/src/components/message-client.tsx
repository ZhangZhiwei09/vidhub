'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { io } from 'socket.io-client'

type Peer = {
  receiver: number
  username?: string
  avatar?: string | null
  content: string
}

type ChatRow = {
  id: number
  fromId: number
  content: string
  createdAt: string
}

export function MessageClient({
  selfId,
  peerId,
}: {
  selfId: number
  peerId?: number
}) {
  const router = useRouter()
  const [peers, setPeers] = useState<Peer[]>([])
  const [rows, setRows] = useState<ChatRow[]>([])
  const [text, setText] = useState('')
  const [target, setTarget] = useState(peerId ? String(peerId) : '')

  async function loadPeers() {
    const res = await fetch('/api/messages')
    const json = await res.json()
    setPeers(json?.data ?? [])
  }

  async function loadChat(id: number) {
    const res = await fetch(`/api/messages/${id}`)
    const json = await res.json()
    setRows(json?.data ?? [])
  }

  useEffect(() => {
    void loadPeers()
  }, [])

  useEffect(() => {
    if (peerId) void loadChat(peerId)
  }, [peerId])

  useEffect(() => {
    if (!selfId) return
    const url = process.env.NEXT_PUBLIC_REALTIME_URL || 'http://localhost:5000'
    const socket = io(url, { transports: ['websocket'] })
    socket.emit('join', selfId)
    socket.on('msg', (payload: { type: string }) => {
      if (payload.type === 'private') {
        void loadPeers()
        if (peerId) void loadChat(peerId)
      }
    })
    return () => {
      socket.disconnect()
    }
  }, [selfId, peerId])

  async function send() {
    const toId = peerId || Number(target)
    if (!toId || !text.trim()) return
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toId, content: text }),
    })
    const json = await res.json()
    if (json.code !== 0) {
      alert(json.message)
      return
    }
    const url = process.env.NEXT_PUBLIC_REALTIME_URL || 'http://localhost:5000'
    const socket = io(url, { transports: ['websocket'] })
    socket.emit('join', selfId)
    socket.emit('sendMessage', { to_id: toId, content: text, from_id: selfId })
    socket.disconnect()
    setText('')
    if (!peerId) router.push(`/message/${toId}`)
    else {
      await loadChat(toId)
      await loadPeers()
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
      <aside className="rounded-xl bg-white p-3 ring-1 ring-zinc-200">
        <h2 className="mb-2 text-sm font-semibold">会话</h2>
        <ul className="space-y-1">
          {peers.map((p) => (
            <li key={p.receiver}>
              <Link
                href={`/message/${p.receiver}`}
                className={`block rounded-md px-2 py-2 text-sm hover:bg-zinc-100 ${peerId === p.receiver ? 'bg-zinc-100' : ''}`}
              >
                <p className="font-medium">{p.username || p.receiver}</p>
                <p className="truncate text-xs text-zinc-500">{p.content}</p>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-2 border-t border-zinc-100 pt-3">
          <input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="对方用户 ID"
            className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
          />
          <button
            type="button"
            onClick={() => target && router.push(`/message/${target}`)}
            className="w-full rounded-md bg-zinc-900 px-2 py-1.5 text-sm text-white"
          >
            开始聊天
          </button>
        </div>
      </aside>
      <section className="flex min-h-[420px] flex-col rounded-xl bg-white p-4 ring-1 ring-zinc-200">
        {!peerId ? (
          <p className="m-auto text-sm text-zinc-500">选择或输入用户 ID 开始私信</p>
        ) : (
          <>
            <div className="flex-1 space-y-2 overflow-y-auto">
              {rows.map((r) => (
                <div
                  key={r.id}
                  className={`flex ${r.fromId === selfId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${r.fromId === selfId ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-800'}`}
                  >
                    {r.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm"
                placeholder="输入消息"
              />
              <button
                type="button"
                onClick={() => void send()}
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white"
              >
                发送
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  )
}