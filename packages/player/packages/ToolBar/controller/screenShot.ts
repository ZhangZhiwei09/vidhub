import Player from '../../../packages/player'
import { DOMProps } from '../../../types'
import { SettingOptions } from '../setting/settingOption'
import { $, addClass, createSvg, includeClass, removeClass } from '../../../utils/dom'
import { confirmPath, screenShotPath } from '../../../svg'
import { storeControlComponent } from '../../store'

export class ScreenShot extends SettingOptions {
  readonly id = 'ScreenShot'

  confirmIcon: SVGSVGElement

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
    this.confirmIcon = createSvg(confirmPath, '0 0 1024 1024')
    addClass(this.el, ['video-screenshot', 'video-controller'])
    this.icon = createSvg(screenShotPath, '0 0 1024 1024')
    this.iconBox.appendChild(this.icon)
    this.hideBox.innerText = '截图'
  }

  initEvent() {
    this.onClick = this.onClick.bind(this)
    if (this.player.env === 'PC') {
      this.el.addEventListener('click', this.onClick)
    }
  }

  onClick(e: Event) {
    if (e instanceof Event) {
      e.stopPropagation()
    }
    if (!includeClass(this.icon, 'video-screenshot-animate')) {
      addClass(this.icon, ['video-screenshot-animate'])
      ;(this.icon as SVGSVGElement).ontransitionend = () => {
        removeClass(this.icon, ['video-screenshot-animate'])
        ;(this.icon as SVGSVGElement).ontransitionend = null
      }
    }
    this.screenShot()
  }

  /**
   * @description 进行截屏
   */
  screenShot() {
    const canvas = document.createElement('canvas')
    const video = this.player.video
    if (canvas) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const context = canvas.getContext('2d')
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
      }
    }

    const fileName = `${Math.random().toString(36).slice(-8)}_${video.currentTime}.png`
    try {
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob as Blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 'image/png')
    } catch {
      // ToDo
    }
    const dom = $('div.video-screenshot-toast')
    const span = $('span')
    span.innerText = '截图成功!'
    const icon = this.confirmIcon.cloneNode(true)
    dom.appendChild(icon)
    dom.appendChild(span)
  }
}
