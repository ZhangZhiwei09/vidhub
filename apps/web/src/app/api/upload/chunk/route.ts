import path from 'node:path'
import { existsSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { auth } from '@/auth'
import { fail, ok } from '@/lib/api'
import { ensureDir, extractExt, getChunkDir, getVideoDir } from '@/lib/storage'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return fail('未登录', 401)

  try {
    const form = await req.formData()
    const file = form.get('file')
    const hash = String(form.get('hash') ?? '')
    const HASH = String(form.get('HASH') ?? form.get('fileHash') ?? '')
    const fileName = String(form.get('fileName') ?? 'video.mp4')

    if (!(file instanceof File) || !HASH || !hash) {
      return fail('缺少切片或 hash')
    }

    const ext = extractExt(fileName)
    const finalPath = path.join(getVideoDir(), `${HASH}${ext}`)
    if (existsSync(finalPath)) {
      return ok({ status: 'file exist' })
    }

    const chunkDir = getChunkDir(HASH)
    const chunkPath = path.join(chunkDir, hash)
    if (existsSync(chunkPath)) {
      return ok({ status: 'chunk exist' })
    }

    await ensureDir(chunkDir)
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(chunkPath, buffer)
    return ok({ status: 'received file chunk' })
  } catch (err) {
    console.error(err)
    return fail('上传切片失败', 500)
  }
}