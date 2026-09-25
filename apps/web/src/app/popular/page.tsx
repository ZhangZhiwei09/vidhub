import { desc, eq } from 'drizzle-orm'
import { users, videos } from '@vidhub/db/schema'
import { db } from '@/lib/db'
import { VideoCard } from '@/components/video-card'

export default async function PopularPage() {
  let list: Array<{
    id: number
    title: string
    cover: string | null
    username: string
    clicks: number
  }> = []
  try {
    list = await db
      .select({
        id: videos.id,
        title: videos.title,
        cover: videos.cover,
        username: users.username,
        clicks: videos.clicks,
      })
      .from(videos)
      .innerJoin(users, eq(videos.uid, users.id))
      .where(eq(videos.status, 'approved'))
      .orderBy(desc(videos.clicks))
      .limit(10)
  } catch {
    list = []
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">热门视频</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((v) => (
          <VideoCard key={v.id} video={v} />
        ))}
      </div>
    </main>
  )
}