import { $ } from '../../../utils/dom'
import { Component } from '../../component'
import { PlayButton } from './playButton'
import { ComponentConstructor, ComponentItem } from '../../../types'
import Player from '../../player'
import { Volume } from './volume'
import { DutaionShow } from './DutaionShow'
import { DanmakuSwitch } from '../../../packages/Danmaku/danmakuSwitch'
import { DanmakuInput } from '../../../packages/Danmaku/danmakuInput'
import { FullScreen } from './fullScreen'
import { Setting } from '../setting/setting'
import { ScreenShot } from './screenShot'
import { PicInPic } from './picInPic'
import { DanmakuSetting } from '../../../packages/Danmaku/danmakuSetting'

export class Controller extends Component implements ComponentItem {
  readonly id = 'Controller'

  player: Player

  bottombar: HTMLElement

  leftArea: HTMLElement

  mediumArea: HTMLElement

  rightArea: HTMLElement

  leftControllers: ComponentConstructor[] = [PlayButton, Volume, DutaionShow]

  centerControllers: ComponentConstructor[] = [DanmakuSwitch, DanmakuSetting, DanmakuInput]

  rightController: ComponentConstructor[] = [Setting, ScreenShot, PicInPic, FullScreen]

  constructor(container: HTMLElement, player: Player, desc?: string) {
    super(container, desc)
    this.player = player
    this.init()
    this.initControlComponent()
  }

  init() {
    this.leftArea = $('div.video-bottombar-left')
    this.mediumArea = $('div.video-bottombar-medium')
    this.rightArea = $('div.video-bottombar-right')
    this.el.append(this.leftArea, this.mediumArea, this.rightArea)
  }

  initControlComponent() {
    this.leftControllers.forEach((Component) => {
      new Component(this.player, this.leftArea, 'div')
    })

    this.centerControllers.forEach((Component) => {
      new Component(this.player, this.mediumArea, 'div')
    })

    this.rightController.forEach((Component) => {
      new Component(this.player, this.rightArea, 'div')
    })
  }
}
