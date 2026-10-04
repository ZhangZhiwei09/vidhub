import { ComponentItem } from '../../types'
import Player from '../player'
import { $, addClass, createSvg } from '../../utils'
import { danmakuFontPath } from '../../svg'
import { DanmakuPanel } from './danmakuPanel'
import { Component } from '../component'

export class DanmakuSetting extends Component implements ComponentItem {
  readonly id = 'DanmakuSetting'

  player: Player

  danmakuPanel: DanmakuPanel

  iconBox: HTMLElement

  danmakuSettingIcon: SVGSVGElement | string

  constructor(player: Player, container: HTMLElement, desc?: string) {
    super(container, desc)
    this.player = player
    this.init()
  }

  init() {
    this.initTemplate()
    this.initSubSettingBase()
    this.initEvent()
  }

  initTemplate() {
    addClass(this.el, ['video-danmaku-setting', 'video-controller'])
    this.iconBox = $('div.video-icon')
    this.danmakuSettingIcon = createSvg(danmakuFontPath, '0 0 24 24')
    this.iconBox.appendChild(this.danmakuSettingIcon)
    this.el.appendChild(this.iconBox)
  }

  initEvent() {
    this.iconBox.addEventListener('click', (e: MouseEvent) => {
      if (e instanceof Event) {
        e.stopPropagation()
      }
      this.danmakuPanel.toggle()
    })
  }

  initSubSettingBase() {
    this.danmakuPanel = new DanmakuPanel(this.player)
    this.registerSubsettingsBase(this.danmakuPanel)
  }

  registerSubsettingsBase(baseCons: DanmakuPanel) {
    this.el.appendChild(baseCons.el)
  }
}
