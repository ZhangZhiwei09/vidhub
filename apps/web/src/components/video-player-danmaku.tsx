'use client'

import { useEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'

type Danmaku = {
  id?: number
  text: string
  color: string
  time: number
}

const RATES = [0.75, 1, 1.25, 1.5, 2]

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
  const [color, setColor] = useState('#ffffff')
  const [enabled, setEnabled] = useState(true)
  const [rate, setRate] = useState(1)
  const [showPanel, setShowPanel] = useState(false)
  const [flying, setFlying] = useState<Array<Danmaku & { key: string }>>([])
  const socketRef = useRef<Socket | null>(null)
  const firedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    void fetch(`/api/videos/${vid}/danmakus`)
      .then((r) => r.json())
      .then((json) => setList(json?.data ?? []))

    const url = process.env.NEXT_PUBLIC_REALTIME_URL || 'http://localhost:5000'
    const socket = io(url, { transports: ['websocket'] })
    socketRef.current = socket
    socket.emit('joinRoom', vid)
    socket.on('msg', (payload: { type: string; data: Danmaku }) => {
      if (payload.type === 'danmaku' && payload.data && enabled) {
        pushFlying(payload.data)
      }
    })
    return () => {
      socket.emit('leaveRoom', vid)
      socket.disconnect()
    }
  }, [vid, enabled])

  function pushFlying(d: Danmaku) {
    const key = `${Date.now()}-${Math.random()}`
    setFlying((prev) => [...prev, { ...d, key }])
    setTimeout(() => {
      setFlying((prev) => prev.filter((x) => x.key !== key))
    }, 8000)
  }

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    const onTime = () => {
      if (!enabled) return
      const t = Math.floor(el.currentTime)
      for (const d of list) {
        if (d.time !== t) continue
        const id = `${d.id ?? d.text}-${t}`
        if (firedRef.current.has(id)) continue
        firedRef.current.add(id)
        pushFlying(d)
      }
    }
    el.addEventListener('timeupdate', onTime)
    return () => el.removeEventListener('timeupdate', onTime)
  }, [list, enabled])

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = rate
  }, [rate])

  async function send() {
    if (!text.trim() || !videoRef.current) return
    const time = Math.floor(videoRef.current.currentTime)
    const payload = { vid, text, color, time, type: 0 }
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
    if (enabled) pushFlying(json.data)
    setText('')
  }

  async function togglePiP() {
    const el = videoRef.current
    if (!el) return
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
      } else if (document.pictureInPictureEnabled) {
        await el.requestPictureInPicture()
      }
    } catch {
      alert('当前环境不支持画中画')
    }
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
        {enabled ? (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {flying.map((d) => (
              <div
                key={d.key}
                className="absolute animate-[danmaku_8s_linear_forwards] whitespace-nowrap text-sm font-medium drop-shadow"
                style={{ color: d.color || '#fff', top: `${8 + ((d.key.length * 7) % 70)}%` }}
              >
                {d.text}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="发送弹幕"
          className="min-w-[160px] flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-9 w-10 cursor-pointer rounded border border-zinc-300"
          title="弹幕颜色"
        />
        <button
          type="button"
          onClick={() => void send()}
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white"
        >
          发送
        </button>
        <button
          type="button"
          onClick={() => setShowPanel((v) => !v)}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        >
          设置
        </button>
      </div>

      {showPanel ? (
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-white p-3 text-sm ring-1 ring-zinc-200">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
            显示弹幕
          </label>
          <div className="flex items-center gap-1">
            <span className="text-zinc-500">倍速</span>
            {RATES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRate(r)}
                className={`rounded px-2 py-1 ${rate === r ? 'bg-zinc-900 text-white' : 'bg-zinc-100'}`}
              >
                {r}x
              </button>
            ))}
          </div>
          <button type="button" onClick={() => void togglePiP()} className="rounded bg-zinc-100 px-2 py-1">
            画中画
          </button>
        </div>
      ) : null}

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