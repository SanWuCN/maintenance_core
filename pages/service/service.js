const app = getApp()

Page({
  data: {
    actionReady: false,
    navigating: false,
    selectedServiceId: 'combo',
    services: [
      {
        id: 'combo',
        name: '清灰换脂',
        price: 50,
        desc: '深度清灰 / 更换硅脂',
        tags: ['推荐', '散热恢复']
      },
      {
        id: 'clean',
        name: '单清灰',
        price: 30,
        desc: '风扇除尘 / 散热鳍片清理',
        tags: ['基础维护']
      }
    ],
    addons: [
      { id: 'screen', name: '屏幕清洁', oldPrice: 8, price: 0, selected: true, free: true },
      { id: 'keyboard', name: '键盘清洁', oldPrice: 6, price: 0, selected: true, free: true },
      { id: 'ports', name: '接口除尘', oldPrice: 5, price: 0, selected: true, free: true },
      { id: 'shell', name: '外壳清理', oldPrice: 5, price: 0, selected: true, free: true },
      { id: 'system', name: '系统优化', price: 10, selected: false },
      { id: 'benchmark', name: '跑分测试', price: 5, selected: false }
    ],
    greases: [
      { id: 'tf7', name: '利民 TF7', tag: '主推', price: 0 },
      { id: 'tf8', name: '利民 TF8', price: 15 },
      { id: 'tf9', name: '利民 TF9', tag: '极致', price: 20 },
      { id: 'honeywell', name: '霍尼韦尔相变片', price: 15 },
      { id: 'custom', name: '更多（自己填写）', custom: true, price: 0 }
    ],
    selectedGreaseId: 'tf7',
    customGrease: '',
    totalPrice: 50
  },
  onLoad() {
    const saved = app.globalData.booking.service
    const savedAddons = app.globalData.booking.addons || []
    const savedGrease = app.globalData.booking.grease || {}
    let addons = this.data.addons
    if (savedAddons.length) {
      addons = addons.map(item => {
        const matched = savedAddons.find(savedItem => savedItem.id === item.id)
        return matched ? { ...item, selected: true } : { ...item, selected: false }
      })
    }
    if (saved) {
      this.setData({
        selectedServiceId: saved.id,
        addons,
        selectedGreaseId: savedGrease.id || 'tf7',
        customGrease: savedGrease.customName || ''
      }, this.updateTotal)
      return
    }
    this.setData({ addons }, this.updateTotal)
  },
  onReady() {
    this.setData({ actionReady: true })
  },
  selectService(e) {
    this.setData({
      selectedServiceId: e.currentTarget.dataset.id
    }, this.updateTotal)
  },
  toggleAddon(e) {
    const addonId = e.currentTarget.dataset.id
    const addons = this.data.addons.map(item => (
      item.id === addonId ? { ...item, selected: !item.selected } : item
    ))
    this.setData({ addons }, this.updateTotal)
  },
  selectGrease(e) {
    this.setData({
      selectedGreaseId: e.currentTarget.dataset.id
    }, this.updateTotal)
  },
  onCustomGrease(e) {
    this.setData({ customGrease: e.detail.value })
  },
  noop() {},
  updateTotal() {
    const service = this.data.services.find(item => item.id === this.data.selectedServiceId)
    const addonsPrice = this.data.addons
      .filter(item => item.selected)
      .reduce((sum, item) => sum + (Number(item.price) || 0), 0)
    const grease = this.getSelectedGrease()
    const greasePrice = this.data.selectedServiceId === 'combo' ? Number(grease.price || 0) : 0
    this.setData({
      totalPrice: service.price + addonsPrice + greasePrice
    })
  },
  getSelectedGrease() {
    return this.data.greases.find(item => item.id === this.data.selectedGreaseId) || this.data.greases[0]
  },
  next() {
    if (this.data.navigating) return
    const service = this.data.services.find(item => item.id === this.data.selectedServiceId)
    const selectedAddons = this.data.addons.filter(item => item.selected)
    const selectedGrease = this.getSelectedGrease()
    if (this.data.selectedServiceId === 'combo' && selectedGrease.custom && !this.data.customGrease.trim()) {
      wx.showToast({
        title: '请填写硅脂名称',
        icon: 'none'
      })
      return
    }
    this.setData({ navigating: true })
    app.globalData.booking = {
      ...app.globalData.booking,
      service: {
        ...service,
        totalPrice: this.data.totalPrice
      },
      addons: selectedAddons,
      grease: this.data.selectedServiceId === 'combo'
        ? {
            ...selectedGrease,
            finalName: selectedGrease.custom ? this.data.customGrease.trim() : selectedGrease.name,
            customName: this.data.customGrease.trim()
          }
        : null
    }
    wx.navigateTo({
      url: '/pages/schedule/schedule',
      complete: () => {
        this.setData({ navigating: false })
      }
    })
  }
})
