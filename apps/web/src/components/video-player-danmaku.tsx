'use client'

import { useEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'

type Danmaku = {
  id?: number
  text: string
  color: string
  time: number
}

export function VideoPlayerWithDanmaku({
  vid,
  src,
  poster,
}: {
  vid: number
  src: string
  poster?: string
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [list, setList] = useState<Danmaku[]>([])
  const [text, setText] = useState('')
  const [flying, setFlying] = useState<Array<Danmaku & { key: string }>>([])
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    void fetch(`/api/videos/${vid}/danmakus`)
      .then((r) => r.json())
      .then((json) => setList(json?.data ?? []))

    const url = process.env.NEXT_PUBLIC_REALTIME_URL || 'http://localhost:5000'
    const socket = io(url, { transports: ['websocket'] })
    socketRef.current = socket
    socket.emit('joinRoom', vid)
    socket.on('msg', (payload: { type: string; data: Danmaku & { roomId?: number } }) => {
      if (payload.type === 'danmaku' && payload.data) {
        setFlying((prev) => [...prev, { ...payload.data, key: `${Date.now()}-${Math.random()}` }])
        setTimeout(() => {
          setFlying((prev) => prev.slice(1))
        }, 8000)
      }
    })
    return () => {
      socket.emit('leaveRoom', vid)
      socket.disconnect()
    }
  }, [vid])

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    const onTime = () => {
      const t = Math.floor(el.currentTime)
      const hits = list.filter((d) => d.time === t)
      if (hits.length) {
        setFlying((prev) => [
          ...prev,
          ...hits.map((h) => ({ ...h, key: `${t}-${h.text}-${Math.random()}` })),
        ])
        setTimeout(() => setFlying((prev) => prev.slice(hits.length)), 8000)
      }
    }
    el.addEventListener('timeupdate', onTime)
    return () => el.removeEventListener('timeupdate', onTime)
  }, [list])

  async function send() {
    if (!text.trim() || !videoRef.current) return
    const time = Math.floor(videoRef.current.currentTime)
    const payload = { vid, text, color: '#ffffff', time, type: 0 }
    const res = await fetch(`/api/videos/${vid}/danmakus`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    if (json.code !== 0) {
      alert(json.message || '请先登录')
      return
    }
    socketRef.current?.emit('sendDanmaku', { ...payload, roomId: vid })
    setList((prev) => [...prev, json.data])
    setText('')
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-xl bg-black">
        <video
          ref={videoRef}
          src={src}
          controls
          poster={poster}
          className="aspect-video w-full"
        />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {flying.map((d) => (
            <div
              key={d.key}
              className="absolute animate-[danmaku_8s_linear_forwards] whitespace-nowrap text-sm font-medium drop-shadow"
              style={{ color: d.color || '#fff', top: `${10 + (d.key.length % 70)}%` }}
            >
              {d.text}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="发送弹幕"
          className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => void send()}
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white"
        >
          弹幕
        </button>
      </div>
      <style jsx global>{`
        @keyframes danmaku {
          from {
            transform: translateX(100vw);
          }
          to {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  )
}