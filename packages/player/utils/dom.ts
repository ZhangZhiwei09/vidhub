import { isString } from './is'
import { CLASS_PREFIX } from '../constants'
import { getDOMPoint } from './math'

const SELECTOR_REGEX = /([\w-]+)?(?:#([\w-]+))?((?:\.(?:[\w-]+))*)/

export function $<T extends HTMLElement>(
  desc?: string,
  attrs?: { [key: string]: any },
  children?: string | Array<Node>,
  classPrefix = CLASS_PREFIX
): T {
  let match: string[] = []

  if (desc) match = SELECTOR_REGEX.exec(desc) || []

  const el = document.createElement(match[1] || 'div')

  if (match[2]) el.id = match[3]
  if (match[3]) el.className = match[3].replace(/\./g, ` ${classPrefix}`).trim()

  if (attrs) {
    Object.keys(attrs).forEach((name) => {
      const value = attrs[name]
      if (value === undefined) return

      if (/^on\w+$/.test(name)) {
        (el as any)[name] = value
      } else if (name === 'selected') {
        if (value) {
          el.setAttribute(name, 'true')
        }
      } else {
        el.setAttribute(name, value)
      }
    })
  }

  if (children) {
    if (isString(children)) {
      el.innerHTML = children
    } else {
      children.forEach((c) => el.appendChild(c))
    }
  }

  return el as T
}

export function addClass(dom: Element, classNames: string[], prefix = CLASS_PREFIX) {
  const classList = classNames.map((name) => `${prefix}${name}`)
  for (const name of classList) {
    if (!includeClass(dom, name)) {
      dom.classList.add(name)
    }
  }
}

const svgNS = 'http://www.w3.org/2000/svg'
export function createSvg(d?: string, viewBox = '0 0 24 24'): SVGSVGElement {
  const svg = document.createElementNS(svgNS, 'svg')
  svg.setAttribute('viewBox', viewBox)
  if (d) {
    const path = document.createElementNS(svgNS, 'path')
    path.setAttributeNS(null, 'd', d)
    svg.appendChild(path)
  }
  return svg
}

export function createSvgs(d: string[], viewBox = '0 0 24 24'): SVGSVGElement {
  const svg = document.createElementNS(svgNS, 'svg')
  svg.setAttribute('viewBox', viewBox)
  for (const str of d) {
    const path = document.createElementNS(svgNS, 'path')
    path.setAttributeNS(null, 'd', str)
    svg.appendChild(path)
  }
  return svg
}

export function includeClass(dom: Element, className: string): boolean {
  className = `${CLASS_PREFIX}${className}`
  const classList = dom.classList
  for (const key in classList) {
    if (classList[key] === className) return true
  }
  return false
}

export function removeClass(dom: Element, classNames: string[]) {
  const classList = classNames.map((name) => `${CLASS_PREFIX}${name}`)
  dom.classList.remove(...classList)
}

export function toggleClass(element: HTMLElement, className: string) {
  if (element.classList.contains(className)) {
    element.classList.remove(className)
  } else {
    element.classList.add(className)
  }
}

/**
 * @description 查看当前的鼠标位置是否在父元素和绝对定位的子元素的组合范围内，如果超出则返回false
 * @param parent
 * @param topChild
 * @param pageX
 * @param pageY
 * @returns {boolean}
 */
export function checkIsMouseInRange(
  parent: HTMLElement,
  topChild: HTMLElement,
  bottom: number,
  pageX: number,
  pageY: number
) {
  const { x, y } = getDOMPoint(parent)
  const allTop = y - bottom - topChild.clientHeight
  const allBottom = y + parent.clientHeight
  const allLeft = x + Math.round(parent.clientWidth / 2) - Math.round(topChild.clientWidth / 2)
  const allRight = x + Math.round(parent.clientWidth / 2) + Math.round(topChild.clientWidth / 2)
  const parentLeft = x
  const parentRight = x + parent.clientWidth
  if (pageX >= allLeft && pageX <= allRight && pageY <= y && pageY >= allTop) return true
  if (
    pageX >= parentLeft - 5 &&
    pageX <= parentRight + 5 &&
    pageY >= y - 5 &&
    pageY <= allBottom + 5
  )
    return true
  return false
}
