import { and, asc, eq, or } from 'drizzle-orm'
import { chats, users } from '@vidhub/db/schema'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { fail, ok } from '@/lib/api'

type Params = { params: Promise<{ peerId: string }> }

export async function GET(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return fail('未登录', 401)

  try {
    const peerId = Number((await params).peerId)
    const uid = Number(session.user.id)
    if (!Number.isFinite(peerId)) return fail('无效用户')

    const rows = await db
      .select({
        id: chats.id,
        fromId: chats.fromId,
        toId: chats.toId,
        content: chats.content,
        createdAt: chats.createdAt,
        fromUsername: users.username,
        fromAvatar: users.avatar,
      })
      .from(chats)
      .leftJoin(users, eq(users.id, chats.fromId))
      .where(
        or(
          and(eq(chats.fromId, uid), eq(chats.toId, peerId)),
          and(eq(chats.fromId, peerId), eq(chats.toId, uid)),
        ),
      )
      .orderBy(asc(chats.createdAt))

    await db
      .update(chats)
      .set({ readStatus: true })
      .where(and(eq(chats.fromId, peerId), eq(chats.toId, uid)))

    return ok(rows)
  } catch (err) {
    console.error(err)
    return fail('获取聊天记录失败', 500)
  }
}