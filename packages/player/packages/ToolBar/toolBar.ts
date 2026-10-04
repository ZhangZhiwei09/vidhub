import { addClass, includeClass, removeClass } from '../../utils/dom'
import { Component } from '../component'
import Player from '../player'
import { MediumBar } from '../MediumBar/mediumBar'
import { Controller } from './controller/controller'
import { ComponentItem, DOMProps } from '../../types'
import { EVENT } from '../../events'
import { storeControlComponent } from '../store'

export class ToolBar extends Component implements ComponentItem {
  readonly id = 'Toolbar'

  props: DOMProps

  player: Player

  toolbar: HTMLElement

  mediumbar: MediumBar

  controller: Controller

  status: 'show' | 'hidden' = 'hidden'

  private timer: number | null = 0

  constructor(
    player: Player,
    container: HTMLElement,
    desc?: string,
    props?: DOMProps,
    children?: Node[]
  ) {
    super(container, desc, props, children)
    this.player = player
    this.props = props || {}
    this.init()
  }

  init() {
    this.initTemplate()
    this.initComponent()
    this.initEvent()
    storeControlComponent(this)
  }

  initTemplate() {
    addClass(this.el, ['video-toolbar'])
  }

  initComponent() {
    this.mediumbar = new MediumBar(this.el, this.player, 'div.video-mediumbar')
    this.controller = new Controller(this.el, this.player, 'div.video-bottombar')
  }

  initEvent() {
    this.player.on(EVENT.SHOW_TOOLBAR, () => {
      this.onShowToolBar()
    })

    this.player.on(EVENT.HIDE_TOOLBAR, () => {
      this.onHideToolBar()
    })
  }

  private hideToolBar() {
    if (!includeClass(this.el, 'video-toolbar-hidden') && !this.player.video.paused) {
      addClass(this.el, ['video-toolbar-hidden'])
      this.status = 'hidden'
    }
  }

  private showToolBar() {
    if (includeClass(this.el, 'video-toolbar-hidden')) {
      removeClass(this.el, ['video-toolbar-hidden'])
      this.status = 'show'
    }

    this.timer = window.setTimeout(() => {
      if (!this.player.video.paused) this.hideToolBar()
    }, 3000)
  }

  onShowToolBar() {
    if (this.timer) {
      window.clearTimeout(this.timer)
      this.timer = null
    }
    this.showToolBar()
  }

  onHideToolBar() {
    this.hideToolBar()
  }
}
