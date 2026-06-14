// app.js
App({
  onLaunch() {
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    wx.login({
      success: res => {
        this.globalData.loginCode = res.code
      }
    })
  },
  globalData: {
    userInfo: null,
    loginCode: '',
    booking: {}
  }
})
