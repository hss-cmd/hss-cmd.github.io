export function statusBarHeight() {
  try {
    const info = uni.getSystemInfoSync()
    return info.statusBarHeight || 0
  } catch (e) {
    return 0
  }
}

export function toast(title) {
  uni.showToast({ title, icon: 'none' })
}
