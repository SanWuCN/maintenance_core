Page({
  data: {
    maskedPhone: '未绑定'
  },
  onShow() {
    const user = wx.getStorageSync('userSession') || {}
    const phone = user.phone || ''
    this.setData({
      maskedPhone: phone ? `${phone.slice(0, 3)}****${phone.slice(-4)}` : '未绑定'
    })
  },
  logout() {
    wx.showModal({
      title: '退出账号',
      content: '退出后本机将不再显示该账号的会员资产和订单。',
      confirmText: '退出',
      confirmColor: '#111111',
      success: res => {
        if (!res.confirm) return
        wx.removeStorageSync('userSession')
        wx.removeStorageSync('userInfo')
        wx.removeStorageSync('orders')
        wx.showToast({ title: '已退出账号', icon: 'none' })
        setTimeout(() => wx.switchTab({ url: '/pages/mine/mine' }), 400)
      }
    })
  }
})
