import path from 'node:path'
import { createWriteStream, createReadStream, existsSync } from 'node:fs'
import { mkdir, readdir, rm, writeFile, unlink } from 'node:fs/promises'

export function getUploadRoot() {
  const raw = process.env.UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads')
  return path.resolve(raw)
}

export function getVideoDir() {
  return path.join(getUploadRoot(), 'video')
}

export function getCoverDir() {
  return path.join(getUploadRoot(), 'cover')
}

export function getChunkDir(hash: string) {
  return path.join(getVideoDir(), `chunkDir_${hash}`)
}

export function extractExt(fileName: string) {
  const i = fileName.lastIndexOf('.')
  return i >= 0 ? fileName.slice(i) : ''
}

export async function ensureDir(dir: string) {
  await mkdir(dir, { recursive: true })
}

export async function listUploadedChunks(hash: string) {
  const dir = getChunkDir(hash)
  if (!existsSync(dir)) return [] as string[]
  return readdir(dir)
}

/** Sequential concat merge — safe for large chunked uploads */
export async function mergeFileChunksSafe(filePath: string, hash: string) {
  const chunkDir = getChunkDir(hash)
  const fileList = await readdir(chunkDir)
  fileList.sort((a, b) => Number(a.split('-')[1]) - Number(b.split('-')[1]))

  await ensureDir(path.dirname(filePath))
  const writeStream = createWriteStream(filePath)
  for (const chunkName of fileList) {
    const chunkPath = path.join(chunkDir, chunkName)
    await new Promise<void>((resolve, reject) => {
      const readStream = createReadStream(chunkPath)
      readStream.on('error', reject)
      readStream.on('end', () => resolve())
      readStream.pipe(writeStream, { end: false })
    })
    await unlink(chunkPath)
  }
  await new Promise<void>((resolve, reject) => {
    writeStream.end(() => resolve())
    writeStream.on('error', reject)
  })
  await rm(chunkDir, { recursive: true, force: true })
}

export async function writeBase64File(dir: string, fileName: string, base64: string) {
  await ensureDir(dir)
  const cleaned = base64.replace(/^data:image\/\w+;base64,/, '')
  const buffer = Buffer.from(cleaned, 'base64')
  const fullPath = path.join(dir, fileName)
  await writeFile(fullPath, buffer)
  return fullPath
}

export function publicUrl(relativeUnderUploads: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${base}/uploads/${relativeUnderUploads.replace(/^\/+/, '')}`
}