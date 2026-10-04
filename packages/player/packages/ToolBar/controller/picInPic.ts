import Player from '../../../packages/player'
import { SettingOptions } from '../setting/settingOption'
import { DOMProps } from '../../../types'
import { picInPicPath } from '../../../svg'
import { addClass, createSvg } from '../../../utils/dom'
import { storeControlComponent } from '../../store'

export class PicInPic extends SettingOptions {
  readonly id = 'PicInPic'
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
    storeControlComponent(this)
  }

  initTemplate() {
    addClass(this.el, ['video-picInpic', 'video-controller'])
    this.icon = createSvg(picInPicPath, '0 0 1024 1024')
    this.iconBox.appendChild(this.icon)
    this.hideBox.innerText = '画中画'
  }

  initEvent() {
    this.onClick = this.onClick.bind(this)
    this.el.onclick = this.onClick
  }

  onClick(e: Event) {
    if (e instanceof Event) {
      e.stopPropagation()
    }
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture()
    } else {
      this.player.video.requestPictureInPicture()
    }
  }
}
