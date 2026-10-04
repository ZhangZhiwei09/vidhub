import { $ } from '../../utils/dom'
import { Component } from '../../packages/component'
import Player from '../player'
import { storeControlComponent } from '../store'
import { VideoProgress } from './videoProgress'
import { ComponentItem } from '../../types'

export class MediumBar extends Component implements ComponentItem {
  readonly id = 'MediumBar'

  mediubar: HTMLElement

  leftArea: HTMLElement

  mediumArea: HTMLElement

  rightArea: HTMLElement

  videoProgress: VideoProgress

  player: Player

  constructor(container: HTMLElement, player: Player, desc?: string) {
    super(container, desc)
    this.player = player
    this.init()
    this.initComponent()
    storeControlComponent(this)
  }

  init(): void {
    this.leftArea = $('div.video-mediumbar-left')
    this.mediumArea = $('div.video-mediumbar-medium')
    this.rightArea = $('div.video-mediumbar-right')
    this.el.append(this.leftArea, this.mediumArea, this.rightArea)
  }

  initComponent() {
    this.videoProgress = new VideoProgress(this.player, this.el, 'div')
    this.mediumArea.append(this.videoProgress.el)
  }
}
