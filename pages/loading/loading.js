Page({
  data: {
    bootLogo: '/static/logo/swart-boot-logo.png'
  },

  onLoad() {
    setTimeout(() => {
      wx.switchTab({
        url: '/pages/index/index'
      })
    }, 950)
  }
})
