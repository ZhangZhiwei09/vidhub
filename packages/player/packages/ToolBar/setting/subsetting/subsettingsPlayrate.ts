import { SubsettingsItem } from '../../../../types'
import { SettingBase } from '../settingBase'
import { $, createSvg } from '../../../../utils'
import { leftarrowPath, settingsConfirmPath } from '../../../../svg'
import { Setting } from '../setting'
import Player from '../../../../packages/player'
import { SettingMain } from '../settingMain'

export class SubsettingsPlayrate extends SettingBase {
  readonly SubsettingsItem: SubsettingsItem[] = [
    {
      leftIcon: createSvg(leftarrowPath, '0 0 1024 1024'),
      leftText: '播放速度',
      target: SettingMain
    },
    {
      leftText: '0.5',
      target: SettingMain
    },
    {
      leftText: '0.75',
      target: SettingMain
    },
    {
      leftIcon: createSvg(settingsConfirmPath),
      leftText: '正常',
      target: SettingMain
    },
    {
      leftText: '1.5',
      target: SettingMain
    },
    {
      leftText: '2',
      target: SettingMain
    }
  ]
  constructor(setting: Setting, player: Player) {
    super(setting, player)
    this.init()
  }

  init() {
    this.el = $('div.video-subsetting-playrate')
    this.el.dataset.width = '170'
    this.el.style.display = 'none'
    this.initSubsettingsItem()
    this.initEvent()
  }

  initSubsettingsItem() {
    this.initBaseSubsettingsItem()
  }

  initEvent() {
    this.SubsettingsItem.forEach((item) => {
      item.click = () => {
        if (item.leftText === '播放速度') {
          this.el.style.display = 'none'
          const instance = this.setting.settingsBaseGraph.get(this)?.[0]
          if (instance) {
            instance.el.style.display = ''
          }
          return
        } else {
          if (item.leftText === '正常') {
            this.player.video.playbackRate = 1
          } else {
            this.player.video.playbackRate = Number(item.leftText)
          }
        }
        item.leftIcon = createSvg(settingsConfirmPath)
        if (item.instance) {
          item.instance.leftIconBox.innerHTML = ''
          item.instance.leftIconBox.appendChild(item.leftIcon)
        }

        for (const another of this.SubsettingsItem) {
          if (another !== item && another.instance) {
            another.instance.leftIconBox.innerHTML = ''
          }
        }
        this.player.emit('changeRate', item.leftText)
      }
    })
  }
}
