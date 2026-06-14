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
    const savedContact = wx.getStorageSync('savedContact') || {}
    const orders = wx.getStorageSync('orders') || []
    
    // 模拟从接口获取用户的积分和卡券数量 (真实开发中请替换为真实接口)
    const mockUserAssets = {
      points: 1250, // 测试数据，你可以修改这个数值看进度条和等级变化
      cardsCount: 2,
      couponsCount: 1
    };

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
      points: mockUserAssets.points,
      cardsCount: mockUserAssets.cardsCount,
      couponsCount: mockUserAssets.couponsCount,
      levelInfo: this.calculateLevel(mockUserAssets.points),
      orders
    })

    if (savedContact.phone) {
      // 实际接单数据请求
      api.request(`/api/orders?phone=${encodeURIComponent(savedContact.phone)}`)
        .then(res => {
          if (res.ok && res.orders) {
            this.setData({ orders: res.orders })
          }
        })
        .catch(() => {})
    }
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
