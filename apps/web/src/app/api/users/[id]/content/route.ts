import { and, desc, eq } from 'drizzle-orm'
import { archives, users, videos } from '@vidhub/db/schema'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { fail, ok } from '@/lib/api'

type Params = { params: Promise<{ id: string }> }

export async function GET(req: Request, { params }: Params) {
  try {
    const id = Number((await params).id)
    if (!Number.isFinite(id)) return fail('无效用户')

    const { searchParams } = new URL(req.url)
    const tab = searchParams.get('tab') || 'works'
    const session = await auth()
    const isOwner = session?.user?.id && Number(session.user.id) === id

    if (tab === 'works') {
      const rows = await db
        .select({
          id: videos.id,
          title: videos.title,
          cover: videos.cover,
          clicks: videos.clicks,
          status: videos.status,
          createdAt: videos.createdAt,
          username: users.username,
        })
        .from(videos)
        .innerJoin(users, eq(videos.uid, users.id))
        .where(
          isOwner
            ? eq(videos.uid, id)
            : and(eq(videos.uid, id), eq(videos.status, 'approved')),
        )
        .orderBy(desc(videos.createdAt))
      return ok(rows)
    }

    if (tab === 'collect') {
      const rows = await db
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
        .where(and(eq(archives.uid, id), eq(archives.isCollect, true), eq(videos.status, 'approved')))
        .orderBy(desc(archives.updatedAt))
      return ok(rows)
    }

    return fail('未知 tab')
  } catch (err) {
    console.error(err)
    return fail('获取用户内容失败', 500)
  }
}