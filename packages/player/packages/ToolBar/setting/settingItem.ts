import Player from '../../../packages/player'
import { $ } from '../../../utils/dom'

export class SubsettingItem {
  el: HTMLElement

  player: Player

  leftArea: HTMLElement

  rightArea: HTMLElement

  leftIconBox: HTMLElement

  leftTextBox: HTMLElement

  rightTipBox: HTMLElement

  rightElementBox: HTMLElement

  constructor(
    player: Player,
    leftIcon?: HTMLElement | SVGSVGElement,
    leftText?: string,
    rightTip?: string,
    rightElement?: HTMLElement | SVGSVGElement
  ) {
    this.player = player
    this.init()
    if (leftIcon) this.leftIconBox.appendChild(leftIcon)
    if (leftText) this.leftTextBox.innerText = leftText
    if (rightTip) this.rightTipBox.innerText = rightTip
    if (rightElement) this.rightElementBox.appendChild(rightElement)
  }

  init() {
    this.el = $('div.video-subsetting-item')
    this.leftArea = $('div.video-subsetting-itemleft')
    this.rightArea = $('div.video-subsetting-itemright')
    this.leftIconBox = $('div.video-subsettings-itemleft-icon')
    this.leftTextBox = $('div.video-subsetting-itemleft-text')
    this.rightTipBox = $('div.video-subsetting-itemright-tip')
    this.rightElementBox = $('div.video-subsettings-itemright-icon')
    this.el.append(this.leftArea, this.rightArea)
    this.leftArea.append(this.leftIconBox, this.leftTextBox)
    this.rightArea.append(this.rightTipBox, this.rightElementBox)
  }
}
