Page({
  data: {
    activeTab: 'pending'
  },
  switchTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.key })
  }
})
