<script>
export default {
  onLaunch() {
    // 预留：后续可做启动时数据迁移 / 登录态检查
  }
}
</script>

<style>
/* ================= 主题变量（6 套主题色 + 深色模式） ================= */
.theme-mint {
  --primary: #2EC4B6; --primary-deep: #189B90; --primary-soft: #DDF6F2; --on-primary: #FFFFFF;
  --bg: #F3FAF8; --card: #FFFFFF; --line: #EAF0EE;
  --text-1: #22303B; --text-2: #5E6E7C; --text-3: #9AA8B3;
  --accent: #FFD166; --accent-deep: #E8A93C; --accent-soft: #FFF3D9;
  --info: #4E9FF0; --info-soft: #E5F1FD;
  --grape: #8B7CF6; --grape-soft: #ECE9FE;
  --coral: #FF7A59; --coral-soft: #FFE9E1;
  --warn: #F0A63A; --warn-soft: #FFF3D9;
  --success: #2EC4B6; --success-soft: #DDF6F2;
  --danger: #FF6B81; --danger-soft: #FFE7EC;
  --shadow: 0 10rpx 30rpx rgba(31, 74, 68, 0.09);
}
.theme-sky {
  --primary: #4E9FF0; --primary-deep: #2F7FD6; --primary-soft: #E5F1FD; --on-primary: #FFFFFF;
  --bg: #F4F8FC; --card: #FFFFFF; --line: #E9EFF5;
  --text-1: #22303B; --text-2: #5E6E7C; --text-3: #9AA8B3;
  --accent: #FFD166; --accent-deep: #E8A93C; --accent-soft: #FFF3D9;
  --info: #4E9FF0; --info-soft: #E5F1FD;
  --grape: #8B7CF6; --grape-soft: #ECE9FE;
  --coral: #FF7A59; --coral-soft: #FFE9E1;
  --warn: #F0A63A; --warn-soft: #FFF3D9;
  --success: #2EC4B6; --success-soft: #DDF6F2;
  --danger: #FF6B81; --danger-soft: #FFE7EC;
  --shadow: 0 10rpx 30rpx rgba(40, 80, 130, 0.10);
}
.theme-coral {
  --primary: #FF7A59; --primary-deep: #EE5C36; --primary-soft: #FFE9E1; --on-primary: #FFFFFF;
  --bg: #FFF7F4; --card: #FFFFFF; --line: #F4EAE6;
  --text-1: #33231E; --text-2: #6E5A53; --text-3: #A6958E;
  --accent: #FFD166; --accent-deep: #E8A93C; --accent-soft: #FFF3D9;
  --info: #4E9FF0; --info-soft: #E5F1FD;
  --grape: #8B7CF6; --grape-soft: #ECE9FE;
  --coral: #FF7A59; --coral-soft: #FFE9E1;
  --warn: #F0A63A; --warn-soft: #FFF3D9;
  --success: #2EC4B6; --success-soft: #DDF6F2;
  --danger: #FF6B81; --danger-soft: #FFE7EC;
  --shadow: 0 10rpx 30rpx rgba(120, 60, 40, 0.09);
}
.theme-cream {
  --primary: #F5B342; --primary-deep: #D99424; --primary-soft: #FFF3D9; --on-primary: #4A3410;
  --bg: #FFFBF1; --card: #FFFFFF; --line: #F3EBDD;
  --text-1: #332A1A; --text-2: #6E624C; --text-3: #A69A84;
  --accent: #FF7A59; --accent-deep: #EE5C36; --accent-soft: #FFE9E1;
  --info: #4E9FF0; --info-soft: #E5F1FD;
  --grape: #8B7CF6; --grape-soft: #ECE9FE;
  --coral: #FF7A59; --coral-soft: #FFE9E1;
  --warn: #F0A63A; --warn-soft: #FFF3D9;
  --success: #2EC4B6; --success-soft: #DDF6F2;
  --danger: #FF6B81; --danger-soft: #FFE7EC;
  --shadow: 0 10rpx 30rpx rgba(120, 90, 30, 0.09);
}
.theme-pink {
  --primary: #FF8FAB; --primary-deep: #F06E8F; --primary-soft: #FFE7EE; --on-primary: #5B2140;
  --bg: #FFF7F9; --card: #FFFFFF; --line: #F5E9EC;
  --text-1: #33202A; --text-2: #6E5460; --text-3: #A68E98;
  --accent: #FFD166; --accent-deep: #E8A93C; --accent-soft: #FFF3D9;
  --info: #4E9FF0; --info-soft: #E5F1FD;
  --grape: #8B7CF6; --grape-soft: #ECE9FE;
  --coral: #FF7A59; --coral-soft: #FFE9E1;
  --warn: #F0A63A; --warn-soft: #FFF3D9;
  --success: #2EC4B6; --success-soft: #DDF6F2;
  --danger: #FF6B81; --danger-soft: #FFE7EC;
  --shadow: 0 10rpx 30rpx rgba(130, 50, 90, 0.09);
}
.theme-grape {
  --primary: #8B7CF6; --primary-deep: #6F5EE0; --primary-soft: #ECE9FE; --on-primary: #FFFFFF;
  --bg: #F8F7FD; --card: #FFFFFF; --line: #ECEAF6;
  --text-1: #24223A; --text-2: #5E5C7E; --text-3: #9391B0;
  --accent: #FFD166; --accent-deep: #E8A93C; --accent-soft: #FFF3D9;
  --info: #4E9FF0; --info-soft: #E5F1FD;
  --grape: #8B7CF6; --grape-soft: #ECE9FE;
  --coral: #FF7A59; --coral-soft: #FFE9E1;
  --warn: #F0A63A; --warn-soft: #FFF3D9;
  --success: #2EC4B6; --success-soft: #DDF6F2;
  --danger: #FF6B81; --danger-soft: #FFE7EC;
  --shadow: 0 10rpx 30rpx rgba(70, 55, 150, 0.10);
}

/* 深色模式 */
.dark {
  --bg: #10141B; --card: #1A202A; --line: #29313D;
  --text-1: #EDF1F6; --text-2: #A3AFBB; --text-3: #66727F;
  --shadow: 0 12rpx 34rpx rgba(0, 0, 0, 0.35);
  --info-soft: rgba(78, 159, 240, 0.16); --grape-soft: rgba(139, 124, 246, 0.16);
  --coral-soft: rgba(255, 122, 89, 0.16); --warn-soft: rgba(240, 166, 58, 0.16);
  --success-soft: rgba(46, 196, 182, 0.16); --danger-soft: rgba(255, 107, 129, 0.16);
}
.theme-mint.dark { --primary-soft: rgba(46, 196, 182, 0.16); --accent-soft: rgba(255, 209, 102, 0.16) }
.theme-sky.dark { --primary-soft: rgba(78, 159, 240, 0.16); --accent-soft: rgba(255, 209, 102, 0.16) }
.theme-coral.dark { --primary-soft: rgba(255, 122, 89, 0.16); --accent-soft: rgba(255, 209, 102, 0.16) }
.theme-cream.dark { --primary-soft: rgba(245, 179, 66, 0.16); --accent-soft: rgba(255, 122, 89, 0.16) }
.theme-pink.dark { --primary-soft: rgba(255, 143, 171, 0.16); --accent-soft: rgba(255, 209, 102, 0.16) }
.theme-grape.dark { --primary-soft: rgba(139, 124, 246, 0.16); --accent-soft: rgba(255, 209, 102, 0.16) }

/* ================= 基础 ================= */
page {
  background: #F3FAF8;
  color: #22303B;
  font-size: 28rpx;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
.page {
  min-height: 100vh;
  background: var(--bg);
  color: var(--text-1);
  padding: 0 36rpx calc(220rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  transition: background 0.3s;
}
.page-nofab {
  padding-bottom: calc(80rpx + env(safe-area-inset-bottom));
}

/* ================= 公共组件 ================= */
.card { background: var(--card); border-radius: 40rpx; box-shadow: var(--shadow) }

.section-head { display: flex; align-items: baseline; justify-content: space-between; margin: 40rpx 4rpx 22rpx }
.section-head .lh { display: flex; align-items: baseline }
.section-head .title { font-size: 34rpx; font-weight: 800 }
.section-head .cnt { font-size: 22rpx; color: var(--text-3); margin-left: 10rpx }
.section-head .more { font-size: 24rpx; color: var(--text-3) }

.chip {
  display: inline-flex; align-items: center;
  padding: 14rpx 30rpx; border-radius: 99rpx; font-size: 25rpx; font-weight: 600;
  background: var(--card); color: var(--text-2);
  box-shadow: 0 6rpx 18rpx rgba(30, 50, 45, 0.05); white-space: nowrap;
}
.chip.active { background: var(--primary); color: var(--on-primary); box-shadow: 0 10rpx 24rpx rgba(46, 196, 182, 0.35) }

.status-pill { padding: 6rpx 20rpx; border-radius: 99rpx; font-size: 22rpx; font-weight: 700 }
.st-info { background: var(--info-soft); color: #2F7FD6 }
.st-grape { background: var(--grape-soft); color: #6F5EE0 }
.st-coral { background: var(--coral-soft); color: #EE5C36 }
.st-warn { background: var(--warn-soft); color: #D99424 }
.st-success { background: var(--success-soft); color: #189B90 }
.st-danger { background: var(--danger-soft); color: #E5496B }

.btn-primary {
  display: flex; align-items: center; justify-content: center;
  padding: 30rpx 0; border-radius: 36rpx;
  background: linear-gradient(135deg, var(--primary), var(--primary-deep));
  color: var(--on-primary); font-size: 31rpx; font-weight: 800; letter-spacing: 4rpx;
  box-shadow: 0 20rpx 44rpx rgba(46, 196, 182, 0.38);
}

.fab {
  position: fixed; right: 36rpx; bottom: calc(190rpx + env(safe-area-inset-bottom));
  width: 112rpx; height: 112rpx; border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--primary-deep));
  color: var(--on-primary); display: flex; align-items: center; justify-content: center;
  font-size: 60rpx; font-weight: 300; line-height: 1;
  box-shadow: 0 20rpx 44rpx rgba(46, 196, 182, 0.45); z-index: 99;
}

.mask {
  position: fixed; left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(18, 24, 32, 0.45); z-index: 100;
  display: flex; align-items: center; justify-content: center;
}
.sheet {
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 101;
  background: var(--card); border-radius: 56rpx 56rpx 0 0;
  padding: 44rpx 40rpx calc(48rpx + env(safe-area-inset-bottom));
  animation: sheetUp 0.3s ease both;
}
@keyframes sheetUp {
  from { transform: translateY(30%); opacity: 0.6 }
  to { transform: none; opacity: 1 }
}
</style>
