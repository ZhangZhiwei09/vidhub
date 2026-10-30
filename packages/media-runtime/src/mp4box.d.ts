declare module 'mp4box' {
  export type Mp4Sample = {
    data: ArrayBuffer | Uint8Array
    is_sync?: boolean
    is_rap?: boolean
    cts: number
    dts: number
    duration: number
    timescale: number
  }

  export type Mp4TrackInfo = {
    id: number
    type: string
    codec: string
    duration?: number
    timescale?: number
    movie_duration?: number
    movie_timescale?: number
    track_width?: number
    track_height?: number
    video?: {
      width: number
      height: number
    }
  }

  type AvcParameterSet = {
    length: number
    nalu: Uint8Array
  }

  type AvcConfig = {
    configurationVersion: number
    AVCProfileIndication: number
    profile_compatibility: number
    AVCLevelIndication: number
    lengthSizeMinusOne: number
    SPS: AvcParameterSet[]
    PPS: AvcParameterSet[]
    ext?: Uint8Array
  }

  type Mp4SampleEntry = {
    avcC?: AvcConfig
  }

  export type Mp4TrackBox = {
    tkhd: {
      track_id: number
    }
    mdia: {
      minf: {
        stbl: {
          stsd: {
            entries: Mp4SampleEntry[]
          }
        }
      }
    }
  }

  export type Mp4BoxFile = {
    moov?: {
      traks: Mp4TrackBox[]
    }
    onReady: ((info: { videoTracks?: Mp4TrackInfo[] }) => void) | null
    onSamples: ((id: number, user: unknown, samples: Mp4Sample[]) => void) | null
    onError: ((error: unknown) => void) | null
    appendBuffer(buffer: ArrayBuffer): number | undefined
    setExtractionOptions(id: number, user: unknown, options: { nbSamples: number }): void
    start(): void
    stop(): void
    flush(): void
    releaseUsedSamples(id: number, sampleNumber: number): void
  }

  const MP4Box: {
    createFile(keepMdatData?: boolean): Mp4BoxFile
  }

  export default MP4Box
}
