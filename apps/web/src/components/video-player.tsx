'use client'

import { useEffect, useRef } from 'react'

function colorToNumber(color: string | number | null | undefined) {
  if (typeof color === 'number' && Number.isFinite(color)) return color
  let hex = String(color ?? '#ffffff')
  if (hex[0] === '#') hex = hex.slice(1)
  if (hex.length === 3) {
    hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`
  }
  const n = parseInt(hex, 16)
  return Number.isFinite(n) ? n & 0xffffff : 0xffffff
}

export function VideoPlayer({
  vid,
  src,
  poster,
}: {
  vid: number
  src: string
  poster?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !src) return
    const container = containerRef.current
    let destroyed = false
    let player: { destroy: () => void } | null = null

    void import('@vidhub/player').then(({ default: Player }) => {
      if (destroyed || !container) return
      player = new Player({
        container,
        live: false,
        video: {
          url: src,
          pic: poster,
        },
        videoProps: {
          preload: 'auto',
          poster: poster ?? '',
        },
        danmaku: {
          open: true,
          api: `/api/videos/${vid}/danmakus`,
        },
        apiBackend: {
          read: async (option) => {
            try {
              const res = await fetch(`/api/videos/${vid}/danmakus`)
              const json = await res.json()
              const rows = Array.isArray(json?.data) ? json.data : []
              option.success(
                rows.map((row: { text: string; time: number; type: number; color: string }) => ({
                  text: row.text,
                  time: row.time,
                  type: row.type ?? 0,
                  color: colorToNumber(row.color),
                })),
              )
            } catch {
              option.error?.()
            }
          },
          send: async (option) => {
            try {
              const payload = option.data
              const res = await fetch(`/api/videos/${vid}/danmakus`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  text: payload?.text,
                  time: Math.floor(Number(payload?.time ?? 0)),
                  type: Number(payload?.type ?? 0),
                  color: typeof payload?.color === 'number'
                    ? `#${('00000' + payload.color.toString(16)).slice(-6)}`
                    : payload?.color,
                }),
              })
              const json = await res.json()
              if (json.code !== 0) {
                option.error?.()
                return
              }
              option.success()
            } catch {
              option.error?.()
            }
          },
        },
      })
    })

    return () => {
      destroyed = true
      player?.destroy()
      container.replaceChildren()
    }
  }, [vid, src, poster])

  return (
    <div className="relative w-full overflow-hidden rounded-[14px] bg-black pt-[56.25%]">
      <div ref={containerRef} className="absolute inset-0 h-full w-full" id="wplayer" />
    </div>
  )
}