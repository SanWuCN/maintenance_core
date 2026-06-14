const app = getApp()
const api = require('../../utils/api.js')

const pad = number => (number < 10 ? `0${number}` : `${number}`)

Page({
  data: {
    actionReady: false,
    navigating: false,
    dates: [],
    selectedDate: '',
    selectedSlotId: '',
    slots: []
  },
  onLoad() {
    const dates = this.createDates()
    const saved = app.globalData.booking.schedule || {}
    const selectedDate = saved.dateValue || dates[0].value
    this.setData({
      dates,
      selectedDate,
      selectedSlotId: saved.slotId || ''
    })
    this.refreshSlots(selectedDate)
  },
  onReady() {
    this.setData({ actionReady: true })
  },
  createDates() {
    const weekMap = ['日', '一', '二', '三', '四', '五', '六']
    const today = new Date()
    return Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(today)
      date.setDate(today.getDate() + index)
      const month = date.getMonth() + 1
      const day = date.getDate()
      return {
        value: `${date.getFullYear()}-${pad(month)}-${pad(day)}`,
        text: `${month}月${day}日`,
        day: pad(day),
        week: index === 0 ? '今' : `周${weekMap[date.getDay()]}`,
        label: index === 0 ? '今天' : `${pad(month)}.${pad(day)}`
      }
    })
  },
  refreshSlots(dateValue) {
    const dateIndex = this.data.dates.findIndex(item => item.value === dateValue)
    const base = [
      { id: 'noon', time: '12:00 - 15:00', copy: '午间取送，适合上午下课后交接' },
      { id: 'afternoon', time: '15:00 - 18:00', copy: '下午维护，晚饭前后可取回' },
      { id: 'night', time: '18:00 - 21:00', copy: '晚间服务，适合白天有课同学' }
    ]
    const slots = base.map((item, index) => ({
      ...item,
      remaining: Math.max(1, 4 - ((dateIndex + index + 1) % 4))
    }))
    this.setData({ slots })
    api.request(`/api/slots?date=${dateValue}`)
      .then(res => {
        if (res.ok && res.slots) {
          this.setData({ slots: res.slots })
        }
      })
      .catch(() => {})
  },
  selectDate(e) {
    const selectedDate = e.currentTarget.dataset.value
    this.setData({
      selectedDate,
      selectedSlotId: ''
    })
    this.refreshSlots(selectedDate)
  },
  selectSlot(e) {
    const slot = this.data.slots.find(item => item.id === e.currentTarget.dataset.id)
    if (!slot || slot.remaining === 0) return
    this.setData({ selectedSlotId: slot.id })
  },
  next() {
    if (this.data.navigating) return
    const date = this.data.dates.find(item => item.value === this.data.selectedDate)
    const slot = this.data.slots.find(item => item.id === this.data.selectedSlotId)
    if (!slot) {
      wx.showToast({
        title: '请选择时间段',
        icon: 'none'
      })
      return
    }
    app.globalData.booking = {
      ...app.globalData.booking,
      schedule: {
        dateValue: date.value,
        dateText: date.text,
        slotId: slot.id,
        slotTime: slot.time,
        remaining: slot.remaining
      }
    }
    this.setData({ navigating: true })
    wx.navigateTo({
      url: '/pages/device/device',
      complete: () => {
        this.setData({ navigating: false })
      }
    })
  }
})
