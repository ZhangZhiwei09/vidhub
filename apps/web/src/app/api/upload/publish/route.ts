import { eq } from 'drizzle-orm'
import { videoMappings, videos } from '@vidhub/db/schema'
import { publishVideoSchema } from '@vidhub/shared'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { fail, ok } from '@/lib/api'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return fail('未登录', 401)

  try {
    const body = await req.json()
    const parsed = publishVideoSchema.safeParse({
      hash: body.hash ?? body.HASH,
      title: body.title,
      cover: body.cover,
      description: body.description ?? '',
      partitionId: body.partitionId ?? body.partition_id ?? 0,
    })
    if (!parsed.success) return fail('参数无效')

    const { hash, title, cover, description, partitionId } = parsed.data
    const [mapped] = await db
      .select()
      .from(videoMappings)
      .where(eq(videoMappings.hash, hash))
      .limit(1)

    if (!mapped) return fail('请先完成视频上传合并')

    const [created] = await db
      .insert(videos)
      .values({
        title,
        cover,
        description,
        uid: Number(session.user.id),
        url: mapped.url,
        partitionId,
        status: 'pending',
      })
      .returning({ id: videos.id })

    return ok({ id: created?.id })
  } catch (err) {
    console.error(err)
    return fail('发布失败', 500)
  }
}