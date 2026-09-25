import { auth } from '@/auth'
import { fail, ok } from '@/lib/api'
import { extractExt, getCoverDir, publicUrl, writeBase64File } from '@/lib/storage'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return fail('未登录', 401)

  try {
    const body = await req.json()
    const base64 = String(body.BASE64 ?? body.base64 ?? '')
    const coverName = String(body.coverName ?? 'cover.jpg')
    if (!base64) return fail('缺少封面数据')

    const fileName = `${Date.now()}${Math.floor(Math.random() * 999)}${extractExt(coverName)}`
    await writeBase64File(getCoverDir(), fileName, base64)
    return ok({ cover: publicUrl(`cover/${fileName}`) })
  } catch (err) {
    console.error(err)
    return fail('封面上传失败', 500)
  }
}