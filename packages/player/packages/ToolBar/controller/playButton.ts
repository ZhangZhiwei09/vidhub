import { $, addClass, createSvg } from '../../../utils/dom'
import { Component } from '../../component'
import { pausePath, playPath } from '../../../svg/index'
import Player from '../../player'
import { ComponentItem } from '../../../types'
import { storeControlComponent } from '../../../packages/store'

export class PlayButton extends Component implements ComponentItem {
  readonly id = 'PlayButton'

  player: Player

  iconBox: HTMLElement

  playIcon: SVGSVGElement | string

  pauseIcon: SVGSVGElement | string

  button: SVGSVGElement

  constructor(player: Player, container: HTMLElement, desc?: string) {
    super(container, desc)
    this.player = player
    this.init()
  }

  init() {
    this.initTemplate()
    this.initEvent()
    storeControlComponent(this)
  }

  initTemplate() {
    addClass(this.el, ['video-start-pause', 'video-controller'])
    this.playIcon = createSvg(playPath)
    this.pauseIcon = createSvg(pausePath)
    this.iconBox = $('div.video-icon')
    this.iconBox.append(this.playIcon)
    this.button = this.playIcon
    this.el.appendChild(this.iconBox)
  }

  initEvent() {
    this.onClick = this.onClick.bind(this)

    this.iconBox.addEventListener('click', (e: MouseEvent) => {
      e.stopPropagation()
      if (this.player.video.paused) {
        this.player.video.play()
      } else {
        this.player.video.pause()
      }
    })

    this.player.on('play', () => {
      this.iconBox.removeChild(this.button)
      this.button = this.pauseIcon as SVGSVGElement
      this.iconBox.appendChild(this.button)
    })

    this.player.on('pause', () => {
      this.iconBox.removeChild(this.button)
      this.button = this.playIcon as SVGSVGElement
      this.iconBox.appendChild(this.button)
    })
  }

  onClick(e: Event) {
    if (e instanceof Event) {
      e.stopPropagation()
    }
    if (this.player.video.paused) {
      this.player.video.play()
    } else {
      this.player.video.pause()
    }
  }
}
