const app = getApp()

Page({
  data: {
    actionReady: false,
    navigating: false,
    brands: ['联想', '华硕', '戴尔', '惠普', '苹果', '华为', '小米', '机械革命', '神舟', '其他'],
    selectedBrand: '联想',
    selectedModel: '',
    customModel: '',
    deviceNote: '',
    models: [],
    modelMap: {
      '联想': ['拯救者 Y7000P', '拯救者 R7000P', '小新 Pro 14', 'ThinkBook 14+', 'ThinkPad E14'],
      '华硕': ['天选 4', '天选 5 Pro', 'ROG 魔霸', '无畏 Pro 15', '灵耀 14'],
      '戴尔': ['游匣 G15', '灵越 14 Plus', 'XPS 13', '成就  Vostro', '外星人 m16'],
      '惠普': ['暗影精灵 9', '暗影精灵 10', '战 66', '星 Book Pro', 'ENVY 13'],
      '苹果': ['MacBook Air M1', 'MacBook Air M2', 'MacBook Pro 13', 'MacBook Pro 14', 'MacBook Pro 16'],
      '华为': ['MateBook 14', 'MateBook D 14', 'MateBook X Pro', 'MateBook 16s'],
      '小米': ['RedmiBook Pro 14', 'RedmiBook Pro 15', '小米笔记本 Pro', 'Redmi G'],
      '机械革命': ['极光 Pro', '蛟龙 16', '旷世 16', '无界 14 Pro'],
      '神舟': ['战神 Z7', '战神 Z8', '优雅 X5', '战神 TX9'],
      '其他': ['不确定型号', '台式机主机', '一体机', '其他笔记本']
    }
  },
  onLoad() {
    const saved = app.globalData.booking.device || {}
    const selectedBrand = saved.brand || '联想'
    const models = this.data.modelMap[selectedBrand]
    this.setData({
      selectedBrand,
      models,
      selectedModel: saved.model || models[0],
      customModel: saved.customModel || '',
      deviceNote: saved.note || ''
    })
  },
  onReady() {
    this.setData({ actionReady: true })
  },
  selectBrand(e) {
    const selectedBrand = e.currentTarget.dataset.brand
    const models = this.data.modelMap[selectedBrand]
    this.setData({
      selectedBrand,
      models,
      selectedModel: models[0]
    })
  },
  selectModel(e) {
    this.setData({
      selectedModel: e.currentTarget.dataset.model
    })
  },
  onCustomModel(e) {
    this.setData({ customModel: e.detail.value })
  },
  onNote(e) {
    this.setData({ deviceNote: e.detail.value })
  },
  next() {
    if (this.data.navigating) return
    const finalModel = this.data.customModel || this.data.selectedModel
    if (!finalModel) {
      wx.showToast({
        title: '请选择或填写型号',
        icon: 'none'
      })
      return
    }
    app.globalData.booking = {
      ...app.globalData.booking,
      device: {
        brand: this.data.selectedBrand,
        model: this.data.selectedModel,
        customModel: this.data.customModel,
        finalModel,
        note: this.data.deviceNote
      }
    }
    this.setData({ navigating: true })
    wx.navigateTo({
      url: '/pages/dorm/dorm',
      complete: () => {
        this.setData({ navigating: false })
      }
    })
  }
})
