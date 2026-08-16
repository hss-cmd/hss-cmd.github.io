<template>
  <view :class="['page', 'theme-' + themeId, { dark: isDark }]">
    <view class="sb" :style="{ height: sbHeight + 'px' }"></view>

    <view class="topbar">
      <view>
        <view class="greet">消息</view>
        <view class="sub">不错过任何一次机会</view>
      </view>
      <view class="icon-btn" @click="toast('设置消息免打扰 🚧')">⋯</view>
    </view>

    <view class="remind-card">
      <view class="rm-ico">⏰</view>
      <view class="rm-info">
        <view class="rm-title">面试提醒 · 明天 10:00</view>
        <view class="rm-sub">字节跳动 · 产品经理一面（视频面试）</view>
        <view class="rm-sub">记得提前调试设备、准备 1 分钟自我介绍</view>
      </view>
      <view class="rm-btn" @click="toast('已加入面试日历 📅')">查看</view>
    </view>

    <view class="msg-tabs">
      <view v-for="t in TABS" :key="t.id" class="msg-tab" :class="{ active: tab === t.id }" @click="tab = t.id">{{ t.label }}</view>
    </view>

    <view v-for="m in filteredMsgs" :key="m.id" class="msg-item" @click="toast(m.tip)">
      <view class="msg-ico" :style="{ background: m.bg }">{{ m.emoji }}</view>
      <view class="msg-info">
        <view class="mt">{{ m.title }}</view>
        <view class="mp">{{ m.preview }}</view>
      </view>
      <view class="msg-right">
        <view class="msg-time">{{ m.time }}</view>
        <view v-if="m.badge" class="msg-badge">{{ m.badge }}</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getThemeId, getDark } from '../../store/theme.js'
import { statusBarHeight, toast } from '../../utils/system.js'

const themeId = ref(getThemeId())
const isDark = ref(getDark())
const sbHeight = statusBarHeight()
const tab = ref('all')

const TABS = [
  { id: 'all', label: '全部' },
  { id: 'dm', label: '私信' },
  { id: 'notice', label: '通知' }
]

const msgs = ref([
  { id: 1, cat: 'notice', emoji: '🤖', bg: 'var(--primary-soft)', title: '投递进度助手', preview: '你的 3 家投递状态可更新，AI 已根据邮件智能识别', time: '09:12', badge: 3, tip: '正在打开投递进度助手…' },
  { id: 2, cat: 'dm', emoji: '💬', bg: 'var(--info-soft)', title: '社区私信', preview: 'offer收割机：你写的那篇投递复盘太有用了！', time: '昨天', badge: 1, tip: '正在打开私信…' },
  { id: 3, cat: 'notice', emoji: '📚', bg: 'var(--grape-soft)', title: '面经圈', preview: '你收藏的《腾讯产培面经》有新回复', time: '昨天', badge: 0, tip: '正在打开面经圈…' },
  { id: 4, cat: 'notice', emoji: '🔔', bg: 'var(--warn-soft)', title: '系统通知', preview: '秋招日历：8 月 20 日美团笔试，记得参加', time: '08-12', badge: 0, tip: '正在打开系统通知…' },
  { id: 5, cat: 'notice', emoji: '🧠', bg: 'var(--success-soft)', title: '面试日历', preview: '明天 10:00 字节跳动一面，记得提前调试设备', time: '08-11', badge: 0, tip: '正在打开面试日历…' }
])

onShow(() => {
  themeId.value = getThemeId()
  isDark.value = getDark()
})

const filteredMsgs = computed(() => {
  if (tab.value === 'all') return msgs.value
  return msgs.value.filter(m => m.cat === tab.value)
})
</script>

<style scoped>
.sb { width: 100% }
.topbar { display: flex; justify-content: space-between; align-items: center; padding: 26rpx 0 24rpx }
.greet { font-size: 44rpx; font-weight: 800 }
.sub { font-size: 25rpx; color: var(--text-2); margin-top: 6rpx }
.icon-btn {
  width: 80rpx; height: 80rpx; border-radius: 28rpx; background: var(--card);
  box-shadow: var(--shadow); display: flex; align-items: center; justify-content: center;
  font-size: 34rpx; font-weight: 800; color: var(--text-3);
}

.remind-card {
  display: flex; gap: 22rpx; align-items: center;
  background: linear-gradient(135deg, var(--coral-soft), var(--warn-soft));
  border-radius: 40rpx; padding: 30rpx; margin-bottom: 24rpx;
}
.rm-ico { width: 84rpx; height: 84rpx; border-radius: 28rpx; background: var(--coral); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 38rpx; flex-shrink: 0; box-shadow: 0 12rpx 28rpx rgba(255, 122, 89, 0.35) }
.rm-info { flex: 1; min-width: 0 }
.rm-title { font-size: 28rpx; font-weight: 800 }
.rm-sub { font-size: 23rpx; color: var(--text-2); margin-top: 2rpx }
.rm-btn { background: var(--coral); color: #fff; font-size: 24rpx; font-weight: 700; padding: 16rpx 26rpx; border-radius: 99rpx; white-space: nowrap }

.msg-tabs { display: flex; gap: 36rpx; margin-bottom: 12rpx }
.msg-tab { font-size: 28rpx; font-weight: 700; color: var(--text-3); padding: 14rpx 2rpx; position: relative }
.msg-tab.active { color: var(--primary-deep) }
.msg-tab.active::after { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 6rpx; border-radius: 6rpx; background: var(--primary) }

.msg-item {
  display: flex; gap: 22rpx; align-items: center; background: var(--card);
  border-radius: 36rpx; padding: 26rpx 28rpx; margin-top: 16rpx; box-shadow: var(--shadow);
}
.msg-ico { width: 84rpx; height: 84rpx; border-radius: 28rpx; display: flex; align-items: center; justify-content: center; font-size: 36rpx; flex-shrink: 0 }
.msg-info { flex: 1; min-width: 0 }
.mt { font-size: 27rpx; font-weight: 700 }
.mp { font-size: 23rpx; color: var(--text-2); margin-top: 4rpx; white-space: nowrap; overflow: hidden; text-overflow: ellipsis }
.msg-right { display: flex; flex-direction: column; align-items: flex-end; gap: 12rpx; flex-shrink: 0 }
.msg-time { font-size: 21rpx; color: var(--text-3) }
.msg-badge { min-width: 34rpx; height: 34rpx; border-radius: 99rpx; background: var(--danger); color: #fff; font-size: 20rpx; font-weight: 700; display: flex; align-items: center; justify-content: center; padding: 0 10rpx }
</style>
