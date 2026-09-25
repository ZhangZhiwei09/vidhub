import { and, eq } from 'drizzle-orm'
import { archives } from '@vidhub/db/schema'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { fail, ok } from '@/lib/api'

type Params = { params: Promise<{ vid: string }> }

export async function GET(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return ok({ isLike: false, isCollect: false })
  }

  try {
    const vid = Number((await params).vid)
    if (!Number.isFinite(vid)) return fail('无效视频 id')

    const [row] = await db
      .select({
        isLike: archives.isLike,
        isCollect: archives.isCollect,
      })
      .from(archives)
      .where(and(eq(archives.uid, Number(session.user.id)), eq(archives.vid, vid)))
      .limit(1)

    return ok(row ?? { isLike: false, isCollect: false })
  } catch (err) {
    console.error(err)
    return fail('获取状态失败', 500)
  }
}