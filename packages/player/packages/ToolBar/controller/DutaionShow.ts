import Player from '../../../packages/player'
import { Component } from '../../component'
import { addClass } from '../../../utils/dom'
import { EVENT } from '../../../events'
import { formatTime } from '../../../utils/math'

export class DutaionShow extends Component {
  readonly id = 'DutaionShow'

  player: Player

  currentTime = '00:00'

  totalTime = '00:00'

  timeBox: HTMLElement

  constructor(player: Player, container: HTMLElement, desc?: string) {
    super(container, desc)
    this.player = player
    this.init()
  }

  init() {
    this.initTemplate()
    this.initEvent()
  }

  initTemplate() {
    addClass(this.el, ['video-duration-time', 'video-controller'])
    this.el.innerText = `${this.currentTime}/${this.totalTime}`
  }

  initEvent() {
    this.player.on(EVENT.LOADED_META_DATA, (e: Event) => {
      const video = e.target as HTMLVideoElement
      this.totalTime = formatTime(video.duration)
      this.el.innerText = `${this.currentTime}/${this.totalTime}`
    })

    this.player.on(EVENT.TIME_UPDATE, (e: Event) => {
      const video = e.target as HTMLVideoElement
      this.currentTime = formatTime(video.currentTime)
      this.el.innerText = `${this.currentTime}/${this.totalTime}`
    })

    this.player.on(EVENT.VIDEO_DOT_DRAG, (scale: number) => {
      this.currentTime = formatTime(this.player.video.duration * scale)
      this.el.innerText = `${this.currentTime}/${this.totalTime}`
    })
  }
}
