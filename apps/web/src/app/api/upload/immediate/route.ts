import { eq } from 'drizzle-orm'
import { videoMappings } from '@vidhub/db/schema'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { fail, ok } from '@/lib/api'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return fail('未登录', 401)

  try {
    const body = await req.json()
    const hash = String(body.hash ?? body.HASH ?? '')
    if (!hash) return fail('缺少 hash')

    const [row] = await db
      .select()
      .from(videoMappings)
      .where(eq(videoMappings.hash, hash))
      .limit(1)

    if (!row) return ok(null)
    return ok({ url: row.url })
  } catch (err) {
    console.error(err)
    return fail('秒传查询失败', 500)
  }
}