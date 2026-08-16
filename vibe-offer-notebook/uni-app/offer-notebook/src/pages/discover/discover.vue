<template>
  <view :class="['page', 'theme-' + themeId, { dark: isDark }]">
    <view class="sb" :style="{ height: sbHeight + 'px' }"></view>

    <view class="topbar">
      <view>
        <view class="greet">发现</view>
        <view class="sub">校招人的能量补给站 ⚡</view>
      </view>
      <view class="icon-btn" @click="toast('发帖功能演示中 🚧')">✏️</view>
    </view>

    <view class="search-bar">
      <text class="s-ico">🔍</text>
      <input class="s-input" placeholder="搜面经、公司、话题…" />
      <view class="post-btn" @click="toast('发帖功能演示中 🚧')">+ 发帖</view>
    </view>

    <view class="section-head">
      <view class="lh"><text class="title">校招社区</text></view>
      <text class="more" @click="toast('今日热榜准备中 🔥')">热榜 🔥</text>
    </view>

    <view class="feed-tabs">
      <view v-for="t in FEED_TABS" :key="t.id" class="feed-tab" :class="{ active: feed === t.id }" @click="feed = t.id">{{ t.label }}</view>
    </view>

    <view v-for="p in feedPosts" :key="p.id" class="post-card">
      <view class="post-head">
        <view class="p-avatar" :style="{ background: p.bg }">{{ p.emoji }}</view>
        <view class="p-name">
          <view class="pn">{{ p.name }}</view>
          <view class="pt">{{ p.school }} · {{ p.time }}</view>
        </view>
        <view class="p-tag" :class="p.tagCls">{{ p.tag }}</view>
      </view>
      <view class="post-body">
        <text v-if="p.title" class="pb-bold">{{ p.title }}</text>
        <text class="pb-text">{{ p.content }}</text>
      </view>
      <view v-if="p.img" class="post-img"><text>{{ p.img }}</text></view>
      <view class="post-acts">
        <view class="act" :class="{ liked: p.liked }" @click="toggleLike(p)">
          <text>❤️</text><text>{{ fmtLike(p.like) }}</text>
        </view>
        <view class="act"><text>💬</text><text>{{ p.comments }}</text></view>
        <view class="act"><text>↗️</text></view>
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
const feed = ref('all')

const FEED_TABS = [
  { id: 'all', label: '推荐' },
  { id: '面经', label: '面经' },
  { id: '喜报', label: 'Offer喜报' },
  { id: '求助', label: '求助' }
]

const posts = ref([
  { id: 1, emoji: '🧑‍💻', bg: 'var(--grape-soft)', name: 'offer收割机', school: '华中科技大学', time: '2 小时前', tag: '面经', tagCls: 't-面经', title: '字节产品三面面经（超详细）', content: '群面→业务面→HR面全流程复盘，附 12 个高频问题参考答案，还有几个踩坑提醒…', img: '📋 面经干货', like: 2300, comments: 342, liked: false },
  { id: 2, emoji: '🦌', bg: 'var(--warn-soft)', name: '小鹿乱撞', school: '双非本', time: '昨天', tag: '求助', tagCls: 't-求助', title: '', content: '投了 30 家没有回音，简历是不是哪里有问题？求各位大佬帮忙看看，简历放评论区了 🙏', img: '', like: 486, comments: 96, liked: false },
  { id: 3, emoji: '🎓', bg: 'var(--success-soft)', name: '上岸选手', school: '浙江大学', time: '3 天前', tag: '喜报', tagCls: 't-喜报', title: '终于等到你！腾讯 Offer + 面经分享 🎉', content: '从 4 月开始投递到 8 月上岸，一共 47 次投递、9 场面试。把时间线贴在正文里了，给大家打打气！', img: '', like: 1800, comments: 512, liked: false },
  { id: 4, emoji: '🐂', bg: 'var(--info-soft)', name: '牛牛冲鸭', school: '南京大学', time: '4 天前', tag: '面经', tagCls: 't-面经', title: '美团笔试攻略：这几类题必考', content: '逻辑推理、图表分析、性格测试通关技巧，附 3 套真题模拟链接…', img: '', like: 964, comments: 128, liked: false }
])

onShow(() => {
  themeId.value = getThemeId()
  isDark.value = getDark()
})

const feedPosts = computed(() => {
  if (feed.value === 'all') return posts.value
  return posts.value.filter(p => p.tag === feed.value)
})

function fmtLike(n) {
  return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n)
}

function toggleLike(p) {
  p.liked = !p.liked
  p.like += p.liked ? 1 : -1
  if (p.liked) toast('已点赞 ❤️')
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

.search-bar {
  display: flex; align-items: center; gap: 18rpx; background: var(--card);
  border-radius: 32rpx; padding: 24rpx 28rpx; box-shadow: var(--shadow); margin-bottom: 12rpx;
}
.s-ico { font-size: 28rpx }
.s-input { flex: 1; font-size: 27rpx }
.post-btn { font-size: 25rpx; font-weight: 700; color: var(--primary-deep); background: var(--primary-soft); padding: 14rpx 26rpx; border-radius: 99rpx; white-space: nowrap }

.feed-tabs { display: flex; gap: 28rpx; margin-bottom: 22rpx; border-bottom: 3rpx solid var(--line) }
.feed-tab { padding: 16rpx 4rpx 20rpx; font-size: 28rpx; font-weight: 700; color: var(--text-3); position: relative; white-space: nowrap }
.feed-tab.active { color: var(--primary-deep) }
.feed-tab.active::after { content: ''; position: absolute; left: 0; right: 0; bottom: -3rpx; height: 6rpx; border-radius: 6rpx; background: var(--primary) }

.post-card { background: var(--card); border-radius: 40rpx; padding: 30rpx; margin-bottom: 22rpx; box-shadow: var(--shadow) }
.post-head { display: flex; gap: 20rpx; align-items: center; margin-bottom: 20rpx }
.p-avatar { width: 76rpx; height: 76rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 34rpx; flex-shrink: 0 }
.p-name { flex: 1; min-width: 0 }
.pn { font-size: 27rpx; font-weight: 700 }
.pt { font-size: 22rpx; color: var(--text-3) }
.p-tag { font-size: 21rpx; font-weight: 700; padding: 8rpx 20rpx; border-radius: 99rpx }
.t-面经 { background: var(--grape-soft); color: #6F5EE0 }
.t-求助 { background: var(--warn-soft); color: #D99424 }
.t-喜报 { background: var(--success-soft); color: #189B90 }

.post-body { font-size: 27rpx; line-height: 1.65; color: var(--text-1) }
.pb-bold { font-weight: 700; display: block; margin-bottom: 4rpx }
.pb-text { color: var(--text-2) }
.post-img { margin-top: 20rpx; height: 240rpx; border-radius: 28rpx; display: flex; align-items: center; justify-content: center; font-size: 76rpx; background: linear-gradient(135deg, var(--primary), var(--grape)); color: #fff }
.post-acts { display: flex; gap: 60rpx; margin-top: 22rpx; padding-top: 20rpx; border-top: 1rpx solid var(--line); color: var(--text-3); font-size: 24rpx }
.act { display: flex; align-items: center; gap: 8rpx }
.act.liked { color: var(--danger) }
</style>
