Page({
  data: {
    posters: [
      '/static/posters/poster-home.jpg',
      '/static/posters/poster-service.jpg',
      '/static/posters/poster-performance.jpg'
    ]
  },
  goService() {
    wx.navigateTo({
      url: '/pages/service/service'
    })
  }
})
