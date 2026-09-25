import { and, desc, eq, like } from 'drizzle-orm'
import { users, videos } from '@vidhub/db/schema'
import { db } from '@/lib/db'
import { VideoCard } from '@/components/video-card'

type Props = { searchParams: Promise<{ q?: string }> }

export default async function SearchPage({ searchParams }: Props) {
  const { q = '' } = await searchParams
  const keywords = q.trim()
  let list: Array<{
    id: number
    title: string
    cover: string | null
    username: string
    clicks: number
  }> = []

  if (keywords) {
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
        .where(and(eq(videos.status, 'approved'), like(videos.title, `%${keywords}%`)))
        .orderBy(desc(videos.createdAt))
        .limit(48)
    } catch {
      list = []
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <form className="mb-6 flex gap-2">
        <input
          name="q"
          defaultValue={keywords}
          placeholder="搜索标题"
          className="flex-1 rounded-md border border-zinc-300 px-3 py-2"
        />
        <button type="submit" className="rounded-md bg-zinc-900 px-4 py-2 text-white">
          搜索
        </button>
      </form>
      {!keywords ? (
        <p className="text-zinc-500">输入关键词开始搜索</p>
      ) : list.length === 0 ? (
        <p className="text-zinc-500">没有匹配结果</p>
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