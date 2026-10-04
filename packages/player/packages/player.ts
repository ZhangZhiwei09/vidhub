import { $, addClass, removeClass } from '../utils/dom'
import { Component } from './component'
import { BaseEvent } from './event'
import { Loading } from './Loading/loading'
import { setVideoAttrs, setVideoVolumeFromLocal } from '../utils/helper'
import { COMPONENT_STORE, HIDEEN_COMPONENT_STORE } from './store'
import type { ComponentItem, PlayerOptions } from '../types/index'
import { EVENT } from '../events/index'
import { ErrorLoading } from './Loading/error'
import { ToolBar } from './ToolBar/toolBar'
import { Setting } from './ToolBar/setting/setting'
import base64str from '../svg/base64'
import { Env } from '../utils/env'
import { getExtension } from '../utils/getExtension'
import { Danmaku } from './Danmaku/danmaku'
import { Mask } from './Loading/mask'

export default class Player extends Component implements ComponentItem {
  readonly id = 'Player'

  readonly options: PlayerOptions

  readonly video: HTMLVideoElement

  mask: Mask

  events: BaseEvent

  loading: Loading

  error: ErrorLoading

  toolBar: ToolBar

  setting: Setting

  danmaku: Danmaku

  containerWidth: number

  containerHeight: number

  baseSize = 16

  enableSeek = true

  isFullscreen = false

  type: string

  env = Env.env

  pauseIcon: HTMLElement

  private resizeObserver: ResizeObserver | null = null

  // 视频的长宽比例 默认为16： 9
  mediaProportion: number = 9 / 16

  get paused(): boolean {
    return this.video.paused
  }

  constructor(options: PlayerOptions) {
    super(options.container, 'div.wrapper')
    this.options = Object.assign(
      {
        autoPlay: false,
        streamPlay: false
      },
      options
    )
    this.container = options.container as HTMLElement
    this.containerHeight = (options.container as HTMLElement).clientHeight
    this.containerWidth = (options.container as HTMLElement).clientWidth
    this.events = new BaseEvent()
    this.video = $('video')
    this.video['playsinline'] = true
    // 设置播放器为H5播放器
    this.video['x5-video-player-type'] = 'h5'
    this.video.crossOrigin = 'anonymous'

    if (this.options.live) {
      addClass(this.container, ['live'])
    } else {
      removeClass(this.container, ['live'])
    }

    this.el.appendChild(this.video)
    //初始化播放源
    this.options?.video.url && this.attachSource(this.options.video.url)
    setVideoAttrs(this.video, this.options.videoProps)
    setVideoVolumeFromLocal(this.video)
    this.init()
  }

  init() {
    this.initVideo(this.video, this.options.video.type || 'auto')
    this.initTemplate()
    this.initComponent()
    this.initEvent()
    this.initResizeObserver()
  }

  initVideo(video: HTMLVideoElement, type: string) {
    this.type = type
    if (this.options.video.customType && this.options.video.customType[type]) {
      if (
        Object.prototype.toString.call(this.options.video.customType[type]) === '[object Function]'
      ) {
        this.options.video.customType[type](this.video, this)
      } else {
        console.error(`Illegal customType: ${type}`)
      }
    } else {
      if (this.type === 'auto') {
        if (/m3u8(#|\?|$)/i.exec(video.src)) {
          this.type = 'hls'
        } else if (/.flv(#|\?|$)/i.exec(video.src)) {
          this.type = 'flv'
        } else if (/.mpd(#|\?|$)/i.exec(video.src)) {
          this.type = 'dash'
        } else {
          this.type = 'normal'
        }
      }
    }
  }

  initTemplate() {
    this.pauseIcon = $('div.pauseIcon')
    const img: HTMLImageElement = $('img')
    img.src = base64str
    this.pauseIcon.append(img)
    this.pauseIcon.style.display = 'none'
    this.el.append(this.pauseIcon)
  }

  initComponent() {
    this.mask = new Mask(this, this.el, '你感兴趣的视频都在这')
    this.loading = new Loading(this, this.el, '视频姬正在努力加载中(⑅˃◡˂⑅)')
    this.error = new ErrorLoading(this, this.el, '你的网络罢工了')
    this.toolBar = new ToolBar(this, this.el, 'div')
    if (this.options?.danmaku?.open) {
      this.danmaku = new Danmaku(this, {
        api: {
          address: this.options.danmaku.api
        },
        time: () => this.video.currentTime,
        callback: () => {
          console.log('callback执行')
        },
        error: () => {
          console.log('error')
        },
        apiBackend: this.options.apiBackend
      })
    }
  }

  initEvent() {
    if (this.env === 'Mobile') {
      this.initMobileEvent()
    } else {
      this.initPCEvent()
    }

    this.video.addEventListener('loadedmetadata', (e) => {
      this.emit(EVENT.LOADED_META_DATA, e)
      this.adjustMediaSize()
    })

    this.video.addEventListener('timeupdate', (e) => {
      this.emit(EVENT.TIME_UPDATE, e)
    })

    this.video.addEventListener('play', (e) => {
      this.pauseIcon.style.display = 'none'
      this.danmaku.play()
      this.emit(EVENT.PLAY, e)
    })

    this.video.addEventListener('pause', (e) => {
      this.pauseIcon.style.display = ''
      this.danmaku.pause()
      this.emit(EVENT.PAUSE, e)
    })

    this.video.addEventListener('seeking', (e) => {
      if (this.enableSeek) {
        this.emit(EVENT.SEEKING, e)
      }
    })

    this.video.addEventListener('seeked', (e) => {
      this.emit(EVENT.SEEKED, e)
    })

    this.video.addEventListener('waiting', (e) => {
      this.emit(EVENT.WAITING, e)
    })

    this.video.addEventListener('canplay', (e) => {
      this.emit(EVENT.CAN_PLAY, e)
    })

    this.video.addEventListener('error', () => {
      this.emit(EVENT.ERROR)
    })

    this.video.addEventListener('abort', () => {
      this.emit(EVENT.ERROR)
    })

    this.video.addEventListener('ratechange', () => {
      this.emit(EVENT.RATE_CHANGE)
    })

    this.on(EVENT.DANMAKU_INPUT_FOCUS, () => {
      this.el.onmouseleave = null
    })

    this.on(EVENT.DANMAKU_INPUT_BLUR, () => {
      this.el.onmouseleave = (e) => {
        this.emit(EVENT.HIDE_TOOLBAR, e)
      }
    })

    this.on(EVENT.DOT_DOWN, () => {
      this.enableSeek = false
    })

    this.on(EVENT.DOT_UP, () => {
      this.enableSeek = true
    })

    this.on(EVENT.VIDEO_DOT_DRAG, (e: Event) => {
      this.emit(EVENT.SHOW_TOOLBAR, e)
    })

    this.on(EVENT.ENTER_FULLSCREEN, () => {
      this.isFullscreen = true
      this.adjustRem(this.el.clientWidth)
    })

    this.on(EVENT.LEAVE_FULLSCREEN, () => {
      this.isFullscreen = false
      this.adjustRem()
    })

    this.on(EVENT.ENTER_FULLPAGE, () => {
      this.adjustRem(this.el.clientWidth)
    })

    this.on(EVENT.LEAVE_FULLPAGE, () => {
      this.adjustRem()
    })

    this.on(EVENT.HIDE_TOOLBAR, () => {
      this.container.style.cursor = 'none'
      this.el.style.cursor = 'none'
    })

    this.on(EVENT.SHOW_TOOLBAR, () => {
      this.container.style.cursor = ''
      this.el.style.cursor = ''
    })

    // 键盘事件
    document.addEventListener('keyup', (e) => {
      switch (e.key) {
        case 'ArrowRight':
          if (this.video.paused) this.video.play()
          if (this.video.currentTime + 5 <= this.video.duration) {
            this.video.currentTime += 5
          }
          break
        case 'ArrowLeft':
          if (this.video.paused) this.video.play()
          if (this.video.currentTime - 5 >= 0) {
            this.video.currentTime -= 5
          }
          break
        case '':
          if (this.isFullscreen) {
            if (this.video.played) {
              this.video.pause()
            } else {
              this.video.play()
            }
          }
          break
      }
    })
  }

  initPCEvent() {
    this.el.onclick = () => {
      if (this.video.paused) {
        this.video.play()
      } else if (this.video.played) {
        this.video.pause()
      }
    }
    //移入移除控制栏
    this.el.onmousemove = (e) => {
      this.emit(EVENT.SHOW_TOOLBAR, e)
    }

    this.el.onmouseenter = (e) => {
      this.emit(EVENT.SHOW_TOOLBAR, e)
    }

    this.el.onmouseleave = (e) => {
      if (!this.video.paused) this.emit(EVENT.HIDE_TOOLBAR, e)
    }
  }

  attachSource(url: string) {
    const extension = getExtension(url)
    this.emit(EVENT.SOURCE_ATTACHED, url)
    if (extension === 'mp4' && this.options.streamPlay) {
      // new Mp4Parser(url, this)
      // // 是否启动流式播放
      // new Mp4MediaPlayer(url, this)
    } else {
      this.video.src = url
    }
  }

  /**
   * @@description 监听视频播放器大小的变化
   */
  initResizeObserver() {
    const resizeObserver = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width
      const height = entries[0].contentRect.height

      // 触发尺寸变化事件
      this.emit(EVENT.RESIZE, {
        width,
        height
      })

      this.adjustMediaSize()
      if (width <= 500) {
        COMPONENT_STORE.forEach((_, key) => {
          if (['Playrate', 'ScreenShot', 'Setting', 'VideoShot'].indexOf(key) !== -1) {
            if (!HIDEEN_COMPONENT_STORE.get(key)) {
              this.hideComponent(key)
            }
          }
        })
      } else {
        // 展示之前隐藏的组件
        HIDEEN_COMPONENT_STORE.forEach((value, key) => {
          this.showComponent(key)
        })
      }
    })

    resizeObserver.observe(this.el)
    this.resizeObserver = resizeObserver
  }

  destroy() {
    this.video.pause()
    this.video.removeAttribute('src')
    this.video.load()
    this.danmaku?.destroy()
    this.resizeObserver?.disconnect()
    this.resizeObserver = null
    this.el.remove()
    COMPONENT_STORE.clear()
    HIDEEN_COMPONENT_STORE.clear()
  }

  // 展示一个隐藏的组件
  showComponent(id: string) {
    if (!HIDEEN_COMPONENT_STORE.get(id)) {
      throw new Error('该元素已经隐藏')
    }
    if (!COMPONENT_STORE.get(id)) {
      throw new Error('该元素不存在或者被卸载')
    }

    const instance = COMPONENT_STORE.get(id) as ComponentItem
    instance.el.style.display = ''
    HIDEEN_COMPONENT_STORE.delete(id)
  }

  //隐藏某一个已经挂载到视图上的组件
  hideComponent(id: string) {
    if (!COMPONENT_STORE.get(id)) {
      throw new Error('无法隐藏一个未挂载在视图上的组件')
    }
    if (HIDEEN_COMPONENT_STORE.get(id)) {
      throw new Error('该元素已经隐藏')
    }
    const instance = COMPONENT_STORE.get(id) as ComponentItem
    instance.el.style.display = 'none'
    HIDEEN_COMPONENT_STORE.set(id, instance)
  }

  // 设置根节点的fontsize大小以便于做移动端适配 -> rem
  private adjustRem(width = 600) {
    console.log('调整rem大小', width)
    const scale = width / 600
    let number = 1
    if (scale > 1.75) {
      number = 1.25
    }
    document.documentElement.style.fontSize = this.baseSize * number + 'px'
  }

  //调整video的尺寸
  private adjustMediaSize() {
    if (this.mediaProportion !== 0) {
      if (this.el.clientHeight / this.el.clientWidth > this.mediaProportion) {
        this.video.style.width = '100%'
        this.video.style.height =
          this.el.clientWidth * this.mediaProportion + 0.05 * this.el.clientWidth + 'px'
      } else {
        this.video.style.width = this.el.clientHeight / this.mediaProportion + 'px'
        this.video.style.height = '100%'
      }
    }
  }

  resize() {
    if (this.danmaku) {
      this.danmaku.resize()
    }
    this.emit('resize')
  }
}
