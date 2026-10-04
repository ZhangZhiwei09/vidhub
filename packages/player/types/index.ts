import { DutaionShow } from '../packages/ToolBar/controller/DutaionShow'
import { FullScreen } from '../packages/ToolBar/controller/fullScreen'
import { PlayButton } from '../packages/ToolBar/controller/playButton'
import { Volume } from '../packages/ToolBar/controller/volume'
import { Setting } from '../packages/ToolBar/setting/setting'
import { SettingBase } from '../packages/ToolBar/setting/settingBase'
import { SubsettingItem } from '../packages/ToolBar/setting/settingItem'
import { Component } from '../packages/component'
import Player from '../packages/player'
import { DanmakuBackendOptions, DanmakuConfig } from './danmaku'

export interface IVideoInfo {
  speed: number //速率
  currentTime: string //当前播放时间
  duration: string //视频时长
  volume: number //视频音量
}

export interface IVideo {
  url: string
  pic: string
  thumbnails: string
}

export interface PlayerOptions {
  element?: HTMLElement
  container: HTMLElement | null
  thumbnails?: Thumbnails
  videoProps?: Record<string, any>
  live?: boolean
  autoplay?: boolean
  theme?: string
  loop?: boolean
  hotkey?: boolean
  preload?: 'none' | 'metadata' | 'auto'
  volume?: number
  playbackSpeed?: number[]
  video: {
    url: string
    pic?: string
    thumbnails?: string
    type?: string
    customType?: any
  }
  contextmenu?: IContextMenu[]
  streamPlay?: boolean
  mutex?: boolean
  danmaku?: DanmakuConfig
  apiBackend?: {
    read: (option: DanmakuBackendOptions) => void
    send: (option: DanmakuBackendOptions) => void
  }
  [key: string]: any
}

export interface IContextMenu {
  key?: string
  text?: string
  link?: string
}

export type DOMProps = {
  className?: string[]
  id?: string
  style?: Partial<CSSStyleDeclaration>
  [props: string]: any
}

export interface ComponentConstructor {
  new (player: Player, container: HTMLElement, desc?: string): Component
}

// 描述的是Subsettings的上的Item的类型，也就是设置选项
export interface SubsettingsItem {
  leftIcon?: SVGSVGElement | HTMLElement
  leftText?: string
  rightTip?: string
  rightIcon?: SVGSVGElement | HTMLElement
  instance?: SubsettingItem //自身item对应的实例
  click?: (item: SubsettingsItem) => any
  target?: SettingBase | SubsettingsBaseConstructor //该item对应的点击后需要跳转的SubsettingsBase实例对象
}

// ComponentItem用于描述一个组件
export interface ComponentItem {
  id: string
  el: HTMLElement
  container?: HTMLElement
  props?: DOMProps
  [props: string]: any
}

export type ComponentMap = {
  PlayButton: PlayButton
  Volume: Volume
  FullScreen: FullScreen
  DutaionShow: DutaionShow
  Setting: Setting
  [props: string]: ComponentItem
}

export interface SubsettingsBaseConstructor {
  new (subsetting: Setting, player: Player): SettingBase

  instance?: SettingBase
}

export interface Thumbnails {
  row: number // 精灵图的行数
  col: number // 列数
  total: number // 精灵图的总数
  margin: number // 距离上下左右的像素大小
  source: string // 资源的地址
  interval: number //间隔时间
  width: number
  height: number
}

export type Track = {
  id: number
  priority: number
}

export type Video = {
  url?: string //视频的源地址
  volume?: number // 视频的音量
  time?: string // 视频的当前时间
  duration?: number // 视频的总时长
  frameRate?: number //视频的帧率 kps;
  brandRate?: number //视频的码率 bps
  videoCodec?: string //视频的编码方式
  audioCodec?: string // 音频的编码方式
  lastUpdateTime?: Date //视频最后一次更新时间
  isFragmented?: boolean //是否为fragmented类型的mp4文件
  width?: number //视频宽度上的分辨率（像素个数）
  height?: number // 视频高度上的分辨率（像素个数）
}

export interface Node {
  id: string
  el: HTMLElement
}
