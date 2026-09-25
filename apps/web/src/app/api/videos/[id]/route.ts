import { and, eq, sql } from 'drizzle-orm'
import { users, videos } from '@vidhub/db/schema'
import { db } from '@/lib/db'
import { fail, ok } from '@/lib/api'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params
    const vid = Number(id)
    if (!Number.isFinite(vid)) return fail('无效视频 id')

    const [row] = await db
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
        partitionId: videos.partitionId,
        createdAt: videos.createdAt,
      })
      .from(videos)
      .innerJoin(users, eq(videos.uid, users.id))
      .where(and(eq(videos.id, vid), eq(videos.status, 'approved')))
      .limit(1)

    if (!row) return fail('视频不存在', 404)

    await db
      .update(videos)
      .set({ clicks: sql`${videos.clicks} + 1` })
      .where(eq(videos.id, vid))

    return ok({ ...row, clicks: row.clicks + 1 })
  } catch (err) {
    console.error(err)
    return fail('获取详情失败', 500)
  }
}