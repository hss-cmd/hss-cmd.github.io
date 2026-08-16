# 校招记录本 · Offer Notebook（uni-app 工程）

面向应届毕业生的校招投递记录 App。基于 **uni-app（Vue 3 + Vite）**，一套代码可编译为：

- 微信小程序（`mp-weixin`）
- H5 网页
- Android / iOS App（`app`，配合 HBuilderX 云打包）

本工程由高保真 HTML Demo 转写而来，5 个页面、6 套主题色 + 深色模式、本地数据持久化均已就绪。

## 目录结构

```
offer-notebook/
├─ src/
│  ├─ pages/
│  │  ├─ index/index.vue        # 首页 · 求职记录（统计 + 分类导航 + 投递流程）
│  │  ├─ edit/edit.vue          # 编辑页（表单 + AI 截图识别演示）
│  │  ├─ discover/discover.vue  # 发现页 · 校招社区
│  │  ├─ messages/messages.vue  # 消息页
│  │  └─ profile/profile.vue    # 个人页（主题设置）
│  ├─ store/
│  │  ├─ theme.js               # 主题读写（6 套主题色 + 深色模式）
│  │  └─ records.js             # 投递记录读写（uni storage）
│  ├─ utils/system.js           # 状态栏高度、Toast 等工具
│  ├─ static/tabbar/            # 原生 TabBar 图标（8 张 PNG）
│  ├─ App.vue                   # 全局主题变量与公共组件样式
│  ├─ main.js
│  ├─ manifest.json             # 应用配置（appid / 路由 / 平台设置）
│  ├─ pages.json                # 页面注册与原生 TabBar
│  └─ uni.scss
├─ index.html
├─ vite.config.js
└─ package.json
```

## 快速开始

环境要求：Node.js 18+，包管理器推荐 pnpm（npm 亦可）。

```bash
# 1. 安装依赖
pnpm install

# 2. H5 本地预览（浏览器打开 http://localhost:5173）
pnpm run dev:h5

# 3. 微信小程序（先用微信开发者工具导入 dist/dev/mp-weixin）
pnpm run dev:mp-weixin
```

## 构建与发布

```bash
# H5 产物 → dist/build/h5（可部署到任意静态托管）
pnpm run build:h5

# 微信小程序产物 → dist/build/mp-weixin（微信开发者工具中导入并上传）
pnpm run build:mp-weixin

# App 产物（配合 HBuilderX 导入本工程后云打包上架）
pnpm run build:app
```

## 微信开发者工具

1. 打开微信开发者工具 → 导入项目；
2. 目录选择 `dist/build/mp-weixin`（或 `dist/dev/mp-weixin`）；
3. AppID 先用测试号（已配置 `touristappid`），正式发布时在 `src/manifest.json` 的 `mp-weixin.appid` 中替换为自己的 AppID；
4. 编译即可在模拟器与真机预览。

## 功能清单

- 首页：秋招进度卡、已投递 / 面试中 / 挂了 / 已通过四宫格统计、7 个分类导航（全部 / 投递中 / 笔试中 / 面试中 / 待offer / 已通过 / 挂了）、投递流程步骤条
- 编辑页：公司 / 岗位 / 城市 / 投递时间 / 当前阶段 / 薪资 / 渠道 / 链接 / 备注；「拍照 / 上传截图」AI 识别为演示效果（模拟填表）
- 发现页：校招社区（搜索、发帖入口、面经 / Offer 喜报 / 求助、点赞互动、热榜）
- 消息页：面试提醒置顶卡、消息分类、未读角标
- 个人页：资料、简历完整度、数据统计、菜单、主题设置（6 套主题色 + 深色模式）

## 待接入（正式版）

- AI 识别：对接多模态视觉模型（GPT-4o / GPT-5 等），从截图提取投递信息
- 数据上云：uniCloud 云函数 + 云数据库，多端同步与登录
- 社区：帖子 / 评论 / 点赞的云端存储与内容审核
- 消息推送：面试提醒、笔试通知（小程序订阅消息 / App 推送）
- 上架合规：隐私政策、用户协议、App 备案、软著等

## 说明

- 当前投递数据存于本地存储（`uni.setStorageSync`），刷新 / 重进不丢失，换设备不同步
- 「AI 识别」「发帖」「简历更新」等为演示交互，接入后端后替换为真实逻辑
- 页面视觉与 [HTML 高保真 Demo](../index.html) 保持一致，改版时两边同步
