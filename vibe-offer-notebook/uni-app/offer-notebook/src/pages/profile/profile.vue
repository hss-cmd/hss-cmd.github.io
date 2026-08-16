<template>
  <view :class="['page', 'theme-' + themeId, { dark: isDark }]">
    <view class="sb" :style="{ height: sbHeight + 'px' }"></view>

    <view class="topbar">
      <view>
        <view class="greet">我的</view>
        <view class="sub">秋招进行中 · 目标：产品经理</view>
      </view>
      <view class="icon-btn" @click="sheetOpen = true">🎨</view>
    </view>

    <view class="profile-card">
      <view class="p-avatar-lg">杨</view>
      <view class="p-info">
        <view class="p-name">小杨同学</view>
        <view class="p-school">XX 大学 · 2027 届 · 计算机科学与技术</view>
        <view class="p-tags">
          <text class="tag1">秋招中</text>
          <text class="tag2">目标：产品经理</text>
        </view>
      </view>
      <view class="edit-p" @click="toast('编辑资料 🚧')">✏️</view>
    </view>

    <view class="resume-card">
      <view class="rc-ico">📄</view>
      <view class="rc-info">
        <view class="rc-title">我的简历</view>
        <view class="rc-bar"><view class="rc-fill"></view></view>
        <view class="rc-pct">简历完整度 85% · 记得保持最新</view>
      </view>
      <view class="rc-btn" @click="toast('简历上传 / 更新 🚧')">更新</view>
    </view>

    <view class="my-stats">
      <view class="my-stat"><view class="ms-num">{{ stats.applied }}</view><view class="ms-lbl">累计投递</view></view>
      <view class="my-stat"><view class="ms-num">{{ stats.interview }}</view><view class="ms-lbl">面试场次</view></view>
      <view class="my-stat"><view class="ms-num">{{ stats.offered }}</view><view class="ms-lbl">Offer</view></view>
    </view>

    <view class="menu-card">
      <view v-for="m in MENU" :key="m.title" class="menu-item" @click="m.fn()">
        <view class="m-ico" :style="{ background: m.bg }">{{ m.emoji }}</view>
        <text class="m-title">{{ m.title }}</text>
        <text class="m-arr">›</text>
      </view>
    </view>

    <view class="ver-foot">校招记录本 Offer Notebook · v1.0.0<br />愿每一次记录，都有回响 ✨</view>

    <!-- 主题设置底部面板 -->
    <view v-if="sheetOpen" class="mask" @click="sheetOpen = false">
      <view class="sheet" @click.stop>
        <view class="sheet-title">🎨 主题设置</view>
        <view class="sheet-sub">选择一个喜欢的主题色，深浅模式随时切换</view>
        <view class="swatches">
          <view v-for="t in THEMES" :key="t.id" class="sw-wrap">
            <view class="swatch" :class="{ active: themeId === t.id }" :style="{ background: t.c }" @click="pickTheme(t.id)">
              <text v-if="themeId === t.id" class="sw-check">✓</text>
            </view>
            <text class="sw-name">{{ t.name }}</text>
          </view>
        </view>
        <view class="dark-row">
          <text>深色模式</text>
          <switch :checked="isDark" color="#2EC4B6" style="transform: scale(0.8)" @change="onDark" />
        </view>
        <view class="btn-primary sheet-done" @click="sheetOpen = false">完成</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { THEMES, getThemeId, getDark, saveThemeId, saveDark } from '../../store/theme.js'
import { loadRecords } from '../../store/records.js'
import { statusBarHeight, toast } from '../../utils/system.js'

const themeId = ref(getThemeId())
const isDark = ref(getDark())
const sbHeight = statusBarHeight()
const sheetOpen = ref(false)
const records = ref([])

onShow(() => {
  themeId.value = getThemeId()
  isDark.value = getDark()
  records.value = loadRecords()
})

const stats = computed(() => {
  const c = s => records.value.filter(r => r.stage === s).length
  return { applied: records.value.length, interview: c('interview'), offered: c('offered') }
})

const MENU = [
  { emoji: '⭐', bg: 'var(--accent-soft)', title: '我的收藏', fn: () => toast('我的收藏 🚧') },
  { emoji: '📝', bg: 'var(--grape-soft)', title: '我的帖子', fn: () => toast('我的帖子 🚧') },
  { emoji: '📅', bg: 'var(--coral-soft)', title: '面试日历', fn: () => toast('面试日历：明天 10:00 字节一面 📅') },
  { emoji: '📊', bg: 'var(--info-soft)', title: '数据导出', fn: () => toast('已生成投递报告，可导出 TXT / CSV 📊') },
  { emoji: '🎨', bg: 'var(--primary-soft)', title: '主题设置', fn: () => { sheetOpen.value = true } },
  { emoji: '💬', bg: 'var(--warn-soft)', title: '帮助与反馈', fn: () => toast('帮助与反馈 🚧') }
]

function pickTheme(id) {
  saveThemeId(id)
  themeId.value = id
  toast('已切换为' + (THEMES.find(t => t.id === id) || {}).name)
}

function onDark(e) {
  saveDark(e.detail.value)
  isDark.value = e.detail.value
}
</script>

<style scoped>
.sb { width: 100% }
.topbar { display: flex; justify-content: space-between; align-items: center; padding: 26rpx 0 24rpx }
.greet { font-size: 44rpx; font-weight: 800 }
.sub { font-size: 25rpx; color: var(--text-2); margin-top: 6rpx }
.icon-btn {
  width: 80rpx; height: 80rpx; border-radius: 28rpx; background: var(--card);
  box-shadow: var(--shadow); display: flex; align-items: center; justify-content: center; font-size: 34rpx;
}

.profile-card {
  display: flex; gap: 24rpx; align-items: center; background: var(--card);
  border-radius: 44rpx; padding: 34rpx; box-shadow: var(--shadow);
}
.p-avatar-lg {
  width: 116rpx; height: 116rpx; border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--grape)); color: var(--on-primary);
  display: flex; align-items: center; justify-content: center; font-size: 48rpx; font-weight: 800; flex-shrink: 0;
  box-shadow: 0 16rpx 36rpx rgba(46, 196, 182, 0.35);
}
.p-info { flex: 1; min-width: 0 }
.p-name { font-size: 34rpx; font-weight: 800 }
.p-school { font-size: 23rpx; color: var(--text-2); margin-top: 4rpx }
.p-tags { display: flex; gap: 12rpx; margin-top: 14rpx; flex-wrap: wrap }
.p-tags text { font-size: 21rpx; font-weight: 700; padding: 6rpx 18rpx; border-radius: 99rpx }
.tag1 { background: var(--primary-soft); color: var(--primary-deep) }
.tag2 { background: var(--accent-soft); color: var(--accent-deep) }
.edit-p { width: 68rpx; height: 68rpx; border-radius: 22rpx; background: var(--bg); display: flex; align-items: center; justify-content: center; font-size: 28rpx }

.resume-card {
  display: flex; gap: 22rpx; align-items: center;
  background: linear-gradient(135deg, var(--info-soft), var(--grape-soft));
  border-radius: 40rpx; padding: 30rpx; margin-top: 24rpx;
}
.rc-ico { width: 88rpx; height: 88rpx; border-radius: 28rpx; background: var(--card); display: flex; align-items: center; justify-content: center; font-size: 40rpx; box-shadow: 0 10rpx 24rpx rgba(0, 0, 0, 0.08); flex-shrink: 0 }
.rc-info { flex: 1; min-width: 0 }
.rc-title { font-size: 28rpx; font-weight: 800 }
.rc-bar { height: 12rpx; border-radius: 99rpx; background: rgba(255, 255, 255, 0.75); margin-top: 14rpx; overflow: hidden }
.rc-fill { height: 100%; width: 85%; border-radius: 99rpx; background: var(--info) }
.rc-pct { font-size: 22rpx; color: var(--text-2); margin-top: 10rpx }
.rc-btn { background: var(--card); color: var(--info); font-size: 24rpx; font-weight: 800; padding: 16rpx 28rpx; border-radius: 99rpx; white-space: nowrap; box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.08) }

.my-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18rpx; margin-top: 24rpx }
.my-stat { background: var(--card); border-radius: 34rpx; padding: 24rpx 0; text-align: center; box-shadow: var(--shadow) }
.ms-num { font-size: 40rpx; font-weight: 800; color: var(--primary-deep) }
.ms-lbl { font-size: 22rpx; color: var(--text-3) }

.menu-card { background: var(--card); border-radius: 44rpx; padding: 8rpx 30rpx; margin-top: 24rpx; box-shadow: var(--shadow) }
.menu-item { display: flex; align-items: center; gap: 22rpx; padding: 26rpx 0; border-bottom: 1rpx solid var(--line); font-size: 28rpx; font-weight: 600 }
.menu-item:last-child { border-bottom: none }
.m-ico { width: 68rpx; height: 68rpx; border-radius: 22rpx; display: flex; align-items: center; justify-content: center; font-size: 30rpx; flex-shrink: 0 }
.m-title { flex: 1 }
.m-arr { color: var(--text-3); font-size: 32rpx }

.ver-foot { text-align: center; font-size: 22rpx; color: var(--text-3); margin-top: 36rpx; line-height: 1.8 }

.sheet-title { font-size: 34rpx; font-weight: 800; text-align: center }
.sheet-sub { text-align: center; font-size: 24rpx; color: var(--text-3); margin: 12rpx 0 36rpx }
.swatches { display: flex; justify-content: center; gap: 34rpx; margin-bottom: 36rpx }
.sw-wrap { text-align: center }
.swatch {
  width: 88rpx; height: 88rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 12rpx 26rpx rgba(0, 0, 0, 0.14);
}
.swatch.active { box-shadow: 0 0 0 6rpx var(--card), 0 0 0 10rpx var(--primary), 0 14rpx 30rpx rgba(0, 0, 0, 0.18) }
.sw-check { color: #fff; font-size: 40rpx; font-weight: 800; text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.25) }
.sw-name { font-size: 22rpx; color: var(--text-3); margin-top: 12rpx; display: block }
.dark-row { display: flex; align-items: center; justify-content: space-between; background: var(--bg); border-radius: 28rpx; padding: 24rpx 28rpx; font-size: 26rpx; font-weight: 600 }
.sheet-done { margin-top: 28rpx }
</style>
