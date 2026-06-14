const app = getApp()
const bookingFlow = require('../../utils/bookingFlow.js')

const dormMap = [
  { label: '15号楼', className: 'dorm-15' },
  { label: '空楼', className: 'dorm-empty', disabled: true },
  { label: '14号楼', className: 'dorm-14' },
  { label: '13号楼', className: 'dorm-13' },
  { label: '12号楼', className: 'dorm-12' },
  { label: '11号楼', className: 'dorm-11' },
  { label: '10号楼', className: 'dorm-10' },
  { label: '9号楼', className: 'dorm-9' },
  { label: '8号楼', className: 'dorm-8' },
  { label: '7号楼', className: 'dorm-7' },
  { label: '6号楼', className: 'dorm-6' },
  { label: '5号楼', className: 'dorm-5' },
  { label: '4号楼', className: 'dorm-4' },
  { label: '3号楼', className: 'dorm-3' },
  { label: '2号楼', className: 'dorm-2' },
  { label: '1号楼', className: 'dorm-1' }
]

Page({
  data: {
    actionReady: false,
    navigating: false,
    flowSteps: [],
    dorms: [],
    selectedDorm: '',
    contactName: '',
    contactPhone: '',
    addressNote: ''
  },

  onLoad() {
    const savedDorm = wx.getStorageSync('savedDorm') || ''
    const savedContact = wx.getStorageSync('savedContact') || {}
    const userSession = wx.getStorageSync('userSession') || {}
    const userInfo = wx.getStorageSync('userInfo') || {}
    const saved = app.globalData.booking.dorm || {}
    const firstDorm = dormMap.find(item => !item.disabled)
    this.setData({
      dorms: dormMap,
      selectedDorm: saved.dorm || savedDorm || firstDorm.label,
      contactName: saved.contactName || savedContact.name || userSession.nickName || userInfo.nickName || '',
      contactPhone: saved.contactPhone || savedContact.phone || userSession.phone || '',
      addressNote: saved.addressNote || ''
    })
  },

  onShow() {
    this.refreshFlowSteps()
  },

  onReady() {
    this.setData({ actionReady: true })
  },

  refreshFlowSteps() {
    this.setData({
      flowSteps: bookingFlow.buildFlowSteps('dorm', app.globalData.booking)
    })
  },

  goFlowStep(e) {
    bookingFlow.goFlowStep(e.currentTarget.dataset.key, 'dorm', app.globalData.booking)
  },

  selectDorm(e) {
    const dorm = e.currentTarget.dataset.dorm
    if (!dorm || dorm === '空楼') return
    this.setData({ selectedDorm: dorm })
  },

  onName(e) {
    this.setData({ contactName: e.detail.value })
  },

  onPhone(e) {
    this.setData({ contactPhone: e.detail.value })
  },

  onNote(e) {
    this.setData({ addressNote: e.detail.value })
  },

  next() {
    if (this.data.navigating) return
    if (!this.data.selectedDorm) {
      wx.showToast({
        title: '请选择宿舍楼',
        icon: 'none'
      })
      return
    }
    if (!this.data.contactPhone) {
      wx.showToast({
        title: '请填写联系方式',
        icon: 'none'
      })
      return
    }
    wx.setStorageSync('savedDorm', this.data.selectedDorm)
    wx.setStorageSync('savedContact', {
      name: this.data.contactName,
      phone: this.data.contactPhone
    })
    app.globalData.booking = {
      ...app.globalData.booking,
      dorm: {
        dorm: this.data.selectedDorm,
        contactName: this.data.contactName,
        contactPhone: this.data.contactPhone,
        addressNote: this.data.addressNote
      }
    }
    this.setData({ navigating: true })
    wx.redirectTo({
      url: '/pages/confirm/confirm',
      complete: () => {
        this.setData({ navigating: false })
      }
    })
  }
})
