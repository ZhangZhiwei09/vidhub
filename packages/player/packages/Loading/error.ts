import Player from '../player'
import { EVENT } from '../../events'
import { BaseLoading } from './baseLoading'

export class ErrorLoading extends BaseLoading {
  readonly id = 'errorloading'
  constructor(player: Player, container: HTMLElement, msg: string) {
    super(player, container, msg)
    this.initEvent()
  }
  initEvent(): void {
    this.player.on(EVENT.ERROR, () => {
      this.addLoading()
    })

    this.player.on(EVENT.CAN_PLAY, () => {
      this.removeLoading()
    })
  }
}
