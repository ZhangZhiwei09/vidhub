import { and, eq } from 'drizzle-orm'
import { archives } from '@vidhub/db/schema'
import { archiveToggleSchema } from '@vidhub/shared'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { fail, ok } from '@/lib/api'

async function upsertArchive(
  uid: number,
  vid: number,
  patch: Partial<{ isLike: boolean; isCollect: boolean }>,
) {
  const [existing] = await db
    .select()
    .from(archives)
    .where(and(eq(archives.uid, uid), eq(archives.vid, vid)))
    .limit(1)

  if (existing) {
    await db
      .update(archives)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(archives.id, existing.id))
  } else {
    await db.insert(archives).values({
      uid,
      vid,
      isLike: patch.isLike ?? false,
      isCollect: patch.isCollect ?? false,
    })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return fail('未登录', 401)

  try {
    const body = await req.json()
    const action = String(body.action ?? '')
    const parsed = archiveToggleSchema.safeParse({ vid: body.vid, value: body.value })
    if (!parsed.success) return fail('参数无效')

    const uid = Number(session.user.id)
    if (action === 'like') {
      await upsertArchive(uid, parsed.data.vid, { isLike: parsed.data.value })
    } else if (action === 'collect') {
      await upsertArchive(uid, parsed.data.vid, { isCollect: parsed.data.value })
    } else {
      return fail('未知操作')
    }

    return ok()
  } catch (err) {
    console.error(err)
    return fail('操作失败', 500)
  }
}