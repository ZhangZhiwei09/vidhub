'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { PARTITIONS } from '@vidhub/shared'
import { extractVideoCover, hashFileInWorker } from '@vidhub/media-runtime'

const CHUNK_SIZE = 2 * 1024 * 1024
const UPLOAD_CONCURRENCY = 3
const MAX_UPLOAD_RETRIES = 3
const RETRY_DELAY_MS = 400

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function uploadChunkWithRetry(
  file: File,
  hash: string,
  fileName: string,
  chunkIndex: number,
) {
  const start = chunkIndex * CHUNK_SIZE
  const chunk = file.slice(start, start + CHUNK_SIZE)
  const chunkName = `${hash}-${chunkIndex}`

  for (let attempt = 0; attempt < MAX_UPLOAD_RETRIES; attempt++) {
    try {
      const form = new FormData()
      form.append('file', chunk)
      form.append('hash', chunkName)
      form.append('HASH', hash)
      form.append('fileName', fileName)

      const response = await fetch('/api/upload/chunk', {
        method: 'POST',
        body: form,
      })
      if (response.ok) return
    } catch {
      // Retry transient network failures below.
    }

    if (attempt < MAX_UPLOAD_RETRIES - 1) {
      await wait(RETRY_DELAY_MS * (attempt + 1))
    }
  }

  throw new Error('切片上传失败')
}

async function uploadMissingChunks(
  file: File,
  hash: string,
  uploadedList: string[],
  onProgress: (completed: number, total: number) => void,
) {
  const total = Math.ceil(file.size / CHUNK_SIZE)
  const uploaded = new Set(uploadedList)
  const pendingIndexes = Array.from({ length: total }, (_, index) => index).filter(
    (index) => !uploaded.has(`${hash}-${index}`),
  )
  let cursor = 0
  let completed = total - pendingIndexes.length
  onProgress(completed, total)

  async function runWorker() {
    while (cursor < pendingIndexes.length) {
      const index = pendingIndexes[cursor]
      cursor += 1
      if (index === undefined) return

      await uploadChunkWithRetry(file, hash, file.name, index)
      completed += 1
      onProgress(completed, total)
    }
  }

  const workerCount = Math.min(UPLOAD_CONCURRENCY, pendingIndexes.length)
  await Promise.all(Array.from({ length: workerCount }, () => runWorker()))
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
  const [partitionId, setPartitionId] = useState(1)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [coverPending, setCoverPending] = useState(false)
  const [coverPreview, setCoverPreview] = useState('')
  const coverAbortRef = useRef<AbortController | null>(null)
  const coverPreviewRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      coverAbortRef.current?.abort()
      if (coverPreviewRef.current) {
        URL.revokeObjectURL(coverPreviewRef.current)
      }
    }
  }, [])

  function replaceCoverPreview(blob: Blob | null) {
    if (coverPreviewRef.current) {
      URL.revokeObjectURL(coverPreviewRef.current)
      coverPreviewRef.current = null
    }

    if (!blob) {
      setCoverPreview('')
      return
    }

    const url = URL.createObjectURL(blob)
    coverPreviewRef.current = url
    setCoverPreview(url)
  }

  async function handleVideoChange(file: File | null) {
    coverAbortRef.current?.abort()
    coverAbortRef.current = null
    setVideoFile(file)
    setCoverFile(null)
    replaceCoverPreview(null)
    setError('')

    if (!file) return

    const controller = new AbortController()
    coverAbortRef.current = controller
    setCoverPending(true)
    setProgress('正在生成封面…')

    try {
      const result = await extractVideoCover(file, {
        signal: controller.signal,
        onProgress: ({ ratio }) => {
          setProgress(`正在生成封面 ${Math.round(ratio * 100)}%`)
        },
      })

      if (controller.signal.aborted) return

      const baseName = file.name.replace(/\.[^.]+$/, '') || 'cover'
      const generatedCover = new File([result.blob], `${baseName}.jpg`, {
        type: 'image/jpeg',
      })
      setCoverFile(generatedCover)
      replaceCoverPreview(result.blob)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setError('自动生成封面失败，请手动选择封面')
    } finally {
      if (coverAbortRef.current === controller) {
        coverAbortRef.current = null
        setCoverPending(false)
        setProgress('')
      }
    }
  }

  function handleCoverChange(file: File | null) {
    coverAbortRef.current?.abort()
    coverAbortRef.current = null
    setCoverPending(false)
    setCoverFile(file)
    replaceCoverPreview(file)
    setError('')
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!videoFile || !title.trim()) {
      setError('请填写标题并选择视频')
      return
    }
    if (coverPending) {
      setError('封面仍在生成，请稍候')
      return
    }
    if (!coverFile) {
      setError('请选择封面')
      return
    }

    setPending(true)
    setError('')

    try {
      setProgress('计算文件哈希…')
      const { hash } = await hashFileInWorker(videoFile, {
        onProgress: ({ ratio }) => {
          setProgress(`计算文件哈希 ${Math.round(ratio * 100)}%`)
        },
      })

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
          await uploadMissingChunks(videoFile, hash, uploadedList, (completed, total) => {
            setProgress(`上传切片 ${completed}/${total}`)
          })

          setProgress('合并切片…')
          const mergeRes = await fetch('/api/upload/merge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hash, fileName: videoFile.name, size: CHUNK_SIZE }),
          })
          const mergeJson = await mergeRes.json()
          if (mergeJson.code !== 0) {
            throw new Error(mergeJson.message || '合并失败')
          }
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
      if (coverJson.code !== 0) {
        throw new Error(coverJson.message || '封面上传失败')
      }

      setProgress('发布作品…')
      const publishRes = await fetch('/api/upload/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hash,
          title,
          description,
          cover: coverJson.data.cover,
          partitionId,
        }),
      })
      const publishJson = await publishRes.json()
      if (publishJson.code !== 0) {
        throw new Error(publishJson.message || '发布失败')
      }

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
    <form
      onSubmit={onSubmit}
      className="mx-auto flex max-w-xl flex-col gap-4 rounded-[18px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur"
    >
      <h1 className="text-xl font-semibold tracking-tight text-white">投稿</h1>
      <label className="text-sm text-white/55">
        标题
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="vh-input mt-1"
          required
        />
      </label>
      <label className="text-sm text-white/55">
        简介
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="vh-input mt-1"
          rows={3}
        />
      </label>
      <label className="text-sm text-white/55">
        分区
        <select
          value={partitionId}
          onChange={(e) => setPartitionId(Number(e.target.value))}
          className="vh-input mt-1"
        >
          {PARTITIONS.filter((p) => p.id !== 0).map((p) => (
            <option key={p.id} value={p.id} className="text-black">
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm text-white/55">
        视频文件
        <input
          type="file"
          accept="video/*"
          className="mt-1 block w-full text-sm text-white/70 file:mr-3 file:rounded-lg file:border-0 file:bg-white/15 file:px-3 file:py-1.5 file:text-white"
          onChange={(e) => void handleVideoChange(e.target.files?.[0] ?? null)}
          required
        />
      </label>
      <label className="text-sm text-white/55">
        封面图片
        <input
          type="file"
          accept="image/*"
          className="mt-1 block w-full text-sm text-white/70 file:mr-3 file:rounded-lg file:border-0 file:bg-white/15 file:px-3 file:py-1.5 file:text-white"
          onChange={(e) => handleCoverChange(e.target.files?.[0] ?? null)}
        />
      </label>
      {coverPreview ? (
        <img
          src={coverPreview}
          alt="封面预览"
          className="aspect-video w-full rounded-lg object-cover"
        />
      ) : null}
      {progress ? <p className="text-sm text-white/45">{progress}</p> : null}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <button
        type="submit"
        disabled={pending || coverPending}
        className="vh-btn-accent disabled:opacity-60"
      >
        {pending ? '上传中…' : coverPending ? '生成封面中…' : '上传并提交审核'}
      </button>
    </form>
  )
}
