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
    <main className="vh-page">
      <h1 className="vh-page-title text-white">搜索</h1>
      <form className="mb-6 flex gap-2">
        <input
          name="q"
          defaultValue={keywords}
          placeholder="搜索标题"
          className="vh-input flex-1"
        />
        <button type="submit" className="vh-btn-primary !rounded-xl px-4">
          搜索
        </button>
      </form>
      {!keywords ? (
        <p className="text-white/45">输入关键词开始搜索</p>
      ) : list.length === 0 ? (
        <p className="text-white/45">没有匹配结果</p>
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
