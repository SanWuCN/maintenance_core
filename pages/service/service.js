const app = getApp()

Page({
  data: {
    selectedServiceId: 'combo',
    services: [
      {
        id: 'combo',
        name: '清灰换脂',
        price: 50,
        desc: '拆机清灰 + 散热硅脂更换，适合温度高、风扇响、性能下降。',
        tags: ['推荐', '性能恢复', '散热优化']
      },
      {
        id: 'clean',
        name: '单清灰',
        price: 30,
        desc: '风扇、散热鳍片、机身缝隙清洁，适合日常维护。',
        tags: ['基础维护', '灰尘清理']
      }
    ],
    addons: [
      { name: '屏幕深度清洁', oldPrice: 8 },
      { name: '键盘表面保养', oldPrice: 6 },
      { name: 'USB / 接口除尘', oldPrice: 5 },
      { name: '外壳指纹清理', oldPrice: 5 }
    ]
  },
  onLoad() {
    const saved = app.globalData.booking.service
    if (saved) {
      this.setData({ selectedServiceId: saved.id })
    }
  },
  selectService(e) {
    this.setData({
      selectedServiceId: e.currentTarget.dataset.id
    })
  },
  next() {
    const service = this.data.services.find(item => item.id === this.data.selectedServiceId)
    app.globalData.booking = {
      ...app.globalData.booking,
      service,
      addons: this.data.addons
    }
    wx.navigateTo({
      url: '/pages/schedule/schedule'
    })
  }
})
