import MP4Box, {
  type Mp4BoxFile,
  type Mp4Sample,
  type Mp4TrackBox,
  type Mp4TrackInfo,
} from 'mp4box'

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
  buffer: ArrayBuffer
  width: number
  height: number
  duration: number
  implementation: 'webcodecs'
}

type ErrorMessage = {
  type: 'error'
  message: string
}

let cancelled = false
let running = false
const workerScope = self as unknown as {
  postMessage(message: unknown, transfer?: Transferable[]): void
}

function post(message: ProgressMessage | DoneMessage | ErrorMessage) {
  if (message.type === 'done') {
    workerScope.postMessage(message, [message.buffer])
    return
  }

  workerScope.postMessage(message)
}

function buildAvcDescription(track: Mp4TrackBox) {
  const avcC = track.mdia.minf.stbl.stsd.entries[0]?.avcC
  if (!avcC) return undefined

  const sps = avcC.SPS ?? []
  const pps = avcC.PPS ?? []
  const ext = avcC.ext ?? new Uint8Array()
  const byteLength =
    6 +
    sps.reduce((total, item) => total + 2 + item.nalu.byteLength, 0) +
    1 +
    pps.reduce((total, item) => total + 2 + item.nalu.byteLength, 0) +
    ext.byteLength
  const description = new Uint8Array(byteLength)
  let offset = 0

  description[offset++] = avcC.configurationVersion
  description[offset++] = avcC.AVCProfileIndication
  description[offset++] = avcC.profile_compatibility
  description[offset++] = avcC.AVCLevelIndication
  description[offset++] = 0xfc | (avcC.lengthSizeMinusOne & 0x03)
  description[offset++] = 0xe0 | (sps.length & 0x1f)

  for (const parameterSet of sps) {
    description[offset++] = (parameterSet.nalu.byteLength >>> 8) & 0xff
    description[offset++] = parameterSet.nalu.byteLength & 0xff
    description.set(parameterSet.nalu, offset)
    offset += parameterSet.nalu.byteLength
  }

  description[offset++] = pps.length & 0xff
  for (const parameterSet of pps) {
    description[offset++] = (parameterSet.nalu.byteLength >>> 8) & 0xff
    description[offset++] = parameterSet.nalu.byteLength & 0xff
    description.set(parameterSet.nalu, offset)
    offset += parameterSet.nalu.byteLength
  }

  description.set(ext, offset)
  return description
}

async function renderFrame(frame: VideoFrame, width: number, height: number) {
  if (typeof OffscreenCanvas === 'undefined') {
    throw new Error('OffscreenCanvas is unavailable')
  }

  const canvas = new OffscreenCanvas(width, height)
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas context is unavailable')

  context.drawImage(frame, 0, 0, width, height)
  const blob = await canvas.convertToBlob({
    type: 'image/jpeg',
    quality: 0.86,
  })

  return blob.arrayBuffer()
}

function closeDecoder(decoder: VideoDecoder | null) {
  decoder?.close()
}

function findVideoTrack(file: Mp4BoxFile, info: { videoTracks?: Mp4TrackInfo[] }) {
  const trackInfo = info.videoTracks?.find((track) => /^(avc1|avc3)\./.test(track.codec))
  if (!trackInfo) {
    throw new Error('No supported AVC video track found')
  }

  const track = file.moov?.traks.find(
    (item) => item.tkhd.track_id === trackInfo.id,
  )
  if (!track) throw new Error('AVC track metadata is unavailable')

  return { track, trackInfo }
}

async function extractCover(file: File, chunkSize: number) {
  if (typeof VideoDecoder === 'undefined') {
    throw new Error('WebCodecs is unavailable')
  }

  const mp4boxfile = MP4Box.createFile(false)
  let decoder: VideoDecoder | null = null
  let sampleSeen = false
  let resolveOutput: ((buffer: ArrayBuffer) => void) | null = null
  let rejectOutput: ((error: unknown) => void) | null = null
  const output = new Promise<ArrayBuffer>((resolve, reject) => {
    resolveOutput = resolve
    rejectOutput = reject
  })

  let width = 0
  let height = 0
  let duration = 0

  const fail = (error: unknown) => {
    rejectOutput?.(error)
  }

  mp4boxfile.onError = fail
  mp4boxfile.onReady = (info) => {
    try {
      const selected = findVideoTrack(mp4boxfile, info)
      const description = buildAvcDescription(selected.track)
      width = selected.trackInfo.video?.width ?? selected.trackInfo.track_width ?? 0
      height = selected.trackInfo.video?.height ?? selected.trackInfo.track_height ?? 0
      duration =
        (selected.trackInfo.duration ?? selected.trackInfo.movie_duration ?? 0) /
        (selected.trackInfo.timescale ?? selected.trackInfo.movie_timescale ?? 1)

      if (!width || !height) throw new Error('Video dimensions are unavailable')

      decoder = new VideoDecoder({
        output: (frame) => {
          if (!resolveOutput) {
            frame.close()
            return
          }

          void renderFrame(frame, width, height)
            .then((buffer) => {
              resolveOutput?.(buffer)
              resolveOutput = null
            })
            .catch((error) => {
              rejectOutput?.(error)
              rejectOutput = null
            })
            .finally(() => frame.close())
        },
        error: fail,
      })
      decoder.configure({
        codec: selected.trackInfo.codec,
        codedWidth: width,
        codedHeight: height,
        ...(description ? { description } : {}),
      })

      mp4boxfile.onSamples = (_id, _user, samples) => {
        if (sampleSeen || !decoder) return

        const sample =
          samples.find((item) => item.is_sync === true || item.is_rap === true) ??
          samples[0]
        if (!sample) return

        sampleSeen = true
        mp4boxfile.stop()
        const isKeyFrame = sample.is_sync ?? sample.is_rap ?? true

        const timestamp = Math.round(
          (sample.cts / Math.max(sample.timescale, 1)) * 1_000_000,
        )
        const sampleDuration = Math.round(
          (sample.duration / Math.max(sample.timescale, 1)) * 1_000_000,
        )

        decoder.decode(
          new EncodedVideoChunk({
            type: isKeyFrame ? 'key' : 'delta',
            timestamp,
            duration: sampleDuration,
            data: new Uint8Array(sample.data),
          }),
        )
      }

      mp4boxfile.setExtractionOptions(selected.trackInfo.id, null, {
        nbSamples: 16,
      })
      mp4boxfile.start()
    } catch (error) {
      fail(error)
    }
  }

  for (let offset = 0; offset < file.size && !sampleSeen; offset += chunkSize) {
    if (cancelled) throw new DOMException('Cover extraction cancelled', 'AbortError')

    const end = Math.min(offset + chunkSize, file.size)
    const buffer = await file.slice(offset, end).arrayBuffer()
    Object.defineProperty(buffer, 'fileStart', {
      configurable: true,
      value: offset,
    })
    mp4boxfile.appendBuffer(buffer)

    post({
      type: 'progress',
      processed: end,
      total: file.size,
    })
  }

  if (!sampleSeen) mp4boxfile.flush()
  if (!sampleSeen) throw new Error('No decodable video sample found')
  const buffer = await output
  closeDecoder(decoder)

  return { buffer, width, height, duration }
}

async function runCover(file: File, chunkSize: number) {
  if (running) return
  running = true
  cancelled = false

  try {
    const result = await extractCover(file, chunkSize)
    if (cancelled) throw new DOMException('Cover extraction cancelled', 'AbortError')

    post({
      type: 'done',
      ...result,
      implementation: 'webcodecs',
    })
  } catch (error) {
    post({
      type: 'error',
      message: error instanceof Error ? error.message : 'Cover extraction failed',
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

  void runCover(event.data.file, event.data.chunkSize)
}
