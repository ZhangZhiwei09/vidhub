import { $, createSvg, createSvgs } from '../../../utils/dom'
import { SettingBase } from './settingBase'
import {
  flipPath,
  playratePath,
  propotionPath$1,
  propotionPath$2,
  rightarrowPath
} from '../../..//svg'
import { SubsettingsItem } from '../../../types'
import { Setting } from './setting'
import Player from '../../../packages/player'
import { SubsettingsPlayrate } from './subsetting/subsettingsPlayrate'

export class SettingMain extends SettingBase {
  SubsettingsItem: SubsettingsItem[] = [
    {
      leftIcon: createSvg(playratePath, '0 0 1024 1024'),
      leftText: '播放速度',
      rightTip: '正常',
      rightIcon: createSvg(rightarrowPath, '0 0 1024 1024'),
      target: SubsettingsPlayrate
    },
    {
      leftIcon: createSvgs([propotionPath$1, propotionPath$2], '0 0 1024 1024'),
      leftText: '画面比例',
      rightTip: '默认',
      rightIcon: createSvg(rightarrowPath, '0 0 1024 1024')
    },
    {
      leftIcon: createSvg(flipPath, '0 0 1024 1024'),
      leftText: '画面翻转',
      rightTip: '正常',
      rightIcon: createSvg(rightarrowPath, '0 0 1024 1024')
    }
  ]

  constructor(setting: Setting, player: Player) {
    super(setting, player)
    this.init()
  }

  init() {
    this.initTemplate()
    this.initSubsettingsItem()
    this.initEvent()
  }

  initTemplate() {
    this.el = $('div.video-setting-main')
    this.el.dataset.width = '200'
    this.setting.hideBox.style.width =
      parseInt(this.el.dataset.width) / this.player.baseSize + 'rem'
  }

  initSubsettingsItem() {
    this.initBaseSubsettingsItem()
  }

  initEvent() {
    this.player.on('changeRate', (e: string) => {
      if (this.SubsettingsItem[0].instance) {
        this.SubsettingsItem[0].instance.rightTipBox.innerHTML = e
      }
    })
  }
}
