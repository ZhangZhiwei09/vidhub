import path from 'node:path'
import { videoMappings } from '@vidhub/db/schema'
import { uploadMergeSchema } from '@vidhub/shared'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { fail, ok } from '@/lib/api'
import {
  ensureDir,
  extractExt,
  getVideoDir,
  mergeFileChunksSafe,
  publicUrl,
} from '@/lib/storage'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return fail('未登录', 401)

  try {
    const body = await req.json()
    const parsed = uploadMergeSchema.safeParse({
      hash: body.hash ?? body.HASH,
      fileName: body.fileName,
      size: body.size,
    })
    if (!parsed.success) return fail('参数无效')

    const { hash, fileName } = parsed.data
    const ext = extractExt(fileName)
    await ensureDir(getVideoDir())
    const filePath = path.join(getVideoDir(), `${hash}${ext}`)
    await mergeFileChunksSafe(filePath, hash)

    const url = publicUrl(`video/${hash}${ext}`)
    await db.insert(videoMappings).values({ hash, url }).onConflictDoNothing({
      target: videoMappings.hash,
    })

    return ok({ url })
  } catch (err) {
    console.error(err)
    return fail('合并失败', 500)
  }
}