const api = require('../../utils/api.js')

Component({
  properties: {
    visible: {
      type: Boolean,
      value: false
    }
  },

  data: {
    loginStep: 'phone', // 'phone' | 'profile'
    isPhoneStep: true,
    phoneCode: '',
    submitting: false,
    randomSerial: '',
    // 默认头像占位：如果本地有图填本地路径，否则不填将自动触发 WXSS 的极客风格 SVG 占位
    defaultAvatar: '/static/logo/swart-boot-logo.png', 
    avatarDisplayUrl: '',
    hasAvatar: false,
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

    // 重置弹窗状态
    resetModal() {
      this.refreshSerial()
      this.setData({
        loginStep: 'phone',
        isPhoneStep: true,
        phoneCode: '',
        submitting: false,
        avatarDisplayUrl: '',
        hasAvatar: false,
        'loginForm.nickName': '',
        'loginForm.avatarUrl': ''
      })
    },

    // 生成极客随机序列号
    refreshSerial() {
      const id = Math.random().toString(36).slice(2, 8).toUpperCase()
      this.setData({ randomSerial: `SW-ID:${id}` })
    },

    closeModal() {
      this.triggerEvent('close')
    },

    // 步骤一：手机号授权
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
        loginStep: 'profile',
        isPhoneStep: false
      })
    },

    // 步骤二：选取头像
    onChooseAvatar(e) {
      const { avatarUrl } = e.detail
      this.setData({
        avatarDisplayUrl: avatarUrl,
        hasAvatar: true,
        'loginForm.avatarUrl': avatarUrl
      })
    },

    // 监听昵称输入与失去焦点
    onNickInput(e) {
      this.setData({
        'loginForm.nickName': e.detail.value
      })
    },

    // 上传头像文件到服务器（选填：微信临时文件可能会失效，留此方法方便你以后扩展）
    uploadAvatarFile(tempFilePath) {
      return new Promise((resolve) => {
        // 如果你的后端不需要上传临时路径，或者没有写上传接口，直接返回原路径
        // 如果有上传接口，可以解开下面的注释修改：
        /*
        wx.uploadFile({
          url: '你的域名/api/common/upload', 
          filePath: tempFilePath,
          name: 'file',
          success: (res) => {
            const data = JSON.parse(res.data)
            resolve(data.url || tempFilePath)
          },
          fail: () => resolve(tempFilePath)
        })
        */
        resolve(tempFilePath)
      })
    },

    // 提交注册
    async submitRegister() {
      const nickName = (this.data.loginForm.nickName || '').trim()
      const rawAvatarUrl = this.data.loginForm.avatarUrl || ''

      if (!rawAvatarUrl) {
        wx.showToast({ title: '请上传头像', icon: 'none' })
        return
      }
      if (!nickName) {
        wx.showToast({ title: '请填写昵称', icon: 'none' })
        return
      }
      if (this.data.submitting) return

      this.setData({ submitting: true })
      wx.showLoading({ title: '创建账号中', mask: true })

      // 1. 处理头像路径（本地临时路径兜底或上传服务器）
      const finalAvatarUrl = await this.uploadAvatarFile(rawAvatarUrl)

      // 2. 调用微信静默登录获取最新的 code
      wx.login({
        success: res => {
          if (!res.code) {
            this.handleLoginFallback(nickName, finalAvatarUrl)
            return
          }

          // 3. 发送数据给后端进行登录注册集成接口
          api.request('/api/users/login', {
            method: 'POST',
            data: {
              clientUserId: getClientUserId(),
              loginCode: res.code,
              phoneCode: this.data.phoneCode,
              profile: {
                nickName: nickName,
                avatarUrl: finalAvatarUrl
              }
            }
          }).then(result => {
            // 后端有返回完整的 user 格式则用后端的，否则用本地创建的
            const session = result.user || makeLocalSession(nickName, finalAvatarUrl)
            this.finishLogin(session)
          }).catch(() => {
            // 接口报错时，使用本地 Session 强行登录
            this.handleLoginFallback(nickName, finalAvatarUrl)
          })
        },
        fail: () => {
          this.handleLoginFallback(nickName, finalAvatarUrl)
        }
      })
    },

    // 登录失败兜底处理
    handleLoginFallback(nickName, avatarUrl) {
      const session = makeLocalSession(nickName, avatarUrl)
      this.finishLogin(session)
    },

    // 登录成功状态存储与分发
    finishLogin(session) {
      wx.hideLoading()
      wx.setStorageSync('userSession', session)
      wx.setStorageSync('userInfo', {
        nickName: session.nickName,
        avatarUrl: session.avatarUrl
      })
      this.setData({ submitting: false })
      wx.showToast({ title: '登录成功', icon: 'success' })
      
      // 通知父组件
      this.triggerEvent('success', { user: session })
    }
  }
})

// 生成设备或客户端唯一标识
function getClientUserId() {
  let clientUserId = wx.getStorageSync('clientUserId')
  if (!clientUserId) {
    clientUserId = `client_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`
    wx.setStorageSync('clientUserId', clientUserId)
  }
  return clientUserId
}

// 本地离线 Session 生成器（极客风等级设计）
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
