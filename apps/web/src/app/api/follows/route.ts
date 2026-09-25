import { and, eq } from 'drizzle-orm'
import { follows, users } from '@vidhub/db/schema'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { fail, ok } from '@/lib/api'
import { z } from 'zod'

const followSchema = z.object({
  followId: z.coerce.number().int().positive(),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return fail('未登录', 401)

  try {
    const body = await req.json()
    const parsed = followSchema.safeParse(body)
    if (!parsed.success) return fail('参数无效')

    const uid = Number(session.user.id)
    if (uid === parsed.data.followId) return fail('不能关注自己')

    const [exists] = await db
      .select()
      .from(follows)
      .where(and(eq(follows.uid, uid), eq(follows.followId, parsed.data.followId)))
      .limit(1)

    if (exists) {
      await db.delete(follows).where(eq(follows.id, exists.id))
      return ok({ following: false })
    }

    await db.insert(follows).values({ uid, followId: parsed.data.followId })
    return ok({ following: true })
  } catch (err) {
    console.error(err)
    return fail('关注操作失败', 500)
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const uid = Number(searchParams.get('uid'))
  const type = searchParams.get('type') || 'following'
  if (!Number.isFinite(uid)) return fail('无效用户')

  try {
    if (type === 'fans') {
      const rows = await db
        .select({
          id: users.id,
          username: users.username,
          avatar: users.avatar,
        })
        .from(follows)
        .innerJoin(users, eq(follows.uid, users.id))
        .where(eq(follows.followId, uid))
      return ok(rows)
    }

    const rows = await db
      .select({
        id: users.id,
        username: users.username,
        avatar: users.avatar,
      })
      .from(follows)
      .innerJoin(users, eq(follows.followId, users.id))
      .where(eq(follows.uid, uid))
    return ok(rows)
  } catch (err) {
    console.error(err)
    return fail('获取关注列表失败', 500)
  }
}