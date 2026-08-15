/* =====================================================================
   云端小窝 · 小游戏模块：零食雨 / 泡泡乐 / 钓鱼大师 / 记忆翻翻乐
   ===================================================================== */
(function (global) {
  'use strict';
  const $ = id => document.getElementById(id);
  const MiniGames = {};

  function showOverlay() { $('gameOverlay').classList.remove('hidden'); }
  function hideOverlay() { $('gameOverlay').classList.add('hidden'); }

  /* ---------------- 像素绘制工具 ---------------- */
  function drawSky(ctx, W, H, waterY) {
    waterY = waterY || H - 44;
    const bands = ['#8fd0ef', '#9cd7f2', '#a9def5', '#b6e5f7', '#c3ebf9'];
    bands.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(0, i * 12, W, 12); });
    // 完全覆盖中间区域，避免拖尾
    ctx.fillStyle = bands[bands.length - 1];
    ctx.fillRect(0, bands.length * 12, W, waterY - bands.length * 12);
    ctx.fillStyle = '#7cc27a';
    ctx.fillRect(0, waterY, W, H - waterY);
    ctx.fillStyle = '#66ae64';
    ctx.fillRect(0, waterY, W, 6);
  }
  function drawPixelCircle(ctx, cx, cy, r, color) {
    ctx.fillStyle = color;
    for (let y = -r; y <= r; y++) {
      for (let x = -r; x <= r; x++) {
        if (x * x + y * y <= r * r) ctx.fillRect(cx + x, cy + y, 1, 1);
      }
    }
  }
  function drawBowl(ctx, x, y, w) {
    ctx.fillStyle = '#8a6a4a';
    ctx.fillRect(x - 4, y - 6, w + 8, 6);
    ctx.fillRect(x + 2, y - 2, w - 4, 8);
    ctx.fillStyle = '#6a4f33';
    ctx.fillRect(x + 2, y + 4, w - 4, 3);
    ctx.fillStyle = '#f7d9a8';
    ctx.fillRect(x + 6, y - 3, w - 12, 3);
  }
  function drawPoop(ctx, x, y) {
    ctx.fillStyle = '#7a5230';
    for (let i = 0; i < 3; i++) ctx.fillRect(x + i * 4, y + 3, 4, 4);
    ctx.fillRect(x + 3, y, 5, 5);
    ctx.fillStyle = '#9a6b42';
    ctx.fillRect(x + 4, y + 1, 3, 3);
  }

  /* ---------------- 零食雨 ---------------- */
  const RAIN_ITEMS = [
    { type: 'fish',   val: 2, icon: 'fish' },
    { type: 'berry',  val: 1, icon: 'berry' },
    { type: 'carrot', val: 1, icon: 'carrot' },
    { type: 'apple',  val: 2, icon: 'apple' },
    { type: 'cake',   val: 4, icon: 'cake' },
    { type: 'bad',    val: 0, icon: 'bad' }
  ];

  function startRain(canvas, ctx, hud, onDone) {
    const W = canvas.width, H = canvas.height;
    const items = [];
    let score = 0, misses = 0, running = true, lastSpawn = 0, startT = performance.now();
    const bowl = { x: W / 2 - 32, w: 64 };
    hud.innerHTML = '<span>得分 0</span><span>时间 40</span><span>漏接 0/5</span>';

    function move(e) {
      const r = canvas.getBoundingClientRect();
      bowl.x = (e.clientX - r.left) * (W / r.width) - bowl.w / 2;
    }
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerdown', move);
    function key(e) {
      if (e.key === 'ArrowLeft') bowl.x -= 30;
      if (e.key === 'ArrowRight') bowl.x += 30;
    }
    document.addEventListener('keydown', key);

    function frame(now) {
      if (!running) return;
      const t = (now - startT) / 1000;
      const remain = Math.max(0, 40 - t);

      if (now - lastSpawn > 480) {
        lastSpawn = now;
        const roll = Math.random();
        const it = roll < 0.62 ? RAIN_ITEMS[Math.floor(Math.random() * 4)]
                  : roll < 0.78 ? RAIN_ITEMS[4] : RAIN_ITEMS[5];
        items.push({ ...it, x: 12 + Math.random() * (W - 44), y: -12, py: -12, vy: 1.6 + Math.random() * 1.4 });
      }
      for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i];
        it.py = it.y;
        it.y += it.vy;
        const catchY = H - 46;
        const itemH = 36, itemW = 40;
        const bPrev = it.py + itemH;
        const bNow = it.y + itemH;
        const over = it.x + itemW > bowl.x - 4 && it.x < bowl.x + bowl.w + 4;
        if (over && ((bPrev < catchY && bNow >= catchY) || (bNow >= catchY && bNow <= catchY + 30))) {
          if (it.type === 'bad') { misses++; SFX.play('error'); }
          else { score += it.val; SFX.play('coin'); }
          items.splice(i, 1);
        } else if (bNow > catchY + 34) {
          if (it.type !== 'bad') misses++;
          items.splice(i, 1);
        }
      }
      if (misses >= 5 || remain <= 0) { running = false; end(); return; }

      drawSky(ctx, W, H);
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      ctx.font = 'bold 13px "Microsoft YaHei"';
      ctx.fillText('移动接住零食，别接坏东西！', 16, 24);
      items.forEach(it => {
        if (it.icon === 'bad') drawPoop(ctx, it.x, it.y);
        else SPRITES.drawIcon(ctx, it.icon, it.x, it.y, 5);
      });
      drawBowl(ctx, bowl.x, H - 40, bowl.w);
      hud.innerHTML = '<span>得分 ' + score + '</span><span>时间 ' + Math.ceil(remain) + '</span><span>漏接 ' + misses + '/5</span>';
      requestAnimationFrame(frame);
    }
    function end() {
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerdown', move);
      document.removeEventListener('keydown', key);
      hideOverlay();
      onDone(score);
    }
    requestAnimationFrame(frame);
  }

  /* ---------------- 泡泡乐 ---------------- */
  function startBubble(canvas, ctx, hud, onDone) {
    const W = canvas.width, H = canvas.height;
    const bubbles = [];
    let score = 0, running = true, lastSpawn = 0, startT = performance.now();
    hud.innerHTML = '<span>得分 0</span><span>时间 30</span>';

    function popAt(e) {
      const r = canvas.getBoundingClientRect();
      const px = (e.clientX - r.left) * (W / r.width);
      const py = (e.clientY - r.top) * (H / r.height);
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        const dx = px - b.x, dy = py - b.y;
        if (dx * dx + dy * dy <= (b.r + 8) * (b.r + 8)) {
          if (b.type === 'dark') { score = Math.max(0, score - 1); SFX.play('error'); }
          else { score += b.val; SFX.play('coin'); }
          bubbles.splice(i, 1);
          return;
        }
      }
    }
    canvas.addEventListener('pointerdown', popAt);

    function frame(now) {
      if (!running) return;
      const t = (now - startT) / 1000;
      const remain = Math.max(0, 30 - t);
      if (now - lastSpawn > 420) {
        lastSpawn = now;
        const roll = Math.random();
        const type = roll < 0.55 ? 'gold' : roll < 0.8 ? 'heart' : 'dark';
        const val = type === 'gold' ? 3 : type === 'heart' ? 2 : 1;
        bubbles.push({ type, val, x: 18 + Math.random() * (W - 36), y: H + 10, r: 9 + Math.random() * 7, vy: 1 + Math.random() * 1.2 });
      }
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        b.y -= b.vy;
        if (b.y < -20) bubbles.splice(i, 1);
      }
      if (remain <= 0) { running = false; end(); return; }

      drawSky(ctx, W, H);
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      ctx.font = 'bold 13px "Microsoft YaHei"';
      ctx.fillText('点泡泡：金色金币 · 爱心 +2 · 黑色 -1', 14, 24);
      bubbles.forEach(b => {
        if (b.type === 'gold') drawPixelCircle(ctx, b.x, b.y, b.r, 'rgba(255,212,94,.9)');
        else if (b.type === 'heart') { SPRITES.drawIcon(ctx, 'heart', b.x - 8, b.y - 8, 4); return; }
        else drawPixelCircle(ctx, b.x, b.y, b.r, 'rgba(70,64,80,.85)');
        drawPixelCircle(ctx, b.x - b.r / 2, b.y - b.r / 2, 3, 'rgba(255,255,255,.55)');
      });
      hud.innerHTML = '<span>得分 ' + score + '</span><span>时间 ' + Math.ceil(remain) + '</span>';
      requestAnimationFrame(frame);
    }
    function end() {
      canvas.removeEventListener('pointerdown', popAt);
      hideOverlay();
      onDone(score);
    }
    requestAnimationFrame(frame);
  }

  /* ---------------- 钓鱼大师 ---------------- */
  const FISH_TIERS = [
    { label: '普通鱼', value: 5,  clicks: 3, window: 1800, speed: 1.6, scale: 7,  icon: 'fish',     weight: 0.62 },
    { label: '大鱼',   value: 10, clicks: 5, window: 1600, speed: 2.2, scale: 9,  icon: 'fish',     weight: 0.28 },
    { label: '鱼王',   value: 20, clicks: 8, window: 1400, speed: 2.8, scale: 11, icon: 'goldfish', weight: 0.10 }
  ];
  function startFishing(canvas, ctx, hud, onDone) {
    const W = canvas.width, H = canvas.height;
    const waterY = 170;
    const bobber = { x: W / 2, y: 300 };
    let score = 0, running = true, startT = performance.now();
    const fishes = [];
    let bites = 0, nextFishAt = 0, biting = null;
    hud.innerHTML = '<span>得分 0</span><span>时间 45</span><span>钓起 0</span>';

    function spawnFish(now) {
      let roll = Math.random();
      let tier = FISH_TIERS[0];
      for (const t of FISH_TIERS) {
        if (roll < t.weight) { tier = t; break; }
        roll -= t.weight;
      }
      fishes.push({
        tier,
        dir: Math.random() < 0.5 ? 1 : -1,
        x: Math.random() < 0.5 ? 20 : W - 20,
        y: 215 + Math.random() * 115,
        state: 'swim',
        clicks: 0,
        biteStart: 0
      });
      nextFishAt = now + 500 + Math.random() * 900;
    }
    function catchBite() {
      if (!running || !biting || biting.state !== 'bite') return;
      biting.clicks++;
      SFX.play('click');
      if (biting.clicks >= biting.tier.clicks) {
        const t = biting.tier;
        biting.state = 'caught';
        score += t.value;
        bites++;
        SFX.play('coin');
        biting = null;
      }
    }
    canvas.addEventListener('pointerdown', catchBite);
    function key(e) {
      if (e.key === ' ' || e.key === 'Enter') catchBite(e);
    }
    document.addEventListener('keydown', key);

    function frame(now) {
      if (!running) return;
      const t = (now - startT) / 1000;
      const remain = Math.max(0, 45 - t);
      if (fishes.length < 4 && now >= nextFishAt) spawnFish(now);

      for (let i = fishes.length - 1; i >= 0; i--) {
        const f = fishes[i];
        if (f.state === 'swim') {
          f.x += f.dir * f.tier.speed;
          if (!biting && Math.abs(f.x - bobber.x) < 26 && Math.abs(f.y - bobber.y) < 40) {
            f.state = 'bite';
            f.biteStart = now;
            f.clicks = 0;
            biting = f;
            SFX.play('sick');
          } else if (f.x < 4 || f.x > W - 4) {
            fishes.splice(i, 1);
          }
        } else if (f.state === 'bite') {
          if (now - f.biteStart > f.tier.window) {
            fishes.splice(i, 1);
            if (biting === f) biting = null;
          }
        } else if (f.state === 'caught') {
          f.y -= 4;
          f.x += (bobber.x - f.x) * 0.06;
          if (f.y < 40) fishes.splice(i, 1);
        }
      }
      if (remain <= 0) { running = false; end(); return; }

      drawSky(ctx, W, H, waterY);
      const water = ['#5aa7d8', '#4a97c8', '#3f87b5', '#3577a5'];
      water.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(0, waterY + i * 14, W, 14); });
      ctx.fillStyle = '#2f6a95';
      ctx.fillRect(0, waterY + 56, W, H - waterY - 56);
      ctx.fillStyle = '#ffd77a';
      for (let i = 0; i < 3; i++) ctx.fillRect(296 - i * 2, 34 - i * 2, 24 + i * 4, 24 + i * 4);
      ctx.fillStyle = '#ffe9a8'; ctx.fillRect(296, 34, 18, 18);
      ctx.fillStyle = 'rgba(255,255,255,.9)';
      ctx.fillRect(30, 52, 40, 10); ctx.fillRect(42, 44, 20, 14);
      ctx.fillRect(150, 30, 30, 8); ctx.fillRect(160, 26, 16, 10);
      ctx.fillStyle = '#8a5a3a';
      ctx.fillRect(66, 40, 5, 130);
      ctx.fillRect(56, 150, 25, 5);
      ctx.fillStyle = '#4a4a55';
      ctx.fillRect(70, 170, 1, bobber.y - 170);
      ctx.fillStyle = '#e84f4f'; ctx.fillRect(bobber.x - 3, bobber.y - 5, 6, 5);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(bobber.x - 3, bobber.y, 6, 5);
      ctx.fillStyle = '#c22'; ctx.fillRect(bobber.x - 1, bobber.y - 3, 2, 6);

      fishes.forEach(f => {
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.scale(f.dir, 1);
        SPRITES.drawIcon(ctx, f.tier.icon, -f.tier.scale * 2.5, -f.tier.scale * 2, f.tier.scale);
        ctx.restore();
      });
      if (biting && biting.state === 'bite') {
        ctx.fillStyle = '#ff6a4a';
        ctx.font = 'bold 15px "Microsoft YaHei"';
        ctx.fillText('连点收竿 ' + biting.clicks + '/' + biting.tier.clicks + ' ！', bobber.x - 55, bobber.y - 16);
      }
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      ctx.font = 'bold 13px "Microsoft YaHei"';
      ctx.fillText('鱼咬钩后连点鼠标收竿，鱼越稀有越难钓！', 16, 26);
      hud.innerHTML = '<span>得分 ' + score + '</span><span>时间 ' + Math.ceil(remain) + '</span><span>钓起 ' + bites + '</span>';
      requestAnimationFrame(frame);
    }
    function end() {
      canvas.removeEventListener('pointerdown', catchBite);
      document.removeEventListener('keydown', key);
      hideOverlay();
      onDone(score);
    }
    spawnFish(0);
    spawnFish(0);
    requestAnimationFrame(frame);
  }

  /* ---------------- 记忆翻翻乐 ---------------- */
  const MEM_ICONS = ['fish', 'berry', 'cake', 'coin', 'heart', 'ball'];
  function startMemory(canvas, ctx, hud, onDone) {
    const W = canvas.width, H = canvas.height;
    const cols = 4, rows = 3;
    const cw = 72, ch = 72, gap = 10;
    const ox = (W - (cols * cw + (cols - 1) * gap)) / 2;
    const oy = 120;
    let deck = [];
    MEM_ICONS.forEach(icon => { deck.push({ icon, matched: false }); deck.push({ icon, matched: false }); });
    // 洗牌
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = deck[i]; deck[i] = deck[j]; deck[j] = tmp;
    }
    deck.forEach((c, i) => { c.idx = i; c.flipped = false; });
    let score = 0, moves = 0, first = null, lock = false, running = true, matchedCount = 0;
    hud.innerHTML = '<span>得分 0</span><span>步数 0</span><span>配对 0/6</span>';

    function hit(e) {
      if (lock || !running) return;
      const r = canvas.getBoundingClientRect();
      const px = (e.clientX - r.left) * (W / r.width);
      const py = (e.clientY - r.top) * (H / r.height);
      const col = Math.floor((px - ox) / (cw + gap));
      const row = Math.floor((py - oy) / (ch + gap));
      if (col < 0 || col >= cols || row < 0 || row >= rows) return;
      const card = deck[row * cols + col];
      if (!card || card.matched || card.flipped) return;
      card.flipped = true;
      SFX.play('click');
      if (!first) { first = card; }
      else {
        moves++;
        lock = true;
        const a = first, b = card;
        first = null;
        setTimeout(() => {
          if (a.icon === b.icon) {
            a.matched = b.matched = true;
            matchedCount++;
            score += 2;
            SFX.play('coin');
            if (matchedCount === 6) {
              score += 4;
              running = false;
              end();
              return;
            }
          } else {
            SFX.play('error');
            a.flipped = b.flipped = false;
          }
          lock = false;
        }, 650);
      }
    }
    canvas.addEventListener('pointerdown', hit);

    function frame() {
      if (!running) { drawMemory(); return; }
      drawMemory();
      hud.innerHTML = '<span>得分 ' + score + '</span><span>步数 ' + moves + '</span><span>配对 ' + matchedCount + '/6</span>';
      requestAnimationFrame(frame);
    }
    function drawMemory() {
      drawSky(ctx, W, H);
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      ctx.font = 'bold 13px "Microsoft YaHei"';
      ctx.fillText('翻开两张相同的小图标吧！', 16, 26);
      ctx.fillStyle = 'rgba(255,255,255,.55)';
      ctx.fillRect(14, 44, W - 28, 56);
      ctx.fillStyle = '#4a4a55';
      ctx.font = 'bold 11px "Microsoft YaHei"';
      ctx.fillText('翻牌提示：别急着点，先记住位置~', 20, 68);
      ctx.fillStyle = '#fff';
      ctx.fillRect(ox - 6, oy - 6, cols * cw + (cols - 1) * gap + 12, rows * ch + (rows - 1) * gap + 12);
      deck.forEach((card, i) => {
        const col = i % cols, row = Math.floor(i / cols);
        const x = ox + col * (cw + gap), y = oy + row * (ch + gap);
        if (card.matched) return;
        ctx.fillStyle = '#3f7fb0';
        ctx.fillRect(x, y, cw, ch);
        ctx.fillStyle = '#5aa0d0';
        ctx.fillRect(x + 4, y + 4, cw - 8, ch - 8);
        if (card.flipped) {
          ctx.fillStyle = '#fff8e8';
          ctx.fillRect(x + 6, y + 6, cw - 12, ch - 12);
          SPRITES.drawIcon(ctx, card.icon, x + (cw - 48) / 2, y + (ch - 48) / 2, 8);
        } else {
          ctx.fillStyle = '#3f7fb0';
          for (let py2 = y + 12; py2 < y + ch - 8; py2 += 14) {
            for (let px2 = x + 12; px2 < x + cw - 8; px2 += 14) {
              if (((px2 - x) + (py2 - y)) % 28 === 0) ctx.fillRect(px2, py2, 4, 4);
            }
          }
          ctx.fillStyle = '#fff';
          ctx.fillRect(x + cw / 2 - 8, y + ch / 2 - 8, 16, 16);
          ctx.fillStyle = '#3f7fb0';
          ctx.beginPath(); ctx.arc(x + cw / 2, y + ch / 2, 5, 0, Math.PI * 2); ctx.fill();
        }
      });
    }
    function end() {
      canvas.removeEventListener('pointerdown', hit);
      hideOverlay();
      onDone(score);
    }
    requestAnimationFrame(frame);
  }


  /* ---------------- 算术速算 ---------------- */
  function startMath(canvas, ctx, hud, onDone) {
    const W = canvas.width, H = canvas.height;
    let score = 0, qIndex = 0, running = true, startT = performance.now();
    let q = null;
    function makeQ() {
      const type = Math.floor(Math.random() * 3);
      let a, b, ans, op;
      if (type === 0) { a = 10 + Math.floor(Math.random() * 80); b = 10 + Math.floor(Math.random() * 80); op = '+'; ans = a + b; }
      else if (type === 1) { a = 30 + Math.floor(Math.random() * 70); b = 5 + Math.floor(Math.random() * 25); op = '-'; ans = a - b; }
      else { a = 2 + Math.floor(Math.random() * 8); b = 2 + Math.floor(Math.random() * 8); op = '×'; ans = a * b; }
      const opts = [ans];
      let guard = 0;
      while (opts.length < 4 && guard++ < 40) {
        const d = 1 + Math.floor(Math.random() * 9);
        const cand = Math.max(0, ans + (Math.random() < 0.5 ? -d : d));
        if (opts.indexOf(cand) < 0) opts.push(cand);
      }
      for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = opts[i]; opts[i] = opts[j]; opts[j] = t; }
      q = { text: a + ' ' + op + ' ' + b + ' = ?', ans: ans, opts: opts };
    }
    function renderHud() {
      hud.innerHTML = '';
      hud.style.display = 'flex';
      hud.style.flexWrap = 'wrap';
      hud.style.gap = '8px';
      hud.style.justifyContent = 'center';
      q.opts.forEach(v => {
        const b = document.createElement('button');
        b.className = 'btn btn-small';
        b.textContent = v;
        b.addEventListener('click', () => {
          SFX.init();
          if (!running) return;
          if (v === q.ans) { score += 3; SFX.play('coin'); }
          else { score = Math.max(0, score - 1); SFX.play('error'); }
          qIndex++;
          if (qIndex < 12) { makeQ(); renderHud(); }
          else { running = false; end(); }
        });
        hud.appendChild(b);
      });
    }
    function frame(now) {
      if (!running) return;
      const t = (now - startT) / 1000;
      const remain = Math.max(0, 45 - t);
      if (remain <= 0 || qIndex >= 12) { running = false; end(); return; }
      drawSky(ctx, W, H);
      ctx.fillStyle = 'rgba(255,255,255,.9)';
      ctx.font = 'bold 14px "Microsoft YaHei"';
      ctx.fillText('第 ' + (qIndex + 1) + ' / 12 题  ·  残余 ' + Math.ceil(remain) + 's', 16, 28);
      ctx.fillStyle = 'rgba(255,255,255,.55)';
      ctx.fillRect(14, 130, W - 28, 120);
      ctx.fillStyle = '#3b3a36';
      ctx.font = 'bold 40px "Microsoft YaHei"';
      ctx.fillText(q.text, 28, 205);
      ctx.fillStyle = 'rgba(255,255,255,.95)';
      ctx.font = 'bold 14px "Microsoft YaHei"';
      ctx.fillText('答对 +3 ，答错 -1，加油！', 16, 268);
      requestAnimationFrame(frame);
    }
    function end() {
      hud.innerHTML = '';
      hideOverlay();
      onDone(score);
    }
    makeQ();
    renderHud();
    requestAnimationFrame(frame);
  }

  /* ---------------- 猜字谜 ---------------- */
  const RIDDLES = [
    { q: '一口咬掉牛尾巴', a: '告', o: ['牛', '口', '名'] },
    { q: '山上还有山', a: '出', o: ['山', '凹', '凸'] },
    { q: '十张口，一颗心', a: '思', o: ['想', '念', '田'] },
    { q: '一加一', a: '王', o: ['二', '三', '丰'] },
    { q: '人有他则变大', a: '一', o: ['人', '大', '天'] },
    { q: '丢了一撇', a: '找', o: ['我', '持', '技'] },
    { q: '一只黑狗，不叫不吼', a: '默', o: ['狗', '黑', '吠'] },
    { q: '千字头，木字腰，太阳出来从下照', a: '香', o: ['季', '禾', '秋'] }
  ];
  function wrapText(ctx, text, maxW) {
    const lines = [];
    let cur = '';
    for (const ch of text) {
      if (ctx.measureText(cur + ch).width > maxW && cur) { lines.push(cur); cur = ch; }
      else cur += ch;
    }
    if (cur) lines.push(cur);
    return lines;
  }
  function startRiddle(canvas, ctx, hud, onDone) {
    const W = canvas.width, H = canvas.height;
    let idx = 0, score = 0, running = true, locked = false, feedback = null;
    let q = null;
    function renderHud() {
      hud.innerHTML = '';
      hud.style.display = 'flex';
      hud.style.flexWrap = 'wrap';
      hud.style.gap = '8px';
      hud.style.justifyContent = 'center';
      q.opts.forEach(v => {
        const b = document.createElement('button');
        b.className = 'btn btn-small';
        b.textContent = v;
        b.addEventListener('click', () => {
          SFX.init();
          if (!running || locked) return;
          const ok = v === q.a;
          if (ok) { score += 4; SFX.play('coin'); }
          else { SFX.play('error'); }
          locked = true;
          feedback = { ok: ok, until: Date.now() + 700 };
          setTimeout(() => {
            locked = false;
            feedback = null;
            idx++;
            if (idx < RIDDLES.length) { nextQ(); }
            else {
              running = false;
              if (score === RIDDLES.length * 4) score += 4;
              end();
            }
          }, 700);
        });
        hud.appendChild(b);
      });
    }
    function nextQ() {
      q = RIDDLES[idx];
      const opts = [q.a].concat(q.o);
      for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = opts[i]; opts[i] = opts[j]; opts[j] = t; }
      q.opts = opts;
      renderHud();
    }
    function frame() {
      if (!running) return;
      drawSky(ctx, W, H);
      ctx.fillStyle = 'rgba(255,255,255,.9)';
      ctx.font = 'bold 14px "Microsoft YaHei"';
      ctx.fillText('猜字谜 · 第 ' + (idx + 1) + ' / ' + RIDDLES.length + ' 题 · 得分 ' + score, 16, 28);
      ctx.fillStyle = 'rgba(255,255,255,.55)';
      ctx.fillRect(14, 130, W - 28, 130);
      ctx.fillStyle = '#3b3a36';
      ctx.font = 'bold 24px "Microsoft YaHei"';
      const lines = wrapText(ctx, '谜面：' + q.q, W - 60);
      lines.forEach((line, i) => ctx.fillText(line, 30, 185 + i * 34));
      ctx.fillStyle = 'rgba(255,255,255,.95)';
      ctx.font = 'bold 14px "Microsoft YaHei"';
      ctx.fillText('答对 +4，全对额外 +4！', 16, 282);
      if (feedback && Date.now() < feedback.until) {
        ctx.font = 'bold 64px "Microsoft YaHei"';
        ctx.textAlign = 'center';
        ctx.fillStyle = feedback.ok ? '#2ea44f' : '#e5484d';
        ctx.fillText(feedback.ok ? '✅' : '❌', W / 2, 268);
        ctx.textAlign = 'left';
      }
      requestAnimationFrame(frame);
    }
    function end() {
      hud.innerHTML = '';
      hideOverlay();
      onDone(score);
    }
    nextQ();
    requestAnimationFrame(frame);
  }

  MiniGames.launch = function (id, onDone) {
    showOverlay();
    const canvas = $('miniCanvas');
    const ctx = canvas.getContext('2d');
    const hud = $('miniHud');
    if (id === 'rain') startRain(canvas, ctx, hud, onDone);
    else if (id === 'bubble') startBubble(canvas, ctx, hud, onDone);
    else if (id === 'fishing') startFishing(canvas, ctx, hud, onDone);
    else if (id === 'memory') startMemory(canvas, ctx, hud, onDone);
    else if (id === 'math') startMath(canvas, ctx, hud, onDone);
    else if (id === 'riddle') startRiddle(canvas, ctx, hud, onDone);
  };

  global.MiniGames = MiniGames;
})(window);
