const app = getApp()
const bookingFlow = require('../../utils/bookingFlow.js')

const modelMap = {
  '联想': ['拯救者系列', '小新系列', 'ThinkPad', 'ThinkBook', 'Yoga', 'IdeaPad', '昭阳', '扬天'],
  '华硕': ['天选 / TUF', 'ROG 魔霸 / 枪神', 'ROG 幻 / Flow', '灵耀 Zenbook', '无畏 Vivobook', '破晓 / ExpertBook', 'ProArt 创艺国度'],
  '戴尔': ['游匣 G 系列', 'XPS', '灵越 Inspiron', '成就 Vostro', 'Latitude', 'Precision', 'Alienware 外星人'],
  '惠普': ['暗影精灵 OMEN', '光影精灵 Victus', '星 Book / Pavilion', '战 66 / ProBook', 'ENVY', 'Spectre', 'EliteBook', 'ZBook'],
  '苹果': ['MacBook Air', 'MacBook Pro', 'Mac mini', 'iMac', 'Mac Studio'],
  '华为': ['MateBook D', 'MateBook 14 / 16', 'MateBook X Pro', 'MateBook E', 'MateBook GT', 'MateStation'],
  '小米/Redmi': ['RedmiBook Pro', 'RedmiBook', 'Redmi G', 'Xiaomi Book Pro', '小米笔记本 Air', '小米笔记本 Pro'],
  '机械革命': ['极光', '蛟龙', '旷世', '耀世', '无界', '翼龙', '深海泰坦'],
  '神舟': ['战神 Z 系列', '战神 T / TX 系列', '战神 G 系列', '优雅', '精盾', '承运'],
  '荣耀': ['MagicBook X', 'MagicBook Pro', 'MagicBook Art', 'MagicBook V', 'MagicBook 数字系列'],
  '宏碁': ['暗影骑士 Nitro', '掠夺者 Predator', '非凡 Swift', 'Aspire', 'TravelMate', 'ConceptD'],
  '微星': ['Titan', 'Raider', 'Vector', 'Stealth', 'Pulse', 'Katana', 'Cyborg', 'Thin', 'Prestige', 'Modern', 'Summit', 'Creator'],
  '雷蛇': ['Blade 14', 'Blade 15', 'Blade 16', 'Blade 18', 'Blade Stealth', 'Razer Book'],
  '其他': ['不确定型号', '台式机主机', '一体机', '迷你主机', '其他笔记本']
}

const yearGroups = [
  { key: '2026', label: '2026' },
  { key: '2025', label: '2025' },
  { key: '2024', label: '2024' },
  { key: '2023', label: '2023' },
  { key: '2022', label: '2022' },
  { key: '2021', label: '2021' },
  { key: '2020', label: '2020' },
  { key: '2019', label: '2019' }
]

const recommendationMap = {
  '联想:拯救者系列': yearGroups.map(group => ({
    ...group,
    items: ['Y9000P', 'R9000P', 'Y7000P', 'R7000P', 'Y9000X', 'R9000X', 'Y7000', 'R7000', 'Y9000K', 'R9000K']
  })),
  '联想:小新系列': [
    { key: 'pro', label: 'Pro', includeLabel: false, items: ['小新 Pro 14', '小新 Pro 16', '小新 Pro 13', '小新 Pro AI 14', '小新 Pro AI 16'] },
    { key: 'air', label: 'Air', includeLabel: false, items: ['小新 Air 14', '小新 Air 15', '小新 Air 13', '小新 Air 14 Plus'] },
    { key: 'digital', label: '数字', includeLabel: false, items: ['小新 14', '小新 15', '小新 16', '小新 14 Plus', '小新 16 Plus'] },
    { key: 'pad', label: '二合一', includeLabel: false, items: ['小新 Pad Pro', '小新 Duet', '小新 Flex'] }
  ],
  '联想:ThinkPad': [
    { key: 'x1', label: 'X1', includeLabel: false, items: ['X1 Carbon', 'X1 Yoga', 'X1 Nano', 'X1 2-in-1'] },
    { key: 'x', label: 'X', includeLabel: false, items: ['X13', 'X13 Yoga', 'X12 Detachable'] },
    { key: 't', label: 'T', includeLabel: false, items: ['T14', 'T14s', 'T16', 'T490', 'T480'] },
    { key: 'e', label: 'E', includeLabel: false, items: ['E14', 'E15', 'E16', 'E480', 'E580'] },
    { key: 'p', label: 'P', includeLabel: false, items: ['P14s', 'P15', 'P16', 'P1', 'P16v'] },
    { key: 'l', label: 'L', includeLabel: false, items: ['L13', 'L14', 'L15', 'L16'] }
  ],
  '联想:ThinkBook': [
    { key: 'plus', label: 'Plus', includeLabel: false, items: ['ThinkBook 14+', 'ThinkBook 16+', 'ThinkBook Plus'] },
    { key: 'normal', label: '数字', includeLabel: false, items: ['ThinkBook 14', 'ThinkBook 15', 'ThinkBook 16', 'ThinkBook 13x'] },
    { key: 'workstation', label: '高性能', includeLabel: false, items: ['ThinkBook 16p', 'ThinkBook 14p', 'ThinkBook 16 G7'] }
  ],
  '联想:Yoga': [
    { key: 'slim', label: 'Slim', includeLabel: false, items: ['Yoga Slim 7', 'Yoga Slim 7 Pro', 'Yoga Slim 9'] },
    { key: 'pro', label: 'Pro', includeLabel: false, items: ['Yoga Pro 14s', 'Yoga Pro 16s', 'Yoga Pro 7'] },
    { key: 'book', label: 'Book', includeLabel: false, items: ['Yoga Book 9i', 'Yoga Book'] }
  ],

  '华硕:天选 / TUF': yearGroups.map(group => ({
    ...group,
    items: ['天选 6', '天选 5 Pro', '天选 5', '天选 4', 'TUF Gaming A15', 'TUF Gaming A16', 'TUF Gaming F15', 'TUF Gaming F16', 'TUF Dash F15']
  })),
  '华硕:ROG 魔霸 / 枪神': yearGroups.map(group => ({
    ...group,
    items: ['魔霸新锐', '魔霸 7 Plus', '枪神 8', '枪神 7 Plus', 'Strix G16', 'Strix G18', 'Strix Scar 16', 'Strix Scar 18']
  })),
  '华硕:ROG 幻 / Flow': [
    { key: 'zephyrus', label: '幻', includeLabel: false, items: ['幻 14', '幻 16', '幻 X', 'Zephyrus G14', 'Zephyrus G16', 'Zephyrus Duo'] },
    { key: 'flow', label: 'Flow', includeLabel: false, items: ['Flow X13', 'Flow Z13', 'Flow X16'] }
  ],
  '华硕:灵耀 Zenbook': [
    { key: 'zenbook', label: 'Zenbook', includeLabel: false, items: ['灵耀 14', '灵耀 14 Air', '灵耀 16', 'Zenbook 14 OLED', 'Zenbook Pro 14', 'Zenbook Duo'] }
  ],
  '华硕:无畏 Vivobook': [
    { key: 'vivobook', label: 'Vivobook', includeLabel: false, items: ['无畏 Pro 14', '无畏 Pro 15', '无畏 Pro 16', 'Vivobook 14', 'Vivobook 15', 'Vivobook S 14', 'Vivobook S 16'] }
  ],

  '戴尔:游匣 G 系列': yearGroups.map(group => ({
    ...group,
    items: ['G15', 'G16', 'G7', 'G3', 'G5']
  })),
  '戴尔:XPS': [
    { key: 'xps', label: 'XPS', includeLabel: false, items: ['XPS 13', 'XPS 14', 'XPS 15', 'XPS 16', 'XPS 17', 'XPS 13 Plus'] }
  ],
  '戴尔:灵越 Inspiron': [
    { key: 'inspiron', label: 'Inspiron', includeLabel: false, items: ['灵越 13', '灵越 14', '灵越 15', '灵越 16 Plus', 'Inspiron 14', 'Inspiron 16'] }
  ],
  '戴尔:成就 Vostro': [
    { key: 'vostro', label: 'Vostro', includeLabel: false, items: ['成就 13', '成就 14', '成就 15', '成就 16', 'Vostro 3420', 'Vostro 5620'] }
  ],
  '戴尔:Latitude': [
    { key: 'latitude', label: 'Latitude', includeLabel: false, items: ['Latitude 3340', 'Latitude 5440', 'Latitude 5540', 'Latitude 7440', 'Latitude 7640', 'Latitude 9450'] }
  ],
  '戴尔:Precision': [
    { key: 'precision', label: 'Precision', includeLabel: false, items: ['Precision 3480', 'Precision 3581', 'Precision 5480', 'Precision 5680', 'Precision 7680', 'Precision 7780'] }
  ],
  '戴尔:Alienware 外星人': [
    { key: 'm', label: 'm 系列', includeLabel: false, items: ['Alienware m15', 'Alienware m16', 'Alienware m17', 'Alienware m18'] },
    { key: 'x', label: 'x 系列', includeLabel: false, items: ['Alienware x14', 'Alienware x15', 'Alienware x16', 'Alienware x17'] },
    { key: 'area', label: 'Area', includeLabel: false, items: ['Area-51m', 'Area-51'] }
  ],

  '惠普:暗影精灵 OMEN': yearGroups.map(group => ({
    ...group,
    items: ['暗影精灵 11', '暗影精灵 10', '暗影精灵 9', 'OMEN 16', 'OMEN 17', 'OMEN Transcend 14', 'OMEN Transcend 16']
  })),
  '惠普:光影精灵 Victus': yearGroups.map(group => ({
    ...group,
    items: ['光影精灵 10', '光影精灵 9', 'Victus 15', 'Victus 16']
  })),
  '惠普:星 Book / Pavilion': [
    { key: 'star', label: '星', includeLabel: false, items: ['星 Book Pro 14', '星 Book Pro 16', '星 14', '星 15', 'Pavilion 14', 'Pavilion 15'] }
  ],
  '惠普:战 66 / ProBook': [
    { key: 'probook', label: 'ProBook', includeLabel: false, items: ['战 66', '战 99', 'ProBook 440', 'ProBook 445', 'ProBook 450', 'ProBook 455'] }
  ],
  '惠普:ENVY': [
    { key: 'envy', label: 'ENVY', includeLabel: false, items: ['ENVY 13', 'ENVY 14', 'ENVY 15', 'ENVY 16', 'ENVY x360 14', 'ENVY x360 15'] }
  ],
  '惠普:EliteBook': [
    { key: 'elite', label: 'EliteBook', includeLabel: false, items: ['EliteBook 630', 'EliteBook 640', 'EliteBook 645', 'EliteBook 830', 'EliteBook 840', 'EliteBook 860', 'EliteBook x360'] }
  ],
  '惠普:ZBook': [
    { key: 'zbook', label: 'ZBook', includeLabel: false, items: ['ZBook Firefly 14', 'ZBook Firefly 16', 'ZBook Power', 'ZBook Studio', 'ZBook Fury'] }
  ],

  '苹果:MacBook Air': [
    { key: 'chip', label: '芯片', includeLabel: false, items: ['MacBook Air M4 13', 'MacBook Air M4 15', 'MacBook Air M3 13', 'MacBook Air M3 15', 'MacBook Air M2 13', 'MacBook Air M2 15', 'MacBook Air M1'] }
  ],
  '苹果:MacBook Pro': [
    { key: 'chip', label: '芯片', includeLabel: false, items: ['MacBook Pro M4 14', 'MacBook Pro M4 Pro 14', 'MacBook Pro M4 Max 16', 'MacBook Pro M3 14', 'MacBook Pro M2 13', 'MacBook Pro 16 Intel'] }
  ],
  '苹果:Mac mini': [
    { key: 'chip', label: '芯片', includeLabel: false, items: ['Mac mini M4', 'Mac mini M4 Pro', 'Mac mini M2', 'Mac mini M1', 'Mac mini Intel'] }
  ],

  '华为:MateBook D': [
    { key: 'd', label: 'D', includeLabel: false, items: ['MateBook D 14', 'MateBook D 15', 'MateBook D 16', 'MateBook D 14 SE'] }
  ],
  '华为:MateBook 14 / 16': [
    { key: 'normal', label: '数字', includeLabel: false, items: ['MateBook 14', 'MateBook 14s', 'MateBook 16', 'MateBook 16s', 'MateBook 16 Pro'] }
  ],
  '华为:MateBook X Pro': [
    { key: 'xpro', label: 'X Pro', includeLabel: false, items: ['MateBook X Pro 2026', 'MateBook X Pro 2025', 'MateBook X Pro 2024', 'MateBook X Pro 2023'] }
  ],
  '华为:MateBook E': [
    { key: 'e', label: 'E', includeLabel: false, items: ['MateBook E', 'MateBook E Go', 'MateBook E 2023'] }
  ],

  '小米/Redmi:RedmiBook Pro': [
    { key: 'pro', label: 'Pro', includeLabel: false, items: ['RedmiBook Pro 14', 'RedmiBook Pro 15', 'RedmiBook Pro 16'] }
  ],
  '小米/Redmi:Redmi G': yearGroups.map(group => ({
    ...group,
    items: ['Redmi G', 'Redmi G Pro', 'Redmi G 2022']
  })),
  '小米/Redmi:Xiaomi Book Pro': [
    { key: 'book', label: 'Book', includeLabel: false, items: ['Xiaomi Book Pro 14', 'Xiaomi Book Pro 16', 'Xiaomi Book Air 13', '小米笔记本 Pro 14', '小米笔记本 Pro 15'] }
  ],

  '机械革命:极光': yearGroups.map(group => ({ ...group, items: ['极光 Pro', '极光 X', '极光 15', '极光 16'] })),
  '机械革命:蛟龙': yearGroups.map(group => ({ ...group, items: ['蛟龙 15K', '蛟龙 16K', '蛟龙 16 Pro', '蛟龙 17K'] })),
  '机械革命:旷世': yearGroups.map(group => ({ ...group, items: ['旷世 16', '旷世 16 Pro', '旷世 17', '旷世 X'] })),
  '机械革命:无界': [
    { key: 'wujie', label: '无界', includeLabel: false, items: ['无界 14', '无界 14 Pro', '无界 15', '无界 16 Pro'] }
  ],

  '神舟:战神 Z 系列': yearGroups.map(group => ({ ...group, items: ['战神 Z7', '战神 Z8', '战神 Z9', '战神 Z10', '战神 Z7-DA5'] })),
  '神舟:战神 T / TX 系列': yearGroups.map(group => ({ ...group, items: ['战神 T8', '战神 T9', '战神 TX8', '战神 TX9', '战神 TX10'] })),
  '神舟:优雅': [
    { key: 'elegant', label: '优雅', includeLabel: false, items: ['优雅 X4', '优雅 X5', '优雅 X6', '优雅 HP 系列'] }
  ],

  '荣耀:MagicBook X': [
    { key: 'x', label: 'X', includeLabel: false, items: ['MagicBook X 14', 'MagicBook X 15', 'MagicBook X 16', 'MagicBook X 14 Pro', 'MagicBook X 16 Pro'] }
  ],
  '荣耀:MagicBook Pro': [
    { key: 'pro', label: 'Pro', includeLabel: false, items: ['MagicBook Pro 14', 'MagicBook Pro 16', 'MagicBook Pro 2024'] }
  ],
  '荣耀:MagicBook Art': [
    { key: 'art', label: 'Art', includeLabel: false, items: ['MagicBook Art 14'] }
  ],

  '宏碁:暗影骑士 Nitro': yearGroups.map(group => ({ ...group, items: ['暗影骑士 擎', '暗影骑士 龙', 'Nitro 5', 'Nitro 16', 'Nitro 17', 'Nitro V 15', 'Nitro V 16'] })),
  '宏碁:掠夺者 Predator': [
    { key: 'predator', label: 'Predator', includeLabel: false, items: ['Helios Neo 16', 'Helios 16', 'Helios 18', 'Triton 14', 'Triton 17X'] }
  ],
  '宏碁:非凡 Swift': [
    { key: 'swift', label: 'Swift', includeLabel: false, items: ['非凡 Go 14', '非凡 Go 16', 'Swift 3', 'Swift 5', 'Swift X 14', 'Swift Edge'] }
  ],

  '微星:Titan': [
    { key: 'titan', label: 'Titan', includeLabel: false, items: ['Titan 18 HX', 'Titan GT77', 'Titan GT76'] }
  ],
  '微星:Raider': [
    { key: 'raider', label: 'Raider', includeLabel: false, items: ['Raider 18 HX', 'Raider GE78 HX', 'Raider GE68 HX', 'Raider GE77'] }
  ],
  '微星:Vector': [
    { key: 'vector', label: 'Vector', includeLabel: false, items: ['Vector 16 HX', 'Vector 17 HX', 'Vector GP68 HX', 'Vector GP78 HX'] }
  ],
  '微星:Stealth': [
    { key: 'stealth', label: 'Stealth', includeLabel: false, items: ['Stealth 14 Studio', 'Stealth 16 Studio', 'Stealth 17 Studio'] }
  ],
  '微星:Katana': [
    { key: 'katana', label: 'Katana', includeLabel: false, items: ['Katana 15', 'Katana 17', 'Katana GF66', 'Katana GF76'] }
  ],
  '微星:Cyborg': [
    { key: 'cyborg', label: 'Cyborg', includeLabel: false, items: ['Cyborg 14', 'Cyborg 15', 'Cyborg 15 AI'] }
  ],
  '微星:Prestige': [
    { key: 'prestige', label: 'Prestige', includeLabel: false, items: ['Prestige 13 AI Evo', 'Prestige 14', 'Prestige 16 AI Evo', 'Prestige 16 Studio'] }
  ],
  '微星:Modern': [
    { key: 'modern', label: 'Modern', includeLabel: false, items: ['Modern 14', 'Modern 15', 'Modern AM242', 'Modern MD271'] }
  ],

  '雷蛇:Blade 14': yearGroups.map(group => ({ ...group, items: ['Blade 14'] })),
  '雷蛇:Blade 15': yearGroups.map(group => ({ ...group, items: ['Blade 15 Advanced', 'Blade 15 Base', 'Blade 15 Studio'] })),
  '雷蛇:Blade 16': yearGroups.map(group => ({ ...group, items: ['Blade 16'] })),
  '雷蛇:Blade 18': yearGroups.map(group => ({ ...group, items: ['Blade 18'] }))
}

Page({
  data: {
    actionReady: false,
    navigating: false,
    flowSteps: [],
    brands: Object.keys(modelMap),
    selectedBrand: '联想',
    selectedModel: '',
    customModel: '',
    deviceNote: '',
    models: [],
    modelPanelCollapsed: false,
    modelSuggestVisible: false,
    recommendGroups: [],
    selectedRecommendGroupKey: '',
    selectedRecommendItems: []
  },

  onLoad() {
    const saved = app.globalData.booking.device || {}
    const selectedBrand = saved.brand || '联想'
    const models = modelMap[selectedBrand] || modelMap['其他']
    const selectedModel = saved.model || models[0]
    this.setData({
      selectedBrand,
      models,
      selectedModel,
      modelPanelCollapsed: Boolean(saved.model || saved.customModel),
      customModel: saved.customModel || '',
      deviceNote: saved.note || ''
    })
  },

  onShow() {
    this.refreshFlowSteps()
  },

  onReady() {
    this.setData({ actionReady: true })
  },

  refreshFlowSteps() {
    this.setData({
      flowSteps: bookingFlow.buildFlowSteps('device', app.globalData.booking)
    })
  },

  goFlowStep(e) {
    bookingFlow.goFlowStep(e.currentTarget.dataset.key, 'device', app.globalData.booking)
  },

  selectBrand(e) {
    const selectedBrand = e.currentTarget.dataset.brand
    const models = modelMap[selectedBrand] || modelMap['其他']
    this.setData({
      selectedBrand,
      models,
      selectedModel: models[0],
      customModel: '',
      modelPanelCollapsed: false,
      modelSuggestVisible: false
    })
  },

  selectModel(e) {
    this.setData({
      selectedModel: e.currentTarget.dataset.model,
      customModel: '',
      modelPanelCollapsed: true,
      modelSuggestVisible: false
    })
  },

  expandModelPanel() {
    this.setData({ modelPanelCollapsed: false })
  },

  getRecommendGroups() {
    const key = `${this.data.selectedBrand}:${this.data.selectedModel}`
    return recommendationMap[key] || this.buildFallbackGroups()
  },

  buildFallbackGroups() {
    if (!this.data.selectedModel || this.data.selectedModel === '其他笔记本') return []
    return [
      {
        key: 'common',
        label: '常见',
        includeLabel: false,
        items: [
          this.data.selectedModel,
          `${this.data.selectedModel} 14`,
          `${this.data.selectedModel} 15`,
          `${this.data.selectedModel} 16`,
          `${this.data.selectedModel} Pro`,
          `${this.data.selectedModel} Plus`
        ]
      },
      {
        key: 'year',
        label: '年份',
        includeLabel: false,
        items: ['2026 款', '2025 款', '2024 款', '2023 款', '2022 款']
      }
    ]
  },

  openModelSuggest() {
    const groups = this.getRecommendGroups()
    if (!groups.length) return
    const selectedGroup = groups[0]
    this.setData({
      modelSuggestVisible: true,
      recommendGroups: groups,
      selectedRecommendGroupKey: selectedGroup.key,
      selectedRecommendItems: selectedGroup.items
    })
  },

  closeModelSuggest() {
    this.setData({ modelSuggestVisible: false })
  },

  selectRecommendGroup(e) {
    const groupKey = e.currentTarget.dataset.key
    const group = this.data.recommendGroups.find(item => item.key === groupKey)
    if (!group) return
    this.setData({
      selectedRecommendGroupKey: group.key,
      selectedRecommendItems: group.items
    })
  },

  chooseRecommendModel(e) {
    const model = e.currentTarget.dataset.model
    const group = this.data.recommendGroups.find(item => item.key === this.data.selectedRecommendGroupKey)
    const customModel = group && group.includeLabel !== false ? `${group.label} ${model}` : model
    this.setData({
      customModel,
      modelSuggestVisible: false
    })
  },

  onCustomModel(e) {
    this.setData({ customModel: e.detail.value })
  },

  confirmCustomModel() {
    this.closeModelSuggest()
  },

  onNote(e) {
    this.setData({ deviceNote: e.detail.value })
  },

  noop() {},

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
    wx.redirectTo({
      url: '/pages/dorm/dorm',
      complete: () => {
        this.setData({ navigating: false })
      }
    })
  }
})
