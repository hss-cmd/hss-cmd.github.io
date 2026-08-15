/* =====================================================================
   云端小窝 CloudNest · 像素美术模块
   所有宠物均为代码绘制的像素画：支持 7 种动物 × 8 种基础色 × 5 种花色 × 3 个成长阶段
   ===================================================================== */
(function (global) {
  'use strict';

  const COLORS = {
    orange: { label: '橘橙', main: '#e89a4b', shadow: '#c4772c', light: '#f8c37e', pattern: '#fff6e8' },
    cream:  { label: '奶白', main: '#f0dfbc', shadow: '#d3b98b', light: '#fdf5e2', pattern: '#d9a05f' },
    brown:  { label: '巧克力', main: '#9a6b42', shadow: '#7a5030', light: '#ba8f63', pattern: '#e8d5b8' },
    black:  { label: '玄黑', main: '#45454d', shadow: '#2b2b31', light: '#63636d', pattern: '#9a9aa5' },
    gray:   { label: '银灰', main: '#a9afba', shadow: '#838a96', light: '#c9ced8', pattern: '#f2f3f6' },
    pink:   { label: '樱花粉', main: '#ffb3cd', shadow: '#e783a8', light: '#ffd9e6', pattern: '#ffffff' },
    blue:   { label: '天空蓝', main: '#8fc7e8', shadow: '#68a2c9', light: '#b9e0f5', pattern: '#ffffff' },
    mint:   { label: '薄荷绿', main: '#a5d8a3', shadow: '#78b577', light: '#c9ecc5', pattern: '#ffffff' }
  };

  const PALETTES = {
    cat:    { f: '#e89a4b', F: '#c4772c', l: '#f8c37e', w: '#fff6e8', p: '#f7a8c0', d: '#4a3322', e: '#2b1f15', E: '#ffffff', n: '#c96b5a', m: '#7a4a33' },
    dog:    { f: '#c9a06a', F: '#a57e47', l: '#e6c69a', w: '#fff6e8', p: '#f7a8c0', d: '#4a3322', e: '#2b1f15', E: '#ffffff', n: '#5a4433', m: '#7a4a33' },
    pig:    { f: '#f3a8b8', F: '#d9859a', l: '#ffd3de', w: '#ffeef2', p: '#f7839f', d: '#5a3340', e: '#2b1f26', E: '#ffffff', n: '#e56a88', m: '#c25a75' },
    rabbit: { f: '#d6c4aa', F: '#b5a084', l: '#f0e5d2', w: '#fffaf0', p: '#f2a9c3', d: '#4a3a2a', e: '#2b1f15', E: '#ffffff', n: '#e8a7b8', m: '#7a4a5a' },
    bird:   { f: '#7ec8c4', F: '#56a5a2', l: '#aee3df', w: '#fff8e8', p: '#f7a8c0', d: '#2f4a4a', e: '#1e2b2b', E: '#ffffff', b: '#f2a33c', B: '#ffd08a', m: '#c96b3a' },
    chick:  { f: '#f6d365', F: '#e0b14a', l: '#fce9a8', w: '#fff8e0', p: '#f7a8c0', d: '#6b5a1f', e: '#2b2410', E: '#ffffff', b: '#f2903a', B: '#ffbe73', m: '#c96b3a' },
    fish:   { f: '#7fb5e8', F: '#5a93c6', l: '#b6dcf8', w: '#fff8ea', p: '#f7a8c0', d: '#2f4a66', e: '#1e2b3d', E: '#ffffff', b: '#f2a33c', m: '#c96b3a' }
  };

  const MAPS = {
    cat: [
      ".....dddddd.....",
      "....df....fd....",
      "....df....fd....",
      ".....dddddd.....",
      ".....ffffff.....",
      "....ffppppff....",
      "...fffeeeeefff..",
      "...fffeEEeEeff..",
      "...ffffnnnnfff..",
      "...fffwnmmwfff..",
      "...fwwwwwwwwf...",
      "..ffwwfwwfwwff..",
      "..ffwwwwwwwwff..",
      "..fd........df..",
      "...d........d..."
    ],
    dog: [
      ".....dddddd.....",
      "...ddfffffddd...",
      "...dfffffffdd...",
      "...dfffffffdd...",
      "...ddfffffddd...",
      "....dfffffd.....",
      "....ffffffd.....",
      "...ffffeeeeff...",
      "...fffeEEeEef...",
      "...ffffnnnnff...",
      "...ffffnmmnff...",
      "...fwwwwwwwwf...",
      "..ffwwwwwwwwff..",
      "..ffdffffffdff..",
      "..fd........df..",
      "...d........d..."
    ],
    pig: [
      "..d..........d..",
      ".dfd........dfd.",
      ".dffd......dffd.",
      "..dfffffffffd...",
      "...ffffffffff...",
      "...ffppppppff...",
      "...ffpnnnnpff...",
      "...ffpnnnnpff...",
      "...ffppppppff...",
      "...fffeeeefff...",
      "...ffffffffff...",
      "...fwwwwwwwwf...",
      "..ffwwwwwwwwff..",
      "..fd........df..",
      "...d........d..."
    ],
    rabbit: [
      "..dd........dd..",
      "..dffd....dffd..",
      "..dfff....ffffd..",
      "..dffff..ffffd..",
      "..ddffffffdddd..",
      "....ffffff......",
      "...ffppppff.....",
      "..fffeeeefff....",
      "..fffeEEeEef....",
      "..ffffnnnnff....",
      "..ffffnnnnff....",
      "..ffwwwwwwff....",
      "..ffwwwwwwff....",
      "..ff........ff..",
      "..fd........df..",
      "...d........d..."
    ],
    bird: [
      "......dddd......",
      ".....dffffd.....",
      "....dffffffd....",
      "....dffffffd....",
      "...dffffeeffd...",
      "...dffeEEefd....",
      "...dffbbbbfd....",
      "...dffbBBbfd....",
      "...dffbmmbfd....",
      "...dffffffffd...",
      "....dffffffd....",
      "...dwwwwwwwwd...",
      "...dwddddddwd...",
      "..dwd......dwd..",
      "..dw........dw..",
      "................"
    ],
    chick: [
      "...dddddddd...",
      "..dffffffffd..",
      "..dffffffffd..",
      "..dfeEEeeffd..",
      "..dfeEEeeffd..",
      "..dffbbbbffd..",
      "..dffbBBbffd..",
      "..dffffffffd..",
      "..dfffffffd...",
      "...dfffffd....",
      "...dwfdwfd....",
      "...dd..dd....."
    ],
    fish: [
      ".................",
      "..dd....dd.......",
      ".dffd..dffdd.....",
      ".dffffffdfffd....",
      ".dffffeefffffd...",
      ".dfffeEEeffffd...",
      ".dffffeefffffd...",
      ".dffffffdfffd....",
      ".dffd..dffdd.....",
      "..dd....dd.......",
      "................."
    ]
  };

  // 幼年体取头部区域放大（坐标 x,y,w,h）
  const HEAD_BOX = {
    cat:    { x: 3, y: 0, w: 11, h: 9 },
    dog:    { x: 3, y: 0, w: 11, h: 9 },
    pig:    { x: 2, y: 0, w: 12, h: 8 },
    rabbit: { x: 3, y: 0, w: 11, h: 8 },
    bird:   { x: 4, y: 0, w: 9, h: 9 },
    chick:  { x: 2, y: 0, w: 10, h: 9 },
    fish:   { x: 2, y: 0, w: 9, h: 9 }
  };

  const PATTERNS = {
    solid:  { label: '纯色' },
    spots:  { label: '点点' },
    cow:    { label: '奶牛斑' },
    stripe: { label: '条纹' },
    two:    { label: '双色' }
  };

  const ANIMALS = {
    cat:    { label: '猫猫',  emoji: '🐱', desc: '傲娇又粘人' },
    dog:    { label: '狗狗',  emoji: '🐶', desc: '永远等你回家' },
    pig:    { label: '猪猪',  emoji: '🐷', desc: '爱吃爱睡觉' },
    rabbit: { label: '兔子',  emoji: '🐰', desc: '软软的治愈' },
    bird:   { label: '小鸟',  emoji: '🐦', desc: '清晨的歌声' },
    chick:  { label: '小鸡',  emoji: '🐤', desc: '圆滚滚的快乐' },
    fish:   { label: '小鱼',  emoji: '🐟', desc: '咕噜咕噜冒泡泡' }
  };

  /* ---------- 确定性伪随机（同一宠物花色永远一致） ---------- */
  function hash(n) {
    let h = (n * 2654435761) >>> 0;
    h = ((h ^ (h >>> 13)) * 2246822519) >>> 0;
    return (h ^ (h >>> 15)) >>> 0;
  }

  /* ---------- 构建像素地图与调色板 ---------- */
  function buildPet(pet) {
    const animal = pet.type;
    const baseMap = MAPS[animal] || MAPS.cat;
    const color = COLORS[pet.color] || COLORS.orange;
    const pattern = pet.pattern || 'solid';
    const stage = pet.stage || 0;

    let map = baseMap;
    if (stage === 0) {
      const box = HEAD_BOX[animal] || { x: 0, y: 0, w: baseMap[0].length, h: baseMap.length };
      map = baseMap.map(row => row.slice(box.x, box.x + box.w)).slice(box.y, box.y + box.h);
    }

    const pal = Object.assign({}, PALETTES[animal]);
    pal.f = color.main;
    pal.F = color.shadow;
    pal.l = color.light;
    pal.P = color.pattern;

    const seed = pet.seed || 7;
    const rows = map.length;
    const cols = Math.max(...map.map(r => r.length));

    const pixels = [];
    for (let y = 0; y < rows; y++) {
      const row = map[y] || '';
      for (let x = 0; x < cols; x++) {
        let ch = x < row.length ? row[x] : '.';
        if (ch === 'f' && pattern !== 'solid') {
          const h1 = hash(seed * 131 + x * 7 + y * 13);
          const h2 = hash(seed * 173 + x * 11 + y * 5);
          let overlay = false;
          if (pattern === 'spots') overlay = (h1 % 100) < 13;
          else if (pattern === 'cow') overlay = (h2 % 100) < 28;
          else if (pattern === 'stripe') overlay = ((x + y) % 4 === 0) && ((h1 % 3) === 0);
          else if (pattern === 'two') overlay = y > rows * 0.52;
          if (overlay) ch = 'P';
        }
        pixels.push(ch);
      }
    }
    return { map, cols, rows, pixels, pal, stage };
  }

  function cellSizeForStage(stage) {
    if (stage === 0) return 6;   // 幼年：头部特写 + 大像素，更萌
    if (stage === 1) return 4;   // 青年：全身小一点
    return 5;                    // 成年：标准比例
  }

  /* ---------- 浏览器绘制（AI 图优先，回退程序化像素画） ---------- */
  const assets = { pets: {}, rooms: {}, splash: {}, icons: {} };
  const tintCache = new Map();

  function setAsset(kind, key, img) { assets[kind][key] = img; tintCache.clear(); }
  function getAsset(kind, key) { return assets[kind][key] || null; }
  function hasAsset(kind, key) { return !!assets[kind][key]; }

  function hexToHsl(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || '#ffffff');
    if (!m) return { h: 0, s: 0, l: 0.5 };
    let r = parseInt(m[1].slice(0, 2), 16) / 255;
    let g = parseInt(m[1].slice(2, 4), 16) / 255;
    let b = parseInt(m[1].slice(4, 6), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0));
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
    }
    return { h, s, l };
  }
  function colorFilter(fromHex, toHex) {
    const a = hexToHsl(fromHex), b = hexToHsl(toHex);
    const hue = Math.round((b.h - a.h + 360) % 360);
    const sat = b.s === 0 ? 0.1 : Math.max(0.15, Math.min(2.4, b.s / Math.max(0.01, a.s)));
    const bri = Math.max(0.4, Math.min(1.8, 0.82 + (b.l - a.l) * 1.2));
    return 'hue-rotate(' + hue + 'deg) saturate(' + sat.toFixed(2) + ') brightness(' + bri.toFixed(2) + ')';
  }

  function assetKey(pet) {
    return pet.type + '-' + (pet.stage || 0) + '-' + (pet.color || 'orange');
  }
  const trimCache = new Map();
  function getTrim(img) {
    if (trimCache.has(img)) return trimCache.get(img);
    const cv = document.createElement('canvas');
    cv.width = img.width; cv.height = img.height;
    const c = cv.getContext('2d');
    c.drawImage(img, 0, 0);
    let d = null;
    try { d = c.getImageData(0, 0, cv.width, cv.height).data; } catch (e) { d = null; }
    const t = { x: 0, y: 0, w: cv.width, h: cv.height };
    if (d) {
      let minX = cv.width, minY = cv.height, maxX = 0, maxY = 0;
      for (let y = 0; y < cv.height; y++) {
        for (let x = 0; x < cv.width; x++) {
          if (d[(y * cv.width + x) * 4 + 3] > 8) {
            if (x < minX) minX = x; if (x > maxX) maxX = x;
            if (y < minY) minY = y; if (y > maxY) maxY = y;
          }
        }
      }
      if (maxX > minX && maxY > minY) { t.x = minX; t.y = minY; t.w = maxX - minX + 1; t.h = maxY - minY + 1; }
    }
    trimCache.set(img, t);
    return t;
  }

  function getTintedAsset(pet) {
    const img = getAsset('pets', assetKey(pet));
    if (!img) return null;
    const key = assetKey(pet) + '-' + (pet.pattern || 'solid') + '-' + (pet.seed || 7);
    if (tintCache.has(key)) return tintCache.get(key);
    const trim = getTrim(img);
    const cv = document.createElement('canvas');
    cv.width = trim.w; cv.height = trim.h;
    const c = cv.getContext('2d');
    c.imageSmoothingEnabled = false;
    c.drawImage(img, trim.x, trim.y, trim.w, trim.h, 0, 0, trim.w, trim.h);
    const pattern = pet.pattern || 'solid';
    if (pattern !== 'solid') {
      c.globalCompositeOperation = 'source-atop';
      const seed = pet.seed || 7;
      const step = Math.max(5, Math.round(cv.width / 16));
      const baseColor = COLORS[pet.color] || COLORS.orange;
      for (let y = 0; y < cv.height; y += step) {
        for (let x = 0; x < cv.width; x += step) {
          const h1 = hash(seed * 131 + x * 7 + y * 13);
          const h2 = hash(seed * 173 + x * 11 + y * 5);
          let on = false;
          if (pattern === 'spots') on = (h1 % 100) < 14;
          else if (pattern === 'cow') on = (h2 % 100) < 26;
          else if (pattern === 'stripe') on = ((x + y) % Math.max(8, step * 4) < step) && (h1 % 3 === 0);
          else if (pattern === 'two') on = y > cv.height * 0.52;
          if (on) {
            c.globalAlpha = 0.68;
            c.fillStyle = baseColor.pattern;
            c.fillRect(x, y, step, step);
          }
        }
      }
      c.globalAlpha = 1;
      c.globalCompositeOperation = 'source-over';
    }
    tintCache.set(key, cv);
    return cv;
  }

    function drawPetToCanvas(ctx, pet, cx, cy, opts) {
    opts = opts || {};
    const stage = pet.stage || 0;
    const tinted = getTintedAsset(pet);
    if (tinted) {
      const targetH = opts.targetH || (stage === 0 ? 62 : stage === 1 ? 78 : 94);
      let scale = targetH / tinted.height;
      if (stage === 1) scale *= 0.82;
      const w = tinted.width * scale;
      const h = tinted.height * scale;
      ctx.imageSmoothingEnabled = scale < 1;
      if (opts.flip) {
        ctx.save();
        ctx.translate(cx + w / 2, cy + h / 2);
        ctx.scale(-1, 1);
        ctx.drawImage(tinted, -w / 2, -h / 2, w, h);
        ctx.restore();
      } else {
        ctx.drawImage(tinted, cx, cy, w, h);
      }
      return;
    }
    const built = buildPet(pet);
    const cell = opts.cell || cellSizeForStage(stage);
    const flip = !!opts.flip;
    ctx.imageSmoothingEnabled = false;
    for (let y = 0; y < built.rows; y++) {
      for (let x = 0; x < built.cols; x++) {
        const ch = built.pixels[y * built.cols + x];
        if (ch === '.') continue;
        const color = built.pal[ch] || built.pal.f;
        const px = flip ? (cx - (x + 1) * cell) : (cx + x * cell);
        ctx.fillStyle = color;
        ctx.fillRect(px, cy + y * cell, cell, cell);
      }
    }
  }

  /* ---------- AI 资源预加载（宠物 0/2 阶段 + 房间背景） ---------- */
  function preloadAssets(done) {
    done = done || function () {};
    const keys = [];
    const colorList = Object.keys(COLORS);
    Object.keys(ANIMALS).forEach(a => { ['0','1','2'].forEach(s => { colorList.forEach(col => keys.push(a + '-' + s + '-' + col)); }); });
    ['minimal', 'cute', 'retro', 'forest', 'beach'].forEach(t => keys.push('room-' + t));
    keys.push('splash-bg');
    ['fish', 'milk', 'berry', 'cake', 'ball', 'wand', 'cushion', 'carrot', 'apple', 'goldfish', 'tracker', 'math', 'riddle'].forEach(i => keys.push('icon-' + i));
    // 先探测一张，不存在则说明还没生成 AI 资源，跳过避免大量报错
    const probe = new Image();
    probe.onload = function () { loadAll(keys); };
    probe.onerror = function () { done(); };
    probe.src = 'assets/pets/cat-2-orange.png';
    function loadAll(list) {
      let pending = list.length;
      if (!pending) { done(); return; }
      list.forEach(k => {
      const img = new Image();
      img.onload = function () {
        if (k === 'splash-bg') assets.splash.bg = img;
        else if (k.indexOf('icon-') === 0) assets.icons[k.slice(5)] = img;
        else if (k.indexOf('room-') === 0) assets.rooms[k.slice(5)] = img;
        else assets.pets[k] = img;
        pending--; if (pending <= 0) done();
      };
      img.onerror = function () { pending--; if (pending <= 0) done(); };
        img.src = k === 'splash-bg' ? 'assets/splash.png' : (k.indexOf('icon-') === 0 ? 'assets/icons/' + k.slice(5) + '.png' : (k.indexOf('room-') === 0 ? 'assets/rooms/' + k.slice(5) + '.png' : 'assets/pets/' + k + '.png'));
      });
    }
  }

  /* ---------- 配饰槽位（换装） ---------- */
  const GEAR_SLOTS = { bow: 'head', hat: 'head', crown: 'head', scarf: 'neck', glasses: 'face' };
  function drawAccessory(ctx, id, cx, cy, cell) { drawIcon(ctx, id, cx, cy, cell); }

  /* ---------- 小图标（食物/玩具/金币/爱心） ---------- */
  const ITEM_PX = {
    fish: [
      "..dd....dd..",
      ".dffd..dffd.",
      ".dfffffffd.",
      ".dffffeefd.",
      ".dfffeeffd.",
      ".dfffffffd.",
      ".dffd..dffd.",
      "..dd....dd.."
    ],
    milk: [
      "..dddddd..",
      ".dffffffd.",
      ".dffffffd.",
      ".dffffffd.",
      ".dddddddd.",
      ".dffffffd.",
      "..dddddd.."
    ],
    berry: [
      "..dddddd..",
      ".dffffffd.",
      ".dfffffff.",
      ".ddffffff.",
      ".dddddddd.",
      "..dddddd..",
      "...dddd..."
    ],
    cake: [
      "..dddddd..",
      ".dffffffd.",
      ".dffffffd.",
      ".dddddddd.",
      ".dffffffd.",
      ".dffffffd.",
      ".dddddddd."
    ],
    ball: [
      "...dddd...",
      "..dffffd..",
      ".dfffffd..",
      ".dffffffd.",
      ".dfffffd..",
      "..dffffd..",
      "...dddd..."
    ],
    wand: [
      "dd........",
      ".dd.......",
      "..dd......",
      "...dd.....",
      "..dffffd..",
      "..dffffd..",
      "..dffffd..",
      "...dddd..."
    ],
    cushion: [
      "..dddddd..",
      ".dffffffd.",
      ".dffffffd.",
      ".dffffffd.",
      ".dffffffd.",
      "..dddddd.."
    ],
    coin: [
      "..dddddd..",
      ".dfffffd..",
      ".dffffffd.",
      ".dfffffd..",
      ".dfffffd..",
      ".dffffffd.",
      "..dffffffd...",
      "..dddddd.."
    ],
    heart: [
      ".dd..dd.",
      "dffddffd",
      "dffffffd",
      ".dffffd.",
      "..dffd..",
      "...dd..."
    ],
    syrup: [
      "..dddddd..",
      ".dffffffd.",
      ".dwffffwd.",
      ".dwwffwwd.",
      ".dffffffd.",
      ".dddddddd.",
      ".dffffffd.",
      "..dddddd.."
    ],
    tonic: [
      "..dddddd..",
      ".dffffffd.",
      ".dfwwfwfd.",
      ".dfwwwwfd.",
      ".dffffffd.",
      ".dddddddd.",
      ".dffffffd.",
      "..dddddd.."
    ],
    elixir: [
      "..dddddd..",
      ".dffffffd.",
      ".dfwffwfd.",
      ".dffwwffd.",
      ".dffffffd.",
      ".dddddddd.",
      ".dffffffd.",
      "..dddddd.."
    ],
    bow: [
      ".dd....dd.",
      "dffd..dffd",
      "dffffffffd",
      ".dffffffd.",
      "..dddddd.."
    ],
    hat: [
      "...dddddd...",
      "..dffffffd..",
      ".dffffffffd.",
      "dddddddddddd",
      ".dffffffffd.",
      "..dffffffd.."
    ],
    crown: [
      "d.d.d.d.d.",
      ".dd.dd.dd.",
      "dddddddddd",
      ".dddddddd."
    ],
    scarf: [
      "..dddddd..",
      ".dffffffd.",
      ".dffffffd.",
      ".dffffffd.",
      ".dddddddd."
    ],
    glasses: [
      ".dddd...dddd..",
      "d....d.d....d.",
      ".dddd...dddd..",
      "..d.........d."
    ],
    house_cloud: [
      "...dddddddd...",
      "..dffffffffd..",
      ".dffffffffffd.",
      ".dffffffffffd.",
      ".dddddddddddd.",
      "..dd......dd.."
    ],
    house_cabin: [
      "...dddddd...",
      "..dffffffd..",
      ".dffffffffd.",
      "dddddddddddd",
      "dffddffddffd",
      "dffffffffffd",
      "dddddddddddd"
    ],
    house_pod: [
      "...dddddddddd...",
      "..dfffffffffff..",
      ".dffffffffffffd.",
      ".dffffffffffffd.",
      ".dddddddddddddd."
    ],
    house_mushroom: [
      ".....dddddd.....",
      "....dffffffd....",
      "...dffffffffd...",
      "..dffffffffffd..",
      "..dfdffdffdffd..",
      "..dffffffffffd..",
      "..dddddddddddd..",
      "....dd....dd....",
      "...ddd....ddd..."
    ],
    house_tree: [
      "....dddddddd....",
      "..dffffffffffd..",
      ".dffffffffffffd.",
      ".dfffdffffdfffd.",
      ".dffffffffffffd.",
      ".dddddddddddddd.",
      "....ddd..ddd....",
      "....dd....dd...."
    ],
    goldfish: [
      ".................",
      "..dd....dd.......",
      ".dffd..dffdd.....",
      ".dffffffdfffd....",
      ".dffffeefffffd...",
      ".dfffeEEeffffd...",
      ".dffffeefffffd...",
      ".dffffffdfffd....",
      ".dffd..dffdd.....",
      "..dd....dd.......",
      "................."
    ],
    tracker: [
      "..dddddddd..",
      ".dffffffffd.",
      ".dffffffffd.",
      ".dffffffffd.",
      ".dffffffffd.",
      ".dffffffffd.",
      ".dffffffffd.",
      "..dddddddd..",
      "....dddd....",
      "....d..d....",
      "....d..d....",
      "....dddd...."
    ],
    math: [
      "..dddddddd..",
      ".dffffffffd.",
      ".dffddddffd.",
      ".dffddddffd.",
      ".dffffffffd.",
      ".dffffffffd.",
      ".dffffffffd.",
      ".dffffffffd.",
      ".dffffffffd.",
      "..dddddddd.."
    ],
    riddle: [
      "..dddddddd..",
      ".dffffffffd.",
      ".dffffffffd.",
      ".ddddffffff.",
      "....ddddff..",
      ".....dddd...",
      "....dddd....",
      "...dddd.....",
      "...dddd.....",
      "............",
      "...dddd.....",
      "...dddd....."
    ]
  };

  const ITEM_PAL = {
    tracker: { f: '#8fd0ef', d: '#2f4a66' },
    math: { f: '#ffd97a', d: '#5a4632' },
    riddle: { f: '#ff9db1', d: '#7a3346' },
    fish: { f: '#8fc7e8', d: '#2f4a66' },
    milk: { f: '#ffffff', d: '#4a5a7a' },
    berry: { f: '#f06a6a', d: '#5a2333' },
    cake: { f: '#ffd1b8', d: '#7a4a33' },
    ball: { f: '#f2a33c', d: '#5a3320' },
    wand: { f: '#f7839f', d: '#5a2333' },
    cushion: { f: '#8fc7a8', d: '#335a4a' },
    coin: { f: '#ffd45e', d: '#8a6a14' },
    heart: { f: '#f76a8a', d: '#8a2a44' },
    syrup: { f: '#f0a35e', d: '#7a4a1a' },
    tonic: { f: '#8fd0e8', d: '#2f5a7a' },
    elixir: { f: '#c9a8e8', d: '#5a3a7a' },
    bow: { f: '#ff9ec3', d: '#a03a63' },
    hat: { f: '#f0d28a', d: '#8a6a2a' },
    crown: { f: '#ffd45e', d: '#8a6a14' },
    scarf: { f: '#f06a6a', d: '#8a2a2a' },
    glasses: { f: '#9a9aaa', d: '#3a3a4a' },
    house_cloud: { f: '#ffffff', d: '#7a8ab0' },
    house_cabin: { f: '#d9a05f', d: '#7a4a2a' },
    house_pod: { f: '#8fc7e8', d: '#335a7a' },
    house_mushroom: { f: '#f06a6a', d: '#8a2a2a' },
    house_tree: { f: '#79b577', d: '#335a33' },
    goldfish: { f: '#f7b267', d: '#8a5a2a' }
  };

  function drawIcon(ctx, id, cx, cy, cell) {
    const img = assets.icons[id];
    if (img) {
      const map = ITEM_PX[id];
      const cols = map ? Math.max.apply(null, map.map(r => r.length)) : 12;
      const rows = map ? map.length : 10;
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, cx, cy, cols * cell, rows * cell);
      return;
    }
    const map = ITEM_PX[id];
    const pal = ITEM_PAL[id] || ITEM_PAL.coin;
    if (!map) return;
    ctx.imageSmoothingEnabled = false;
    for (let y = 0; y < map.length; y++) {
      const row = map[y];
      for (let x = 0; x < row.length; x++) {
        const ch = row[x];
        if (ch === '.') continue;
        ctx.fillStyle = ch === 'd' ? pal.d : pal.f;
        ctx.fillRect(cx + x * cell, cy + y * cell, cell, cell);
      }
    }
  }

  function drawIconFit(ctx, id, cx, cy, size) {
    const img = assets.icons[id];
    if (img) {
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, cx, cy, size, size);
      return;
    }
    const map = ITEM_PX[id];
    const pal = ITEM_PAL[id] || ITEM_PAL.coin;
    if (!map) return;
    const cols = Math.max.apply(null, map.map(r => r.length));
    const rows = map.length;
    const cell = Math.max(1, Math.floor(size / Math.max(cols, rows)));
    const w = cols * cell, h = rows * cell;
    const ox = cx + Math.floor((size - w) / 2), oy = cy + Math.floor((size - h) / 2);
    ctx.imageSmoothingEnabled = false;
    for (let y = 0; y < map.length; y++) {
      const row = map[y];
      for (let x = 0; x < row.length; x++) {
        const ch = row[x];
        if (ch === '.') continue;
        ctx.fillStyle = ch === 'd' ? pal.d : pal.f;
        ctx.fillRect(ox + x * cell, oy + y * cell, cell, cell);
      }
    }
  }

  const api = {
    ANIMALS, COLORS, PATTERNS, MAPS, buildPet, drawPetToCanvas, getTintedAsset, drawIcon, drawIconFit, cellSizeForStage,
    GEAR_SLOTS, drawAccessory, setAsset, getAsset, hasAsset, preloadAssets
  };
  global.SPRITES = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
