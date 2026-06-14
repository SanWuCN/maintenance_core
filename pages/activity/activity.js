const api = require('../../utils/api.js')

Page({
  data: {
    posters: [
      `${api.ASSET_URL}/poster-home-3x4.png`
    ]
  },
  goService() {
    wx.navigateTo({
      url: '/pages/service/service'
    })
  }
})
