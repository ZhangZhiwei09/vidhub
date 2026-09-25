'use client'

import { useState } from 'react'

export function FollowButton({ followId }: { followId: number }) {
  const [following, setFollowing] = useState<boolean | null>(null)
  const [pending, setPending] = useState(false)

  async function toggle() {
    setPending(true)
    try {
      const res = await fetch('/api/follows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followId }),
      })
      const json = await res.json()
      if (json.code !== 0) {
        alert(json.message || '请先登录')
        return
      }
      setFollowing(!!json.data?.following)
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => void toggle()}
      className="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm text-white disabled:opacity-60"
    >
      {following ? '取消关注' : '关注'}
    </button>
  )
}