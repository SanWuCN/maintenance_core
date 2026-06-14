const api = require('../../utils/api.js')

Page({
  data: {
    logoUrl: `${api.ASSET_URL}/app-icon-512.png`,
    nickName: '',
    avatarText: 'SW',
    savedDorm: '',
    orders: []
  },
  onShow() {
    const userInfo = wx.getStorageSync('userInfo') || {}
    const savedContact = wx.getStorageSync('savedContact') || {}
    const orders = wx.getStorageSync('orders') || []
    this.setData({
      nickName: userInfo.nickName || '',
      avatarText: userInfo.nickName ? userInfo.nickName.slice(0, 1) : 'SW',
      savedDorm: wx.getStorageSync('savedDorm') || '',
      orders
    })
    if (savedContact.phone) {
      api.request(`/api/orders?phone=${encodeURIComponent(savedContact.phone)}`)
        .then(res => {
          if (res.ok && res.orders) {
            this.setData({ orders: res.orders })
          }
        })
        .catch(() => {})
    }
  },
  getProfile() {
    if (!wx.getUserProfile) {
      wx.showToast({
        title: '当前基础库不支持',
        icon: 'none'
      })
      return
    }
    wx.getUserProfile({
      desc: '用于展示个人主页信息',
      success: res => {
        wx.setStorageSync('userInfo', res.userInfo)
        this.setData({
          nickName: res.userInfo.nickName,
          avatarText: res.userInfo.nickName ? res.userInfo.nickName.slice(0, 1) : 'SW'
        })
      }
    })
  },
  goService() {
    wx.navigateTo({
      url: '/pages/service/service'
    })
  }
})
