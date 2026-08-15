/* =====================================================================
   云端小窝 · UI 模块：界面渲染 / 动画循环 / 音效 / 事件绑定
   ===================================================================== */
(function (global) {
  'use strict';
  const $ = id => document.getElementById(id);
  const UI = {};

  /* ---------------- 音效（WebAudio 合成芯片音） ---------------- */
  const SFX = {
    ctx: null, muted: false,
    init() {
      if (!this.ctx) {
        try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
      }
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    },
    beep(freq, dur, type, vol, slide) {
      if (this.muted || !this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = type || 'square';
      osc.frequency.setValueAtTime(freq, t);
      if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slide), t + dur);
      g.gain.setValueAtTime(vol || 0.08, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(g); g.connect(this.ctx.destination);
      osc.start(t); osc.stop(t + dur + 0.02);
    },
    play(name) {
      if (this.muted) return;
      switch (name) {
        case 'click': this.beep(660, 0.07, 'square', 0.05); break;
        case 'feed': this.beep(300, 0.08, 'triangle', 0.08); setTimeout(() => this.beep(240, 0.1, 'triangle', 0.08), 90); break;
        case 'play': [520, 660, 780].forEach((f, i) => setTimeout(() => this.beep(f, 0.09, 'square', 0.06), i * 80)); break;
        case 'pet': this.beep(880, 0.12, 'sine', 0.09); setTimeout(() => this.beep(1320, 0.15, 'sine', 0.07), 100); break;
        case 'sleep': this.beep(392, 0.3, 'sine', 0.06, 330); break;
        case 'coin': this.beep(988, 0.08, 'square', 0.07); setTimeout(() => this.beep(1319, 0.12, 'square', 0.06), 70); break;
        case 'levelup': [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.beep(f, 0.12, 'square', 0.07), i * 100)); break;
        case 'error': this.beep(220, 0.15, 'sawtooth', 0.05, 150); break;
        case 'gameover': [600, 450, 300, 180].forEach((f, i) => setTimeout(() => this.beep(f, 0.14, 'triangle', 0.07), i * 120)); break;
        case 'sick': this.beep(330, 0.3, 'sine', 0.06, 220); break;
        case 'dead': [440, 330, 220].forEach((f, i) => setTimeout(() => this.beep(f, 0.35, 'sine', 0.06), i * 250)); break;
        case 'adopt': [659, 784, 988, 1319].forEach((f, i) => setTimeout(() => this.beep(f, 0.1, 'square', 0.06), i * 90)); break;
      }
    }
  };
  global.SFX = SFX;

  /* ---------------- BGM ---------------- */
  const BGM = {
    el: null,
    start() {
      if (!this.el) this.el = $('bgm');
      if (!this.el) return;
      const st = state();
      if (st.bgm === false || SFX.muted) return;
      this.el.volume = 0.45;
      const p = this.el.play();
      if (p && p.catch) p.catch(function(){});
    },
    stop() {
      if (this.el) { this.el.pause(); this.el.currentTime = 0; }
    },
    toggle() {
      const st = state();
      st.bgm = !(st.bgm !== false);
      localStorage.setItem(Game.SAVE_KEY, JSON.stringify(st));
      if (st.bgm && !SFX.muted) { this.start(); } else { this.stop(); }
      UI.renderSettings();
    }
  };
  global.BGM = BGM;

  /* ---------------- 工具 ---------------- */
  function fmtTime(ts) {
    const d = new Date(ts);
    const p = n => (n < 10 ? '0' : '') + n;
    return (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }
  function drawPetAvatar(pet, size) {
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    const tinted = SPRITES.getTintedAsset ? SPRITES.getTintedAsset(pet) : null;
    if (tinted) {
      const targetH = Math.floor(size * 0.8);
      const scale = targetH / tinted.height;
      const w = tinted.width * scale, h = tinted.height * scale;
      ctx.imageSmoothingEnabled = scale < 1;
      ctx.drawImage(tinted, Math.floor((size - w) / 2), Math.floor((size - h) / 2), w, h);
      return c;
    }
    const built = SPRITES.buildPet(pet);
    const cell = Math.max(2, Math.floor((size * 0.86) / Math.max(built.rows, built.cols)));
    const w = built.cols * cell, h = built.rows * cell;
    SPRITES.drawPetToCanvas(ctx, pet, Math.floor((size - w) / 2), Math.floor((size - h) / 2), { cell });
    return c;
  }
  function drawIconCanvas(id, size) {
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    SPRITES.drawIconFit(ctx, id, 0, 0, size);
    return c;
  }

  /* ---------------- 屏幕切换 ---------------- */
  let currentScreen = 'splash';
  UI.go = function (name) {
    currentScreen = name;
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = $('screen-' + name);
    if (el) el.classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => b.removeAttribute('data-active'));
    const nav = document.querySelector('.nav-btn[data-nav="' + name + '"]');
    if (nav) nav.setAttribute('data-active', '1');
    if (name === 'home') { UI.renderHome(); }
    if (name === 'shop') { UI.renderShop('food'); }
    if (name === 'games') { UI.renderGames(); }
    if (name === 'room') { UI.renderRoom(); }
    if (name === 'pets') { UI.renderPets(); }
    if (name === 'journal') { UI.renderJournal('log'); }
    if (name === 'settings') { UI.renderSettings(); }
    if (name === 'type') { UI.renderType(); }
    if (name === 'color') { UI.renderColor(); }
    if (name === 'splash') { UI.renderSplash(); }
    SFX.play('click');
  };

  /* ---------------- 启动页 ---------------- */
    UI.renderSplash = function () {
    const c = $('splashCanvas');
    const ctx = c.getContext('2d');
    const W = c.width, H = c.height;
    const bg = SPRITES.getAsset('splash', 'bg');
    ctx.clearRect(0, 0, W, H);
    if (bg) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(bg, 0, 0, W, H);
    }
  };
    /* ---------------- 类型选择 ---------------- */
  UI.renderType = function () {
    const grid = $('typeGrid');
    grid.innerHTML = '';
    const types = Object.keys(SPRITES.ANIMALS);
    types.forEach(type => {
      const pet = { type, color: 'orange', pattern: 'solid', stage: 2, seed: 1 };
      const card = document.createElement('div');
      card.className = 'pet-card';
      const cv = drawPetAvatar(pet, 110);
      const info = SPRITES.ANIMALS[type];
      card.appendChild(cv);
      const nameEl = document.createElement('div');
      nameEl.className = 'name'; nameEl.textContent = info.emoji + ' ' + info.label;
      const descEl = document.createElement('div');
      descEl.className = 'desc'; descEl.textContent = info.desc;
      card.appendChild(nameEl); card.appendChild(descEl);
      card.addEventListener('click', () => { UI.selType = type; UI.go('color'); });
      grid.appendChild(card);
    });
  };

  /* ---------------- 花色选择 ---------------- */
  UI.selType = 'cat';
  UI.selColor = 'orange';
  UI.selPattern = 'solid';

  UI.renderColor = function () {
    const sw = $('colorSwatches');
    sw.innerHTML = '';
    Object.keys(SPRITES.COLORS).forEach(id => {
      const col = SPRITES.COLORS[id];
      const b = document.createElement('button');
      b.className = 'swatch' + (id === UI.selColor ? ' selected' : '');
      b.style.background = col.main;
      b.title = col.label;
      b.addEventListener('click', () => { UI.selColor = id; UI.renderColor(); });
      sw.appendChild(b);
    });
    const pw = $('patternSwatches');
    pw.innerHTML = '';
    Object.keys(SPRITES.PATTERNS).forEach(id => {
      const b = document.createElement('button');
      b.className = 'swatch swatch-pattern' + (id === UI.selPattern ? ' selected' : '');
      b.textContent = SPRITES.PATTERNS[id].label;
      b.addEventListener('click', () => { UI.selPattern = id; UI.renderColor(); });
      pw.appendChild(b);
    });
    if (!$('petNameInput').value) $('petNameInput').value = Game.randomName();
    UI.drawColorPreview();
  };

  UI.drawColorPreview = function () {
    const c = $('colorPreview');
    const ctx = c.getContext('2d');
    const W = c.width, H = c.height;
    ctx.fillStyle = '#fdfaf2';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#e8dcc2'; ctx.fillRect(0, H - 36, W, 36);
    ctx.fillStyle = 'rgba(80,60,40,.15)';
    ctx.fillRect(60, H - 34, 90, 6);
    const pet = { type: UI.selType, color: UI.selColor, pattern: UI.selPattern, stage: 2, seed: 7 };
    const built = SPRITES.buildPet(pet);
    const cell = 7;
    const w = built.cols * cell, h = built.rows * cell;
    SPRITES.drawPetToCanvas(ctx, pet, Math.floor((W - w) / 2), H - 36 - h, { cell });
  };

  /* ---------------- 主界面 ---------------- */
  function fmtCoins(n) { return '🪙 ' + n; }

  UI.renderHome = function () {
    const st = state();
    $('homeCoins').textContent = fmtCoins(st.coins);
    $('homeDay').textContent = '第 ' + (Math.floor(st.gameDays || 0) + 1) + ' 天';
    const p = Game.activePet();
    if (p) {
      $('homePetName').textContent = p.name;
      $('homeStage').textContent = (p.alive ? '' : '💫 ') + Game.STAGES[p.stage] + (p.sick ? ' · 生病了' : '') + (p.runaway ? ' · 跑出去啦' : '');
      $('barAffection').style.width = p.affection + '%';
      $('numAffection').textContent = Math.round(p.affection);
      $('barHunger').style.width = p.hunger + '%';
      $('numHunger').textContent = Math.round(p.hunger);
      $('barEnergy').style.width = p.energy + '%';
      $('numEnergy').textContent = Math.round(p.energy);
      updateActionButtons(p);
      const banner = $('sickBanner');
      if (banner) banner.classList.toggle('hidden', !(p.alive && p.sick));
      const rbanner = $('runawayBanner');
      if (rbanner) rbanner.classList.toggle('hidden', !(p.alive && p.runaway));
      const findBtn = $('btnFindPet');
      if (findBtn) {
        findBtn.onclick = () => {
          SFX.init();
          const r = Game.findPet(p.id);
          if (r.ok) { SFX.play('adopt'); UI.toast('📍 ' + r.pet.name + ' 回来啦！'); UI.renderHome(); UI.renderPets(); }
          else {
            SFX.play('error');
            if (r.goto) UI.confirm('提示', r.msg, '去小卖部', () => UI.go(r.goto), '知道了');
            else UI.toast(r.msg);
          }
        };
      }
    } else {
      Game.save();
      UI.go('splash');
      return;
    }
  };

  function state() { return JSON.parse(localStorage.getItem(Game.SAVE_KEY) || 'null') || Game.defaultState(); }

  function updateActionButtons(p) {
    const now = Date.now();
    Object.keys(Game.ACTIONS).forEach(name => {
      const btn = document.querySelector('[data-action="' + name + '"]');
      if (!btn) return;
      if (p.runaway) {
        btn.classList.add('cool');
        let cdEl = btn.querySelector('.cd');
        if (!cdEl) { btn.innerHTML = btn.innerHTML + '<span class="cd"></span>'; cdEl = btn.querySelector('.cd'); }
        cdEl.textContent = '它跑啦';
        return;
      }
      const cfg = Game.ACTIONS[name];
      const lastKey = 'last' + name[0].toUpperCase() + name.slice(1);
      const remain = (p[lastKey] + cfg.cd * 60000 - now) / 60000;
      const cdEl = btn.querySelector('.cd');
      if (remain > 0) {
        btn.classList.add('cool');
        if (!cdEl) btn.innerHTML = btn.innerHTML + '<span class="cd"></span>';
        btn.querySelector('.cd').textContent = remain < 1 ? '<1分' : Math.ceil(remain) + '分';
      } else {
        btn.classList.remove('cool');
        if (cdEl) cdEl.textContent = '';
      }
    });
  }

  /* ---------- 主界面画布动画 ---------- */
  const homeFx = []; // {type,x,y,vy,t,life}
  let bubbleText = null, bubbleUntil = 0;
  let lastTick = 0;

  function addFx(type, x, y) {
    homeFx.push({ type, x, y, vy: type === 'heart' ? -0.8 : -0.5, t: 0, life: 70 });
  }

  UI.sayBubble = function (speech) {
    bubbleText = speech;
    bubbleUntil = Date.now() + 5200;
  };

  function drawBubble(ctx, text) {
    if (!bubbleText) return;
    const lines = [];
    const raw = '「' + (bubbleText.raw || '') + '」';
    const trans = '译：' + (bubbleText.trans || '');
    lines.push(raw, trans);
    ctx.font = 'bold 11px "Microsoft YaHei", sans-serif';
    const maxW = 220;
    const wrapped = [];
    lines.forEach(line => {
      let cur = '';
      for (const ch of line) {
        if (ctx.measureText(cur + ch).width > maxW && cur) { wrapped.push(cur); cur = ch; }
        else cur += ch;
      }
      if (cur) wrapped.push(cur);
    });
    const padX = 8, padY = 6, lineH = 15;
    const w = Math.min(230, Math.max(...wrapped.map(l => ctx.measureText(l).width)) + padX * 2);
    const h = wrapped.length * lineH + padY * 2;
    const bx = 170 - w / 2, by = 74;
    // 像素气泡
    ctx.fillStyle = 'rgba(255,255,255,.96)';
    ctx.strokeStyle = '#3b3a36';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(bx, by, w, h, 6);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#3b3a36';
    ctx.beginPath();
    ctx.moveTo(170 - 6, by + h - 2);
    ctx.lineTo(170, by + h + 8);
    ctx.lineTo(170 + 6, by + h - 2);
    ctx.closePath(); ctx.fill();
    ctx.font = 'bold 11px "Microsoft YaHei", sans-serif';
    wrapped.forEach((line, i) => {
      const isTrans = line.startsWith('译：');
      ctx.fillStyle = isTrans ? '#c26a8e' : '#3b3a36';
      ctx.fillText(line, bx + padX, by + padY + 12 + i * lineH);
    });
  }

  function drawHomeFrame(now) {
    const c = $('homeCanvas');
    if (!c) return;
    const ctx = c.getContext('2d');
    const p = Game.activePet();
    const st = JSON.parse(localStorage.getItem(Game.SAVE_KEY) || 'null') || Game.defaultState();
    const theme = st.theme || 'minimal';
    const h = new Date().getHours();
    const night = h >= 19 || h < 6;
    ROOMS.draw(ctx, c.width, c.height, theme, night);

    if (p && !p.runaway) {
      const floorY = 232;
      const stage = p.stage || 0;
      let pw, ph;
      if (SPRITES.hasAsset('pets', p.type + '-' + stage + '-' + (p.color || 'orange'))) {
        const img = SPRITES.getAsset('pets', p.type + '-' + stage + '-' + (p.color || 'orange'));
        ph = (stage === 0 ? 62 : stage === 1 ? 78 : 94) * (stage === 1 ? 0.82 : 1);
        pw = img.width * ph / img.height;
      } else {
        const built = SPRITES.buildPet(p);
        const cell = SPRITES.cellSizeForStage(stage);
        pw = built.cols * cell; ph = built.rows * cell;
      }
      const petX = 170 - pw / 2;
      let y = floorY - ph;
      let bob = Math.sin(now / 380 + p.seed) * 2.5;
      if (!p.alive) bob = 0;
      if (p.sick) bob = Math.sin(now / 900) * 1.2;
      const fx = homeFx.find(f => f.type === 'play');
      if (fx && fx.t < 40) { bob -= Math.abs(Math.sin(fx.t / 4)) * 22; }
      // 小窝（宠物屋）
      if (p.house && p.alive) {
        ROOMS.drawHouse(ctx, p.house, 40, floorY - 48, 6);
      }
      // 阴影
      ctx.fillStyle = 'rgba(60,45,30,.22)';
      ctx.fillRect(petX + 4, floorY, pw - 8, 6);
      // 生病特效
      if (p.sick) {
        ctx.fillStyle = 'rgba(140,180,150,.25)';
        ctx.fillRect(petX, y, pw, ph);
      }
      SPRITES.drawPetToCanvas(ctx, p, petX, y + bob, {});
      // 配饰
      if (p.gear && p.alive) {
        const accW = { bow: 40, hat: 48, crown: 40, scarf: 40, glasses: 56 };
        const aCell = 3;
        if (p.gear.head) { const aw = (accW[p.gear.head] || 40) * aCell / 4; SPRITES.drawAccessory(ctx, p.gear.head, petX + pw / 2 - aw / 2, y + bob - 8, aCell); }
        if (p.gear.face) { const aw = (accW[p.gear.face] || 40) * aCell / 4; SPRITES.drawAccessory(ctx, p.gear.face, petX + pw / 2 - aw / 2, y + bob + ph * 0.28, aCell); }
        if (p.gear.neck) { const aw = (accW[p.gear.neck] || 40) * aCell / 4; SPRITES.drawAccessory(ctx, p.gear.neck, petX + pw / 2 - aw / 2, y + bob + ph * 0.55, aCell); }
      }
      if (!p.alive) {
        // 星星
        ctx.fillStyle = '#fff3b0';
        [[170 - 10, y + 4], [170 + 14, y + 12], [170 - 18, y + 22]].forEach(([sx, sy]) => {
          for (let i = 0; i < 3; i++) ctx.fillRect(sx - i, sy, 2 + i * 2, 2);
          for (let i = 0; i < 3; i++) ctx.fillRect(sx, sy - i, 2, 2 + i * 2);
        });
      } else if (st.flags && st.flags.sleeping) {
        ctx.fillStyle = '#5a7a9a';
        ctx.font = 'bold 12px "Microsoft YaHei"';
        ctx.fillText('Z', 170 + w / 2 + 4, y + 8);
        ctx.fillText('z', 170 + w / 2 + 14, y - 4);
      }
    }

    if (p && p.runaway && p.alive) {
      ctx.fillStyle = 'rgba(70,60,50,.55)';
      for (let i = 0; i < 4; i++) {
        const fx2 = 104 + i * 26, fy2 = 236 - (i % 2) * 5;
        ctx.fillRect(fx2 - 6, fy2 - 8, 4, 5);
        ctx.fillRect(fx2 + 2, fy2 - 8, 4, 5);
        ctx.fillRect(fx2 - 7, fy2 - 2, 5, 4);
        ctx.fillRect(fx2 + 2, fy2 - 2, 5, 4);
      }
      ctx.fillStyle = 'rgba(255,255,255,.95)';
      ctx.font = 'bold 13px "Microsoft YaHei"';
      ctx.fillText('它偷偷跑出去玩啦！', 92, 264);
    }
    // 粒子特效
    for (let i = homeFx.length - 1; i >= 0; i--) {
      const f = homeFx[i];
      f.t++; f.y += f.vy;
      if (f.type === 'heart') SPRITES.drawIcon(ctx, 'heart', f.x, f.y, 4);
      else if (f.type === 'sparkle') {
        ctx.fillStyle = '#fff3b0';
        for (let k = 0; k < 2; k++) ctx.fillRect(f.x + k, f.y + k, 2, 2);
      } else if (f.type === 'food') SPRITES.drawIcon(ctx, f.icon, f.x, f.y, 4);
      else if (f.type === 'ball') SPRITES.drawIcon(ctx, 'ball', f.x, f.y, 4);
      if (f.t > f.life) homeFx.splice(i, 1);
    }
    drawBubble(ctx, now);
  }

  function startHomeLoop() {
    function loop(now) {
      requestAnimationFrame(loop);
      if (currentScreen === 'home') {
        drawHomeFrame(now);
        if (now - lastTick > 5000) {
          lastTick = now;
          handleTick();
        }
      }
    }
    requestAnimationFrame(loop);
  }

  function handleTick() {
    const events = Game.simulate(Date.now());
    Game.save();
    UI.renderHome();
    events.forEach(ev => {
      if (ev.type === 'daily') {
        UI.toast('每日暖心留言已写入日记，+20 金币 💛');
        SFX.play('coin');
      }
      if (ev.type === 'runaway') {
        const pp = state().pets.find(x => x.id === ev.petId);
        UI.toast('💨 ' + (pp ? pp.name : '小可爱') + ' 偷偷跑出去玩啦！快去商店买定位器找它！');
        SFX.play('sick');
      }
      if (ev.type === 'newday') {
        UI.toast('🌞 第 ' + ev.day + ' 天到了，微风掏来 3 金币');
        SFX.play('coin');
      }
      if (ev.type === 'sick') {
        const p = Game.activePet && Game.activePet();
        UI.toast((p ? p.name : '小伙伴') + ' 生病了…快喂它吃点东西吧');
        SFX.play('sick');
      }
      if (ev.type === 'died') {
        const p = Game.activePet && Game.activePet();
        UI.confirm('『' + (p ? p.name : '伙伴') + '』去了星星上', '它说：谢谢你，给了我一段被爱着的时光。可以用「回忆之光」把它召回。', '回忆之光召回', () => {
          const r = Game.revive(ev.petId);
          if (r.ok) UI.toast(p ? p.name + ' 回来啦！' : '伙伴回来啦！', 2600);
          UI.renderHome(); UI.renderPets();
        }, '让它留在回忆里');
        SFX.play('dead');
      }
    });
  }

  /* ---------------- 互动按钮 ---------------- */
  function doAction(name) {
    SFX.init();
    const res = Game.action(name);
    if (!res.ok) {
      SFX.play('error');
      if (res.goto) {
        UI.confirm('提示', res.msg, '去' + (res.goto === 'shop' ? '小卖部' : '游乐场'), () => UI.go(res.goto), '知道了');
      } else {
        UI.toast(res.msg);
      }
      return;
    }
    SFX.play(res.fx === 'feed' ? 'feed' : res.fx === 'play' ? 'play' : res.fx === 'pet' ? 'pet' : 'sleep');
    const p = Game.activePet();
    UI.sayBubble(res.speech);
    if (p) {
      if (res.fx === 'feed') { addFx('food', 185, 170); homeFx[homeFx.length - 1].icon = 'fish'; }
      if (res.fx === 'play') { addFx('ball', 150, 190); addFx('sparkle', 205, 150); }
      if (res.fx === 'pet') { addFx('heart', 190, 150); addFx('heart', 215, 175); addFx('heart', 165, 175); }
      if (res.fx === 'sleep') { }
    }
    if (res.stageup) {
      setTimeout(() => {
        UI.confirm('🎉 ' + p.name + ' 长大啦！', '现在是' + Game.STAGES[res.stageup.stage] + '！奖励 ' + res.stageup.bonus + ' 金币' + (res.stageup.stage === 2 ? '。再攒 3000 金币就可以领养新伙伴啦！' : '。'), '太好啦', () => {});
        SFX.play('levelup');
      }, 350);
    }
    if (res.achievements && res.achievements.length) {
      setTimeout(() => UI.toast('🏆 成就解锁：' + res.achievements.map(a => a.name).join('、')), 900);
    }
    UI.renderHome();
  }

  /* ---------------- 商店 ---------------- */
  UI.renderShop = function (tab) {
    $('shopCoins').textContent = fmtCoins(state().coins);
    const list = $('shopList');
    list.innerHTML = '';
    const st2 = state();
    const table = tab === 'food' ? Game.FOODS : tab === 'toy' ? Game.TOYS : tab === 'med' ? Game.MEDS : tab === 'gear' ? Game.GEAR : tab === 'tool' ? Game.TRACKERS : Game.HOUSES;
    Object.keys(table).forEach(id => {
      const item = table[id];
      const card = document.createElement('div');
      card.className = 'shop-card';
      const icon = drawIconCanvas(item.icon, 48);
      card.appendChild(icon);
      const info = document.createElement('div');
      info.className = 'info';
      const owned = (tab === 'gear' && st2.wardrobe && st2.wardrobe[id]) || (tab === 'house' && st2.houses && st2.houses[id]);
      const countInfo = (tab === 'gear' || tab === 'house') ? (owned ? ' · 已拥有' : '') : (' · 库存 ' + (st2.inventory[id] || 0));
      info.innerHTML = '<div class="t">' + item.label + '</div><div class="d">' + item.desc + countInfo + '</div>';
      card.appendChild(info);
      const btn = document.createElement('button');
      btn.className = 'btn buy';
      btn.textContent = owned ? '已拥有' : (item.price + ' 🪙');
      if (owned) btn.classList.add('btn-gray');
      btn.addEventListener('click', () => {
        SFX.init();
        if (owned) { UI.toast('已经拥有啦'); return; }
        const res = Game.buyItem(tab, id);
        if (res.ok) { SFX.play('coin'); UI.toast('买好啦：' + item.label + ' ×1'); UI.renderShop(tab); }
        else {
          SFX.play('error');
          if (res.goto) UI.confirm('金币不够啦', res.msg, '去游乐场', () => UI.go('games'), '知道了');
          else UI.toast(res.msg);
        }
      });
      card.appendChild(btn);
      list.appendChild(card);
    });
    document.querySelectorAll('.shop-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  };

  /* ---------------- 小游戏 ---------------- */
  UI.renderGames = function () {
    $('gamesCoins').textContent = fmtCoins(state().coins);
    const list = $('gameList');
    list.innerHTML = '';
    const st = state();
    const games = [
      { id: 'rain', icon: '🌧🍩', label: '零食雨', desc: '左右移动小碗，接住落下的零食赚金币！', best: st.stats.bestRain },
      { id: 'bubble', icon: '🫧', label: '泡泡乐', desc: '戳破泡泡收集金币，小心黑色的泡泡哦！', best: st.stats.bestBubble },
      { id: 'fishing', icon: '🎣', label: '钓鱼大师', desc: '鱼咬钩后连点鼠标收竿，鱼越稀有越难钓！', best: st.stats.bestFishing },
      { id: 'memory', icon: '🃏', label: '记忆翻翻乐', desc: '翻开两张相同的小图标，全部配对得分！', best: st.stats.bestMemory },
      { id: 'math', icon: '🔢', img: 'math', label: '算术速算', desc: '60 秒速算挑战，答对越多赚得越多！', best: st.stats.bestMath },
      { id: 'riddle', icon: '❓', img: 'riddle', label: '猜字谜', desc: '8 道经典字谜，全对还有额外奖励！', best: st.stats.bestRiddle }];
    games.forEach(g => {
      const card = document.createElement('div');
      card.className = 'shop-card';
      let icon;
      if (g.img) {
        icon = drawIconCanvas(g.img, 48);
      } else {
        icon = document.createElement('span');
        icon.className = 'icon'; icon.textContent = g.icon;
      }
      card.appendChild(icon);
      const info = document.createElement('div');
      info.className = 'info';
      info.innerHTML = '<div class="t">' + g.label + '</div><div class="d">' + g.desc + ' · 最高 ' + g.best + ' 分</div>';
      card.appendChild(info);
      const btn = document.createElement('button');
      btn.className = 'btn buy';
      btn.textContent = '开始';
      btn.addEventListener('click', () => {
        SFX.init();
        MiniGames.launch(g.id, score => {
          const res = Game.finishGame(g.id, score);
          SFX.play(score > 0 ? 'coin' : 'gameover');
          UI.toast('获得 ' + score + ' 金币' + (res.achievements.length ? '，解锁成就：' + res.achievements.map(a => a.name).join('、') : ''));
          UI.renderGames();
          UI.renderHome();
        });
      });
      card.appendChild(btn);
      list.appendChild(card);
    });
  };

  /* ---------------- 装修 ---------------- */
  UI.renderRoom = function () {
    $('roomCoins').textContent = fmtCoins(state().coins);
    const st = state();
    const ctx = $('roomPreview').getContext('2d');
    const h = new Date().getHours();
    ROOMS.draw(ctx, 360, 240, st.theme, h >= 19 || h < 6);
    const list = $('themeList');
    list.innerHTML = '';
    ROOMS.THEMES.forEach(th => {
      const card = document.createElement('div');
      card.className = 'shop-card theme-card';
      const cv = document.createElement('canvas');
      cv.width = 165; cv.height = 110;
      const cctx = cv.getContext('2d');
      ROOMS.draw(cctx, 165, 110, th.id, false);
      card.appendChild(cv);
      const info = document.createElement('div');
      info.className = 'info';
      info.innerHTML = '<div class="t">' + th.emoji + ' ' + th.label + '</div><div class="d">' + th.desc + '</div>';
      card.appendChild(info);
      const owned = st.ownedThemes.indexOf(th.id) >= 0;
      const btn = document.createElement('button');
      btn.className = 'btn buy';
      btn.textContent = owned ? (st.theme === th.id ? '使用中' : '换用') : th.price + ' 🪙';
      btn.addEventListener('click', () => {
        SFX.init();
        const res = Game.buyTheme(th.id);
        if (res.ok) {
          SFX.play('coin');
          UI.toast(owned ? '已换上「' + th.label + '」' : '购买并换上「' + th.label + '」');
          document.querySelector('.app').setAttribute('data-theme', th.id);
          UI.renderRoom(); UI.renderHome();
        } else {
          SFX.play('error');
          if (res.goto) UI.confirm('金币不够啦', res.msg, '去游乐场', () => UI.go('games'), '知道了');
          else UI.toast(res.msg);
        }
      });
      card.appendChild(btn);
      list.appendChild(card);
    });
  };

  /* ---------------- 我的伙伴 ---------------- */
  let adoptMode = 'first';

  UI.renderPets = function () {
    $('petsCoins').textContent = fmtCoins(state().coins);
    const st = state();
    const list = $('petList');
    list.innerHTML = '';
    st.pets.forEach(p => {
      const card = document.createElement('div');
      card.className = 'pet-list-card' + (p.id === st.activePetId ? ' active' : '');
      card.appendChild(drawPetAvatar(p, 64));
      const info = document.createElement('div');
      info.className = 'info';
      const status = !p.alive ? '💫 去了星星上' : (p.sick ? '🤒 生病了' : (p.runaway ? '💨 跑出去玩了' : '☀️ 健康'));
      info.innerHTML = '<div class="t">' + p.name + ' <span class="badge">' + Game.STAGES[p.stage] + '</span></div>' +
        '<div class="d">' + SPRITES.ANIMALS[p.type].label + ' · ' + status + '</div>' +
        '<div class="mini-stats"><span>♥' + Math.round(p.affection) + '</span><span>🍖' + Math.round(p.hunger) + '</span><span>⚡' + Math.round(p.energy) + '</span></div>';
      card.appendChild(info);
      if (p.runaway && p.alive) {
        const fbtn = document.createElement('button');
        fbtn.className = 'btn buy';
        fbtn.textContent = '📍 定位找回';
        fbtn.addEventListener('click', () => {
          SFX.init();
          const r = Game.findPet(p.id);
          if (r.ok) { SFX.play('adopt'); UI.toast('📍 ' + p.name + ' 回来啦！'); UI.renderPets(); UI.renderHome(); }
          else {
            SFX.play('error');
            if (r.goto) UI.confirm('提示', r.msg, '去小卖部', () => UI.go(r.goto), '知道了');
            else UI.toast(r.msg);
          }
        });
        card.appendChild(fbtn);
      }
      if (p.id !== st.activePetId && p.alive) {
        const btn = document.createElement('button');
        btn.className = 'btn buy';
        btn.textContent = '切换';
        btn.addEventListener('click', () => { SFX.play('click'); Game.switchPet(p.id); UI.renderPets(); UI.renderHome(); });
        card.appendChild(btn);
      } else if (!p.alive) {
        const btn = document.createElement('button');
        btn.className = 'btn buy';
        const cost = 100 + p.reviveCount * 50;
        btn.textContent = cost + ' 🪙 召回';
        btn.addEventListener('click', () => {
          SFX.init();
          const r = Game.revive(p.id);
          if (r.ok) { SFX.play('adopt'); UI.toast('✨ ' + p.name + ' 回来啦！'); UI.renderPets(); UI.renderHome(); }
          else {
            SFX.play('error');
            if (r.goto) UI.confirm('金币不够啦', r.msg, '去游乐场', () => UI.go('games'), '知道了');
            else UI.toast(r.msg);
          }
        });
        card.appendChild(btn);
      }
      if (p.alive) {
        const btnRow = document.createElement('div');
        btnRow.className = 'pet-btn-row';
        const gearBtn = document.createElement('button');
        gearBtn.className = 'btn btn-small';
        gearBtn.textContent = '🎀 装扮';
        gearBtn.addEventListener('click', () => { SFX.play('click'); UI.openWardrobe(p.id); });
        const houseBtn = document.createElement('button');
        houseBtn.className = 'btn btn-small';
        houseBtn.textContent = '🏠 小窝';
        houseBtn.addEventListener('click', () => { SFX.play('click'); UI.openHouse(p.id); });
        btnRow.appendChild(gearBtn); btnRow.appendChild(houseBtn);
        card.appendChild(btnRow);
      }
      list.appendChild(card);
    });
    const btn = $('btnAdoptNew');
    const canAdopt = st.pets.length < Game.MAX_PETS;
    btn.disabled = !canAdopt || st.coins < 3000;
    btn.textContent = !canAdopt
      ? '小窝已经住满啦'
      : '领养新伙伴（3000 金币）';
    btn.onclick = () => {
      if (st.coins < 3000) {
        UI.confirm('金币不够', '需要 3000 金币才能领养新伙伴，先玩小游戏赚点吧', '去游乐场', () => UI.go('games'), '知道了');
        return;
      }
      adoptMode = 'second';
      UI.go('type');
    };
  };

  /* ---------------- 装扮 / 小窝 ---------------- */
  UI.openWardrobe = function (petId) {
    const st0 = state();
    const pp = st0.pets.find(x => x.id === petId);
    if (pp && !pp.gear) { pp.gear = { head: null, neck: null, face: null }; localStorage.setItem(Game.SAVE_KEY, JSON.stringify(st0)); }
    const st = state();
    const p = st.pets.find(x => x.id === petId);
    if (!p) return;
    const box = $('wardrobeContent');
    box.innerHTML = '';
    const slots = [
      { slot: 'head', label: '头饰' },
      { slot: 'neck', label: '脖子' },
      { slot: 'face', label: '脸部' }
    ];
    slots.forEach(s => {
      const row = document.createElement('div');
      row.className = 'wardrobe-row';
      row.innerHTML = '<div class="label">' + s.label + '</div>';
      const btns = document.createElement('div');
      btns.className = 'wardrobe-btns';
      const off = document.createElement('button');
      off.className = 'btn btn-small' + (p.gear[s.slot] === null ? ' active' : '');
      off.textContent = '不戴';
      off.addEventListener('click', () => { SFX.play('click'); Game.equipGear(petId, s.slot, null); UI.openWardrobe(petId); UI.renderPets(); UI.renderHome(); });
      btns.appendChild(off);
      Object.keys(Game.GEAR).forEach(id => {
        const g = Game.GEAR[id];
        if (g.slot !== s.slot) return;
        const b = document.createElement('button');
        b.className = 'btn btn-small' + (p.gear[s.slot] === id ? ' active' : '') + (!st.wardrobe[id] ? ' off' : '');
        b.textContent = g.label;
        if (!st.wardrobe[id]) {
          b.title = '去商店购买';
          b.addEventListener('click', () => { SFX.play('error'); UI.toast('还没买「' + g.label + '」，去小卖部看看吧'); UI.go('shop'); });
        } else {
          b.addEventListener('click', () => { SFX.play('click'); Game.equipGear(petId, s.slot, id); UI.openWardrobe(petId); UI.renderPets(); UI.renderHome(); });
        }
        btns.appendChild(b);
      });
      row.appendChild(btns);
      box.appendChild(row);
    });
    $('wardrobeOverlay').classList.remove('hidden');
  };

  UI.openHouse = function (petId) {
    const st = state();
    const p = st.pets.find(x => x.id === petId);
    if (!p) return;
    const box = $('houseContent');
    box.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'wardrobe-btns';
    const off = document.createElement('button');
    off.className = 'btn btn-small' + (p.house === null ? ' active' : '');
    off.textContent = '不放置';
    off.addEventListener('click', () => { SFX.play('click'); Game.setHouse(petId, null); UI.openHouse(petId); UI.renderPets(); UI.renderHome(); });
    wrap.appendChild(off);
    Object.keys(Game.HOUSES).forEach(id => {
      const h = Game.HOUSES[id];
      const b = document.createElement('button');
      b.className = 'btn btn-small' + (p.house === id ? ' active' : '') + (!st.houses[id] ? ' off' : '');
      b.textContent = h.label;
      if (!st.houses[id]) {
        b.addEventListener('click', () => { SFX.play('error'); UI.toast('还没买「' + h.label + '」，去小卖部看看吧'); UI.go('shop'); });
      } else {
        b.addEventListener('click', () => { SFX.play('click'); Game.setHouse(petId, id); UI.openHouse(petId); UI.renderPets(); UI.renderHome(); });
      }
      wrap.appendChild(b);
    });
    box.appendChild(wrap);
    $('houseOverlay').classList.remove('hidden');
  };

  /* ---------------- 日记 ---------------- */
  UI.renderJournal = function (tab) {
    const list = $('journalList');
    list.innerHTML = '';
    const st = state();
    if (tab === 'log') {
      (st.log || []).forEach(item => {
        const el = document.createElement('div');
        el.className = 'journal-item';
        el.innerHTML = '<div class="time">' + fmtTime(item.t) + '</div><div class="raw">' + item.text + '</div>';
        list.appendChild(el);
      });
      if (!st.log || !st.log.length) list.innerHTML = '<p class="screen-sub">日记还是空的，多陪陪它，这里会慢慢被温暖填满。</p>';
    } else {
      Game.ACHIEVEMENTS.forEach(a => {
        const got = st.achievements.indexOf(a.id) >= 0;
        const el = document.createElement('div');
        el.className = 'achieve-item' + (got ? '' : ' locked');
        el.innerHTML = '<span class="a-icon">' + (got ? a.icon : '🔒') + '</span><div><div class="a-name">' + a.name + '</div><div class="a-desc">' + a.desc + '</div></div>';
        list.appendChild(el);
      });
    }
    document.querySelectorAll('.journal-tabs .shop-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  };

  /* ---------------- 设置 ---------------- */
  UI.renderSettings = function () {
    const st = state();
    $('btnSound').textContent = st.sound ? '开' : '关';
    const bgmBtn = $('btnBgm');
    if (bgmBtn) bgmBtn.textContent = (st.bgm !== false) ? '开' : '关';
    document.querySelectorAll('[data-warp]').forEach(b => {
      b.classList.toggle('active', String(st.timeWarp) === b.dataset.warp);
    });
  };

  /* ---------------- Toast / Confirm ---------------- */
  let toastTimer = null;
  UI.toast = function (msg, dur) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.remove('hidden'); t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.classList.add('hidden'); t.classList.remove('show'); }, dur || 2200);
  };

  UI.confirm = function (title, text, okLabel, onOk, cancelLabel) {
    $('confirmTitle').textContent = title;
    $('confirmText').textContent = text;
    const okBtn = $('confirmOk');
    const cancelBtn = $('confirmCancel');
    okBtn.textContent = okLabel || '好的';
    cancelBtn.textContent = cancelLabel || '取消';
    $('confirmOverlay').classList.remove('hidden');
    const done = (res) => {
      $('confirmOverlay').classList.add('hidden');
      okBtn.onclick = null; cancelBtn.onclick = null;
      if (res && onOk) onOk();
    };
    okBtn.onclick = () => done(true);
    cancelBtn.onclick = () => done(false);
  };

  /* ---------------- 初始化与事件 ---------------- */
  UI.init = function () {
    Game.load();
    const boot = function () {
    // 启动
    $('btnStart').addEventListener('click', () => {
      SFX.init();
      BGM.start();
      let st = null;
      try { st = JSON.parse(localStorage.getItem(Game.SAVE_KEY) || 'null'); } catch (e) {}
      if (st && st.pets && st.pets.length) { UI.toast('欢迎回来，小伙伴们在等你～'); UI.go('home'); return; }
      adoptMode = 'first';
      UI.go('type');
    });
    $('btnContinue').addEventListener('click', () => {
      SFX.init();
      BGM.start();
      let st = null;
      try { st = JSON.parse(localStorage.getItem(Game.SAVE_KEY) || 'null'); } catch (e) {}
      if (st && st.pets && st.pets.length) { UI.go('home'); return; }
      UI.toast('还没有存档，先领养第一只小伙伴吧！');
      adoptMode = 'first';
      UI.go('type');
    });
    $('btnRandomName').addEventListener('click', () => { $('petNameInput').value = Game.randomName(); SFX.play('click'); });
    $('btnAdopt').addEventListener('click', () => {
      SFX.init();
      const name = ($('petNameInput').value || '').trim() || Game.randomName();
      if (adoptMode === 'second') {
        const r = Game.adoptNew(UI.selType, UI.selColor, UI.selPattern, name);
        if (!r.ok) { SFX.play('error'); UI.toast(r.msg); return; }
      } else {
        Game.adopt(UI.selType, UI.selColor, UI.selPattern, name);
      }
      SFX.play('adopt');
      UI.go('home');
    });

    // 返回键
    document.querySelectorAll('.screen-head .btn-icon').forEach(b => {
      const nav = b.dataset.nav;
      b.addEventListener('click', () => {
        if (nav === 'type' && adoptMode === 'second') { UI.go('pets'); return; }
        UI.go(nav);
      });
    });

    // 底部导航
    document.querySelectorAll('.nav-btn').forEach(b => {
      b.addEventListener('click', () => UI.go(b.dataset.nav));
    });

    // 互动
    document.querySelectorAll('[data-action]').forEach(b => {
      b.addEventListener('click', () => doAction(b.dataset.action));
    });

    // 商店 tab
    document.querySelectorAll('.shop-tab').forEach(b => {
      b.addEventListener('click', () => {
        if (b.closest('#screen-shop')) UI.renderShop(b.dataset.tab);
        if (b.closest('#screen-journal')) UI.renderJournal(b.dataset.tab);
      });
    });

    // 设置
    $('btnSound').addEventListener('click', () => {
      const st = JSON.parse(localStorage.getItem(Game.SAVE_KEY));
      st.sound = !st.sound;
      localStorage.setItem(Game.SAVE_KEY, JSON.stringify(st));
      SFX.muted = !st.sound;
      UI.renderSettings();
      if (st.sound) { BGM.start(); } else { BGM.stop(); }
    });
    $('btnBgm').addEventListener('click', () => BGM.toggle());
    document.querySelectorAll('[data-warp]').forEach(b => {
      b.addEventListener('click', () => {
        const st = JSON.parse(localStorage.getItem(Game.SAVE_KEY));
        st.timeWarp = parseInt(b.dataset.warp, 10);
        localStorage.setItem(Game.SAVE_KEY, JSON.stringify(st));
        UI.toast('演示加速：' + (st.timeWarp === 1 ? '真实时间' : st.timeWarp + ' 倍') + '（离线也会结算）');
        UI.renderSettings();
      });
    });
    $('btnAbout').addEventListener('click', () => {
      UI.confirm('云端小窝 CloudNest', '一款治愈系像素云养宠 Demo。\n本机存档：localStorage\n\n玩小游戏赚金币 → 买食物玩具 → 陪伴长大 → 领养新伙伴。记得每天回来看看它，别让它等太久。', '好的', () => {});
    });
    $('btnReset').addEventListener('click', () => {
      UI.confirm('重新领养？', '所有宠物、金币、日记和装修都会清零，回到首次领养界面。此操作无法恢复，确定吗？', '清零重来', () => {
        Game.reset();
        SFX.play('click');
        location.reload();
      });
    });        // 重新领养（清零进度）
    const readoptBtn = btnReAdopt;
    if (readoptBtn) {
      readoptBtn.addEventListener('click', () => {
        UI.confirm('重新领养？', '所有宠物、金币、日记和装修都会清零，回到首次领养界面。此操作无法恢复，确定吗？', '清零重来', () => {
          Game.reset();
          SFX.play('click');
          location.reload();
        });
      });
    }

    // 喂药
    $('btnMedicate').addEventListener('click', () => {
      SFX.init();
      const p = Game.activePet();
      if (!p) return;
      const r = Game.medicate(p.id);
      if (r.ok) {
        SFX.play('levelup');
        UI.sayBubble({ raw: '咕噜咕噜～', trans: '吃了药，感觉好多了！谢谢你。' });
        UI.toast('喂了' + r.med.label + '，' + p.name + ' 好多了！');
        UI.renderHome();
      } else {
        SFX.play('error');
        if (r.goto) UI.confirm('没有药啦', r.msg, '去小卖部', () => UI.go('shop'), '知道了');
        else UI.toast(r.msg);
      }
    });
    $('wardrobeClose').addEventListener('click', () => $('wardrobeOverlay').classList.add('hidden'));
    $('houseClose').addEventListener('click', () => $('houseOverlay').classList.add('hidden'));

    // 全局点击音效初始化
    document.addEventListener('pointerdown', () => SFX.init(), { once: true });

    // 应用主题
    const st = JSON.parse(localStorage.getItem(Game.SAVE_KEY) || 'null');
    if (st && st.theme) document.querySelector('.app').setAttribute('data-theme', st.theme);
    SFX.muted = !(st && st.sound);

    // 首屏
    if (st && st.pets && st.pets.length) {
      const events = Game.simulate(Date.now());
    Game.save();
      UI.go('splash');
      UI.renderSplash();
      events.forEach(ev => {
        if (ev.type === 'died') {
          const dp = Game.activePet();
          UI.confirm('『' + (dp ? dp.name : '伙伴') + '』去了星星上', '它说：谢谢你，给了我一段被爱着的时光。可以用「回忆之光」把它召回。', '回忆之光召回', () => {
            const r = Game.revive(ev.petId);
            if (r.ok) UI.toast('✨ 它回来啦！');
            UI.renderHome(); UI.renderPets();
          }, '让它留在回忆里');
        }
        if (ev.type === 'sick') UI.toast('有小伙伴生病了…快去照顾它吧');
        if (ev.type === 'daily') UI.toast('每日暖心留言 +20 金币 💛');
      });
      startHomeLoop();
    } else {
      Game.save();
      UI.go('splash');
      UI.renderSplash();
      startHomeLoop();
    }
    };
    if (SPRITES.preloadAssets) SPRITES.preloadAssets(boot); else boot();
  };

  global.UI = UI;
})(window);
