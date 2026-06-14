Page({
  data: {
    index: 0,
    order: {},
    serviceName: '电脑清灰维护',
    serviceDesc: '楼下取机 · 楼下送回',
    totalPrice: 0,
    statusText: '待服务',
    payStatus: '已支付',
    cancelText: '撤销预定',
    cancelDisabled: false,
    detailRows: []
  },
  onLoad(options) {
    const index = Number(options.index || 0)
    this.loadOrder(index)
  },
  loadOrder(index) {
    const orders = wx.getStorageSync('orders') || []
    const order = orders[index] || {}
    const booking = order.service ? order : {}
    const service = booking.service || {}
    const schedule = booking.schedule || {}
    const device = booking.device || {}
    const dorm = booking.dorm || {}
    const total = order.totalPrice || service.totalPrice || service.price || 0
    const statusText = order.status || '待服务'
    this.setData({
      index,
      order,
      serviceName: service.name || '电脑清灰维护',
      serviceDesc: service.desc || '楼下取机 · 楼下送回',
      totalPrice: total,
      statusText,
      payStatus: order.payStatus || '已支付',
      cancelText: statusText === '已取消' ? '已撤销' : '撤销预定',
      cancelDisabled: statusText === '已取消',
      detailRows: [
        { icon: '/static/confirm/service.png', label: '主项目', value: `${service.name || '清灰维护'} · ¥${service.price || total}` },
        { icon: '/static/confirm/grease.png', label: '硅脂', value: booking.grease ? `${booking.grease.finalName} · +${booking.grease.price} RMB` : '未选择' },
        { icon: '/static/confirm/time.png', label: '预约时间', value: `${schedule.dateText || schedule.dateValue || ''} ${schedule.slotTime || ''}`.trim() || '待确认' },
        { icon: '/static/confirm/device.png', label: '设备型号', value: `${device.brand || ''} · ${device.finalModel || device.note || '未填写'}` },
        { icon: '/static/confirm/address.png', label: '地址', value: dorm.dorm || '未选择' },
        { icon: '/static/confirm/phone.png', label: '联系方式', value: `${dorm.contactName || ''} ${dorm.contactPhone || ''}`.trim() || '未填写' }
      ]
    })
  },
  cancelOrder() {
    wx.showModal({
      title: '撤销预定',
      content: '确定撤销这次预约吗？',
      confirmText: '撤销',
      confirmColor: '#111111',
      success: res => {
        if (!res.confirm) return
        const orders = wx.getStorageSync('orders') || []
        if (orders[this.data.index]) {
          orders[this.data.index].status = '已取消'
          wx.setStorageSync('orders', orders)
        }
        this.loadOrder(this.data.index)
        wx.showToast({ title: '已撤销', icon: 'none' })
      }
    })
  }
})
