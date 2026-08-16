export const THEMES = [
  { id: 'mint', name: '薄荷绿', c: '#2EC4B6' },
  { id: 'sky', name: '天空蓝', c: '#4E9FF0' },
  { id: 'coral', name: '珊瑚橙', c: '#FF7A59' },
  { id: 'cream', name: '奶油黄', c: '#F5B342' },
  { id: 'pink', name: '淡粉色', c: '#FF8FAB' },
  { id: 'grape', name: '葡萄紫', c: '#8B7CF6' }
]

export function getThemeId() {
  try {
    return uni.getStorageSync('nb_theme') || 'mint'
  } catch (e) {
    return 'mint'
  }
}

export function saveThemeId(id) {
  uni.setStorageSync('nb_theme', id)
}

export function getDark() {
  try {
    return uni.getStorageSync('nb_dark') === '1'
  } catch (e) {
    return false
  }
}

export function saveDark(v) {
  uni.setStorageSync('nb_dark', v ? '1' : '0')
}
