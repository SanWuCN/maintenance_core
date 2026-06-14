const app = getApp()

Page({
  data: {
    dorms: [],
    savedDorm: '',
    selectedDorm: '',
    contactName: '',
    contactPhone: '',
    addressNote: ''
  },
  onLoad() {
    const dorms = Array.from({ length: 21 }).map((_, index) => `${index + 1}号楼`)
    const savedDorm = wx.getStorageSync('savedDorm') || ''
    const savedContact = wx.getStorageSync('savedContact') || {}
    const saved = app.globalData.booking.dorm || {}
    this.setData({
      dorms,
      savedDorm,
      selectedDorm: saved.dorm || savedDorm || dorms[0],
      contactName: saved.contactName || savedContact.name || '',
      contactPhone: saved.contactPhone || savedContact.phone || '',
      addressNote: saved.addressNote || ''
    })
  },
  useSavedDorm() {
    this.setData({ selectedDorm: this.data.savedDorm })
  },
  selectDorm(e) {
    this.setData({ selectedDorm: e.currentTarget.dataset.dorm })
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
    wx.navigateTo({
      url: '/pages/confirm/confirm'
    })
  }
})
