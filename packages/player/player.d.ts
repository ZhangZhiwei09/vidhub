declare module '@vidhub/player' {
  export interface PlayerOptions {
    container: HTMLElement | null
    live?: boolean
    video: {
      url: string
      pic?: string
      type?: string
    }
    videoProps?: Record<string, string>
    danmaku?: {
      open: boolean
      api: string
    }
    apiBackend?: {
      read: (option: {
        url: string
        success: (data?: unknown) => void
        error?: (data?: unknown) => void
      }) => void
      send: (option: {
        url: string
        data?: { text: string; time: number; color: number; type: number }
        success: (data?: unknown) => void
        error?: (data?: unknown) => void
      }) => void
    }
    [key: string]: unknown
  }

  export default class Player {
    constructor(options: PlayerOptions)
    destroy(): void
    video: HTMLVideoElement
  }
}