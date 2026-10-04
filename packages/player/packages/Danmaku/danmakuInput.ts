import { $, addClass } from '../../utils/dom'
import { Component } from '../component'
import Player from '../player'
import { ComponentItem, DOMProps } from '../../types'

export class DanmakuInput extends Component implements ComponentItem {
  readonly id = 'DanmakuInput'

  private player: Player

  props: DOMProps

  danmakuInputBox: HTMLElement

  danmakuInput: HTMLInputElement

  danmakuSendBox: HTMLElement

  constructor(
    player: Player,
    container: HTMLElement,
    desc?: string,
    props?: DOMProps,
    children?: Node[]
  ) {
    super(container, desc, props, children)
    this.props = props || {}
    this.player = player
    this.init()
  }

  init() {
    this.initTemplate()
    this.initEvent()
  }

  initTemplate() {
    addClass(this.el, ['danmaku-input-wrapper'])
    this.danmakuInput = $('input.danmaku-input', { type: 'text' })
    this.danmakuSendBox = $('span.danmaku-send')
    this.danmakuSendBox.innerText = '发送'
    this.el.append(this.danmakuInput, this.danmakuSendBox)
  }

  initEvent() {
    this.danmakuSendBox.onclick = (e) => {
      e.stopPropagation()
      const value = this.danmakuInput.value
      this.player.emit('sendData', value)
      this.danmakuInput.value = ''
      this.danmakuInput.blur()
    }

    this.danmakuInput.addEventListener('focus', (e) => {
      e.stopPropagation()
      this.player.emit('inputFocus')
    })

    this.danmakuInput.addEventListener('blur', (e) => {
      e.stopPropagation()
      this.player.emit('inputBlur')
    })

    this.danmakuInput.addEventListener('click', (e) => {
      e.stopPropagation()
    })
  }
}
