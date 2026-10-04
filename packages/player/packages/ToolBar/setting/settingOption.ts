import { $, addClass, checkIsMouseInRange, includeClass, removeClass } from '../../../utils/dom'
import { Component } from '../../../packages/component'
import Player from '../../../packages/player'
import { ComponentItem, DOMProps } from '../../../types'
import { EVENT } from '../../../events'

export class SettingOptions extends Component implements ComponentItem {
  id = 'SettingOptions'

  props: DOMProps

  player: Player

  hideWidth: number

  hideHeight: number

  hideBox: HTMLElement

  iconBox: HTMLElement

  icon: Element

  bottom = 48

  constructor(
    player: Player,
    container?: HTMLElement,
    hideWidth?: number,
    hideHeight?: number,
    desc?: string,
    props?: DOMProps,
    children?: Node[]
  ) {
    super(container, desc, props, children)
    this.player = player
    props ? (this.props = props) : (this.props = {})
    this.hideHeight = hideHeight as number
    this.hideWidth = hideWidth as number
    this.initBase()
  }

  initBase() {
    this.initBaseTemplate()
    this.initBaseEvent()
  }

  initBaseTemplate() {
    this.hideBox = $('div')
    addClass(this.hideBox, ['video-set', 'video-set-hidden'])
    if (this.hideHeight && this.hideHeight > 0) {
      this.hideBox.style.height = this.hideHeight + 'px'
    }
    if (this.hideWidth && this.hideWidth > 0) {
      this.hideBox.style.width = this.hideWidth + 'px'
    }
    this.el.appendChild(this.hideBox)
    this.iconBox = $('div')
    addClass(this.iconBox, ['video-icon'])
    this.el.appendChild(this.iconBox)
  }

  initBaseEvent() {
    this.el.onmouseenter = () => {
      removeClass(this.hideBox, ['video-set-hidden'])
      document.body.onmousemove = this.handleMouseMove.bind(this)
      this.player.emit('oneControllerHover', this)
    }

    this.player.on('oneControllerHover', (controller: ComponentItem) => {
      if (this !== controller) {
        if (!includeClass(this.hideBox, 'video-set-hidden')) {
          addClass(this.hideBox, ['video-set-hidden'])
        }
      }
    })

    this.player.on(EVENT.VIDEO_CLICK, () => {
      addClass(this.hideBox, ['video-set-hidden'])
    })
  }

  handleMouseMove(e: MouseEvent) {
    const pX = e.clientX,
      pY = e.clientY
    if (!checkIsMouseInRange(this.el, this.hideBox, this.bottom, pX, pY)) {
      addClass(this.hideBox, ['video-set-hidden'])
      document.body.onmousemove = null
    }
  }
}
