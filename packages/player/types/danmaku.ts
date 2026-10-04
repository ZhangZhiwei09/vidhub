import { PlayerOptions } from '.'

export interface DanmakuConfig {
  open: boolean
  api: string
}

export interface DanmakuOptions {
  api: {
    address: string
    addition?: string[]
    speedRate?: number
  }
  time: () => number
  callback: () => void
  error: () => void
  apiBackend: PlayerOptions['apiBackend']
}

export interface DanmakuData {
  text: string
  time: number
  type: number
  color: number
}

export interface DanmakuBackendOptions {
  data?: DanmakuData
  url: string
  success: (opton?: any) => void
  error: (opton?: any) => void
}

export interface DanmakuTunnel {
  right: object
  top: object
  bottom: object
}
