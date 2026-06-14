const app = getApp()
const api = require('../../utils/api.js')
const bookingFlow = require('../../utils/bookingFlow.js')

const pad = number => (number < 10 ? `0${number}` : `${number}`)

Page({
  data: {
    actionReady: false,
    navigating: false,
    flowSteps: [],
    bookableDays: 180,
    lastBookableText: '',
    dates: [],
    calendarMonths: [],
    selectedDate: '',
    selectedDateText: '',
    selectedDateObj: null, // 存储当前选中的日期对象供页面渲染
    selectedSlotId: '',
    slots: [],
    showDatePicker: false // 控制底部日历面板
  },

  onLoad() {
    const dates = this.createDates(this.data.bookableDays)
    const calendarMonths = this.buildCalendarMonths(dates)
    const lastBookableText = dates.length ? `${dates[dates.length - 1].month}.${dates[dates.length - 1].day}` : ''
    const saved = app.globalData.booking.schedule || {}
    const selectedDate = saved.dateValue || dates[0].value
    
    this.setData({
      dates,
      calendarMonths,
      lastBookableText,
      selectedDate,
      selectedDateObj: dates.find(d => d.value === selectedDate) || dates[0],
      selectedDateText: (dates.find(d => d.value === selectedDate) || dates[0]).text,
      selectedSlotId: saved.slotId || ''
    })
    
    this.refreshSlots(selectedDate)
  },

  onShow() {
    this.refreshFlowSteps()
  },

  onReady() {
    this.setData({ actionReady: true })
  },

  refreshFlowSteps() {
    this.setData({
      flowSteps: bookingFlow.buildFlowSteps('schedule', app.globalData.booking)
    })
  },

  goFlowStep(e) {
    bookingFlow.goFlowStep(e.currentTarget.dataset.key, 'schedule', app.globalData.booking)
  },

  createDates(days = 180) {
    const weekMap = ['日', '一', '二', '三', '四', '五', '六']
    const today = new Date()
    return Array.from({ length: days }).map((_, index) => {
      const date = new Date(today)
      date.setDate(today.getDate() + index)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()
      return {
        value: `${year}-${pad(month)}-${pad(day)}`,
        text: `${month}月${day}日`,
        year,
        month,
        day: pad(day),
        gridDay: day,
        stripLabel: index === 0 ? '今' : (index === 1 ? '明' : `周${weekMap[date.getDay()]}`),
        stripDate: `${pad(month)}.${pad(day)}`,
        week: index === 0 ? '今' : `周${weekMap[date.getDay()]}`,
        gridWeek: index === 0 ? '今天' : `周${weekMap[date.getDay()]}`,
        isToday: index === 0
      }
    })
  },

  buildCalendarMonths(dates) {
    if (!dates.length) return []

    const availableMap = dates.reduce((map, item) => {
      map[item.value] = item
      return map
    }, {})

    const firstDate = dates[0]
    const lastDate = dates[dates.length - 1]
    const months = []
    const cursor = new Date(firstDate.year, firstDate.month - 1, 1)
    const end = new Date(lastDate.year, lastDate.month - 1, 1)

    while (cursor <= end) {
      const year = cursor.getFullYear()
      const month = cursor.getMonth() + 1
      const firstWeekday = new Date(year, month - 1, 1).getDay()
      const daysInMonth = new Date(year, month, 0).getDate()
      const cells = []

      for (let i = 0; i < firstWeekday; i += 1) {
        cells.push({
          key: `${year}-${pad(month)}-empty-${i}`,
          placeholder: true,
          available: false,
          visible: false,
          className: 'placeholder muted-day'
        })
      }

      for (let day = 1; day <= daysInMonth; day += 1) {
        const value = `${year}-${pad(month)}-${pad(day)}`
        const source = availableMap[value]
        cells.push({
          key: value,
          value,
          day,
          available: Boolean(source),
          placeholder: false,
          visible: true,
          className: source ? '' : 'muted-day'
        })
      }

      months.push({
        key: `${year}-${pad(month)}`,
        title: `${year}年${month}月`,
        watermark: month,
        cells
      })

      cursor.setMonth(cursor.getMonth() + 1)
    }

    return months
  },

  refreshSlots(dateValue) {
    const foundDateIndex = this.data.dates.findIndex(item => item.value === dateValue)
    const dateIndex = foundDateIndex >= 0 ? foundDateIndex : 0
    // 移除了多余的 copy 小字描述
    const base = [
      { id: 'noon', time: '12:00 - 15:00' },
      { id: 'afternoon', time: '15:00 - 18:00' },
      { id: 'night', time: '18:00 - 21:00' }
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

  // 打开底部日期选择器
  openDatePicker() {
    this.setData({ showDatePicker: true })
  },

  // 关闭底部日期选择器
  closeDatePicker() {
    this.setData({ showDatePicker: false })
  },

  applySelectedDate(selectedDate, keepPickerOpen = false) {
    if (!selectedDate) return
    const selectedDateObj = this.data.dates.find(d => d.value === selectedDate)
    if (!selectedDateObj) return
    this.setData({
      selectedDate,
      selectedDateObj,
      selectedDateText: selectedDateObj.text,
      selectedSlotId: '',
      showDatePicker: keepPickerOpen
    })
    this.refreshSlots(selectedDate)
  },

  // 选择顶部横向日期
  selectDate(e) {
    this.applySelectedDate(e.currentTarget.dataset.value, false)
  },

  // 在底部日历中选择日期，保留弹窗用于确认
  selectPickerDate(e) {
    this.applySelectedDate(e.currentTarget.dataset.value, true)
  },

  confirmDatePicker() {
    this.closeDatePicker()
  },

  // 选择时间段
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
    wx.redirectTo({
      url: '/pages/device/device',
      complete: () => {
        this.setData({ navigating: false })
      }
    })
  }
})
