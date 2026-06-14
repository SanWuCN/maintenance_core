// app.js
App({
  onLaunch() {
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    this.globalData.posterCache = wx.getStorageSync('posterCache') || {}

    wx.login({
      success: res => {
        this.globalData.loginCode = res.code
      }
    })
  },
  globalData: {
    userInfo: null,
    loginCode: '',
    booking: {},
    posterCache: {}
  }
})
