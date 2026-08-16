<template>
  <view :class="['page', 'page-nofab', 'theme-' + themeId, { dark: isDark }]">
    <view class="sb" :style="{ height: sbHeight + 'px' }"></view>

    <view class="edit-header">
      <view class="back" @click="goBack"><text class="arr">‹</text> 返回</view>
      <text class="etitle">{{ editingId ? '编辑投递' : '新增投递' }}</text>
      <view class="save-link" @click="save">保存</view>
    </view>

    <!-- AI 智能填写 -->
    <view class="ai-card">
      <view class="ai-head">
        <view class="ai-ico">🤖</view>
        <view class="ai-txt">
          <view class="ai-title">AI 智能填写</view>
          <view class="ai-sub">把投递邮件 / 官网截图发给 AI，自动帮你填好</view>
        </view>
      </view>
      <view class="ai-upload" @click="pickImage">
        <text class="ai-cam">📷</text>
        <text>拍照 / 上传投递截图</text>
      </view>
      <view class="ai-tags">
        <text class="tag">JPG</text><text class="tag">PNG</text>
        <text class="tag-tip">示例：官网投递成功页、笔试邮件截图</text>
      </view>
    </view>

    <view v-if="aiResult" class="ai-result">✅ AI 已识别 {{ aiResult }} 项信息，请核对后保存（已自动填入表单）</view>
    <view v-if="imgPreview" class="img-preview">
      <image :src="imgPreview" mode="aspectFill"></image>
      <view class="img-clear" @click="imgPreview = ''">✕</view>
    </view>

    <!-- 表单 -->
    <view class="form-card">
      <view class="field"><text class="flabel">公司名称 *</text><input v-model="form.company" placeholder="如：字节跳动" /></view>
      <view class="field"><text class="flabel">岗位名称 *</text><input v-model="form.position" placeholder="如：产品经理（校招）" /></view>
      <view class="row2">
        <view class="field"><text class="flabel">城市</text><input v-model="form.city" placeholder="如：深圳" /></view>
        <view class="field">
          <text class="flabel">投递时间</text>
          <picker mode="date" :value="form.date" @change="onDate">
            <view class="picker-val">{{ form.date || '选择日期' }}</view>
          </picker>
        </view>
      </view>
      <view class="field">
        <text class="flabel">当前阶段 *</text>
        <view class="stage-chips">
          <view v-for="(m, key) in STAGE_META" :key="key" class="stage-chip" :class="{ active: stage === key }" @click="stage = key">{{ m.label }}</view>
        </view>
      </view>
      <view class="row2">
        <view class="field">
          <text class="flabel">薪资范围</text>
          <picker :range="SALARY" @change="onSalary"><view class="picker-val">{{ form.salary || '暂不填写' }}</view></picker>
        </view>
        <view class="field">
          <text class="flabel">投递渠道</text>
          <picker :range="CHANNELS" @change="onChannel"><view class="picker-val">{{ form.channel }}</view></picker>
        </view>
      </view>
      <view class="field"><text class="flabel">岗位链接</text><input v-model="form.link" placeholder="https://…" /></view>
      <view class="field"><text class="flabel">备注</text><textarea v-model="form.note" placeholder="笔试 / 面试时间、面试官问过的问题、需要准备的点…" :maxlength="200" /></view>
      <view class="switch-row">
        <text>⏰ 投递后提醒我更新状态</text>
        <switch :checked="form.remind" color="#2EC4B6" style="transform: scale(0.8)" @change="e => form.remind = e.detail.value" />
      </view>
    </view>

    <view class="btn-primary save-btn" @click="save">保存记录</view>

    <!-- AI 识别中 -->
    <view v-if="scanning" class="mask">
      <view class="scan-box">
        <view class="scan-ico">🤖</view>
        <view class="scan-txt">AI 正在识别投递截图…</view>
        <view class="scanbar"><view class="scan-fill"></view></view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { loadRecords, saveRecords, STAGE_META } from '../../store/records.js'
import { getThemeId, getDark } from '../../store/theme.js'
import { statusBarHeight, toast } from '../../utils/system.js'

const themeId = ref(getThemeId())
const isDark = ref(getDark())
const sbHeight = statusBarHeight()
const editingId = ref(null)
const stage = ref('submitted')
const scanning = ref(false)
const imgPreview = ref('')
const aiResult = ref(0)

const SALARY = ['暂不填写', '8-12K', '12-18K', '18-25K', '25K+']
const CHANNELS = ['官网投递', '内推', '牛客', '宣讲会', '招聘平台', '其他']

const form = reactive({
  company: '', position: '', city: '', date: today(), salary: '',
  channel: '官网投递', link: '', note: '', remind: true
})

function today() {
  const d = new Date()
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

onLoad(options => {
  themeId.value = getThemeId()
  isDark.value = getDark()
  if (options && options.id) {
    const list = loadRecords()
    const r = list.find(x => x.id === Number(options.id))
    if (r) {
      editingId.value = r.id
      Object.assign(form, {
        company: r.company, position: r.position, city: r.city || '', date: r.date || '',
        salary: r.salary || '', channel: r.channel || '官网投递', link: r.link || '',
        note: r.note || '', remind: true
      })
      stage.value = r.stage
    }
  }
})

function onDate(e) { form.date = e.detail.value }
function onSalary(e) { form.salary = SALARY[e.detail.value] }
function onChannel(e) { form.channel = CHANNELS[e.detail.value] }

function pickImage() {
  uni.chooseImage({
    count: 1,
    success: res => {
      imgPreview.value = res.tempFilePaths[0]
      scan()
    }
  })
}

function scan() {
  scanning.value = true
  setTimeout(() => {
    scanning.value = false
    Object.assign(form, {
      company: '字节跳动', position: 'AI产品经理（校招）', city: '深圳', date: '2026-08-14',
      salary: '20-30K', channel: '内推', link: 'https://jobs.bytedance.com/ai',
      note: '示例：AI 已识别出 6 项信息，这里是自动填写的备注'
    })
    stage.value = 'interview'
    aiResult.value = 6
    toast('AI 识别完成 🤖')
  }, 1800)
}

function save() {
  if (!form.company || !form.position) {
    toast('公司名和岗位名不能为空哦')
    return
  }
  const record = {
    id: editingId.value || Date.now(),
    company: form.company, position: form.position, city: form.city, date: form.date,
    stage: stage.value, salary: form.salary, channel: form.channel, link: form.link,
    note: form.note, updated: '刚刚'
  }
  const list = loadRecords()
  if (editingId.value) {
    const i = list.findIndex(r => r.id === editingId.value)
    if (i >= 0) list.splice(i, 1, record)
    toast('已更新 ✓')
  } else {
    list.unshift(record)
    toast('保存成功 ✓ 加油！')
  }
  saveRecords(list)
  setTimeout(goBack, 400)
}

function goBack() {
  if (getCurrentPages().length > 1) uni.navigateBack()
  else uni.switchTab({ url: '/pages/index/index' })
}
</script>

<style scoped>
.sb { width: 100% }
.edit-header { display: flex; align-items: center; justify-content: space-between; padding: 24rpx 0 }
.back { display: flex; align-items: center; font-size: 26rpx; color: var(--text-2); font-weight: 600 }
.back .arr { font-size: 40rpx; line-height: 1; margin-right: 2rpx }
.etitle { font-size: 36rpx; font-weight: 800 }
.save-link { font-size: 26rpx; font-weight: 700; color: var(--primary-deep); background: var(--primary-soft); padding: 14rpx 30rpx; border-radius: 99rpx }

.ai-card { background: linear-gradient(135deg, var(--primary-soft), var(--accent-soft)); border-radius: 40rpx; padding: 32rpx; margin-bottom: 28rpx }
.ai-head { display: flex; gap: 20rpx; align-items: center; margin-bottom: 24rpx }
.ai-ico { width: 76rpx; height: 76rpx; border-radius: 24rpx; background: var(--card); display: flex; align-items: center; justify-content: center; font-size: 38rpx; box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.06) }
.ai-title { font-size: 28rpx; font-weight: 800 }
.ai-sub { font-size: 23rpx; color: var(--text-2); margin-top: 4rpx }
.ai-upload {
  display: flex; align-items: center; justify-content: center; gap: 14rpx;
  padding: 30rpx; border-radius: 30rpx; border: 3rpx dashed var(--primary);
  background: var(--card); font-size: 27rpx; font-weight: 700; color: var(--primary-deep);
}
.ai-cam { font-size: 34rpx }
.ai-tags { display: flex; align-items: center; gap: 10rpx; margin-top: 18rpx; font-size: 22rpx; color: var(--text-3) }
.ai-tags .tag { font-style: normal; padding: 4rpx 14rpx; border-radius: 8rpx; background: var(--card); font-weight: 700; color: var(--text-2) }
.ai-tags .tag-tip { margin-left: 6rpx }

.ai-result { background: var(--success-soft); color: var(--primary-deep); font-size: 24rpx; font-weight: 600; border-radius: 28rpx; padding: 20rpx 26rpx; margin-bottom: 24rpx }
.img-preview { position: relative; border-radius: 28rpx; overflow: hidden; margin-bottom: 24rpx }
.img-preview image { width: 100%; height: 300rpx; display: block }
.img-clear { position: absolute; top: 16rpx; right: 16rpx; width: 52rpx; height: 52rpx; border-radius: 50%; background: rgba(0, 0, 0, 0.5); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 26rpx }

.form-card { background: var(--card); border-radius: 44rpx; padding: 34rpx; box-shadow: var(--shadow) }
.field { margin-bottom: 28rpx }
.field:last-child { margin-bottom: 0 }
.flabel { display: block; font-size: 24rpx; font-weight: 700; color: var(--text-2); margin-bottom: 14rpx }
.field input, .field textarea, .picker-val {
  width: 100%; border: 3rpx solid var(--line); background: var(--bg); border-radius: 26rpx;
  padding: 24rpx 26rpx; font-size: 27rpx; box-sizing: border-box;
}
.field textarea { height: 160rpx; line-height: 1.6 }
.row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20rpx }
.stage-chips { display: flex; flex-wrap: wrap; gap: 16rpx }
.stage-chip { padding: 16rpx 28rpx; border-radius: 24rpx; font-size: 25rpx; font-weight: 700; background: var(--bg); color: var(--text-2) }
.stage-chip.active { background: var(--primary); color: var(--on-primary) }
.switch-row { display: flex; align-items: center; justify-content: space-between; background: var(--bg); border-radius: 28rpx; padding: 24rpx 28rpx; font-size: 26rpx; font-weight: 600 }
.save-btn { margin-top: 36rpx }

.scan-box { width: 560rpx; background: var(--card); border-radius: 48rpx; padding: 56rpx 48rpx; text-align: center; box-shadow: var(--shadow) }
.scan-ico { font-size: 88rpx; animation: floatY 1.2s ease-in-out infinite }
.scan-txt { font-size: 28rpx; font-weight: 700; margin: 24rpx 0 28rpx }
.scanbar { height: 12rpx; border-radius: 99rpx; background: var(--bg); overflow: hidden }
.scan-fill { height: 100%; width: 40%; border-radius: 99rpx; background: linear-gradient(90deg, var(--primary), var(--grape)); animation: scan 1.2s ease-in-out infinite }
@keyframes floatY { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-10rpx) } }
@keyframes scan { 0% { margin-left: -40% } 100% { margin-left: 100% } }
</style>
