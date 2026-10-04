import { addClass, createSvg } from '../../../utils/dom'
import Player from '../../../packages/player'
import { fullscreenExitPath, fullscreenPath } from '../../../svg'
import { EVENT } from '../../../events'
import { exitFull, isFull } from 'be-full'
import { FullHTMLElement, enterFull } from '../../../utils/full'
import { SettingOptions } from '../setting/settingOption'
import { DOMProps } from '../../../types'

export class FullScreen extends SettingOptions {
  readonly id = 'FullScreen'

  fullScreenIcon: SVGSVGElement | string

  constructor(
    player: Player,
    container: HTMLElement,
    desc?: string,
    props?: DOMProps,
    children?: Node[]
  ) {
    super(player, container, 0, 0, desc, props, children)
    this.init()
  }

  init() {
    this.initTemplate()
    this.initEvent()
  }

  initTemplate() {
    addClass(this.el, ['video-fullscreen', 'video-controller'])
    this.icon = createSvg(fullscreenPath, '0 0 1024 1024')
    this.iconBox.appendChild(this.icon)
    this.hideBox.innerText = '全屏'
  }

  initEvent() {
    this.requestFullScreen = this.requestFullScreen.bind(this)

    this.el.onclick = this.requestFullScreen

    document.addEventListener('fullscreenchange', () => {
      if (document.fullscreenElement) {
        this.player.emit(EVENT.ENTER_FULLSCREEN)
      } else {
        this.player.emit(EVENT.LEAVE_FULLSCREEN)
      }
      this.player.resize()
    })
  }

  requestFullScreen(e?: Event) {
    if (e instanceof Event) {
      // 在此处做了一层类型守卫
      e.stopPropagation()
    }
    if (!isFull(this.player.container)) {
      // 调用浏览器提供的全屏API接口去请求元素的全屏，原生全屏分为  竖屏全屏 + 横屏全屏
      enterFull(this.player.container as FullHTMLElement)
      // this.player.container.requestFullscreen();

      this.iconBox.removeChild(this.icon)
      this.icon = createSvg(fullscreenExitPath, '0 0 1024 1024')
      this.iconBox.appendChild(this.icon)
    } else if (isFull(this.player.container)) {
      // document.exitFullscreen()
      exitFull()
      this.iconBox.removeChild(this.icon)
      this.icon = createSvg(fullscreenPath, '0 0 1024 1024')
      this.iconBox.appendChild(this.icon)
    }
  }
}
