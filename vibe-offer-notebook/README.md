# 校招记录本 · Offer Notebook（高保真交互 Demo）

面向应届毕业生的「校招记录本」移动端 App 概念 Demo。5 个核心页面、统一视觉风格、6 套主题色 + 深色模式，全部可交互。

## 如何打开

直接用浏览器打开 [index.html](index.html) 即可，无需安装任何依赖、无需联网。

## 宣传落地页

[promo.html](promo.html) 是 App 的宣传推广页（网站）：品牌介绍、核心功能、页面预览、主题展示与 CTA 一应俱全，适合投放到 GitHub Pages、Netlify / Vercel 或发给朋友分享。

## 单页样式稿（逐页评审用）

[pages/](pages/) 目录下是 5 份独立的单页样式稿，每页一个文件：左侧为设计说明（设计目标 / 核心组件 / 设计规范 / 交互说明），右侧为手机壳中的页面效果，适合逐页评审、发给团队或写 PRD 时引用：

| 文件 | 页面 |
| --- | --- |
| [pages/page-home.html](pages/page-home.html) | 01 首页 · 求职记录 |
| [pages/page-edit.html](pages/page-edit.html) | 02 编辑页 · 新增 / 编辑投递 |
| [pages/page-discover.html](pages/page-discover.html) | 03 发现页 · 校招社区 |
| [pages/page-messages.html](pages/page-messages.html) | 04 消息页 · 消息中心 |
| [pages/page-profile.html](pages/page-profile.html) | 05 个人页 · 我的 |

对应预览图位于 [screens/](screens/)（`spec-01` ~ `spec-05`）。

## 页面清单

| 页面 | 说明 |
| --- | --- |
| 首页 / 求职记录 | 顶部秋招进度卡 + 已投递 / 面试中 / 挂了 / 已通过四宫格统计；下方为投递列表，展示每个岗位的投递 → 笔试 → 面试 → Offer 流程进度；右下角「+」跳转编辑页；投递列表支持 7 个分类导航（全部 / 投递中 / 笔试中 / 面试中 / 待offer / 已通过 / 挂了），点击卡片可编辑 |
| 编辑页 | 手动填写公司、岗位、当前阶段、投递时间、薪资、渠道、链接、备注；也可「拍照 / 上传截图」让 AI 一键识别并自动填表（Demo 中为模拟效果） |
| 发现页 | 校招社区（搜索 / 发帖入口 / 面经 / Offer 喜报 / 求助帖子，支持点赞互动、分类筛选、热榜） |
| 消息页 | 面试提醒、投递进度助手、社区互动、系统通知 |
| 个人页 | 个人资料、简历完整度、数据统计、菜单（收藏 / 帖子 / 日历 / 导出 / 主题设置等） |

## 可交互点

- 底部 Tab 切换 4 个主页面
- 首页「+」新增投递，保存后真实加入列表并更新统计（数据存于 localStorage）
- 编辑页「上传截图」模拟 AI 识别，自动填入表单
- 帖子点赞、社区分类筛选
- 控制面板 / 个人页均可切换 6 套主题色（薄荷绿 / 天空蓝 / 珊瑚橙 / 奶油黄 / 淡粉 / 葡萄紫）与深色模式

## 设计说明

- 视觉风格：轻松活泼、青春友好，圆角卡片 + 柔和阴影 + 渐变主题色
- 配色：薄荷绿、奶油黄、天空蓝、珊瑚橙、米白、淡粉等，通过 CSS 变量实现一键换肤
- 投递阶段模型参考开源项目「Offer之路」的 7 状态划分，统计口径与页面文案保持口语化

## 参考的开源项目

- [ikunhx/My-Offer-Way](https://github.com/ikunhx/My-Offer-Way) — 求职投递记录管理工具（7 种状态、统计概览、本地存储）
- [jacywallny/autumn-recruitment-tracker](https://github.com/jacywallny/autumn-recruitment-tracker) — 秋招投递管理网页（增删改查、筛选、自动统计、CSV 导出）
- [blue-lotus-org/jobby](https://github.com/blue-lotus-org/jobby) — Next.js 求职追踪 + AI 简历优化（AI 功能可参考）
- [LTXWorld/JobTracker](https://github.com/LTXWorld/JobTracker) — React Native 移动端求职记录（移动端技术选型可参考）

## 后续可做（正式版）

1. 把 Demo 落地为真实 App（推荐 uni-app / Flutter / React Native 三选一）
2. AI 识别对接多模态模型（如 GPT-4o / GPT-5 视觉），从截图提取投递信息
3. 面试日历、邮件/短信自动解析投递状态
4. 数据导出（CSV / Markdown / 投递报告）与多端同步
