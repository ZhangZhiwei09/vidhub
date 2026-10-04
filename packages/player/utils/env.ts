function ua() {
  if (typeof window === 'undefined') return ''
  return window.navigator.userAgent.toLowerCase()
}

export const Env = {
  isInWeixin() {
    return ua().indexOf('micromessenger') !== -1
  },
  isInApp() {
    return /(^|;\s)app\//.test(ua())
  },
  isInIOS() {
    return ua().match(/(iphone|ipod|ipad);?/i)
  },
  isInAndroid() {
    return ua().match(/android|adr/i)
  },
  isInPc() {
    return !(Env.isInAndroid() || Env.isInApp() || Env.isInIOS() || Env.isInWeixin())
  },
  get env(): 'PC' | 'Mobile' {
    if (typeof window === 'undefined') return 'PC'
    return this.isInPc() ? 'PC' : 'Mobile'
  },
}