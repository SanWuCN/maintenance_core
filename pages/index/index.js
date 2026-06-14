const POSTER_URLS = [
  '/static/posters/poster-home.jpg',
  '/static/posters/poster-service.jpg',
  '/static/posters/poster-performance.jpg'
]

const api = require('../../utils/api.js')

Page({
  data: {
    heroReady: true,
    loginPanelVisible: false,
    loginStep: 'phone',
    phoneCode: '',
    loginForm: {
      nickName: '',
      avatarUrl: ''
    },
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
  onPhoneLogin(e) {
    const detail = e.detail || {}
    if (!detail.code) {
      wx.showToast({
        title: '需要授权手机号登录',
        icon: 'none'
      })
      return
    }
    this.setData({
      phoneCode: detail.code,
      loginStep: 'profile'
    })
  },
  onChooseAvatar(e) {
    this.setData({
      'loginForm.avatarUrl': e.detail.avatarUrl
    })
  },
  onNickInput(e) {
    this.setData({
      'loginForm.nickName': e.detail.value
    })
  },
  completeLogin() {
    const nickName = (this.data.loginForm.nickName || '').trim() || '三物用户'
    const clientUserId = getClientUserId()
    wx.login({
      success: res => {
        api.request('/api/users/login', {
          method: 'POST',
          data: {
            clientUserId,
            loginCode: res.code,
            phoneCode: this.data.phoneCode,
            profile: {
              nickName,
              avatarUrl: this.data.loginForm.avatarUrl
            }
          }
        }).then(result => {
          const session = result.user || {
            userId: `local_${Date.now()}`,
            nickName,
            avatarUrl: this.data.loginForm.avatarUrl,
            phone: ''
          }
          wx.setStorageSync('userSession', session)
          wx.setStorageSync('userInfo', {
            nickName: session.nickName,
            avatarUrl: session.avatarUrl
          })
          this.setData({ loginPanelVisible: false })
        }).catch(() => {
          const session = {
            userId: `local_${Date.now()}`,
            nickName,
            avatarUrl: this.data.loginForm.avatarUrl,
            phone: ''
          }
          wx.setStorageSync('userSession', session)
          wx.setStorageSync('userInfo', {
            nickName,
            avatarUrl: session.avatarUrl
          })
          this.setData({ loginPanelVisible: false })
        })
      }
    })
  },
  closeLoginPanel() {
    this.setData({ loginPanelVisible: false })
  },
  goService() {
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

function getClientUserId() {
  let clientUserId = wx.getStorageSync('clientUserId')
  if (!clientUserId) {
    clientUserId = `client_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`
    wx.setStorageSync('clientUserId', clientUserId)
  }
  return clientUserId
}
