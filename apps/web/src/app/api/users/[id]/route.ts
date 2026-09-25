import { and, eq } from 'drizzle-orm'
import { follows, users } from '@vidhub/db/schema'
import { db } from '@/lib/db'
import { fail, ok } from '@/lib/api'
import { auth } from '@/auth'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  try {
    const id = Number((await params).id)
    if (!Number.isFinite(id)) return fail('无效用户')

    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        avatar: users.avatar,
        sign: users.sign,
        sex: users.sex,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1)

    if (!user) return fail('用户不存在', 404)

    const followingCount = (await db.select().from(follows).where(eq(follows.uid, id))).length
    const fansCount = (await db.select().from(follows).where(eq(follows.followId, id))).length

    const session = await auth()
    let isFollowing = false
    if (session?.user?.id && Number(session.user.id) !== id) {
      const [row] = await db
        .select()
        .from(follows)
        .where(and(eq(follows.uid, Number(session.user.id)), eq(follows.followId, id)))
        .limit(1)
      isFollowing = !!row
    }

    return ok({ ...user, followingCount, fansCount, isFollowing })
  } catch (err) {
    console.error(err)
    return fail('获取用户失败', 500)
  }
}