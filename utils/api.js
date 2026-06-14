const BASE_URL = 'https://appruya.top:40208/swart-api'
const ASSET_URL = 'https://appruya.top:40208/swart-assets'

const request = (path, options = {}) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}${path}`,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'content-type': 'application/json'
      },
      success: res => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
          return
        }
        reject(new Error((res.data && res.data.message) || '接口请求失败'))
      },
      fail: reject
    })
  })
}

module.exports = {
  BASE_URL,
  ASSET_URL,
  request
}
