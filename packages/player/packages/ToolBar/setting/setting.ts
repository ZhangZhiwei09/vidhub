import { createSvg, includeClass, removeClass } from '../../../utils/dom'
import Player from '../../../packages/player'
import { subSettingPath } from '../../../svg'
import { addClass } from '../../../utils/dom'
import { SettingMain } from './settingMain'
import { SubsettingsBaseConstructor } from '../../../types'
import { SettingBase } from './settingBase'
import { SettingOptions } from './settingOption'
import { storeControlComponent } from '../../../packages/store'

export class Setting extends SettingOptions {
  readonly id = 'Setting'

  settingsIcon: SVGSVGElement | string

  settingMain: SettingMain

  settingsBaseGraph: Map<SettingBase, SettingBase[] | null> = new Map()

  constructor(player: Player, container: HTMLElement, desc?: string) {
    super(player, container, 0, 0, desc)
    this.player = player
    this.init()
  }

  init() {
    this.initTemplate()
    this.initEvent()
    storeControlComponent(this)
  }

  initTemplate() {
    addClass(this.el, ['video-settings', 'video-controller'])
    addClass(this.hideBox, ['video-settings-set'])
    this.el['aria-label'] = '设置'
    this.settingsIcon = createSvg(subSettingPath, '0 0 1024 1024')
    this.iconBox.append(this.settingsIcon)
    this.el.appendChild(this.iconBox)
    this.el.appendChild(this.hideBox)
    this.initSubSettingBase()
  }

  initSubSettingBase() {
    this.settingMain = new SettingMain(this, this.player)
    this.registerSubsettingsBase(this.settingMain)
  }

  initEvent() {
    this.el.onmouseenter = null
    this.iconBox.addEventListener('click', (e: MouseEvent) => {
      if (e instanceof Event) {
        e.stopPropagation()
      }
      if (!includeClass(this.settingsIcon as SVGSVGElement, 'setting-animate')) {
        addClass(this.settingsIcon as SVGSVGElement, ['setting-animate'])
      } else {
        removeClass(this.settingsIcon as SVGSVGElement, ['setting-animate'])
      }

      if (!includeClass(this.hideBox, 'video-set-hidden')) {
        addClass(this.hideBox, ['video-set-hidden'])
      } else {
        removeClass(this.hideBox, ['video-set-hidden'])
      }
      this.player.emit('oneControllerHover', this)
    })
  }

  // 注册基础的子设置项
  registerSubsettingsBase(baseCons: SubsettingsBaseConstructor | SettingBase) {
    if (baseCons instanceof SettingBase) {
      this.hideBox.appendChild(baseCons.el)
    } else {
      const base = new baseCons(this, this.player)
      this.hideBox.appendChild(base.el)
    }
  }
}
