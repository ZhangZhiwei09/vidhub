'use client'

import { useEffect, useRef, useState } from 'react'
import flvjs from 'flv.js'

export function LivePlayer({ playUrl, title }: { playUrl: string; title: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (flvjs.isSupported()) {
      const player = flvjs.createPlayer({ type: 'flv', url: playUrl, isLive: true })
      player.attachMediaElement(video)
      player.load()
      player.play().catch(() => setError('自动播放被拦截，请点击播放'))
      return () => {
        player.destroy()
      }
    }
    setError('当前浏览器不支持 FLV 播放')
  }, [playUrl])

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">{title || '直播间'}</h1>
      <video ref={videoRef} controls className="aspect-video w-full rounded-xl bg-black" />
      {error ? <p className="mt-2 text-sm text-amber-700">{error}</p> : null}
      <p className="mt-2 text-xs text-zinc-500">{playUrl}</p>
    </div>
  )
}