import { and, count, desc, eq } from 'drizzle-orm'
import { notifications } from '@vidhub/db/schema'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { fail, ok, pageOk } from '@/lib/api'
import { paginationSchema } from '@vidhub/shared'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return fail('未登录', 401)
  const uid = Number(session.user.id)

  try {
    const { searchParams } = new URL(req.url)
    if (searchParams.get('unreadCount') === '1') {
      const [row] = await db
        .select({ value: count() })
        .from(notifications)
        .where(and(eq(notifications.toId, uid), eq(notifications.readStatus, false)))
      return ok({ unread: row?.value ?? 0 })
    }

    const parsed = paginationSchema.safeParse({
      currentPage: searchParams.get('currentPage') ?? undefined,
      pageSize: searchParams.get('pageSize') ?? 20,
    })
    if (!parsed.success) return fail('分页无效')

    const rows = await db
      .select()
      .from(notifications)
      .where(eq(notifications.toId, uid))
      .orderBy(desc(notifications.createdAt))

    return pageOk(parsed.data.currentPage, parsed.data.pageSize, rows)
  } catch (err) {
    console.error(err)
    return fail('获取通知失败', 500)
  }
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return fail('未登录', 401)
  const uid = Number(session.user.id)

  try {
    const body = await req.json()
    if (body.action === 'read-all') {
      await db
        .update(notifications)
        .set({ readStatus: true })
        .where(eq(notifications.toId, uid))
      return ok()
    }
    const id = Number(body.id)
    if (!Number.isFinite(id)) return fail('无效 id')
    await db
      .update(notifications)
      .set({ readStatus: true })
      .where(and(eq(notifications.id, id), eq(notifications.toId, uid)))
    return ok()
  } catch (err) {
    console.error(err)
    return fail('标记已读失败', 500)
  }
}