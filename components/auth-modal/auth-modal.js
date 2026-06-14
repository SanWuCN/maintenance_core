const api = require('../../utils/api.js')

Component({
  properties: {
    visible: {
      type: Boolean,
      value: false
    }
  },

  data: {
    loginStep: 'phone',
    phoneCode: '',
    submitting: false,
    randomSerial: 'SW-ID:SANWU',
    defaultAvatar: '/static/logo/swart-boot-logo.png',
    avatarDisplayUrl: '/static/logo/swart-boot-logo.png',
    loginForm: {
      nickName: '',
      avatarUrl: ''
    }
  },

  observers: {
    visible(value) {
      if (value) {
        this.resetModal()
      }
    }
  },

  lifetimes: {
    attached() {
      this.refreshSerial()
    }
  },

  methods: {
    noop() {},

    resetModal() {
      this.refreshSerial()
      this.setData({
        loginStep: 'phone',
        phoneCode: '',
        submitting: false,
        avatarDisplayUrl: this.data.defaultAvatar,
        loginForm: {
          nickName: '',
          avatarUrl: ''
        }
      })
    },

    refreshSerial() {
      const id = Math.random().toString(36).slice(2, 8).toUpperCase()
      this.setData({ randomSerial: `SW-ID:${id}` })
    },

    closeModal() {
      this.triggerEvent('close')
    },

    onPhoneLogin(e) {
      const detail = e.detail || {}
      if (!detail.code) {
        wx.showToast({
          title: '需要授权手机号登录',
          icon: 'none'
        })
        return
      }
      this.setData({
        phoneCode: detail.code,
        loginStep: 'profile'
      })
    },

    onChooseAvatar(e) {
      this.setData({
        avatarDisplayUrl: e.detail.avatarUrl,
        'loginForm.avatarUrl': e.detail.avatarUrl
      })
    },

    onNickInput(e) {
      this.setData({
        'loginForm.nickName': e.detail.value
      })
    },

    submitRegister() {
      const nickName = (this.data.loginForm.nickName || '').trim()
      const avatarUrl = this.data.loginForm.avatarUrl || ''
      if (!avatarUrl) {
        wx.showToast({ title: '请上传头像', icon: 'none' })
        return
      }
      if (!nickName) {
        wx.showToast({ title: '请填写昵称', icon: 'none' })
        return
      }
      if (this.data.submitting) return
      this.setData({ submitting: true })
      wx.showLoading({ title: '创建账号中' })
      wx.login({
        success: res => {
          api.request('/api/users/login', {
            method: 'POST',
            data: {
              clientUserId: getClientUserId(),
              loginCode: res.code,
              phoneCode: this.data.phoneCode,
              profile: {
                nickName,
                avatarUrl
              }
            }
          }).then(result => {
            const session = result.user || makeLocalSession(nickName, avatarUrl)
            this.finishLogin(session)
          }).catch(() => {
            this.finishLogin(makeLocalSession(nickName, avatarUrl))
          })
        },
        fail: () => {
          this.finishLogin(makeLocalSession(nickName, avatarUrl))
        }
      })
    },

    finishLogin(session) {
      wx.hideLoading()
      wx.setStorageSync('userSession', session)
      wx.setStorageSync('userInfo', {
        nickName: session.nickName,
        avatarUrl: session.avatarUrl
      })
      this.setData({ submitting: false })
      wx.showToast({ title: '登录成功' })
      this.triggerEvent('success', { user: session })
    }
  }
})

function getClientUserId() {
  let clientUserId = wx.getStorageSync('clientUserId')
  if (!clientUserId) {
    clientUserId = `client_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`
    wx.setStorageSync('clientUserId', clientUserId)
  }
  return clientUserId
}

function makeLocalSession(nickName, avatarUrl) {
  return {
    userId: getClientUserId(),
    nickName,
    avatarUrl,
    phone: '',
    points: 0,
    cardsCount: 0,
    couponsCount: 0,
    levelInfo: {
      name: 'IT小白',
      percent: 0,
      nextName: '入门IT',
      needPoints: 1000
    }
  }
}
