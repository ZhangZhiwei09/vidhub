import Player from '../player'
import { EVENT } from '../../events'
import { $ } from '../../utils/dom'

export class Mask {
  readonly id = 'Mask'

  player: Player

  maskBox: HTMLElement

  loadingBox: HTMLElement

  msg: string

  messageBox: HTMLElement

  container: HTMLElement

  canPlayHandled = false

  constructor(player: Player, container: HTMLElement, msg = '你感兴趣的视频都在这') {
    this.player = player
    this.container = container
    this.msg = msg
    this.init()
  }

  init() {
    this.initTemplate()
    this.initEvent()
  }

  initTemplate() {
    this.loadingBox = $('div.video-loading-loadingbox')
    this.maskBox = $('div.video-mask-loading')
    this.messageBox = $('div.video-loading-msgbox')
    this.messageBox.innerText = this.msg
    this.maskBox.append(this.loadingBox, this.messageBox)
    this.container.appendChild(this.maskBox)
  }

  initEvent(): void {
    this.maskBox.addEventListener('click', (e) => {
      e.stopPropagation()
    })

    this.player.on(EVENT.CAN_PLAY, () => {
      if (this.maskBox && !this.canPlayHandled) {
        this.container.removeChild(this.maskBox)
        this.canPlayHandled = true
      }
    })
  }
}
