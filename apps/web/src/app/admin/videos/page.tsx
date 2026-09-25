import { AdminVideos } from '@/components/admin-videos'

export default function AdminVideosPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">视频管理</h1>
      <AdminVideos />
    </main>
  )
}