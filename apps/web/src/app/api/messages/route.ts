import { and, desc, eq, or } from 'drizzle-orm'
import { chats, users } from '@vidhub/db/schema'
import { chatSendSchema } from '@vidhub/shared'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { fail, ok } from '@/lib/api'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return fail('未登录', 401)

  try {
    const uid = Number(session.user.id)
    const rows = await db
      .select({
        id: chats.id,
        fromId: chats.fromId,
        toId: chats.toId,
        content: chats.content,
        readStatus: chats.readStatus,
        createdAt: chats.createdAt,
      })
      .from(chats)
      .where(or(eq(chats.fromId, uid), eq(chats.toId, uid)))
      .orderBy(desc(chats.createdAt))
      .limit(200)

    const peerMap = new Map<
      number,
      {
        receiver: number
        content: string
        createdAt: Date
        fromId: number
        readStatus: boolean
        id: number
      }
    >()

    for (const row of rows) {
      const receiver = row.fromId === uid ? row.toId : row.fromId
      if (!peerMap.has(receiver)) {
        peerMap.set(receiver, {
          id: row.id,
          receiver,
          content: row.content,
          createdAt: row.createdAt,
          fromId: row.fromId,
          readStatus: row.readStatus,
        })
      }
    }

    const peers = [...peerMap.values()]
    const result = []
    for (const peer of peers) {
      const [user] = await db
        .select({ username: users.username, avatar: users.avatar })
        .from(users)
        .where(eq(users.id, peer.receiver))
        .limit(1)
      result.push({ ...peer, username: user?.username, avatar: user?.avatar })
    }

    return ok(result)
  } catch (err) {
    console.error(err)
    return fail('获取会话失败', 500)
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return fail('未登录', 401)

  try {
    const body = await req.json()
    const parsed = chatSendSchema.safeParse(body)
    if (!parsed.success) return fail('参数无效')

    const fromId = Number(session.user.id)
    const [row] = await db
      .insert(chats)
      .values({
        fromId,
        toId: parsed.data.toId,
        content: parsed.data.content,
      })
      .returning()

    return ok(row)
  } catch (err) {
    console.error(err)
    return fail('发送失败', 500)
  }
}