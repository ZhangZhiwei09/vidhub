import { DOMProps } from '../types'
import { $, addClass } from '../utils/dom'
import { BaseEvent } from './event'

export class Component extends BaseEvent {
  el: HTMLElement //el代表着该组件对应的整个HTML元素

  container: HTMLElement

  constructor(
    container?: HTMLElement | null,
    desc?: string,
    props?: DOMProps,
    children?: string | Node[]
  ) {
    super()
    const dom = $(desc, props, children)
    this.el = dom
    if (container) {
      this.container = container
    }
    if (props) {
      if (props.id) this.el.id = props.id
      if (props.className) addClass(this.el, props.className)
      if (props.style) {
        for (const key in props.style) {
          this.el.style[key] = props.style[key] as string
        }
      }
    }
    // 安装组件成功
    if (container) {
      container.appendChild(dom)
    }
  }

  init() {}
  initEvent() {}
  initPCEvent() {}
  initMobileEvent() {}
  initTemplate() {}
  initPCTemplate() {}
  initMobileTemplate() {}
  initComponent() {}
  resetEvent() {}
  // 销毁组件
  dispose() {}
}
