import { eq } from 'drizzle-orm'
import { lives, users } from '@vidhub/db/schema'
import { liveSwitchSchema, paginationSchema } from '@vidhub/shared'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { fail, ok, pageOk } from '@/lib/api'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const parsed = paginationSchema.safeParse({
      currentPage: searchParams.get('currentPage') ?? undefined,
      pageSize: searchParams.get('pageSize') ?? 8,
    })
    if (!parsed.success) return fail('分页参数无效')

    const rows = await db
      .select({
        id: lives.id,
        uid: lives.uid,
        title: lives.title,
        publicUrl: lives.publicUrl,
        playUrl: lives.playUrl,
        cover: lives.cover,
        status: lives.status,
        username: users.username,
        avatar: users.avatar,
      })
      .from(lives)
      .innerJoin(users, eq(lives.uid, users.id))
      .where(eq(lives.status, 1))

    return pageOk(parsed.data.currentPage, parsed.data.pageSize, rows)
  } catch (err) {
    console.error(err)
    return fail('获取直播列表失败', 500)
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return fail('未登录', 401)

  try {
    const uid = Number(session.user.id)
    const body = await req.json()
    const action = String(body.action ?? 'ensure')

    const rtmp = process.env.NEXT_PUBLIC_RTMP_URL || 'rtmp://localhost:1935/live'
    const playBase = process.env.NEXT_PUBLIC_MEDIA_HTTP_URL || 'http://localhost:8000'
    const publicUrl = rtmp
    const playUrl = `${playBase}/live/${uid}.flv`

    if (action === 'ensure') {
      const [existing] = await db.select().from(lives).where(eq(lives.uid, uid)).limit(1)
      if (existing) return ok(existing)
      const [created] = await db
        .insert(lives)
        .values({ uid, publicUrl, playUrl, title: '' })
        .returning()
      return ok(created)
    }

    if (action === 'switch') {
      const parsed = liveSwitchSchema.safeParse(body)
      if (!parsed.success) return fail('参数无效')
      const [existing] = await db.select().from(lives).where(eq(lives.uid, uid)).limit(1)
      if (!existing) {
        const [created] = await db
          .insert(lives)
          .values({
            uid,
            publicUrl,
            playUrl,
            title: parsed.data.title,
            status: parsed.data.status,
          })
          .returning()
        return ok(created)
      }
      const [updated] = await db
        .update(lives)
        .set({
          title: parsed.data.title,
          status: parsed.data.status,
          updatedAt: new Date(),
        })
        .where(eq(lives.uid, uid))
        .returning()
      return ok(updated)
    }

    return fail('未知操作')
  } catch (err) {
    console.error(err)
    return fail('直播操作失败', 500)
  }
}