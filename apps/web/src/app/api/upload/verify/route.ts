import path from 'node:path'
import { existsSync } from 'node:fs'
import { uploadVerifySchema } from '@vidhub/shared'
import { auth } from '@/auth'
import { fail, ok } from '@/lib/api'
import { extractExt, getVideoDir, listUploadedChunks } from '@/lib/storage'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return fail('未登录', 401)

  try {
    const body = await req.json()
    const parsed = uploadVerifySchema.safeParse({
      hash: body.hash ?? body.HASH,
      fileName: body.fileName,
    })
    if (!parsed.success) return fail('参数无效')

    const { hash, fileName } = parsed.data
    const ext = extractExt(fileName)
    const filePath = path.join(getVideoDir(), `${hash}${ext}`)

    if (existsSync(filePath)) {
      return ok({ shouldUpload: false })
    }

    return ok({
      shouldUpload: true,
      uploadedList: await listUploadedChunks(hash),
    })
  } catch (err) {
    console.error(err)
    return fail('校验失败', 500)
  }
}