import Player from '../../../packages/player'
import { Setting } from './setting'
import { SubsettingsBaseConstructor, SubsettingsItem } from '../../../types'
import { SubsettingItem } from './settingItem'
import { BaseEvent } from '../../../packages/event'

export class SettingBase extends BaseEvent {
  readonly id = 'SettingBase'

  el: HTMLElement

  player: Player

  setting: Setting

  container: HTMLElement

  settingBox: HTMLElement

  settingsIcon: SVGSVGElement | string

  SubsettingsItem: SubsettingsItem[]

  constructor(setting: Setting, player: Player) {
    super()
    this.player = player
    this.setting = setting
    ;(this as any).__proto__.constructor.instance = this
  }

  initBaseSubsettingsItem() {
    this.SubsettingsItem.forEach((item) => {
      this.registerSubsettingsItem(item)
      if (item.instance) {
        item.instance.el.dataset.SubsettingsSubtitleType = item.leftText
      }
    })
  }

  registerSubsettingsItem(item: SubsettingsItem) {
    let base: SettingBase | null = null
    if (item.target) {
      if (item.target instanceof SettingBase) {
        base = item.target
      } else {
        if ((item.target as SubsettingsBaseConstructor).instance) {
          base = (item.target as SubsettingsBaseConstructor).instance as SettingBase
        } else {
          base = new item.target(this.setting, this.player)
        }
      }
      this.setting.registerSubsettingsBase(base)

      if (!this.setting.settingsBaseGraph.has(this)) {
        this.setting.settingsBaseGraph.set(this, [base])
      } else {
        const res = this.setting.settingsBaseGraph.get(this)
        if (res) {
          !res.includes(base) && res.push(base)
          this.setting.settingsBaseGraph.set(this, res)
        }
      }
    }

    if (!this.SubsettingsItem.includes(item)) this.SubsettingsItem.push(item)

    const instance = new SubsettingItem(
      this.player,
      item.leftIcon,
      item.leftText,
      item.rightTip,
      item.rightIcon
    )

    item.instance = instance
    this.el.appendChild(instance.el)

    instance.el.addEventListener('click', (e: MouseEvent) => {
      if (e instanceof MouseEvent) {
        e.stopPropagation()
      }
      if (item.target) {
        this.el.style.display = 'none'
        if (base) {
          base.el.style.display = ''
          this.setting.hideBox.style.width = base.el.dataset.width
            ? Number(base.el.dataset.width) / this.player.baseSize + 'rem'
            : 200 / this.player.baseSize + 'rem'
        }
      }
      if (item.click) item.click(item)
    })
  }
}
