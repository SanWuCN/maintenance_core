const api = require('../../utils/api.js')

const POSTER_URLS = [
  `${api.ASSET_URL}/poster-home-3x4.png`,
  `${api.ASSET_URL}/poster-service-500-3x4.png`
]

Page({
  data: {
    heroReady: false,
    bootLogo: `${api.ASSET_URL}/app-icon-boot-transparent.png`,
    posters: []
  },
  onLoad() {
    const orderedPosters = shuffle(POSTER_URLS)
    this.posterUrls = orderedPosters
    this.setData({
      posters: resolvePosterPaths(orderedPosters)
    })
    this.cacheFirstPosterThenEnter(orderedPosters)
    this.cacheRestPosters(orderedPosters)
  },
  onPosterLoad() {},
  onPosterError() {
    this.setData({ heroReady: true })
    wx.showToast({
      title: '海报加载失败',
      icon: 'none'
    })
  },
  cacheFirstPosterThenEnter(posters) {
    const firstPoster = posters[0]
    if (getCachedPoster(firstPoster)) {
      this.setData({ heroReady: true })
      return
    }

    cachePoster(firstPoster, localPath => {
      this.applyCachedPoster(firstPoster, localPath)
      if (!this.data.heroReady) {
        this.setData({ heroReady: true })
      }
    }, () => {
      if (!this.data.heroReady) {
        this.setData({ heroReady: true })
      }
    })
  },
  cacheRestPosters(posters) {
    posters.forEach((url, index) => {
      if (index === 0) {
        return
      }
      if (getCachedPoster(url)) {
        return
      }
      cachePoster(url, localPath => {
        this.applyCachedPoster(url, localPath)
      })
    })
  },
  applyCachedPoster(url, localPath) {
    const index = this.posterUrls.indexOf(url)
    if (index < 0 || this.data.posters[index] === localPath) {
      return
    }
    const posters = this.data.posters.slice()
    posters[index] = localPath
    this.setData({ posters })
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

function resolvePosterPaths(urls) {
  return urls.map(url => getCachedPoster(url) || url)
}

function getCachedPoster(url) {
  const app = getApp()
  const cachedPath = app.globalData.posterCache[url] || ''
  if (!cachedPath) {
    return ''
  }
  try {
    wx.getFileSystemManager().accessSync(cachedPath)
    return cachedPath
  } catch (error) {
    delete app.globalData.posterCache[url]
    wx.setStorageSync('posterCache', app.globalData.posterCache)
    return ''
  }
}

function cachePoster(url, onSuccess, onFail) {
  wx.downloadFile({
    url,
    success(downloadResult) {
      if (downloadResult.statusCode !== 200) {
        if (onFail) onFail()
        return
      }
      wx.saveFile({
        tempFilePath: downloadResult.tempFilePath,
        success(saveResult) {
          const app = getApp()
          app.globalData.posterCache[url] = saveResult.savedFilePath
          wx.setStorageSync('posterCache', app.globalData.posterCache)
          if (onSuccess) onSuccess(saveResult.savedFilePath)
        },
        fail() {
          if (onFail) onFail()
        }
      })
    },
    fail() {
      if (onFail) onFail()
    }
  })
}
