import { $ } from '../../utils/dom'
import { Component } from '../../packages/component'
import Player from '../../packages/player'
import { ComponentItem } from '../../types'
import { EVENT } from '../../events'

export class Progress extends Component implements ComponentItem {
  id = 'Progress'

  player: Player

  dot: HTMLElement

  completedProgress: HTMLElement

  bufferProgress: HTMLElement

  mouseX = 0

  dotLeft = 0

  constructor(player: Player, container?: HTMLElement, desc?: string) {
    super(container, desc)
    this.player = player
    this.initBase()
  }

  initBase() {
    this.initBaseTemplate()
    this.initBaseEvent()
  }

  initBaseTemplate() {
    this.dot = $('div')
    this.completedProgress = $('div')
    this.bufferProgress = $('div')
    this.el.append(this.dot, this.completedProgress, this.bufferProgress)
  }

  initBaseEvent() {
    this.onMouseMove = this.onMouseMove.bind(this)
    this.initBasePCEvent()
    this.player.on(EVENT.PROGRESS_CLICK, (dx: number) => {
      let scale = dx / this.el.clientWidth
      if (scale < 0) {
        scale = 0
      } else if (scale > 1) {
        scale = 1
      }
      this.dot.style.left = `calc(${scale * 100}% - 6px)`
      this.completedProgress.style.width = scale * 100 + '%'
    })

    this.on(EVENT.DOT_DRAG, (dx: number) => {
      let scale = (dx + this.dotLeft) / this.el.clientWidth
      if (scale < 0) {
        scale = 0
      } else if (scale > 1) {
        scale = 1
      }
      this.dot.style.left = `calc(${scale * 100}% - 6px)`
      this.completedProgress.style.width = scale * 100 + '%'
    })
  }

  initBasePCEvent() {
    this.el.onmouseenter = (e: Event) => {
      this.el.style.height = '8px'
      this.emit(EVENT.PROGRESS_MOUSE_ENTER, e, this)
    }

    this.el.onmouseleave = (e: Event) => {
      this.el.style.height = ''
      this.emit(EVENT.PROGRESS_MOUSE_LEAVE, e, this)
    }

    this.el.onclick = (e: MouseEvent) => {
      e.stopPropagation()
      this.player.emit(EVENT.PROGRESS_CLICK, e.offsetX, this)
    }

    this.dot.addEventListener('mousedown', (e: MouseEvent) => {
      e.stopPropagation()
      this.emit(EVENT.DOT_DOWN)
      this.mouseX = e.pageX
      document.body.addEventListener('mousemove', this.onMouseMove)

      document.body.onmouseup = () => {
        this.emit(EVENT.DOT_UP, this.completedProgress.clientWidth / this.el.clientWidth, this)
        document.body.removeEventListener('mousemove', this.onMouseMove)
        document.body.onmouseup = null
      }
    })
  }

  onMouseMove(e: MouseEvent | TouchEvent) {
    console.log(e)
    if (e instanceof MouseEvent) {
      const dx = e.pageX - this.mouseX
      this.emit(EVENT.DOT_DRAG, dx, this)
    } else {
      const dx = e.touches[0].clientX - this.mouseX
      this.emit(EVENT.DOT_DRAG, dx, this)
    }
  }
}
