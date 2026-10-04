import type { PlayerOptions } from '../types'

export function setVideoAttrs(video: HTMLVideoElement, opts: PlayerOptions['videoAttrs']): void {
  if (!opts) return
  Object.keys(opts).forEach((k) => {
    video.setAttribute(k, opts[k])
  })
}

const storageVolumeKey = 'wplayer:volume'
export function setVideoVolumeFromLocal(video: HTMLVideoElement): void {
  try {
    const volume = parseFloat(localStorage.getItem(storageVolumeKey) as string)
    if (!isNaN(volume)) video.volume = volume
  } catch (error) {
    // ignore
  }
}
