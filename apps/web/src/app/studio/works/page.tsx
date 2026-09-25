import { desc, eq } from 'drizzle-orm'
import { users, videos } from '@vidhub/db/schema'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { StudioShell } from '../_shell'
import { VideoCard } from '@/components/video-card'

export default async function StudioWorksPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?callbackUrl=/studio/works')
  const uid = Number(session.user.id)

  const list = await db
    .select({
      id: videos.id,
      title: videos.title,
      cover: videos.cover,
      clicks: videos.clicks,
      status: videos.status,
      username: users.username,
    })
    .from(videos)
    .innerJoin(users, eq(videos.uid, users.id))
    .where(eq(videos.uid, uid))
    .orderBy(desc(videos.createdAt))

  return (
    <StudioShell tab="works">
      {list.length === 0 ? (
        <p className="text-sm text-zinc-500">还没有作品，去投稿吧。</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((v) => (
            <div key={v.id} className="space-y-1">
              <VideoCard video={v} />
              <p className="text-xs text-zinc-500">状态：{v.status}</p>
            </div>
          ))}
        </div>
      )}
    </StudioShell>
  )
}