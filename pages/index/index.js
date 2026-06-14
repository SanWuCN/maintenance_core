const POSTER_URLS = [
  '/static/posters/poster-home.jpg',
  '/static/posters/poster-service.jpg',
  '/static/posters/poster-performance.jpg'
]

Page({
  data: {
    heroReady: true,
    loginPanelVisible: false,
    pendingServiceNavigation: false,
    businessIcons: {
      clean: '/static/icons/service-fan.png',
      upgrade: '/static/icons/service-chip.png',
      optimize: '/static/icons/service-gear.png',
      cleanWhite: '/static/icons/service-fan-white.png',
      upgradeWhite: '/static/icons/service-chip-white.png',
      optimizeWhite: '/static/icons/service-gear-white.png'
    },
    posters: []
  },
  onLoad() {
    const orderedPosters = shuffle(POSTER_URLS)
    this.posterUrls = orderedPosters
    this.setData({
      posters: resolvePosterPaths(orderedPosters)
    })
    this.prepareLoginPanel()
  },
  prepareLoginPanel() {
    const userSession = wx.getStorageSync('userSession') || null
    if (userSession && userSession.userId) {
      return
    }
    this.setData({ loginPanelVisible: true })
  },
  closeLoginPanel() {
    this.setData({
      loginPanelVisible: false,
      pendingServiceNavigation: false
    })
  },
  onLoginSuccess() {
    const shouldGoService = this.data.pendingServiceNavigation
    this.setData({
      loginPanelVisible: false,
      pendingServiceNavigation: false
    })
    if (shouldGoService) {
      this.openServicePage()
    }
  },
  goService() {
    const userSession = wx.getStorageSync('userSession') || {}
    if (!userSession.userId) {
      this.setData({
        loginPanelVisible: true,
        pendingServiceNavigation: true
      })
      return
    }
    this.openServicePage()
  },
  openServicePage() {
    wx.navigateTo({
      url: '/pages/service/service'
    })
  },
  comingSoon() {
    wx.showToast({
      title: '该业务即将开放',
      icon: 'none'
    })
  },
})

function shuffle(list) {
  const result = list.slice()
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const temp = result[index]
    result[index] = result[swapIndex]
    result[swapIndex] = temp
  }
  return result
}

function resolvePosterPaths(urls) {
  return urls
}
