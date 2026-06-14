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
      levelInfo: userSession.levelInfo || this.calculateLevel(userSession.points || 0),
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
          levelInfo: user.levelInfo || this.calculateLevel(user.points || 0),
          activeAppointment: this.getActiveAppointment(orders),
          orders
        })
      })
      .catch(() => {})
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

  getActiveAppointment(orders) {
    const active = (orders || []).find(item => item.status !== '已完成' && item.status !== '已取消')
    if (!active) {
      return null
    }
    const schedule = active.schedule || {}
    const service = active.service || {}
    return {
      serviceName: service.name || active.serviceName || '电脑清灰维护',
      bookTime: `${schedule.dateText || schedule.dateValue || ''} ${schedule.slotTime || ''}`.trim()
    }
  },

  // 首次登录在主页完成：手机号授权 + 头像昵称注册。
  getProfile() {
    wx.showToast({
      title: '请回到主页完成登录',
      icon: 'none'
    })
  },

  // ========== 页面路由跳转预留口 ==========
  goLevelDesc() {
    wx.showToast({ title: '会员权益介绍开发中', icon: 'none' })
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
    wx.showToast({ title: '个人信息设置', icon: 'none' })
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
    wx.showToast({ title: '账号与安全', icon: 'none' })
  }
})
