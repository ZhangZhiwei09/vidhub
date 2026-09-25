import { notFound } from 'next/navigation'
import { and, eq, sql } from 'drizzle-orm'
import { users, videos } from '@vidhub/db/schema'
import { db } from '@/lib/db'
import { ArchiveActions } from '@/components/archive-actions'
import { CommentSection } from '@/components/comment-section'
import { VideoPlayerWithDanmaku } from '@/components/video-player-danmaku'
import { FollowButton } from '@/components/follow-button'

type Props = { params: Promise<{ id: string }> }

export default async function VideoDetailPage({ params }: Props) {
  const { id } = await params
  const vid = Number(id)
  if (!Number.isFinite(vid)) notFound()

  let row
  try {
    ;[row] = await db
      .select({
        id: videos.id,
        title: videos.title,
        cover: videos.cover,
        url: videos.url,
        description: videos.description,
        uid: videos.uid,
        username: users.username,
        avatar: users.avatar,
        sign: users.sign,
        clicks: videos.clicks,
        createdAt: videos.createdAt,
      })
      .from(videos)
      .innerJoin(users, eq(videos.uid, users.id))
      .where(and(eq(videos.id, vid), eq(videos.status, 'approved')))
      .limit(1)

    if (row) {
      await db
        .update(videos)
        .set({ clicks: sql`${videos.clicks} + 1` })
        .where(eq(videos.id, vid))
    }
  } catch {
    notFound()
  }

  if (!row) notFound()

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_280px]">
      <section>
        <VideoPlayerWithDanmaku
          vid={row.id}
          src={row.url}
          poster={row.cover || undefined}
        />
        <h1 className="mt-4 text-2xl font-semibold text-zinc-900">{row.title}</h1>
        <p className="mt-2 text-sm text-zinc-500">
          {row.username} · {(row.clicks ?? 0) + 1} 播放 ·{' '}
          {row.createdAt instanceof Date ? row.createdAt.toLocaleString() : String(row.createdAt)}
        </p>
        <ArchiveActions vid={row.id} />
        <p className="mt-4 whitespace-pre-wrap text-zinc-700">{row.description}</p>
        <CommentSection vid={row.id} />
      </section>
      <aside className="h-fit rounded-xl bg-white p-4 ring-1 ring-zinc-200">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={row.avatar || '/next.svg'}
            alt=""
            className="h-12 w-12 rounded-full bg-zinc-100 object-cover"
          />
          <div>
            <p className="font-medium text-zinc-900">{row.username}</p>
            <p className="text-sm text-zinc-500">{row.sign || '这个人很懒，什么都没写'}</p>
          </div>
        </div>
        <div className="mt-4">
          <FollowButton followId={row.uid} />
        </div>
      </aside>
    </main>
  )
}