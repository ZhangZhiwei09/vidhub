import { Suspense } from 'react'
import { AdminVideos } from '@/components/admin-videos'

export default function AdminVideosPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">视频管理</h1>
      <Suspense fallback={<p className="text-sm text-zinc-500">加载中…</p>}>
        <AdminVideos />
      </Suspense>
    </main>
  )
}