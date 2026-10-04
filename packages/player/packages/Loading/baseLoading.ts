import { ComponentItem, DOMProps } from '../../types'
import { Component } from '../component'
import Player from '../player'
import { $, addClass } from '../../utils/dom'

export class BaseLoading extends Component implements ComponentItem {
  id = 'BaseLoading'

  props: DOMProps

  player: Player

  loadingBox: HTMLElement

  messageBox: HTMLElement

  message: string

  constructor(
    player: Player,
    container: HTMLElement,
    msg: string,
    desc?: string,
    props?: DOMProps,
    children?: Node[]
  ) {
    super(null, desc, props, children)
    this.props = props || {}
    this.player = player
    this.container = container
    this.message = msg
    this.initBase()
  }

  initBase() {
    this.initBaseTemplate()
  }

  initBaseTemplate(): void {
    addClass(this.el, ['video-loading'])
    this.loadingBox = $('div')
    this.messageBox = $('div')
    this.messageBox.innerText = this.message
    addClass(this.messageBox, ['video-loading-msgbox'])
    this.el.appendChild(this.loadingBox)
    this.el.appendChild(this.messageBox)
  }

  addLoading() {
    if (![...this.container.childNodes].includes(this.el)) {
      this.container.appendChild(this.el)
    }
  }

  removeLoading() {
    if ([...this.container.childNodes].includes(this.el)) {
      this.container.removeChild(this.el)
    }
  }
}
