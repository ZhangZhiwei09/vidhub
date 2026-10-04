import Player from '../player'
import { $, colorToNumber, numberToColor, numberToType } from '../../utils'
import { addClass, removeClass } from '../../utils/dom'
import { DanmakuData, DanmakuOptions, DanmakuTunnel } from '../../types/danmaku'

export class Danmaku {
  private player: Player

  private options: DanmakuOptions

  private danTunnel: DanmakuTunnel

  private danIndex: number

  private dan: DanmakuData[]

  private showing: boolean

  private paused = false

  private destroyed = false

  private rafId = 0

  private el: HTMLElement

  private container: HTMLElement

  private danmakuLoading: HTMLElement

  private theme = '#b7daff'

  constructor(player: Player, options: DanmakuOptions) {
    this.player = player
    this.options = options
    this.danTunnel = {
      right: {},
      top: {},
      bottom: {}
    }
    this.danIndex = 0
    this.dan = []
    this.showing = true
    this.container = player.el
    // this._opacity = this.options.opacity
    this._measure('')
    this.init()
    this.load()
  }

  init() {
    this.initTemplate()
    this.initEvent()
  }

  load() {
    const apiurl = this.options.api.address
    const endpoints = (this.options.api.addition || []).slice(0)
    endpoints.push(apiurl)
    this._readAllEndpoints(endpoints, (results) => {
      if (this.destroyed) return
      this.dan = ([] as DanmakuData[]).concat(...results).sort((a, b) => a.time - b.time)
      this.rafId = window.requestAnimationFrame(() => {
        this.frame()
      })
    })
  }

  _readAllEndpoints(endpoints, callback) {
    const results: any = []
    let readCount = 0
    for (let i = 0; i < endpoints.length; ++i) {
      this.options.apiBackend?.read({
        url: endpoints[i],
        success: (data) => {
          this.el.style.backgroundColor = ''
          this.danmakuLoading.childNodes[0].textContent = '弹幕加载成功'
          removeClass(this.danmakuLoading, ['video-danmaku-loading', 'video-danmaku-shaking'])
          setTimeout(() => {
            addClass(this.danmakuLoading, ['video-danmaku-loading-hide'])
          }, 3000)
          results[i] = data
          ++readCount
          if (readCount === endpoints.length) {
            callback(results)
          }
        },
        error: () => {
          removeClass(this.danmakuLoading, ['video-danmaku-loading', 'video-danmaku-shaking'])
          setTimeout(() => {
            addClass(this.danmakuLoading, ['video-danmaku-loading-hide'])
          }, 3000)
          this.options.error()
          results[i] = []
          ++readCount
          if (readCount === endpoints.length) {
            callback(results)
          }
        }
      })
    }
  }

  frame() {
    if (this.dan.length && !this.paused && this.showing) {
      let item = this.dan[this.danIndex]
      const dan = [] as DanmakuData[]
      while (item && this.options.time() > parseFloat(item.time + '')) {
        dan.push(item)
        item = this.dan[++this.danIndex]
      }
      this.draw(dan)
    }
    if (this.destroyed) return
    this.rafId = window.requestAnimationFrame(() => {
      this.frame()
    })
  }

  destroy() {
    this.destroyed = true
    this.paused = true
    if (this.rafId) window.cancelAnimationFrame(this.rafId)
    this.clear()
  }

  draw(dan) {
    if (this.showing) {
      const itemHeight = 24
      //播放器的宽度，高度
      const danWidth = this.container.clientWidth
      const danHeight = this.container.clientHeight
      //可容纳多少行弹幕
      const itemY = danHeight / itemHeight
      //计算弹幕元素右侧位置
      const danItemRight = (ele) => {
        const eleWidth = ele.offsetWidth || parseInt(ele.style.width)
        const eleRight =
          ele.getBoundingClientRect().right || this.el.getBoundingClientRect().right + eleWidth
        return this.el.getBoundingClientRect().right - eleRight
      }
      //弹幕速度
      const danSpeed = (width) => (danWidth + width) / 5

      const getTunnel = (ele, type, width?) => {
        //弹幕走完轨道所需时间
        const tmp = danWidth / danSpeed(width)
        for (let i = 0; i < itemY; i++) {
          //获取轨道上已有的弹幕
          const item = this.danTunnel[type][i + '']
          if (item && item.length) {
            //不是滚动类型的弹幕则跳过
            if (type !== 'right') {
              continue
            }
            //遍历滚动弹幕
            for (let j = 0; j < item.length; j++) {
              const danRight = danItemRight(item[j]) - 10
              //如果右侧位置小于轨道宽度，则跳出循环
              if (
                danRight <= danWidth - tmp * danSpeed(parseInt(item[j].style.width)) ||
                danRight <= 0
              ) {
                break
              }
              //如果遍历到到最后一个弹幕，则将新的弹幕添加到当前轨道
              if (j === item.length - 1) {
                this.danTunnel[type][i + ''].push(ele)
                //监听新弹幕的动画结束事件，从当前轨道中删除该弹幕
                ele.addEventListener('animationend', () => {
                  this.danTunnel[type][i + ''].splice(0, 1)
                })
                //返回当前轨道在总轨道数量中的索引，确保新弹幕插入到合适的轨道
                return i % itemY
              }
            }
          } else {
            //如果当前轨道上没有弹幕，将新的弹幕添加到当前轨道
            this.danTunnel[type][i + ''] = [ele]
            ele.addEventListener('animationend', () => {
              this.danTunnel[type][i + ''].splice(0, 1)
            })
            return i % itemY
          }
        }
        //如果没有找到适合的轨道，则返回-1
        return -1
      }

      if (Object.prototype.toString.call(dan) !== '[object Array]') {
        dan = [dan]
      }

      const docFragment = document.createDocumentFragment()

      for (let i = 0; i < dan.length; i++) {
        //转换弹幕类型
        dan[i].type = numberToType(dan[i].type)
        if (!dan[i].color) {
          dan[i].color = 16777215
        }
        const item = $('div')
        addClass(item, ['danmaku-item', `danmaku-${dan[i].type}`])
        if (dan[i].border) {
          item.innerHTML = `<span style="border:${dan[i].border}">${dan[i].text}</span>`
        } else {
          item.innerHTML = dan[i].text
        }
        //转换弹幕颜色
        item.style.color = numberToColor(dan[i].color)
        //弹幕动画事件完成，移除弹幕
        item.addEventListener('animationend', () => {
          this.el.removeChild(item)
        })
        const itemWidth = this._measure(dan[i].text)
        let tunnel
        // adjust
        switch (dan[i].type) {
          //滚动弹幕
          case 'right':
            tunnel = getTunnel(item, dan[i].type, itemWidth)
            if (tunnel >= 0) {
              item.style.width = itemWidth + 1 + 'px'
              item.style.top = itemHeight * tunnel + 'px'
              item.style.transform = `translateX(-${danWidth}px)`
            }
            break
          //顶部弹幕
          case 'top':
            tunnel = getTunnel(item, dan[i].type)
            if (tunnel >= 0) {
              item.style.top = itemHeight * tunnel + 'px'
            }
            break
          case 'bottom':
            tunnel = getTunnel(item, dan[i].type)
            if (tunnel >= 0) {
              item.style.bottom = itemHeight * tunnel + 'px'
            }
            break
          default:
            console.error(`Can't handled danmaku type: ${dan[i].type}`)
        }

        if (tunnel >= 0) {
          item.classList.add('wplayer-danmaku-move')
          item.style.animationDuration = this._danAnimation(dan[i].type)
          docFragment.appendChild(item)
        }
      }

      this.el.appendChild(docFragment)
      return docFragment
    }
  }

  send(dan, callback?) {
    const danmakuData = {
      time: this.options.time(),
      text: dan.text,
      color: dan.color,
      type: dan.type
    }
    this.options.apiBackend?.send({
      url: this.options.api.address,
      data: danmakuData,
      success: callback,
      error: () => {
        this.options.error()
      }
    })

    this.dan.splice(this.danIndex, 0, danmakuData)
    this.danIndex++
    const danmaku = {
      text: this.htmlEncode(danmakuData.text),
      border: `2px solid ${this.theme}`,
      color: danmakuData.color,
      type: danmakuData.type
    }
    this.draw(danmaku)
  }

  _measure(text) {
    const canvas = document.createElement('canvas').getContext('2d')
    return canvas!.measureText(text).width
  }

  play() {
    addClass(this.el, ['playing'])
    removeClass(this.el, ['paused'])
    this.paused = false
  }

  pause() {
    addClass(this.el, ['paused'])
    removeClass(this.el, ['playing'])
    this.paused = true
  }

  htmlEncode(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2f;')
  }

  resize() {
    const danWidth = this.container.clientWidth
    const items = this.container.getElementsByClassName('wplayer-danmaku-item')
    for (let i = 0; i < items.length; i++) {
      const dom = items[i] as HTMLElement
      dom.style.transform = `translateX(-${danWidth}px)`
    }
  }

  seek() {
    this.clear()
    for (let i = 0; i < this.dan.length; i++) {
      if (this.dan[i].time >= this.options.time()) {
        this.danIndex = i
        break
      }
      this.danIndex = this.dan.length
    }
  }

  show() {
    this.seek()
    this.showing = true
    this.play()
  }

  hide() {
    this.showing = false
    this.pause()
    this.clear()
  }

  clear() {
    this.danTunnel = {
      right: {},
      top: {},
      bottom: {}
    }
    this.danIndex = 0
    this.el.innerHTML = ''
  }

  _danAnimation(position) {
    const rate = this.options.api.speedRate || 1
    const isFullScreen = !!this.player.isFullscreen
    const animations = {
      top: `${(isFullScreen ? 6 : 4) / rate}s`,
      right: `${(isFullScreen ? 8 : 5) / rate}s`,
      bottom: `${(isFullScreen ? 6 : 4) / rate}s`
    }
    return animations[position]
  }

  initTemplate() {
    this.el = $('div.video-danmaku-container')
    this.el.style.backgroundColor = '#000'
    this.danmakuLoading = $('div')
    addClass(this.danmakuLoading, [
      'video-danmaku-loading-base',
      'video-danmaku-loading',
      'video-danmaku-shaking'
    ])
    this.danmakuLoading.innerHTML = '<span>弹幕数据加载中...</span>'
    this.container.appendChild(this.el)
    this.el.appendChild(this.danmakuLoading)
  }

  initEvent() {
    this.player.on('seeking', () => {
      this.seek()
    })

    // 此处为发送弹幕的逻辑
    this.player.on('sendData', (data: string) => {
      const list = document.querySelectorAll('input:checked') as unknown as HTMLElement
      const color = list[0].value
      const type = list[1].value
      if (!data) return
      this.send(
        {
          text: data,
          color: colorToNumber(color),
          type: parseInt(type)
        },
        () => {
          console.log('弹幕发送成功')
        }
      )
    })
  }
}
