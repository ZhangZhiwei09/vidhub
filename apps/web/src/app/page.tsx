import { desc, eq } from 'drizzle-orm'
import { users, videos } from '@vidhub/db/schema'
import { db } from '@/lib/db'
import { VideoCard } from '@/components/video-card'
import Link from 'next/link'

async function getVideos() {
  try {
    return await db
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
      .orderBy(desc(videos.createdAt))
      .limit(24)
  } catch {
    return []
  }
}

export default async function HomePage() {
  const list = await getVideos()

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <section className="mb-10 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-700 px-8 py-12 text-white">
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-300">VidHub</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">发现精彩视频</h1>
        <p className="mt-3 max-w-lg text-zinc-300">列表、详情与分片投稿已接入。登录后即可上传。</p>
        <div className="mt-6 flex gap-3">
          <Link href="/upload" className="rounded-md bg-white px-4 py-2 text-sm font-medium text-zinc-900">
            去投稿
          </Link>
          <Link
            href="/popular"
            className="rounded-md border border-white/40 px-4 py-2 text-sm font-medium text-white"
          >
            热门
          </Link>
        </div>
      </section>

      {list.length === 0 ? (
        <p className="text-zinc-500">暂无视频。启动 Postgres 并投稿后将显示在这里。</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      )}
    </main>
  )
}