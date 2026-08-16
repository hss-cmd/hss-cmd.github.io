<template>
  <view :class="['page', 'theme-' + themeId, { dark: isDark }]">
    <view class="sb" :style="{ height: sbHeight + 'px' }"></view>

    <!-- 顶部问候 -->
    <view class="topbar">
      <view>
        <view class="greet">Hi，小杨同学 👋</view>
        <view class="sub">今天也离 Offer 更近一步</view>
      </view>
      <view class="icon-btn" @click="toast('1 条新通知')">
        <text>🔔</text>
        <view class="dot"></view>
      </view>
    </view>

    <!-- 秋招进度 -->
    <view class="progress-card">
      <view class="pc-top">
        <text class="pc-label">秋招进度</text>
        <text class="pc-pct">{{ progressPct }}%</text>
      </view>
      <view class="pc-bar"><view class="pc-fill" :style="{ width: progressPct + '%' }"></view></view>
      <view class="pc-foot">已投 <text class="pc-num">{{ stats.applied }}</text> 家 · 本周 +3 · 保持节奏，Offer 在路上 🚀</view>
    </view>

    <!-- 四宫格统计 -->
    <view class="stats-grid">
      <view class="stat-card s-sky">
        <view class="ico">📨</view><view class="num">{{ stats.applied }}</view>
        <view class="lbl">已投递</view><view class="trend">+3</view>
      </view>
      <view class="stat-card s-coral">
        <view class="ico">📞</view><view class="num">{{ stats.interview }}</view>
        <view class="lbl">面试中</view><view class="trend">+2</view>
      </view>
      <view class="stat-card s-pink">
        <view class="ico">💔</view><view class="num">{{ stats.failed }}</view>
        <view class="lbl">挂了</view><view class="trend">0</view>
      </view>
      <view class="stat-card s-mint">
        <view class="ico">🎉</view><view class="num">{{ stats.offered }}</view>
        <view class="lbl">已通过</view><view class="trend">+1</view>
      </view>
    </view>

    <!-- 投递列表 -->
    <view class="section-head">
      <view class="lh"><text class="title">我的投递</text><text class="cnt">{{ records.length }} 条</text></view>
      <text class="more" @click="toast('搜索功能将在正式版开放 🔍')">搜索</text>
    </view>

    <scroll-view class="filter-row" scroll-x :show-scrollbar="false">
      <view v-for="f in FILTERS" :key="f.id" class="chip" :class="{ active: filter === f.id }" @click="setFilter(f.id)">{{ f.label }}</view>
    </scroll-view>

    <view v-for="r in filtered" :key="r.id" class="job-card" @click="editRecord(r.id)">
      <view class="job-main">
        <view class="job-logo" :style="{ background: logoBg(r.company) }">{{ r.company[0] }}</view>
        <view class="job-info">
          <view class="job-name">
            <text class="nm">{{ r.company }}</text>
            <text class="status-pill" :class="stageCls(r.stage)">{{ stageLabel(r.stage) }}</text>
          </view>
          <view class="job-pos">{{ r.position }}</view>
          <view class="job-meta">{{ r.city || '—' }} · {{ fmtDate(r.date) }} 投递 · {{ r.updated || '' }}更新</view>
        </view>
        <view class="more-btn" @click.stop="editRecord(r.id)">⋯</view>
      </view>
      <view v-if="r.stage !== 'offered'" class="steps">
        <block v-for="(s, i) in stepsOf(r)" :key="i">
          <text class="step" :class="s.state">{{ s.state === 'done' ? '✓ ' : '' }}{{ s.label }}</text>
          <text v-if="i < stepsOf(r).length - 1" class="conn"></text>
        </block>
        <text v-if="r.stage === 'failed'" class="fail-note">很遗憾，继续加油 💪</text>
      </view>
      <view v-else class="steps"><text class="offer-note">🎉 恭喜！已收到 Offer，记得更新入职信息</text></view>
    </view>

    <view v-if="!filtered.length" class="empty">这个分类下还没有投递记录</view>
    <view class="fab" @click="addRecord">+</view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { loadRecords, STAGE_META, LOGO_COLORS } from '../../store/records.js'
import { getThemeId, getDark } from '../../store/theme.js'
import { statusBarHeight, toast } from '../../utils/system.js'

const themeId = ref(getThemeId())
const isDark = ref(getDark())
const sbHeight = statusBarHeight()
const records = ref([])
const filter = ref('all')

const FILTERS = [
  { id: 'all', label: '全部' },
  { id: 'submitted', label: '投递中' },
  { id: 'written', label: '笔试中' },
  { id: 'interview', label: '面试中' },
  { id: 'offer_wait', label: '待offer' },
  { id: 'offered', label: '已通过' },
  { id: 'failed', label: '挂了' }
]

onShow(() => {
  themeId.value = getThemeId()
  isDark.value = getDark()
  records.value = loadRecords()
})

const stats = computed(() => {
  const c = s => records.value.filter(r => r.stage === s).length
  return { applied: records.value.length, interview: c('interview'), failed: c('failed'), offered: c('offered') }
})

const progressPct = computed(() => {
  const applied = records.value.length
  if (!applied) return 0
  const active = records.value.filter(r => ['submitted', 'written', 'interview', 'offer_wait'].includes(r.stage)).length
  return Math.round(((active * 0.55 + stats.value.offered) / applied) * 100)
})

const filtered = computed(() => {
  const list = records.value.slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  if (filter.value === 'all') return list
  return list.filter(r => r.stage === filter.value)
})

function setFilter(id) { filter.value = id }
function stageLabel(stage) { return STAGE_META[stage] ? STAGE_META[stage].label : stage }
function stageCls(stage) { return STAGE_META[stage] ? STAGE_META[stage].cls : '' }
function logoBg(company) { return LOGO_COLORS[company] || 'linear-gradient(135deg, var(--primary), var(--grape))' }
function fmtDate(d) { if (!d) return ''; const p = d.split('-'); return p[1] + '.' + p[2] }

function stepsOf(r) {
  const labels = ['投递', '笔试', '面试', 'Offer']
  if (r.stage === 'failed') {
    return labels.map((l, i) => ({ label: l, state: i < 2 ? 'done' : (i === 2 ? 'fail' : '') }))
  }
  const order = ['submitted', 'written', 'interview', 'offer_wait']
  const idx = order.indexOf(r.stage)
  return labels.map((l, i) => ({ label: l, state: i < idx ? 'done' : (i === idx ? 'current' : '') }))
}

function addRecord() { uni.navigateTo({ url: '/pages/edit/edit' }) }
function editRecord(id) { uni.navigateTo({ url: '/pages/edit/edit?id=' + id }) }
</script>

<style scoped>
.sb { width: 100% }
.topbar { display: flex; justify-content: space-between; align-items: center; padding: 26rpx 0 24rpx }
.greet { font-size: 44rpx; font-weight: 800; letter-spacing: 1rpx }
.sub { font-size: 25rpx; color: var(--text-2); margin-top: 6rpx }
.icon-btn {
  width: 80rpx; height: 80rpx; border-radius: 28rpx; background: var(--card);
  box-shadow: var(--shadow); display: flex; align-items: center; justify-content: center;
  font-size: 34rpx; position: relative;
}
.icon-btn .dot { position: absolute; top: 16rpx; right: 16rpx; width: 16rpx; height: 16rpx; border-radius: 50%; background: var(--danger); border: 4rpx solid var(--card) }

.progress-card {
  position: relative; overflow: hidden; border-radius: 48rpx; padding: 40rpx;
  color: var(--on-primary); background: linear-gradient(135deg, var(--primary), var(--primary-deep));
  box-shadow: 0 24rpx 52rpx rgba(46, 196, 182, 0.40);
}
.progress-card::before, .progress-card::after { content: ''; position: absolute; border-radius: 50%; background: rgba(255, 255, 255, 0.14) }
.progress-card::before { width: 300rpx; height: 300rpx; right: -90rpx; top: -110rpx }
.progress-card::after { width: 180rpx; height: 180rpx; right: 140rpx; bottom: -84rpx }
.pc-top { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1 }
.pc-label { font-size: 26rpx; font-weight: 600; opacity: 0.95 }
.pc-pct { font-size: 52rpx; font-weight: 800 }
.pc-bar { height: 16rpx; border-radius: 99rpx; background: rgba(255, 255, 255, 0.26); margin: 24rpx 0; overflow: hidden }
.pc-fill { height: 100%; border-radius: 99rpx; background: #fff; transition: width 0.5s }
.pc-foot { font-size: 24rpx; opacity: 0.95 }
.pc-num { font-size: 28rpx; font-weight: 800 }

.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20rpx; margin-top: 24rpx }
.stat-card { border-radius: 36rpx; padding: 26rpx 28rpx; position: relative; overflow: hidden }
.stat-card .ico { font-size: 34rpx }
.stat-card .num { font-size: 44rpx; font-weight: 800; line-height: 1.25 }
.stat-card .lbl { font-size: 23rpx; font-weight: 600; opacity: 0.85 }
.stat-card .trend { position: absolute; top: 22rpx; right: 26rpx; font-size: 20rpx; font-weight: 700; font-style: normal; padding: 4rpx 16rpx; border-radius: 99rpx; background: rgba(255, 255, 255, 0.75) }
.s-sky { background: var(--info-soft); color: #2F7FD6 }
.s-coral { background: var(--coral-soft); color: #EE5C36 }
.s-pink { background: var(--danger-soft); color: #E5496B }
.s-mint { background: var(--success-soft); color: #189B90 }

.filter-row { white-space: nowrap; margin-bottom: 24rpx; width: 100% }
.filter-row .chip { margin-right: 16rpx }

.job-card { background: var(--card); border-radius: 40rpx; padding: 30rpx; margin-bottom: 22rpx; box-shadow: var(--shadow) }
.job-main { display: flex; gap: 22rpx; align-items: flex-start }
.job-logo {
  width: 84rpx; height: 84rpx; border-radius: 26rpx; display: flex; align-items: center; justify-content: center;
  font-size: 34rpx; font-weight: 800; color: #fff; flex-shrink: 0; box-shadow: 0 10rpx 24rpx rgba(0, 0, 0, 0.12);
}
.job-info { flex: 1; min-width: 0 }
.job-name { display: flex; align-items: center; gap: 16rpx; flex-wrap: wrap }
.job-name .nm { font-size: 30rpx; font-weight: 700 }
.job-pos { font-size: 25rpx; color: var(--text-2); margin-top: 4rpx }
.job-meta { font-size: 22rpx; color: var(--text-3); margin-top: 8rpx }
.more-btn {
  width: 52rpx; height: 52rpx; border-radius: 18rpx; background: var(--bg); color: var(--text-3);
  font-size: 28rpx; line-height: 1; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.steps { display: flex; align-items: center; gap: 10rpx; margin-top: 24rpx; padding-top: 22rpx; border-top: 1rpx dashed var(--line); flex-wrap: wrap }
.step { padding: 8rpx 22rpx; border-radius: 99rpx; font-size: 21rpx; font-weight: 700; background: var(--bg); color: var(--text-3); white-space: nowrap }
.step.done { background: var(--primary-soft); color: var(--primary-deep) }
.step.current { background: var(--primary); color: var(--on-primary) }
.step.fail { background: var(--danger-soft); color: #E5496B }
.conn { height: 3rpx; flex: 1; background: var(--line); min-width: 14rpx }
.offer-note { font-size: 23rpx; color: var(--primary-deep); font-weight: 600 }
.fail-note { font-size: 23rpx; color: #E5496B; font-weight: 600 }
.empty { text-align: center; color: var(--text-3); font-size: 25rpx; padding: 80rpx 0 }
</style>
