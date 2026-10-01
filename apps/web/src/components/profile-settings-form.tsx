'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function ProfileSettingsForm() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [sign, setSign] = useState('')
  const [sex, setSex] = useState<'unknown' | 'male' | 'female'>('unknown')
  const [avatar, setAvatar] = useState('')
  const [pending, setPending] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    void fetch('/api/users/me')
      .then((r) => r.json())
      .then((json) => {
        if (json.code !== 0) return
        setUsername(json.data.username ?? '')
        setSign(json.data.sign ?? '')
        setSex(json.data.sex ?? 'unknown')
        setAvatar(json.data.avatar ?? '')
      })
  }, [])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setMsg('')
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, sign, sex }),
      })
      const json = await res.json()
      if (json.code !== 0) {
        setMsg(json.message || '保存失败')
        return
      }
      setMsg('资料已保存')
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  async function onAvatar(file: File | null) {
    if (!file) return
    setPending(true)
    setMsg('')
    try {
      const base64 = await fileToBase64(file)
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'avatar', BASE64: base64, coverName: file.name }),
      })
      const json = await res.json()
      if (json.code !== 0) {
        setMsg(json.message || '头像上传失败')
        return
      }
      setAvatar(json.data.avatar)
      setMsg('头像已更新')
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="mx-auto grid max-w-xl gap-6">
      <section className="rounded-xl bg-white p-6 ring-1 ring-zinc-200">
        <h2 className="font-semibold">头像</h2>
        <div className="mt-4 flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatar || '/next.svg'}
            alt=""
            className="h-16 w-16 rounded-full bg-zinc-100 object-cover"
          />
          <label className="cursor-pointer rounded-md border border-zinc-300 px-3 py-2 text-sm">
            更换头像
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void onAvatar(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
      </section>

      <form onSubmit={saveProfile} className="space-y-4 rounded-xl bg-white p-6 ring-1 ring-zinc-200">
        <h2 className="font-semibold">基本资料</h2>
        <label className="block text-sm text-zinc-600">
          昵称
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            maxLength={32}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm text-zinc-600">
          签名
          <textarea
            value={sign}
            onChange={(e) => setSign(e.target.value)}
            maxLength={200}
            rows={3}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm text-zinc-600">
          性别
          <select
            value={sex}
            onChange={(e) => setSex(e.target.value as typeof sex)}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
          >
            <option value="unknown">保密</option>
            <option value="male">男</option>
            <option value="female">女</option>
          </select>
        </label>
        {msg ? <p className="text-sm text-emerald-700">{msg}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-white disabled:opacity-60"
        >
          {pending ? '保存中…' : '保存'}
        </button>
      </form>
    </div>
  )
}