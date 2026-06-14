const FLOW_STEPS = [
  { key: 'service', label: '服务', url: '/pages/service/service' },
  { key: 'schedule', label: '时间', url: '/pages/schedule/schedule' },
  { key: 'device', label: '设备', url: '/pages/device/device' },
  { key: 'dorm', label: '地址', url: '/pages/dorm/dorm' }
]

function canVisitStep(key, booking = {}) {
  if (key === 'service') return true
  if (key === 'schedule') return Boolean(booking.service)
  if (key === 'device') return Boolean(booking.service && booking.schedule)
  if (key === 'dorm') return Boolean(booking.service && booking.schedule && booking.device)
  return false
}

function buildFlowSteps(currentKey, booking = {}) {
  const currentIndex = FLOW_STEPS.findIndex(item => item.key === currentKey)
  return FLOW_STEPS.map((item, index) => {
    const isCurrent = item.key === currentKey
    const canVisit = isCurrent || canVisitStep(item.key, booking)
    return {
      ...item,
      canVisit,
      state: isCurrent ? 'active' : (canVisit && index < currentIndex ? 'done' : ''),
      lockClass: canVisit ? 'clickable' : 'locked'
    }
  })
}

function goFlowStep(stepKey, currentKey, booking = {}) {
  const target = FLOW_STEPS.find(item => item.key === stepKey)
  if (!target || target.key === currentKey) return
  if (!canVisitStep(target.key, booking)) {
    wx.showToast({
      title: '请先完成前一步',
      icon: 'none'
    })
    return
  }
  wx.redirectTo({ url: target.url })
}

module.exports = {
  buildFlowSteps,
  goFlowStep
}
