export type HashImplementation = 'wasm' | 'webcrypto'

export type HashProgress = {
  processed: number
  total: number
  ratio: number
}

export type HashFileOptions = {
  chunkSize?: number
  onProgress?: (progress: HashProgress) => void
  signal?: AbortSignal
}

type WorkerProgressMessage = {
  type: 'progress'
  processed: number
  total: number
}

type WorkerDoneMessage = {
  type: 'done'
  hash: string
  implementation: HashImplementation
}

type WorkerErrorMessage = {
  type: 'error'
  message: string
}

type WorkerMessage =
  | WorkerProgressMessage
  | WorkerDoneMessage
  | WorkerErrorMessage

const DEFAULT_CHUNK_SIZE = 8 * 1024 * 1024

export type HashFileResult = {
  hash: string
  implementation: HashImplementation
}

export function hashFileInWorker(
  file: File,
  options: HashFileOptions = {},
): Promise<HashFileResult> {
  const worker = new Worker(new URL('./hash.worker.ts', import.meta.url), {
    type: 'module',
  })
  const chunkSize = options.chunkSize ?? DEFAULT_CHUNK_SIZE

  return new Promise<HashFileResult>((resolve, reject) => {
    let settled = false

    const abort = () => {
      worker.postMessage({ type: 'cancel' })
      finish(() =>
        reject(new DOMException('Hash calculation cancelled', 'AbortError')),
      )
    }

    const cleanup = () => {
      worker.terminate()
      options.signal?.removeEventListener('abort', abort)
    }

    const finish = (callback: () => void) => {
      if (settled) return
      settled = true
      cleanup()
      callback()
    }

    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const message = event.data

      if (message.type === 'progress') {
        options.onProgress?.({
          processed: message.processed,
          total: message.total,
          ratio: message.total === 0 ? 1 : message.processed / message.total,
        })
        return
      }

      if (message.type === 'done') {
        finish(() =>
          resolve({
            hash: message.hash,
            implementation: message.implementation,
          }),
        )
        return
      }

      finish(() => reject(new Error(message.message)))
    }

    worker.onerror = (event) => {
      finish(() => reject(new Error(event.message || 'Hash worker failed to start')))
    }

    if (options.signal?.aborted) {
      abort()
      return
    }

    options.signal?.addEventListener('abort', abort, { once: true })
    worker.postMessage({
      type: 'start',
      file,
      chunkSize,
    })
  })
}

export type CoverImplementation = 'webcodecs' | 'html-video'

export type CoverProgress = {
  processed: number
  total: number
  ratio: number
}

export type ExtractCoverOptions = {
  chunkSize?: number
  onProgress?: (progress: CoverProgress) => void
  signal?: AbortSignal
}

export type ExtractCoverResult = {
  blob: Blob
  width: number
  height: number
  duration: number
  implementation: CoverImplementation
}

type CoverProgressMessage = {
  type: 'progress'
  processed: number
  total: number
}

type CoverDoneMessage = {
  type: 'done'
  buffer: ArrayBuffer
  width: number
  height: number
  duration: number
  implementation: 'webcodecs'
}

type CoverErrorMessage = {
  type: 'error'
  message: string
}

type CoverWorkerMessage =
  | CoverProgressMessage
  | CoverDoneMessage
  | CoverErrorMessage

const DEFAULT_COVER_CHUNK_SIZE = 4 * 1024 * 1024

function coverAbortError() {
  return new DOMException('Cover extraction cancelled', 'AbortError')
}

function extractCoverInWorker(
  file: File,
  options: ExtractCoverOptions,
): Promise<ExtractCoverResult> {
  const worker = new Worker(new URL('./cover.worker.ts', import.meta.url), {
    type: 'module',
  })
  const chunkSize = options.chunkSize ?? DEFAULT_COVER_CHUNK_SIZE

  return new Promise<ExtractCoverResult>((resolve, reject) => {
    let settled = false

    const abort = () => {
      worker.postMessage({ type: 'cancel' })
      finish(() => reject(coverAbortError()))
    }

    const cleanup = () => {
      worker.terminate()
      options.signal?.removeEventListener('abort', abort)
    }

    const finish = (callback: () => void) => {
      if (settled) return
      settled = true
      cleanup()
      callback()
    }

    worker.onmessage = (event: MessageEvent<CoverWorkerMessage>) => {
      const message = event.data

      if (message.type === 'progress') {
        options.onProgress?.({
          processed: message.processed,
          total: message.total,
          ratio: message.total === 0 ? 1 : message.processed / message.total,
        })
        return
      }

      if (message.type === 'done') {
        finish(() =>
          resolve({
            blob: new Blob([message.buffer], { type: 'image/jpeg' }),
            width: message.width,
            height: message.height,
            duration: message.duration,
            implementation: message.implementation,
          }),
        )
        return
      }

      finish(() => reject(new Error(message.message)))
    }

    worker.onerror = (event) => {
      finish(() => reject(new Error(event.message || 'Cover worker failed')))
    }

    if (options.signal?.aborted) {
      abort()
      return
    }

    options.signal?.addEventListener('abort', abort, { once: true })
    worker.postMessage({
      type: 'start',
      file,
      chunkSize,
    })
  })
}

function extractCoverWithVideoElement(
  file: File,
  options: ExtractCoverOptions,
): Promise<ExtractCoverResult> {
  return new Promise<ExtractCoverResult>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    let settled = false

    const abort = () => finish(() => reject(coverAbortError()))

    const cleanup = () => {
      video.pause()
      video.removeAttribute('src')
      video.load()
      URL.revokeObjectURL(objectUrl)
      options.signal?.removeEventListener('abort', abort)
    }

    const finish = (callback: () => void) => {
      if (settled) return
      settled = true
      cleanup()
      callback()
    }

    const fail = () =>
      finish(() => reject(new Error('Video cover extraction failed')))

    video.muted = true
    video.playsInline = true
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      if (!Number.isFinite(video.duration) || video.videoWidth === 0) {
        fail()
        return
      }

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      video.currentTime = Math.min(video.duration * 0.1, 1)
    }
    video.onseeked = () => {
      const context = canvas.getContext('2d')
      if (!context) {
        fail()
        return
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            fail()
            return
          }

          options.onProgress?.({ processed: 1, total: 1, ratio: 1 })
          finish(() =>
            resolve({
              blob,
              width: canvas.width,
              height: canvas.height,
              duration: video.duration,
              implementation: 'html-video',
            }),
          )
        },
        'image/jpeg',
        0.86,
      )
    }
    video.onerror = fail
    options.signal?.addEventListener('abort', abort, { once: true })
    video.src = objectUrl
  })
}

export async function extractVideoCover(
  file: File,
  options: ExtractCoverOptions = {},
): Promise<ExtractCoverResult> {
  try {
    return await extractCoverInWorker(file, options)
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error
    }

    return extractCoverWithVideoElement(file, options)
  }
}
