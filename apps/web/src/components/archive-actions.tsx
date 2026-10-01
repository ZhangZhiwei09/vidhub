'use client'

import { useEffect, useState } from 'react'

export function ArchiveActions({ vid }: { vid: number }) {
  const [isLike, setIsLike] = useState(false)
  const [isCollect, setIsCollect] = useState(false)

  useEffect(() => {
    void fetch(`/api/videos/${vid}/archive`)
      .then((r) => r.json())
      .then((json) => {
        setIsLike(!!json?.data?.isLike)
        setIsCollect(!!json?.data?.isCollect)
      })
  }, [vid])

  async function toggle(action: 'like' | 'collect', value: boolean) {
    const res = await fetch('/api/archive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, vid, value }),
    })
    const json = await res.json()
    if (json.code !== 0) {
      alert(json.message || '请先登录')
      return
    }
    if (action === 'like') setIsLike(value)
    else setIsCollect(value)
  }

  return (
    <div className="mt-4 flex gap-3">
      <button
        type="button"
        onClick={() => void toggle('like', !isLike)}
        className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
          isLike
            ? 'bg-white text-black'
            : 'border border-white/25 text-white/80 hover:border-white/45 hover:text-white'
        }`}
      >
        {isLike ? '已赞' : '点赞'}
      </button>
      <button
        type="button"
        onClick={() => void toggle('collect', !isCollect)}
        className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
          isCollect
            ? 'bg-white text-black'
            : 'border border-white/25 text-white/80 hover:border-white/45 hover:text-white'
        }`}
      >
        {isCollect ? '已收藏' : '收藏'}
      </button>
    </div>
  )
}
