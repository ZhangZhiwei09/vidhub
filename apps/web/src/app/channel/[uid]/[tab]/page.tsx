import { and, desc, eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { archives, follows, users, videos } from '@vidhub/db/schema'
import { db } from '@/lib/db'
import { ProfileHeader, ProfileTabs } from '@/components/profile-header'
import { VideoCard } from '@/components/video-card'
import { UserList } from '@/components/user-list'
import { FollowButton } from '@/components/follow-button'
import { auth } from '@/auth'
import Link from 'next/link'

type Props = {
  params: Promise<{ uid: string; tab?: string }>
}

async function loadUser(uid: number) {
  const [user] = await db
    .select({
      id: users.id,
      username: users.username,
      avatar: users.avatar,
      sign: users.sign,
    })
    .from(users)
    .where(eq(users.id, uid))
    .limit(1)
  if (!user) return null
  const followingCount = (await db.select().from(follows).where(eq(follows.uid, uid))).length
  const fansCount = (await db.select().from(follows).where(eq(follows.followId, uid))).length
  return { ...user, followingCount, fansCount }
}

export default async function ChannelTabPage({ params }: Props) {
  const resolved = await params
  const uid = Number(resolved.uid)
  const tab = resolved.tab || 'works'
  if (!Number.isFinite(uid)) notFound()

  const profile = await loadUser(uid)
  if (!profile) notFound()

  const session = await auth()
  const isSelf = session?.user?.id && Number(session.user.id) === uid

  let body: React.ReactNode = null
  if (tab === 'works') {
    const list = await db
      .select({
        id: videos.id,
        title: videos.title,
        cover: videos.cover,
        clicks: videos.clicks,
        username: users.username,
      })
      .from(videos)
      .innerJoin(users, eq(videos.uid, users.id))
      .where(and(eq(videos.uid, uid), eq(videos.status, 'approved')))
      .orderBy(desc(videos.createdAt))
    body =
      list.length === 0 ? (
        <p className="text-sm text-zinc-500">暂无公开作品</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      )
  } else if (tab === 'collect') {
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
    body =
      list.length === 0 ? (
        <p className="text-sm text-zinc-500">暂无收藏</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      )
  } else if (tab === 'following') {
    const list = await db
      .select({ id: users.id, username: users.username, avatar: users.avatar })
      .from(follows)
      .innerJoin(users, eq(follows.followId, users.id))
      .where(eq(follows.uid, uid))
    body = <UserList users={list} />
  } else if (tab === 'fans') {
    const list = await db
      .select({ id: users.id, username: users.username, avatar: users.avatar })
      .from(follows)
      .innerJoin(users, eq(follows.uid, users.id))
      .where(eq(follows.followId, uid))
    body = <UserList users={list} />
  } else {
    notFound()
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <ProfileHeader
        user={profile}
        actions={
          isSelf ? (
            <Link href="/studio/works" className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm">
              管理空间
            </Link>
          ) : (
            <div className="flex gap-2">
              <FollowButton followId={uid} />
              <Link
                href={`/message/${uid}`}
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm"
              >
                私信
              </Link>
            </div>
          )
        }
      />
      <ProfileTabs basePath={`/channel/${uid}`} active={tab} />
      {body}
    </main>
  )
}