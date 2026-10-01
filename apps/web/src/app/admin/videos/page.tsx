import { Suspense } from 'react'
import { AdminVideos } from '@/components/admin-videos'

export default function AdminVideosPage() {
  return (
    <div>
      <h1 className="mb-5 text-[28px] font-bold tracking-tight">视频管理</h1>
      <Suspense fallback={<p className="text-sm text-[var(--vh-admin-secondary)]">加载中…</p>}>
        <AdminVideos />
      </Suspense>
    </div>
  )
}
