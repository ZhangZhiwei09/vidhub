import { $, addClass, createSvg } from '../../utils/dom'
import { Component } from '../component'
import Player from '../player'
import { danmakuOpenPath, danmakuClosePath } from '../../svg'

export class DanmakuSwitch extends Component {
  readonly id = 'DanmakuSwitch'

  player: Player

  msg: '开启弹幕' | '关闭弹幕' = '开启弹幕'

  status: 'open' | 'close' = 'open'

  iconBox: HTMLElement

  danmakuSwitchIcon: SVGSVGElement | string

  constructor(player: Player, container: HTMLElement, desc?: string) {
    super(container, desc)
    this.player = player
    this.init()
  }

  init() {
    this.initTemplate()
    this.initEvent()
  }

  initTemplate() {
    addClass(this.el, ['video-danmaku-openclose', 'video-controller'])
    this.iconBox = $('div.video-icon')
    this.danmakuSwitchIcon = createSvg(danmakuOpenPath, '0 0 1024 1024')
    this.iconBox.append(this.danmakuSwitchIcon)
    this.el.appendChild(this.iconBox)
  }

  initEvent() {
    //弹幕控制开关
    this.iconBox.addEventListener('click', (e) => {
      e.stopPropagation()
      this.status = this.status === 'open' ? 'close' : 'open'
      this.msg = this.status === 'open' ? '关闭弹幕' : '开启弹幕'
      this.iconBox.removeChild(this.danmakuSwitchIcon as SVGSVGElement)
      this.danmakuSwitchIcon =
        this.status === 'open'
          ? createSvg(danmakuOpenPath, '0 0 1024 1024')
          : createSvg(danmakuClosePath, '0 0 1024 1024')
      this.iconBox.append(this.danmakuSwitchIcon)
      this.status === 'open' ? this.player.danmaku.show() : this.player.danmaku.hide()
    })
  }
}
