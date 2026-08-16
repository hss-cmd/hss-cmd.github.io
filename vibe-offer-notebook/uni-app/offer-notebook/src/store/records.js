export const STAGE_META = {
  submitted: { label: '已投递', cls: 'st-info' },
  written: { label: '笔试中', cls: 'st-grape' },
  interview: { label: '面试中', cls: 'st-coral' },
  offer_wait: { label: '待offer', cls: 'st-warn' },
  offered: { label: '已通过', cls: 'st-success' },
  failed: { label: '挂了', cls: 'st-danger' }
}

export const LOGO_COLORS = {
  字节跳动: '#4E8EF7',
  腾讯: '#12B7F5',
  美团: '#FFC300',
  拼多多: '#E02E24',
  小红书: '#FF2442',
  网易: '#C20E0E',
  百度: '#2932E1',
  阿里巴巴: '#FF6A00'
}

const SEED = [
  { id: 1, company: '字节跳动', position: '产品经理（校招）', city: '深圳', date: '2026-07-28', stage: 'interview', channel: '内推', salary: '20-30K', link: 'https://jobs.bytedance.com/', note: '一面通过，准备二面；面试官深挖了实习项目', updated: '2小时前' },
  { id: 2, company: '腾讯', position: '后端开发工程师', city: '广州', date: '2026-08-01', stage: 'written', channel: '官网投递', salary: '18-25K', link: 'https://join.qq.com/', note: '8/20 笔试，刷了 3 套真题', updated: '昨天' },
  { id: 3, company: '美团', position: '商业分析', city: '上海', date: '2026-08-05', stage: 'submitted', channel: '官网投递', salary: '', link: '', note: '', updated: '3 天前' },
  { id: 4, company: '拼多多', position: '数据分析', city: '上海', date: '2026-08-02', stage: 'offered', channel: '内推', salary: '25K+', link: '', note: '已收到意向书，等正式 Offer 邮件', updated: '周一' },
  { id: 5, company: '小红书', position: '内容运营', city: '北京', date: '2026-08-10', stage: 'failed', channel: '牛客', salary: '', link: '', note: '一面挂，反问环节没答好', updated: '上周' },
  { id: 6, company: '网易', position: '游戏策划', city: '杭州', date: '2026-08-11', stage: 'offer_wait', channel: '宣讲会', salary: '18-25K', link: '', note: 'HR 说这周给结果，蹲一个', updated: '2 天前' }
]

export function loadRecords() {
  try {
    const raw = uni.getStorageSync('nb_records')
    if (raw && raw.length) return raw
  } catch (e) { /* 忽略 */ }
  return SEED.map(r => ({ ...r }))
}

export function saveRecords(list) {
  uni.setStorageSync('nb_records', list)
}
