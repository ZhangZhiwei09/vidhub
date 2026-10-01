'use client'

import { useEffect, useState } from 'react'

type Comment = {
  id: number
  content: string
  username: string
  avatar: string | null
  createdAt: string
  children?: Comment[]
  childrenCount?: number
}

export function CommentSection({ vid }: { vid: number }) {
  const [list, setList] = useState<Comment[]>([])
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function load() {
    const res = await fetch(`/api/videos/${vid}/comments`)
    const json = await res.json()
    setList(json?.data?.list ?? [])
  }

  useEffect(() => {
    void load()
  }, [vid])

  async function submit() {
    if (!content.trim()) return
    setPending(true)
    setError('')
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vid, content }),
      })
      const json = await res.json()
      if (json.code !== 0) {
        setError(json.message || '评论失败')
        return
      }
      setContent('')
      await load()
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="mt-8 space-y-4">
      <h2 className="text-lg font-semibold tracking-tight text-white">评论</h2>
      <div className="flex gap-2">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="说点什么…"
          className="vh-input flex-1"
        />
        <button
          type="button"
          disabled={pending}
          onClick={() => void submit()}
          className="vh-btn-primary !rounded-xl px-4 disabled:opacity-60"
        >
          发送
        </button>
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <ul className="space-y-3">
        {list.map((c) => (
          <li
            key={c.id}
            className="rounded-[14px] border border-white/10 bg-white/[0.04] p-3 backdrop-blur"
          >
            <div className="flex items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.avatar || '/next.svg'}
                alt=""
                className="h-9 w-9 rounded-full bg-white/10 object-cover"
              />
              <div>
                <p className="text-sm font-medium text-white">{c.username}</p>
                <p className="mt-1 text-sm text-white/70">{c.content}</p>
                {(c.children?.length ?? 0) > 0 ? (
                  <ul className="mt-3 space-y-2 border-l border-white/10 pl-3">
                    {c.children!.map((child) => (
                      <li key={child.id} className="text-sm text-white/70">
                        <span className="font-medium text-white">{child.username}</span>：
                        {child.content}
                      </li>
                    ))}
                    {(c.childrenCount ?? 0) > (c.children?.length ?? 0) ? (
                      <li className="text-xs text-white/40">还有更多回复…</li>
                    ) : null}
                  </ul>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
