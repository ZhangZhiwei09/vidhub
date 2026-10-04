export function addZero(num: number): string {
  return num > 9 ? '' + num : '0' + num
}
export function formatTime(seconds: number): string {
  if (seconds < 0 || seconds === Infinity || seconds.toString() === 'NaN') {
    return '00:00'
  }
  seconds = Math.floor(seconds)
  const minute = Math.floor(seconds / 60)
  const second = seconds % 60

  return addZero(minute) + ':' + addZero(second)
}

export function getDOMPoint(dom: HTMLElement): { x: number; y: number } {
  const rect = dom.getBoundingClientRect()
  return { x: rect.left, y: rect.top }
}

export function colorToNumber(color: string) {
  if (color[0] === '#') {
    color = color.substr(1)
  }
  if (color.length === 3) {
    color = `${color[0]}${color[0]}${color[1]}${color[1]}${color[2]}${color[2]}`
  }
  return (parseInt(color, 16) + 0x000000) & 0xffffff
}

export function numberToColor(number: number): string {
  return '#' + ('00000' + number.toString(16)).slice(-6)
}

export function numberToType(type: number) {
  switch (type) {
    case 0:
      return 'right'
    case 1:
      return 'top'
    case 2:
      return 'bottom'
    default:
      return 'right'
  }
}
