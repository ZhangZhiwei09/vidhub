import { notFound } from 'next/navigation'
import { and, eq, sql } from 'drizzle-orm'
import { users, videos } from '@vidhub/db/schema'
import { db } from '@/lib/db'

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
        <div className="overflow-hidden rounded-xl bg-black">
          <video
            key={row.url}
            src={row.url}
            controls
            poster={row.cover || undefined}
            className="aspect-video w-full"
          />
        </div>
        <h1 className="mt-4 text-2xl font-semibold text-zinc-900">{row.title}</h1>
        <p className="mt-2 text-sm text-zinc-500">
          {row.username} · {(row.clicks ?? 0) + 1} 播放 · {row.createdAt?.toLocaleString?.() ?? ''}
        </p>
        <p className="mt-4 whitespace-pre-wrap text-zinc-700">{row.description}</p>
      </section>
      <aside className="rounded-xl bg-white p-4 ring-1 ring-zinc-200">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={row.avatar || '/next.svg'}
            alt=""
            className="h-12 w-12 rounded-full object-cover bg-zinc-100"
          />
          <div>
            <p className="font-medium text-zinc-900">{row.username}</p>
            <p className="text-sm text-zinc-500">{row.sign || '这个人很懒，什么都没写'}</p>
          </div>
        </div>
      </aside>
    </main>
  )
}