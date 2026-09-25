import { asc, eq } from 'drizzle-orm'
import { danmakus } from '@vidhub/db/schema'
import { danmakuCreateSchema } from '@vidhub/shared'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { fail, ok } from '@/lib/api'

type Params = { params: Promise<{ vid: string }> }

export async function GET(_req: Request, { params }: Params) {
  try {
    const vid = Number((await params).vid)
    if (!Number.isFinite(vid)) return fail('无效视频 id')

    const rows = await db
      .select()
      .from(danmakus)
      .where(eq(danmakus.vid, vid))
      .orderBy(asc(danmakus.time))

    return ok(rows)
  } catch (err) {
    console.error(err)
    return fail('获取弹幕失败', 500)
  }
}

export async function POST(req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return fail('未登录', 401)

  try {
    const vid = Number((await params).vid)
    const body = await req.json()
    const parsed = danmakuCreateSchema.safeParse({ ...body, vid })
    if (!parsed.success) return fail('参数无效')

    const [row] = await db
      .insert(danmakus)
      .values({
        vid: parsed.data.vid,
        uid: Number(session.user.id),
        color: parsed.data.color,
        text: parsed.data.text,
        time: parsed.data.time,
        type: parsed.data.type,
      })
      .returning()

    return ok(row)
  } catch (err) {
    console.error(err)
    return fail('发送弹幕失败', 500)
  }
}