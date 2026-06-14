Page({
  data: {
    activeTab: 'all',
    tabs: [
      { key: 'all', label: '全部' },
      { key: 'unpaid', label: '待付款' },
      { key: 'service', label: '待服务' },
      { key: 'receive', label: '待取机' },
      { key: 'review', label: '待评价' }
    ],
    orders: [],
    filteredOrders: []
  },
  onLoad(options) {
    this.setData({ activeTab: options.status || 'all' })
  },
  onShow() {
    this.loadOrders()
  },
  loadOrders() {
    const raw = wx.getStorageSync('orders') || []
    const orders = raw.map((item, index) => {
      const service = item.service || {}
      const schedule = item.schedule || {}
      const device = item.device || {}
      return {
        ...item,
        originIndex: index,
        serviceName: service.name || item.serviceName || '电脑清灰维护',
        totalPrice: item.totalPrice || service.totalPrice || service.price || 0,
        timeText: `${schedule.dateText || schedule.dateValue || ''} ${schedule.slotTime || ''}`.trim(),
        deviceText: `${device.brand || ''} ${device.finalModel || device.note || ''}`.trim(),
        status: item.status || '待服务'
      }
    })
    this.setData({ orders }, this.filterOrders)
  },
  switchTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.key }, this.filterOrders)
  },
  filterOrders() {
    const tab = this.data.activeTab
    const filteredOrders = this.data.orders.filter(item => {
      if (tab === 'all') return true
      if (tab === 'unpaid') return item.status === '待付款'
      if (tab === 'service') return item.status === '待服务' || item.status === '待确认'
      if (tab === 'receive') return item.status === '待取机'
      if (tab === 'review') return item.status === '待评价'
      return true
    })
    this.setData({ filteredOrders })
  },
  openOrder(e) {
    wx.navigateTo({ url: `/pages/order-detail/order-detail?index=${e.currentTarget.dataset.index}` })
  }
})
