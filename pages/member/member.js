Page({
  data: {
    points: 0,
    currentLevelIndex: 0,
    levels: [],
    benefits: [
      { icon: '券', title: '送优惠券', copy: '满50减10.1' },
      { icon: '分', title: '送100积分', copy: '注册即送' },
      { icon: '生', title: '生日特权', copy: '生日专享' },
      { icon: '六', title: '会员日', copy: '每周六' }
    ]
  },
  onShow() {
    const user = wx.getStorageSync('userSession') || {}
    const points = Number(user.points || 100)
    const currentLevelIndex = points >= 5000 ? 2 : points >= 1000 ? 1 : 0
    const names = ['IT小白', '入门IT', 'IT Goal']
    const rules = ['注册默认入会', '1000积分解锁', '5000积分解锁']
    this.setData({
      points,
      currentLevelIndex,
      levels: names.map((name, index) => ({
        name,
        rule: rules[index],
        current: index === currentLevelIndex,
        className: ['level-basic', 'level-mid', 'level-goal'][index]
      }))
    })
  },
  onLevelChange(e) {
    this.setData({ currentLevelIndex: e.detail.current })
  },
  goHome() {
    wx.switchTab({ url: '/pages/index/index' })
  }
})
