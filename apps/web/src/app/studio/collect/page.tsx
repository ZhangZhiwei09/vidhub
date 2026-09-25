import { and, desc, eq } from 'drizzle-orm'
import { archives, users, videos } from '@vidhub/db/schema'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { StudioShell } from '../_shell'
import { VideoCard } from '@/components/video-card'

export default async function StudioCollectPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?callbackUrl=/studio/collect')
  const uid = Number(session.user.id)

  const list = await db
    .select({
      id: videos.id,
      title: videos.title,
      cover: videos.cover,
      clicks: videos.clicks,
      username: users.username,
    })
    .from(archives)
    .innerJoin(videos, eq(archives.vid, videos.id))
    .innerJoin(users, eq(videos.uid, users.id))
    .where(and(eq(archives.uid, uid), eq(archives.isCollect, true), eq(videos.status, 'approved')))
    .orderBy(desc(archives.updatedAt))

  return (
    <StudioShell tab="collect">
      {list.length === 0 ? (
        <p className="text-sm text-zinc-500">暂无收藏</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      )}
    </StudioShell>
  )
}