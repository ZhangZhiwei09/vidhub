import { and, desc, eq, sql } from 'drizzle-orm'
import { users, videos } from '@vidhub/db/schema'
import { paginationSchema } from '@vidhub/shared'
import { db } from '@/lib/db'
import { fail, ok, pageOk } from '@/lib/api'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const parsed = paginationSchema.safeParse({
      currentPage: searchParams.get('currentPage') ?? undefined,
      pageSize: searchParams.get('pageSize') ?? undefined,
    })
    if (!parsed.success) return fail('分页参数无效')

    const partitionId = Number(searchParams.get('partitionId') ?? 0)
    const conditions = [eq(videos.status, 'approved')]
    if (partitionId !== 0) {
      conditions.push(eq(videos.partitionId, partitionId))
    }

    const rows = await db
      .select({
        id: videos.id,
        title: videos.title,
        cover: videos.cover,
        url: videos.url,
        description: videos.description,
        uid: videos.uid,
        username: users.username,
        avatar: users.avatar,
        clicks: videos.clicks,
        partitionId: videos.partitionId,
        createdAt: videos.createdAt,
        commentCount: sql<number>`0`,
      })
      .from(videos)
      .innerJoin(users, eq(videos.uid, users.id))
      .where(and(...conditions))
      .orderBy(desc(videos.createdAt))

    return pageOk(parsed.data.currentPage, parsed.data.pageSize, rows)
  } catch (err) {
    console.error(err)
    return fail('获取视频列表失败', 500)
  }
}