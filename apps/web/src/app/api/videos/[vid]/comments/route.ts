import { and, asc, eq } from 'drizzle-orm'
import { comments, users } from '@vidhub/db/schema'
import { paginationSchema } from '@vidhub/shared'
import { db } from '@/lib/db'
import { fail, ok, pageOk } from '@/lib/api'

type Params = { params: Promise<{ vid: string }> }

export async function GET(req: Request, { params }: Params) {
  try {
    const { vid: vidRaw } = await params
    const vid = Number(vidRaw)
    if (!Number.isFinite(vid)) return fail('无效视频 id')

    const { searchParams } = new URL(req.url)
    const parsed = paginationSchema.safeParse({
      currentPage: searchParams.get('currentPage') ?? undefined,
      pageSize: searchParams.get('pageSize') ?? undefined,
    })
    if (!parsed.success) return fail('分页参数无效')

    const rows = await db
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
      .where(eq(comments.vid, vid))
      .orderBy(asc(comments.createdAt))

    type Row = (typeof rows)[number] & { children: Row[]; childrenCount: number }
    const map = new Map<number, Row>()
    const roots: Row[] = []
    for (const row of rows) {
      map.set(row.id, { ...row, children: [], childrenCount: 0 })
    }
    for (const row of rows) {
      const node = map.get(row.id)!
      if (row.replyId == null) {
        roots.push(node)
      } else {
        const parent = map.get(row.replyId)
        if (parent) {
          parent.children.push(node)
          parent.childrenCount = parent.children.length
        } else {
          roots.push(node)
        }
      }
    }

    for (const root of roots) {
      root.childrenCount = root.children.length
      root.children = root.children.slice(0, 3)
    }

    return pageOk(parsed.data.currentPage, parsed.data.pageSize, roots)
  } catch (err) {
    console.error(err)
    return fail('获取评论失败', 500)
  }
}