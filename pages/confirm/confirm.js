const app = getApp()
const api = require('../../utils/api.js')

Page({
  data: {
    booking: {},
    actionReady: false,
    submitting: false,
    totalPrice: 0,
    hasAddons: false,
    detailRows: [],
    addonRows: [],
    promiseItems: [
      { icon: '/static/confirm/engineer.png', label: '专业工程师' },
      { icon: '/static/confirm/process.png', label: '标准流程' },
      { icon: '/static/confirm/clock.png', label: '准时服务' },
      { icon: '/static/confirm/lock.png', label: '隐私保护' }
    ],
    flowMarks: ['服务', '时间', '设备', '地址', '确认']
  },
  onShow() {
    const booking = app.globalData.booking || {}
    if (!booking.service || !booking.schedule || !booking.device || !booking.dorm) {
      wx.showToast({
        title: '请先完成预约信息',
        icon: 'none'
      })
      setTimeout(() => {
        wx.redirectTo({ url: '/pages/service/service' })
      }, 600)
      return
    }
    this.setData({
      booking,
      totalPrice: this.calculateTotal(booking),
      hasAddons: Boolean((booking.addons || []).length),
      detailRows: this.buildDetailRows(booking),
      addonRows: this.buildAddonRows(booking)
    })
  },
  onReady() {
    this.setData({ actionReady: true })
  },
  calculateTotal(booking) {
    if (booking.service && typeof booking.service.totalPrice === 'number') {
      return booking.service.totalPrice
    }
    const servicePrice = Number((booking.service || {}).price || 0)
    const addonsPrice = (booking.addons || []).reduce((sum, item) => sum + Number(item.price || 0), 0)
    const greasePrice = booking.grease ? Number(booking.grease.price || 0) : 0
    return servicePrice + addonsPrice + greasePrice
  },
  buildDetailRows(booking) {
    const rows = [
      {
        icon: '/static/confirm/service.png',
        label: '主项目',
        value: `${booking.service.name} · ¥${booking.service.price}`
      }
    ]
    if (booking.grease) {
      rows.push({
        icon: '/static/confirm/grease.png',
        label: '硅脂',
        value: `${booking.grease.finalName} · +${booking.grease.price} RMB`
      })
    }
    rows.push(
      {
        icon: '/static/confirm/time.png',
        label: '预约时间',
        value: `${booking.schedule.dateText} ${booking.schedule.slotTime}`
      },
      {
        icon: '/static/confirm/device.png',
        label: '设备型号',
        value: `${booking.device.brand} · ${booking.device.finalModel}`
      },
      {
        icon: '/static/confirm/address.png',
        label: '地址',
        value: booking.dorm.dorm
      },
      {
        icon: '/static/confirm/phone.png',
        label: '联系方式',
        value: `${booking.dorm.contactName || ''} ${booking.dorm.contactPhone}`.trim()
      }
    )
    return rows
  },
  buildAddonRows(booking) {
    return (booking.addons || []).map(item => ({
      ...item,
      priceText: item.free ? '0 RMB' : `+${item.price} RMB`,
      oldPriceText: item.free ? `+${item.oldPrice} RMB` : ''
    }))
  },
  backEdit() {
    wx.redirectTo({ url: '/pages/dorm/dorm' })
  },
  submit() {
    if (this.data.submitting) return
    this.setData({ submitting: true })
    wx.showLoading({ title: '提交中' })
    const userSession = wx.getStorageSync('userSession') || {}
    const payload = {
      ...this.data.booking,
      userId: userSession.userId || '',
      user: {
        userId: userSession.userId || '',
        nickName: userSession.nickName || '',
        avatarUrl: userSession.avatarUrl || '',
        phone: userSession.phone || ''
      },
      totalPrice: this.data.totalPrice
    }
    api.request('/api/orders', {
      method: 'POST',
      data: payload
    })
      .then(res => {
        const order = {
          ...(res.order || payload),
          orderNo: res.orderNo,
          status: '待服务',
          payStatus: '已支付',
          createdAt: Date.now()
        }
        if (res.user) {
          wx.setStorageSync('userSession', res.user)
          wx.setStorageSync('userInfo', {
            nickName: res.user.nickName,
            avatarUrl: res.user.avatarUrl
          })
        }
        this.saveLocalOrder(order)
        this.finishSubmit('预约已提交', `订单号：${res.orderNo}`)
      })
      .catch(err => {
        const order = {
          ...this.data.booking,
          status: '待服务',
          payStatus: '已支付',
          createdAt: Date.now()
        }
        this.saveLocalOrder(order)
        this.finishSubmit('已本地保存', err.message || '接口暂时不可用，请稍后联系商家确认。')
      })
  },
  saveLocalOrder(order) {
    const orders = wx.getStorageSync('orders') || []
    orders.unshift(order)
    wx.setStorageSync('orders', orders)
  },
  finishSubmit(title, extra) {
    wx.hideLoading()
    this.setData({ submitting: false })
    app.globalData.booking = {}
    wx.showModal({
      title,
      content: `${extra}\n我们会按你填写的联系方式确认取机，请提前 10 分钟到宿舍楼下交接。`,
      showCancel: false,
      success: () => {
        wx.switchTab({ url: '/pages/mine/mine' })
      }
    })
  }
})
