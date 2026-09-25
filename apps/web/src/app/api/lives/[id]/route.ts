import { eq } from 'drizzle-orm'
import { lives, users } from '@vidhub/db/schema'
import { db } from '@/lib/db'
import { fail, ok } from '@/lib/api'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  try {
    const id = Number((await params).id)
    if (!Number.isFinite(id)) return fail('无效直播间')

    const [row] = await db
      .select({
        id: lives.id,
        uid: lives.uid,
        title: lives.title,
        playUrl: lives.playUrl,
        cover: lives.cover,
        status: lives.status,
        username: users.username,
        avatar: users.avatar,
      })
      .from(lives)
      .innerJoin(users, eq(lives.uid, users.id))
      .where(eq(lives.id, id))
      .limit(1)

    if (!row) return fail('直播间不存在', 404)
    return ok(row)
  } catch (err) {
    console.error(err)
    return fail('获取直播详情失败', 500)
  }
}