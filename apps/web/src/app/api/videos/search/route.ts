import { and, desc, eq, like } from 'drizzle-orm'
import { users, videos } from '@vidhub/db/schema'
import { paginationSchema } from '@vidhub/shared'
import { db } from '@/lib/db'
import { fail, pageOk } from '@/lib/api'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const keywords = searchParams.get('keywords')?.trim() ?? ''
    const parsed = paginationSchema.safeParse({
      currentPage: searchParams.get('currentPage') ?? undefined,
      pageSize: searchParams.get('pageSize') ?? 6,
    })
    if (!parsed.success) return fail('分页参数无效')
    if (!keywords) return pageOk(parsed.data.currentPage, parsed.data.pageSize, [])

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
      })
      .from(videos)
      .innerJoin(users, eq(videos.uid, users.id))
      .where(and(eq(videos.status, 'approved'), like(videos.title, `%${keywords}%`)))
      .orderBy(desc(videos.createdAt))

    return pageOk(parsed.data.currentPage, parsed.data.pageSize, rows)
  } catch (err) {
    console.error(err)
    return fail('搜索失败', 500)
  }
}