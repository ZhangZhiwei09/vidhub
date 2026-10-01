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
      <section className="rounded-[18px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
        <h2 className="font-semibold text-white">头像</h2>
        <div className="mt-4 flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatar || '/next.svg'}
            alt=""
            className="h-16 w-16 rounded-full bg-white/10 object-cover"
          />
          <label className="cursor-pointer rounded-full border border-white/25 px-3 py-2 text-sm text-white/80 hover:border-white/45 hover:text-white">
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

      <form
        onSubmit={saveProfile}
        className="space-y-4 rounded-[18px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur"
      >
        <h2 className="font-semibold text-white">基本资料</h2>
        <label className="block text-sm text-white/55">
          昵称
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            maxLength={32}
            className="vh-input mt-1"
          />
        </label>
        <label className="block text-sm text-white/55">
          签名
          <textarea
            value={sign}
            onChange={(e) => setSign(e.target.value)}
            maxLength={200}
            rows={3}
            className="vh-input mt-1"
          />
        </label>
        <label className="block text-sm text-white/55">
          性别
          <select
            value={sex}
            onChange={(e) => setSex(e.target.value as typeof sex)}
            className="vh-input mt-1"
          >
            <option value="unknown" className="text-black">
              保密
            </option>
            <option value="male" className="text-black">
              男
            </option>
            <option value="female" className="text-black">
              女
            </option>
          </select>
        </label>
        {msg ? <p className="text-sm text-emerald-400">{msg}</p> : null}
        <button type="submit" disabled={pending} className="vh-btn-accent disabled:opacity-60">
          {pending ? '保存中…' : '保存'}
        </button>
      </form>
    </div>
  )
}
