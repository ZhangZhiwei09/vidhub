import { EVENT } from '../../events'
import { addClass } from '../../utils/dom'
import Player from '../player'
import { BaseLoading } from './baseLoading'

export class Loading extends BaseLoading {
  readonly id = 'Loading'

  constructor(player: Player, container: HTMLElement, msg = 'Loading...') {
    super(player, container, msg)
    addClass(this.loadingBox, ['video-loading-loadingbox'])
    this.init()
  }
  init() {
    this.initEvent()
  }

  initEvent(): void {
    this.player.on(EVENT.WAITING, () => {
      this.addLoading()
    })

    this.player.on(EVENT.CAN_PLAY, () => {
      this.removeLoading()
    })
  }
}
