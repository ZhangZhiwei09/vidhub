'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const CHUNK_SIZE = 2 * 1024 * 1024

async function sha256File(file: File) {
  const buffer = await file.arrayBuffer()
  const digest = await crypto.subtle.digest('SHA-256', buffer)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function UploadForm() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!videoFile || !coverFile || !title.trim()) {
      setError('请填写标题并选择视频与封面')
      return
    }
    setPending(true)
    setError('')
    try {
      setProgress('计算文件哈希…')
      const hash = await sha256File(videoFile)

      setProgress('检查秒传…')
      const immediateRes = await fetch('/api/upload/immediate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash }),
      })
      const immediateJson = await immediateRes.json()
      let videoUrl = immediateJson?.data?.url as string | undefined

      if (!videoUrl) {
        setProgress('校验已上传切片…')
        const verifyRes = await fetch('/api/upload/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hash, fileName: videoFile.name }),
        })
        const verifyJson = await verifyRes.json()
        const uploadedList: string[] = verifyJson?.data?.uploadedList ?? []

        if (verifyJson?.data?.shouldUpload !== false) {
          const total = Math.ceil(videoFile.size / CHUNK_SIZE)
          for (let i = 0; i < total; i++) {
            const chunkName = `${hash}-${i}`
            if (uploadedList.includes(chunkName)) continue
            const start = i * CHUNK_SIZE
            const chunk = videoFile.slice(start, start + CHUNK_SIZE)
            const form = new FormData()
            form.append('file', chunk)
            form.append('hash', chunkName)
            form.append('HASH', hash)
            form.append('fileName', videoFile.name)
            setProgress(`上传切片 ${i + 1}/${total}`)
            const chunkRes = await fetch('/api/upload/chunk', { method: 'POST', body: form })
            if (!chunkRes.ok) throw new Error('切片上传失败')
          }

          setProgress('合并切片…')
          const mergeRes = await fetch('/api/upload/merge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hash, fileName: videoFile.name, size: CHUNK_SIZE }),
          })
          const mergeJson = await mergeRes.json()
          if (mergeJson.code !== 0) throw new Error(mergeJson.message || '合并失败')
          videoUrl = mergeJson.data.url
        }
      }

      setProgress('上传封面…')
      const coverBase64 = await fileToBase64(coverFile)
      const coverRes = await fetch('/api/upload/cover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ BASE64: coverBase64, coverName: coverFile.name }),
      })
      const coverJson = await coverRes.json()
      if (coverJson.code !== 0) throw new Error(coverJson.message || '封面失败')

      setProgress('发布作品…')
      const publishRes = await fetch('/api/upload/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hash,
          title,
          description,
          cover: coverJson.data.cover,
          partitionId: 0,
        }),
      })
      const publishJson = await publishRes.json()
      if (publishJson.code !== 0) throw new Error(publishJson.message || '发布失败')

      router.push('/studio/works')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败')
    } finally {
      setPending(false)
      setProgress('')
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto flex max-w-xl flex-col gap-4 rounded-xl bg-white p-6 ring-1 ring-zinc-200">
      <h1 className="text-xl font-semibold">投稿</h1>
      <label className="text-sm text-zinc-600">
        标题
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
          required
        />
      </label>
      <label className="text-sm text-zinc-600">
        简介
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
          rows={3}
        />
      </label>
      <label className="text-sm text-zinc-600">
        视频文件
        <input
          type="file"
          accept="video/*"
          className="mt-1 block w-full text-sm"
          onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
          required
        />
      </label>
      <label className="text-sm text-zinc-600">
        封面图片
        <input
          type="file"
          accept="image/*"
          className="mt-1 block w-full text-sm"
          onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
          required
        />
      </label>
      {progress ? <p className="text-sm text-zinc-500">{progress}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-white disabled:opacity-60"
      >
        {pending ? '上传中…' : '上传并提交审核'}
      </button>
    </form>
  )
}