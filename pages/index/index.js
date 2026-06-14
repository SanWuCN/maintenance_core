const api = require('../../utils/api.js')

Page({
  data: {
    heroReady: false,
    posters: shuffle([
      `${api.ASSET_URL}/poster-home-3x4.png`,
      `${api.ASSET_URL}/poster-service-500-3x4.png`
    ])
  },
  onPosterLoad(e) {
    if (Number(e.currentTarget.dataset.index) === 0 && !this.data.heroReady) {
      this.setData({ heroReady: true })
    }
  },
  onPosterError() {
    this.setData({ heroReady: true })
    wx.showToast({
      title: '海报加载失败',
      icon: 'none'
    })
  },
  goService() {
    wx.navigateTo({
      url: '/pages/service/service'
    })
  },
  comingSoon() {
    wx.showToast({
      title: '该业务即将开放',
      icon: 'none'
    })
  },
})

function shuffle(list) {
  const result = list.slice()
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const temp = result[index]
    result[index] = result[swapIndex]
    result[swapIndex] = temp
  }
  return result
}
