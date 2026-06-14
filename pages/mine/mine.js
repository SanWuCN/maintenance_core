const api = require('../../utils/api.js')

Page({
  data: {
    userInfo: {},
    nickName: '',
    avatarText: 'SW',
    
    // 资产与体系数据
    points: 0,
    cardsCount: 0,
    couponsCount: 0,
    levelInfo: {
      name: 'IT小白',
      percent: 0,
      nextName: '入门IT',
      needPoints: 1000
    },
    showLevelProgress: true,
    progressStyle: 'width: 0%;',
    loginPanelVisible: false,

    // 预约动态卡片数据 (为 null 时自动隐藏)
    activeAppointment: {
      serviceName: '专业笔记本清灰换硅脂',
      bookTime: '明天下午 14:00'
    },
    
    orders: []
  },

  onShow() {
    const userSession = wx.getStorageSync('userSession') || {}
    const userInfo = wx.getStorageSync('userInfo') || userSession || {}
    const orders = wx.getStorageSync('orders') || []
    const nickName = userSession.nickName || userInfo.nickName || ''
    const avatarUrl = userSession.avatarUrl || userInfo.avatarUrl || ''
    const levelInfo = userSession.levelInfo || this.calculateLevel(userSession.points || 0)
    const levelViewState = this.getLevelViewState(levelInfo)

    this.setData({
      userInfo: {
        ...userInfo,
        nickName,
        avatarUrl
      },
      nickName,
      avatarText: nickName ? nickName.slice(0, 1).toUpperCase() : 'SW',
      points: userSession.points || 0,
      cardsCount: userSession.cardsCount || 0,
      couponsCount: userSession.couponsCount || 0,
      levelInfo,
      ...levelViewState,
      activeAppointment: this.getActiveAppointment(orders),
      orders
    })

    if (userSession.userId) {
      this.refreshUserAssets(userSession.userId)
    }
  },

  refreshUserAssets(userId) {
    api.request(`/api/users/me?userId=${encodeURIComponent(userId)}`)
      .then(res => {
        if (!res.ok || !res.user) {
          return
        }
        const user = res.user
        const orders = res.orders || []
        const levelInfo = user.levelInfo || this.calculateLevel(user.points || 0)
        const levelViewState = this.getLevelViewState(levelInfo)
        wx.setStorageSync('userSession', user)
        wx.setStorageSync('userInfo', {
          nickName: user.nickName,
          avatarUrl: user.avatarUrl
        })
        wx.setStorageSync('orders', orders)
        this.setData({
          userInfo: {
            nickName: user.nickName,
            avatarUrl: user.avatarUrl
          },
          nickName: user.nickName || '',
          avatarText: user.nickName ? user.nickName.slice(0, 1).toUpperCase() : 'SW',
          points: user.points || 0,
          cardsCount: user.cardsCount || 0,
          couponsCount: user.couponsCount || 0,
          levelInfo,
          ...levelViewState,
          activeAppointment: this.getActiveAppointment(orders),
          orders
        })
      })
      .catch(() => {})
  },

  resetUserState() {
    const levelInfo = this.calculateLevel(0)
    this.setData({
      userInfo: {},
      nickName: '',
      avatarText: 'SW',
      points: 0,
      cardsCount: 0,
      couponsCount: 0,
      levelInfo,
      ...this.getLevelViewState(levelInfo),
      activeAppointment: null,
      orders: []
    })
  },

  // 核心：处理会员等级和进度计算
  calculateLevel(points) {
    if (points < 1000) {
      return {
        name: 'IT小白',
        percent: (points / 1000) * 100,
        nextName: '入门IT',
        needPoints: 1000 - points
      }
    } else if (points < 5000) {
      return {
        name: '入门IT',
        percent: ((points - 1000) / 4000) * 100, // 超过1000后的进度
        nextName: 'IT Goal',
        needPoints: 5000 - points
      }
    } else {
      return {
        name: 'IT Goal',
        percent: 100,
        nextName: 'MAX',
        needPoints: 0
      }
    }
  },

  getLevelViewState(levelInfo) {
    const percent = Math.max(0, Math.min(100, Number(levelInfo.percent) || 0))
    return {
      showLevelProgress: levelInfo.name !== 'IT Goal',
      progressStyle: `width: ${percent}%;`
    }
  },

  getActiveAppointment(orders) {
    const activeIndex = (orders || []).findIndex(item => item.status !== '已完成' && item.status !== '已取消')
    const active = activeIndex >= 0 ? orders[activeIndex] : null
    if (!active) {
      return null
    }
    const schedule = active.schedule || {}
    const service = active.service || {}
    return {
      serviceName: service.name || active.serviceName || '电脑清灰维护',
      bookTime: `${schedule.dateText || schedule.dateValue || ''} ${schedule.slotTime || ''}`.trim(),
      index: activeIndex
    }
  },

  getProfile() {
    const userSession = wx.getStorageSync('userSession') || {}
    if (userSession.userId) {
      wx.navigateTo({ url: '/pages/profile/profile' })
      return
    }
    this.setData({ loginPanelVisible: true })
  },

  closeLoginPanel() {
    this.setData({ loginPanelVisible: false })
  },

  onLoginSuccess(e) {
    const user = (e.detail || {}).user || wx.getStorageSync('userSession') || {}
    this.setData({ loginPanelVisible: false })
    if (user.userId) {
      this.refreshUserAssets(user.userId)
      return
    }
    this.onShow()
  },

  // ========== 页面路由跳转预留口 ==========
  goMember() {
    wx.navigateTo({ url: '/pages/member/member' })
  },
  goActiveOrder() {
    if (!this.data.activeAppointment) return
    wx.navigateTo({ url: `/pages/order-detail/order-detail?index=${this.data.activeAppointment.index}` })
  },
  goCards() {
    wx.showToast({ title: '查看特权次卡', icon: 'none' })
  },
  goCoupons() {
    wx.showToast({ title: '查看优惠券', icon: 'none' })
  },
  goTask() {
    wx.showToast({ title: '任务中心开发中', icon: 'none' })
  },
  goProfile() {
    wx.navigateTo({ url: '/pages/profile/profile' })
  },
  goAbout() {
    wx.showToast({ title: '关于我们', icon: 'none' })
  },
  goJoin() {
    wx.showToast({ title: '加入我们', icon: 'none' })
  },
  goFeedback() {
    wx.showToast({ title: '问题反馈', icon: 'none' })
  },
  goSecurity() {
    wx.navigateTo({ url: '/pages/security/security' })
  },
  goOrders(e) {
    const userSession = wx.getStorageSync('userSession') || {}
    if (!userSession.userId) {
      this.setData({ loginPanelVisible: true })
      return
    }
    const status = (e.currentTarget.dataset || {}).status || 'all'
    wx.navigateTo({ url: `/pages/orders/orders?status=${status}` })
  },
  goReviews() {
    wx.navigateTo({ url: '/pages/reviews/reviews' })
  },
  goAfterSale() {
    wx.navigateTo({ url: '/pages/after-sale/after-sale' })
  }
})
