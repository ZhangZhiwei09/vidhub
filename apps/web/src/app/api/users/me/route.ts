import { eq } from 'drizzle-orm'
import { users } from '@vidhub/db/schema'
import { updateProfileSchema } from '@vidhub/shared'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { fail, ok } from '@/lib/api'
import { extractExt, getUploadRoot, publicUrl, writeBase64File } from '@/lib/storage'
import path from 'node:path'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return fail('未登录', 401)

  try {
    const [user] = await db
      .select({
        id: users.id,
        account: users.account,
        username: users.username,
        avatar: users.avatar,
        sign: users.sign,
        sex: users.sex,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, Number(session.user.id)))
      .limit(1)

    if (!user) return fail('用户不存在', 404)
    return ok(user)
  } catch (err) {
    console.error(err)
    return fail('获取资料失败', 500)
  }
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return fail('未登录', 401)

  try {
    const body = await req.json()
    const action = String(body.action ?? 'profile')

    if (action === 'avatar') {
      const base64 = String(body.BASE64 ?? body.base64 ?? '')
      const coverName = String(body.coverName ?? 'avatar.jpg')
      if (!base64) return fail('缺少头像数据')
      const dir = path.join(getUploadRoot(), 'avatar')
      const fileName = `${Date.now()}${Math.floor(Math.random() * 999)}${extractExt(coverName)}`
      await writeBase64File(dir, fileName, base64)
      const url = publicUrl(`avatar/${fileName}`)
      await db
        .update(users)
        .set({ avatar: url, updatedAt: new Date() })
        .where(eq(users.id, Number(session.user.id)))
      return ok({ avatar: url })
    }

    const parsed = updateProfileSchema.safeParse(body)
    if (!parsed.success) return fail('参数无效')

    await db
      .update(users)
      .set({
        username: parsed.data.username,
        sign: parsed.data.sign,
        sex: parsed.data.sex,
        updatedAt: new Date(),
      })
      .where(eq(users.id, Number(session.user.id)))

    return ok()
  } catch (err) {
    console.error(err)
    return fail('更新资料失败', 500)
  }
}