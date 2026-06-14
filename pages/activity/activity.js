const api = require('../../utils/api.js')

Page({
  data: {
    posters: [
      `${api.ASSET_URL}/poster-clean-1@2x.png`,
      `${api.ASSET_URL}/poster-clean-2@2x.png`
    ]
  },
  goService() {
    wx.navigateTo({
      url: '/pages/service/service'
    })
  }
})
