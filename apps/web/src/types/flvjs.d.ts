declare module 'flv.js' {
  export interface MediaDataSource {
    type: string
    url: string
    isLive?: boolean
  }

  export interface Player {
    attachMediaElement(mediaElement: HTMLMediaElement): void
    load(): void
    play(): Promise<void>
    destroy(): void
  }

  const flvjs: {
    isSupported(): boolean
    createPlayer(mediaDataSource: MediaDataSource): Player
  }

  export default flvjs
}