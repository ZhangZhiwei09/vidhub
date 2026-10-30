import init, { Sha256Hasher } from '@vidhub/media-wasm'

type StartMessage = {
  type: 'start'
  file: File
  chunkSize: number
}

type CancelMessage = {
  type: 'cancel'
}

type WorkerMessage = StartMessage | CancelMessage

type ProgressMessage = {
  type: 'progress'
  processed: number
  total: number
}

type DoneMessage = {
  type: 'done'
  hash: string
  implementation: 'wasm' | 'webcrypto'
}

type ErrorMessage = {
  type: 'error'
  message: string
}

let cancelled = false
let running = false

function post(message: ProgressMessage | DoneMessage | ErrorMessage) {
  self.postMessage(message)
}

async function hashWithWasm(file: File, chunkSize: number) {
  await init()

  const hasher = new Sha256Hasher()
  let processed = 0

  while (processed < file.size) {
    if (cancelled) throw new DOMException('Hash calculation cancelled', 'AbortError')

    const end = Math.min(processed + chunkSize, file.size)
    const chunk = new Uint8Array(await file.slice(processed, end).arrayBuffer())
    hasher.update(chunk)
    processed = end

    post({
      type: 'progress',
      processed,
      total: file.size,
    })
  }

  return hasher.finalize_hex()
}

async function hashWithWebCrypto(file: File) {
  const buffer = await file.arrayBuffer()
  const digest = await crypto.subtle.digest('SHA-256', buffer)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

async function runHash(file: File, chunkSize: number) {
  if (running) return
  running = true
  cancelled = false

  try {
    let hash: string
    let implementation: DoneMessage['implementation']

    try {
      hash = await hashWithWasm(file, chunkSize)
      implementation = 'wasm'
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') throw error

      post({
        type: 'progress',
        processed: 0,
        total: file.size,
      })
      hash = await hashWithWebCrypto(file)
      implementation = 'webcrypto'
    }

    if (cancelled) throw new DOMException('Hash calculation cancelled', 'AbortError')
    post({ type: 'done', hash, implementation })
  } catch (error) {
    post({
      type: 'error',
      message: error instanceof Error ? error.message : 'Hash calculation failed',
    })
  } finally {
    running = false
  }
}

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  if (event.data.type === 'cancel') {
    cancelled = true
    return
  }

  void runHash(event.data.file, event.data.chunkSize)
}
