Page({
  data: {
    nickName: '',
    avatarUrl: '',
    avatarText: '三',
    maskedPhone: '未绑定',
    gender: '',
    birthday: '',
    region: '',
    savedDorm: ''
  },
  onShow() {
    const user = wx.getStorageSync('userSession') || {}
    const phone = user.phone || ''
    this.setData({
      nickName: user.nickName || '',
      avatarUrl: user.avatarUrl || '',
      avatarText: user.nickName ? user.nickName.slice(0, 1) : '三',
      maskedPhone: phone ? `${phone.slice(0, 3)}****${phone.slice(-4)}` : '未绑定',
      gender: user.gender || '',
      birthday: user.birthday || '',
      region: user.region || '',
      savedDorm: wx.getStorageSync('savedDorm') || ''
    })
  },
  setGender(e) {
    const gender = e.currentTarget.dataset.gender
    const user = wx.getStorageSync('userSession') || {}
    user.gender = gender
    wx.setStorageSync('userSession', user)
    this.setData({ gender })
  }
})
