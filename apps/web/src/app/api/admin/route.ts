import { count, desc, eq, sql } from 'drizzle-orm'
import { comments, danmakus, users, videos } from '@vidhub/db/schema'
import { adminVideoStatusSchema, paginationSchema } from '@vidhub/shared'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { fail, ok, pageOk } from '@/lib/api'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'admin') return null
  return session
}

export async function GET(req: Request) {
  if (!(await requireAdmin())) return fail('无权限', 403)

  try {
    const { searchParams } = new URL(req.url)
    const resource = searchParams.get('resource') || 'dashboard'

    if (resource === 'dashboard') {
      const [[videoTotal], [userTotal], [clickSum], [commentTotal], [danmakuTotal]] =
        await Promise.all([
          db.select({ value: count() }).from(videos),
          db.select({ value: count() }).from(users),
          db.select({ value: sql<number>`coalesce(sum(${videos.clicks}), 0)` }).from(videos),
          db.select({ value: count() }).from(comments),
          db.select({ value: count() }).from(danmakus),
        ])

      return ok([
        { title: '视频数量', total: videoTotal?.value ?? 0 },
        { title: '用户数量', total: userTotal?.value ?? 0 },
        { title: '播放量', total: Number(clickSum?.value ?? 0) },
        { title: '评论数', total: commentTotal?.value ?? 0 },
        { title: '弹幕数', total: danmakuTotal?.value ?? 0 },
      ])
    }

    const parsed = paginationSchema.safeParse({
      currentPage: searchParams.get('currentPage') ?? undefined,
      pageSize: searchParams.get('pageSize') ?? undefined,
    })
    if (!parsed.success) return fail('分页无效')

    if (resource === 'videos') {
      const status = searchParams.get('status') as 'pending' | 'approved' | 'rejected' | null
      const rows = status
        ? await db.select().from(videos).where(eq(videos.status, status)).orderBy(desc(videos.createdAt))
        : await db.select().from(videos).orderBy(desc(videos.createdAt))
      return pageOk(parsed.data.currentPage, parsed.data.pageSize, rows)
    }

    if (resource === 'users') {
      const rows = await db.select().from(users).orderBy(desc(users.createdAt))
      return pageOk(parsed.data.currentPage, parsed.data.pageSize, rows)
    }

    if (resource === 'comments') {
      const rows = await db.select().from(comments).orderBy(desc(comments.createdAt))
      return pageOk(parsed.data.currentPage, parsed.data.pageSize, rows)
    }

    if (resource === 'danmakus') {
      const rows = await db.select().from(danmakus).orderBy(desc(danmakus.createdAt))
      return pageOk(parsed.data.currentPage, parsed.data.pageSize, rows)
    }

    return fail('未知资源')
  } catch (err) {
    console.error(err)
    return fail('管理接口失败', 500)
  }
}

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) return fail('无权限', 403)

  try {
    const body = await req.json()
    const action = String(body.action ?? '')

    if (action === 'video-status') {
      const parsed = adminVideoStatusSchema.safeParse(body)
      if (!parsed.success) return fail('参数无效')
      await db
        .update(videos)
        .set({ status: parsed.data.status, updatedAt: new Date() })
        .where(eq(videos.id, parsed.data.id))
      return ok()
    }

    if (action === 'delete-video') {
      const id = Number(body.id)
      if (!Number.isFinite(id)) return fail('无效 id')
      await db.delete(videos).where(eq(videos.id, id))
      return ok()
    }

    if (action === 'delete-comment') {
      const id = Number(body.id)
      if (!Number.isFinite(id)) return fail('无效 id')
      await db.delete(comments).where(eq(comments.id, id))
      return ok()
    }

    if (action === 'delete-danmaku') {
      const id = Number(body.id)
      if (!Number.isFinite(id)) return fail('无效 id')
      await db.delete(danmakus).where(eq(danmakus.id, id))
      return ok()
    }

    return fail('未知操作')
  } catch (err) {
    console.error(err)
    return fail('管理操作失败', 500)
  }
}