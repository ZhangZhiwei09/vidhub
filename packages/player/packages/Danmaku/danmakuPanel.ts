import { $, toggleClass, addClass } from '../../utils/dom'
import Player from '../../packages/player'

export class DanmakuPanel {
  el: HTMLElement

  player: Player

  topText: HTMLElement

  topBox: HTMLElement

  bottomText: HTMLElement

  bottomBox: HTMLElement

  SubsettingsTopItem = {
    text: '设置弹幕颜色',
    content: ['#fff', '#e54256', '#ffe133', '#64DD17', '#39ccff', '#D500F9']
  }

  SubsettingsBottomItem = {
    text: '设置弹幕类型',
    content: ['滚动', '顶部', '底部']
  }

  constructor(player: Player) {
    this.player = player
    this.init()
  }

  init() {
    this.initTemplate()
    this.initEvent()
  }

  initTemplate() {
    this.el = $('div.comment-setting-box')
    addClass(this.el, ['video-set', 'hidden'])
    this.initBaseColors()
    this.initBaseType()
    this.el.append(this.topBox, this.bottomBox)
  }

  initBaseColors() {
    this.topBox = $('div.comment-setting-color')
    this.topText = $('div.comment-setting-title')
    this.topText.innerText = this.SubsettingsTopItem.text
    this.topBox.appendChild(this.topText)
    this.SubsettingsTopItem.content.forEach((item, index) => {
      const input = $('input', {
        type: 'radio',
        name: `wplayer-danmaku-color`,
        value: item
      })
      if (index === 0) {
        (input as HTMLInputElement).checked = true
      }
      const span = $('span')
      span.style.backgroundColor = item
      const label = $('label')
      label.append(input, span)
      this.topBox.append(label)
    })
  }

  initBaseType() {
    this.bottomBox = $('div.comment-setting-type')
    this.bottomText = $('div.comment-setting-title')
    this.bottomText.innerText = this.SubsettingsBottomItem.text
    this.bottomBox.appendChild(this.bottomText)
    this.SubsettingsBottomItem.content.forEach((item, index) => {
      const input = $('input', {
        type: 'radio',
        name: `wplayer-danmaku-type`,
        value: index
      })
      if (index === 0) {
        (input as HTMLInputElement).checked = true
      }
      const span = $('span')
      span.innerText = item
      const label = $('label')
      label.append(input, span)
      this.bottomBox.append(label)
    })
  }

  initEvent() {}

  toggle() {
    toggleClass(this.el, 'wplayer-hidden')
  }
}
