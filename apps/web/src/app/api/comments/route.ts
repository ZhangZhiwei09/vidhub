import { eq } from 'drizzle-orm'
import { comments, users, videos } from '@vidhub/db/schema'
import { commentCreateSchema } from '@vidhub/shared'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { fail, ok } from '@/lib/api'
import { createNotification } from '@/lib/notify'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return fail('未登录', 401)

  try {
    const body = await req.json()
    const parsed = commentCreateSchema.safeParse({
      vid: body.vid,
      content: body.content,
      replyId: body.replyId ?? body.reply_id ?? null,
      target: body.target ?? null,
    })
    if (!parsed.success) return fail('参数无效')

    const uid = Number(session.user.id)
    const [created] = await db
      .insert(comments)
      .values({
        vid: parsed.data.vid,
        content: parsed.data.content,
        uid,
        replyId: parsed.data.replyId ?? null,
        target: parsed.data.target ?? null,
      })
      .returning({ id: comments.id })

    if (!created) return fail('评论失败')

    const [row] = await db
      .select({
        id: comments.id,
        vid: comments.vid,
        content: comments.content,
        uid: comments.uid,
        replyId: comments.replyId,
        target: comments.target,
        createdAt: comments.createdAt,
        username: users.username,
        avatar: users.avatar,
      })
      .from(comments)
      .innerJoin(users, eq(comments.uid, users.id))
      .where(eq(comments.id, created.id))
      .limit(1)

    const [video] = await db
      .select({ uid: videos.uid, title: videos.title })
      .from(videos)
      .where(eq(videos.id, parsed.data.vid))
      .limit(1)

    const notifyTo = parsed.data.target ?? video?.uid
    if (notifyTo) {
      await createNotification({
        toId: notifyTo,
        fromId: uid,
        type: 'comment',
        content: `${row?.username ?? '有人'} 评论了「${video?.title ?? '视频'}」: ${parsed.data.content.slice(0, 80)}`,
      })
    }

    return ok(row)
  } catch (err) {
    console.error(err)
    return fail('评论失败', 500)
  }
}