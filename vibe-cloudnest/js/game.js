/* =====================================================================
   云端小窝 · 游戏核心逻辑（纯逻辑，无 DOM，可在 Node 中单测）
   ===================================================================== */
(function (global) {
  'use strict';

  const SAVE_KEY = 'cloudnest_save_v1';
  const VERSION = 2;
  const MAX_PETS = 4;
  const DAY_MINUTES = 5;   // 游戏内 5 分钟 = 1 天

  const STAGES = ['幼年体', '青年体', '成年体'];
  const STAGE_XP = [120, 360];      // 达到即进化

  const FOODS = {
    fish:  { label: '小鱼干',   icon: 'fish',    price: 20, hunger: 44, xp: 16, aff: 5,  desc: '最经典的美味，饱食 +44' },
    milk:  { label: '牛奶',     icon: 'milk',    price: 25, hunger: 38, xp: 14, aff: 4,  desc: '补钙长高高，饱食 +38' },
    berry: { label: '草莓',     icon: 'berry',   price: 15, hunger: 32, xp: 18, aff: 3,  desc: '甜甜的维生素，饱食 +32' },
    cake:  { label: '奶油蛋糕', icon: 'cake',    price: 40, hunger: 60, xp: 22, aff: 7,  desc: '节日小奢侈，饱食 +60' },
    carrot: { label: '胡萝卜',   icon: 'carrot',  price: 18, hunger: 30, xp: 12, aff: 3,  desc: '脆脆的维A，饱食 +30' },
    apple:  { label: '红苹果',   icon: 'apple',   price: 22, hunger: 34, xp: 15, aff: 4,  desc: '一天一苹果，饱食 +34' }
  };
  const TOYS = {
    ball:    { label: '毛线球', icon: 'ball',    price: 30, xp: 18, aff: 8, desc: '玩一次就停不下来，好感 +8' },
    wand:    { label: '逗猫棒', icon: 'wand',    price: 45, xp: 24, aff: 12, desc: '专治各种不开心，好感 +12' },
    cushion: { label: '软软垫', icon: 'cushion', price: 60, xp: 12, aff: 7,  energy: 35, desc: '睡在云朵上，好感 +7' }
  };
  const MEDS = {
    syrup: { label: '感冒药', icon: 'syrup', price: 50, cures: true,  desc: '治好转的小感冒' },
    tonic: { label: '活力药剂', icon: 'tonic', price: 60, energy: 40, hunger: 15, desc: '恢复精力 +40' },
    elixir: { label: '万能灵药', icon: 'elixir', price: 120, cures: true, energy: 50, hunger: 50, aff: 5, desc: '治病 + 全恢复' }
  };
  const GEAR = {
    bow:     { label: '蝴蝶结', icon: 'bow',     price: 30,  slot: 'head', desc: '戴上更可爱' },
    hat:     { label: '草帽',   icon: 'hat',     price: 55,  slot: 'head', desc: '夏日遮阳' },
    crown:   { label: '小皇冠', icon: 'crown',   price: 120, slot: 'head', desc: '尊贵的小宝贝' },
    scarf:   { label: '小围巾', icon: 'scarf',   price: 40,  slot: 'neck', desc: '温暖又时髦' },
    glasses: { label: '圆眼镜', icon: 'glasses', price: 50,  slot: 'face', desc: '学识渊博的样子' }
  };
  const TRACKERS = {
    tracker: { label: '定位器', icon: 'tracker', price: 500, desc: '找到偷偷跑出去的宠物' }
  };

  const HOUSES = {
    cloud: { label: '云朵床', icon: 'house_cloud', price: 80,  sleep: 15, petAff: 0, desc: '睡觉精力 +15' },
    cabin: { label: '原木小屋', icon: 'house_cabin', price: 120, sleep: 0,  petAff: 2, desc: '抚摸好感 +2' },
    pod:   { label: '太空舱', icon: 'house_pod',   price: 200, sleep: 25, petAff: 2, desc: '全能：睡觉 +25 精力，抚摸好感 +2' },
    mushroom: { label: '蘑菇窝', icon: 'house_mushroom', price: 140, sleep: 18, petAff: 2, desc: '森林小屋：睡觉 +18 精力，抚摸好感 +2' },
    tree:  { label: '树屋',   icon: 'house_tree',  price: 160, sleep: 20, petAff: 1, desc: '大树桩：睡觉 +20 精力，抚摸好感 +1' }
  };

  const ACTIONS = {
    feed:  { label: '喂食', cd: 3,  need: 'food' },
    play:  { label: '玩耍', cd: 5,  need: 'toy' },
    pet:   { label: '抚摸', cd: 2,  need: null },
    sleep: { label: '睡觉', cd: 10, need: null }
  };

  const ACHIEVEMENTS = [
    { id: 'first_pet',  icon: '🥚', name: '初遇',       desc: '领养第一只伙伴',          cond: s => s.pets.length >= 1 },
    { id: 'first_feed', icon: '🍣', name: '第一餐',     desc: '喂它吃过一顿饭',          cond: s => s.stats.feed >= 1 },
    { id: 'playmate',   icon: '⚽', name: '一起玩耍',   desc: '陪它玩过一次',            cond: s => s.stats.play >= 1 },
    { id: 'cuddle',     icon: '🖐', name: '摸摸头',     desc: '抚摸过它一次',            cond: s => s.stats.pet >= 1 },
    { id: 'lover',      icon: '💖', name: '挚爱时刻',   desc: '好感度达到 100',           cond: s => s.pets.some(p => p.affection >= 100) },
    { id: 'grown',      icon: '🌟', name: '长大啦',     desc: '养大第一只成年伙伴',       cond: s => s.pets.some(p => p.stage >= 2) },
    { id: 'family',     icon: '🏡', name: '家人团聚',   desc: '拥有 2 只伙伴',            cond: s => s.pets.length >= 2 },
    { id: 'rich',       icon: '💰', name: '小富翁',     desc: '累计赚到 1000 金币',       cond: s => s.stats.coinsEarned >= 1000 },
    { id: 'gamer',      icon: '🎮', name: '游戏达人',   desc: '小游戏单次得分 50+',       cond: s => s.stats.bestRain >= 50 || s.stats.bestBubble >= 50 || s.stats.bestFishing >= 50 || s.stats.bestMemory >= 50 || s.stats.bestMath >= 50 || s.stats.bestRiddle >= 50 },
    { id: 'streak7',    icon: '📅', name: '坚持 7 天',  desc: '连续 7 天来看它',          cond: s => s.streak >= 7 },
    { id: 'dressed',    icon: '🎀', name: '装扮大师',   desc: '戴上第一件配饰',          cond: s => s.pets.some(p => p.gear && (p.gear.head || p.gear.neck || p.gear.face)) },
    { id: 'doctor',     icon: '💊', name: '白衣天使',   desc: '治好一次生病',            cond: s => s.stats.meds >= 1 },
    { id: 'homeowner',  icon: '🏠', name: '有家了',     desc: '买下第一间小窝',          cond: s => s.stats.houses >= 1 }
  ];

  const PET_SOUNDS = {
    cat:    ['喵呜', '喵～', '咕噜咕噜'],
    dog:    ['汪呜', '汪汪', '哼唧哼唧'],
    pig:    ['哼哼', '咕噜咕噜', '哼！'],
    rabbit: ['噗噗', '咕咕', '呼噜呼噜'],
    bird:   ['啾啾', '啁啾～', '嘀哩嘀哩'],
    chick:  ['叽叽', '啾！', '叽叽喳喳'],
    fish:   ['咕噜咕噜', '啵啵', '咕嘟']
  };

  const NAME_POOL = ['团子', '奶糖', '布丁', '小满', '年糕', '花卷', '芋圆', '糖豆', '豆沙', '糯米', '桃桃', '栗子', '汤圆', '香草', '泡芙'];

  function defaultState() {
    return {
      v: VERSION,
      createdAt: Date.now(),
      lastSeen: Date.now(),
      coins: 120,
      sound: true,
      bgm: true,
      timeWarp: 1,
      theme: 'minimal',
      ownedThemes: ['minimal'],
      activePetId: null,
      pets: [],
      inventory: { fish: 2, milk: 1, berry: 3, cake: 0, carrot: 1, apple: 1, ball: 1, wand: 0, cushion: 0, syrup: 0, tonic: 0, elixir: 0, tracker: 0 },
      wardrobe: { bow: false, hat: false, crown: false, scarf: false, glasses: false },
      houses: { cloud: false, cabin: false, pod: false },
      stats: { feed: 0, play: 0, pet: 0, sleep: 0, games: 0, coinsEarned: 0, bestRain: 0, bestBubble: 0, bestFishing: 0, bestMemory: 0, bestMath: 0, bestRiddle: 0, meds: 0, houses: 0 },
      gameDays: 0,
      lastGameDay: 0,
      streak: 0,
      lastDayKey: '',
      log: [],
      achievements: [],
      flags: {}
    };
  }

  let state = null;

  function newPet(type, color, pattern, name) {
    return {
      id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      type, color, pattern, name,
      stage: 0, xp: 0,
      affection: 70, hunger: 80, energy: 90,
      alive: true, sick: false, runaway: false, runawaySince: 0,
      bornAt: Date.now(),
      lastFeed: 0, lastPlay: 0, lastPet: 0, lastSleep: 0, lastTouched: Date.now(),
      sickSince: 0, lowAffSince: 0, sickAt: 0, sickRandom: false,
      gear: { head: null, neck: null, face: null }, house: null,
      seed: Math.floor(Math.random() * 100000),
      deadAt: null, reviveCount: 0
    };
  }

  /* ---------------- 存档 ---------------- */
  function save() {
    try {
      state.lastSeen = Date.now();
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (e) { /* ignore */ }
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s && s.v === VERSION) {
          state = Object.assign(defaultState(), s);
          state.inventory = Object.assign(defaultState().inventory, s.inventory || {});
          state.stats = Object.assign(defaultState().stats, s.stats || {});
          (s.pets || []).forEach(p => {
            p.gear = p.gear || { head: null, neck: null, face: null };
            if (p.house === undefined) p.house = null;
            if (p.sickRandom === undefined) p.sickRandom = false;
            if (p.sickAt === undefined) p.sickAt = 0;
            if (p.runaway === undefined) p.runaway = false;
            if (p.runawaySince === undefined) p.runawaySince = 0;
          });
          state.lastSeen = Date.now(); // 离开时间暂停，回来从零计算
          return true;
        }
      }
    } catch (e) { /* ignore */ }
    state = defaultState();
    return false;
  }

  function reset() {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
    state = defaultState();
    save();
  }

  /* ---------------- 工具 ---------------- */
  function activePet() {
    return state.pets.find(p => p.id === state.activePetId) || null;
  }
  function nowKey(d) {
    const x = d || new Date();
    return x.getFullYear() + '-' + (x.getMonth() + 1) + '-' + x.getDate();
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function fmtMin(m) {
    if (m >= 1440) return Math.round(m / 1440) + ' 天';
    if (m >= 60) return Math.round(m / 60) + ' 小时';
    return Math.max(1, Math.round(m)) + ' 分钟';
  }

  /* ---------------- 时间模拟 ---------------- */
  function simulate(now) {
    const raw = (now - state.lastSeen) / 60000;
    const min = raw * state.timeWarp;
    const events = [];
    if (min <= 0.5) return events;

    const days = min / DAY_MINUTES;
    state.pets.forEach(p => {
      if (!p.alive) return;
      const hungerDecay = days * 50;   // 每游戏日 -50 饱食（约一天掉一半）
      const energyDecay = days * 45;   // 每游戏日 -45 精力
      let affDecay = days * 15;        // 每游戏日 -15 好感
      if (p.hunger <= 0) affDecay += days * 25;
      p.hunger = clamp(p.hunger - hungerDecay, 0, 100);
      p.energy = clamp(p.energy - energyDecay, 0, 100);
      p.affection = clamp(p.affection - affDecay, 0, 100);

      // 生病与死亡判定
      if (p.hunger <= 0 && !p.sickSince) p.sickSince = now;
      if (p.hunger > 0) { p.sickSince = 0; }
      if (p.affection <= 0 && !p.lowAffSince) p.lowAffSince = now;
      if (p.affection > 0) p.lowAffSince = 0;

      if (!p.sick && p.sickSince && (now - p.sickSince) >= 30 * 3600000) {
        p.sick = true;
        events.push({ type: 'sick', petId: p.id });
        pushLog(p.name + ' 生病了…它缩成一团，等你来照顾。');
      }
      if (p.sick && p.sickSince && (now - p.sickSince) >= 60 * 3600000) {
        die(p, events);
      } else if (p.lowAffSince && (now - p.lowAffSince) >= 36 * 3600000) {
        die(p, events);
      }
      // 随机生病（与饥饿无关的小概率事件）
      if (p.alive && !p.sick && p.hunger > 10 && p.affection > 5) {
        const hours = min / 60;
        if (hours > 0 && Math.random() < hours * 0.028) {
          p.sick = true; p.sickRandom = true; p.sickAt = now;
          events.push({ type: 'sick', petId: p.id, random: true });
          pushLog(p.name + ' 好像有点不舒服…去小卖部买点感冒药吧。');
        }
      }
      // 随机生病 24 小时后自己好转
      if (p.sick && p.sickRandom && p.sickAt && (now - p.sickAt) >= 24 * 3600000) {
        p.sick = false; p.sickRandom = false; p.sickAt = 0;
        pushLog(p.name + ' 自己慢慢好起来了，但还是多注意它呀。');
      }

      // 突发：偷偷跑出去玩
      if (p.alive && !p.sick && !p.runaway && p.hunger > 5) {
        const hours = min / 60;
        if (hours > 0 && Math.random() < hours * 0.006) {
          p.runaway = true;
          p.runawaySince = now;
          events.push({ type: 'runaway', petId: p.id });
          pushLog('💨 ' + p.name + ' 趁你不注意偷偷跑出去玩啦！快去买个定位器（500金币）把它找回来！');
        }
      }
      if (days >= 1) {
        pushLog(p.name + ' 在窗边等了你 ' + (days >= 1 ? Math.floor(days) + ' 天' : '大半天') + '…饱食 -' + Math.round(hungerDecay) + '，好感 -' + Math.round(affDecay) + '。看到你回来，它眼睛一下子亮了。');
      }
    });

    // 每日登录
    const key = nowKey(new Date(now));
    if (state.lastDayKey !== key) {
      state.lastDayKey = key;
      state.streak = state.streak + 1;
      state.coins += 20;
      const p = activePet();
      const who = p && p.alive ? p.name : '小家伙';
      pushLog('今天 ' + who + ' 对你说：' + dailyLine(p));
      events.push({ type: 'daily' });
    }
    // 游戏内天数：每 5 分钟过一天
    state.gameDays += days;
    const newDayCount = Math.floor(state.gameDays);
    if (newDayCount > state.lastGameDay) {
      const gained = newDayCount - state.lastGameDay;
      state.lastGameDay = newDayCount;
      state.coins += 3 * gained;
      pushLog('🌞 第 ' + (newDayCount + 1) + ' 天到了，微风掏来 ' + (3 * gained) + ' 金币。');
      events.push({ type: 'newday', day: newDayCount + 1 });
    }
    return events;
  }

  function die(p, events) {
    p.alive = false;
    p.sick = false;
    p.deadAt = Date.now();
    p.affection = 0;
    p.hunger = 0;
    events.push({ type: 'died', petId: p.id });
    pushLog('『' + p.name + '』去了星星上…它说：谢谢你，给了它一段被爱着的时光。');
  }

  /* ---------------- 宠物语言翻译 ---------------- */
  function petSound(p) {
    const arr = PET_SOUNDS[p.type] || PET_SOUNDS.cat;
    return arr[Math.floor(Math.random() * arr.length)];
  }
  function tier(p) {
    if (p.affection >= 80) return 'love';
    if (p.affection >= 55) return 'high';
    if (p.affection >= 30) return 'mid';
    return 'low';
  }
  function transLines(p, ctx) {
    const t = tier(p);
    const name = p.name;
    if (ctx === 'feed') return {
      raw: '吧唧吧唧～',
      trans: ['好好吃！有你在，每顿饭都是幸福的味道。', '吃饱饱，才有力气一直陪着你呀。']
    };
    if (ctx === 'play') return {
      raw: '呼呼～再来一次！',
      trans: ['和你一起玩的时候，时间过得真快呀。', '我最喜欢和你玩啦，可以一直玩到天黑吗？']
    };
    if (ctx === 'pet') return {
      raw: '蹭蹭蹭～',
      trans: ['被摸摸头的时候，心里暖洋洋的。', '你的手手好温柔，多摸一会儿嘛。']
    };
    if (ctx === 'sleep') return {
      raw: '呼…呼…',
      trans: ['晚安，有你在，我睡得特别香。', '梦里也会梦见你哦。']
    };
    if (ctx === 'morning') return {
      raw: '早安喵～',
      trans: ['早呀！今天也要开开心心出门，我在家等你回来。']
    };
    if (ctx === 'night') return {
      raw: '晚安啦～',
      trans: ['一天辛苦啦，钻进被窝前，记得来摸摸我哦。']
    };
    if (t === 'love') return {
      raw: petSound(p) + '～',
      trans: [
        '妈妈我会一直爱你。',
        '只要你在，我就什么都不怕。',
        '你是我见过最好的主人，我要一直跟着你。',
        '抱抱！今天的你也辛苦啦。',
        '和你在一起的每一天，都是晴天。'
      ]
    };
    if (t === 'high') return {
      raw: petSound(p) + '～',
      trans: ['最喜欢你摸摸头啦！', '今天也要一起玩好不好呀？', '有你在，这个小窝就是全世界最幸福的地方。']
    };
    if (t === 'mid') return {
      raw: petSound(p) + '…',
      trans: ['今天也一起玩好不好呀？', '我有一点想你了。']
    };
    return {
      raw: petSound(p) + '…',
      trans: ['有点孤单…能多陪陪我吗？', '你是不是把我忘啦？我会乖乖等你的。']
    };
  }
  function dailyLine(p) {
    if (!p) return '不管今天过得好不好，都有人在等你回家。';
    if (tier(p) === 'love') return '妈妈我会一直爱你。';
    const lines = ['今天也要好好吃饭哦，我在家等你。', '你出门的时候，我把云朵数了一遍。', '不管多忙，记得回来看看我。'];
    return lines[Math.floor(Math.random() * lines.length)];
  }
  function say(p, ctx) {
    const line = transLines(p, ctx);
    return { raw: line.raw, trans: line.trans[Math.floor(Math.random() * line.trans.length)] };
  }
  function pushLog(text) {
    state.log.unshift({ t: Date.now(), text: text });
    if (state.log.length > 80) state.log.length = 80;
  }

  /* ---------------- 领养与伙伴 ---------------- */
  function adopt(type, color, pattern, name) {
    const p = newPet(type, color, pattern, name || randomName());
    state.pets.push(p);
    state.activePetId = p.id;
    pushLog('你把 ' + p.name + ' 带回了家。它怯生生地看了你一眼，然后蹭了蹭你的手。');
    pushLog('小贴士：好感度越高，它会说越多心里话哦。');
    checkAchievements();
    save();
    return p;
  }

  function adoptNew(type, color, pattern, name) {
    if (state.pets.length >= MAX_PETS) return { ok: false, msg: '小窝已经住满啦（最多 ' + MAX_PETS + ' 只）' };
    if (state.coins < 3000) return { ok: false, msg: '领养新伙伴需要 3000 金币，先玩小游戏赚点吧', goto: 'games' };
    state.coins -= 3000;
    const p = adopt(type, color, pattern, name);
    pushLog('小窝迎来了新成员：' + p.name + '！它好奇地闻了闻周围的一切。');
    save();
    return { ok: true, pet: p };
  }

  function switchPet(id) {
    if (state.pets.some(p => p.id === id)) {
      state.activePetId = id;
      save();
      return true;
    }
    return false;
  }

  function randomName() {
    return NAME_POOL[Math.floor(Math.random() * NAME_POOL.length)];
  }

  /* ---------------- 互动 ---------------- */
  function action(name, now) {
    now = now || Date.now();
    const p = activePet();
    if (!p) return { ok: false, msg: '还没有伙伴哦' };
    if (!p.alive) return { ok: false, msg: p.name + ' 还在星星上…先去伙伴列表看看它吧' };
    if (p.runaway) return { ok: false, msg: '它偷偷跑出去啦，先去商店买定位器找它回来吧', goto: 'shop' };
    const cfg = ACTIONS[name];
    if (!cfg) return { ok: false, msg: '未知操作' };
    const lastKey = 'last' + name[0].toUpperCase() + name.slice(1);
    const remain = (p[lastKey] + cfg.cd * 60000 - now) / 60000;
    if (remain > 0) return { ok: false, msg: '它还想再玩一会儿，等 ' + Math.ceil(remain) + ' 分钟再来吧', cd: Math.ceil(remain) };

    const res = { ok: true, msg: '', fx: name, speech: say(p, name) };

    if (name === 'feed') {
      const foodId = firstInventory('food');
      if (!foodId) return { ok: false, msg: '没有食物啦！去小卖部买一点吧', goto: 'shop' };
      const food = FOODS[foodId];
      state.inventory[foodId]--;
      p.hunger = clamp(p.hunger + food.hunger, 0, 100);
      p.xp += food.xp;
      p.affection = clamp(p.affection + food.aff, 0, 100);
      res.msg = food.label + ' +' + food.hunger + ' 饱食';
      state.stats.feed++;
      res.speech = say(p, 'feed');
    } else if (name === 'play') {
      const toyId = firstInventory('toy');
      if (!toyId) return { ok: false, msg: '没有玩具啦！去小卖部买一个吧', goto: 'shop' };
      state.inventory[toyId]--;
      const toy = TOYS[toyId];
      let gainXp = 12 + toy.xp, gainAff = 5 + toy.aff, extra = '（' + toy.label + '加成）';
      p.energy = clamp(p.energy - 14, 0, 100);
      p.hunger = clamp(p.hunger - 10, 0, 100);
      p.xp += gainXp;
      p.affection = clamp(p.affection + gainAff, 0, 100);
      res.msg = '开心玩耍 +' + gainAff + ' 好感' + extra;
      state.stats.play++;
      res.speech = say(p, 'play');
    } else if (name === 'pet') {
      const house = HOUSES[p.house];
      const affGain = 4 + (house && house.petAff ? house.petAff : 0);
      p.xp += 8;
      p.affection = clamp(p.affection + affGain, 0, 100);
      res.msg = '温柔抚摸 +' + affGain + ' 好感';
      state.stats.pet++;
      res.speech = say(p, 'pet');
    } else if (name === 'sleep') {
      const house = HOUSES[p.house];
      const gain = 60 + (house && house.sleep ? house.sleep : 0);
      p.energy = clamp(p.energy + gain, 0, 100);
      p.xp += 6;
      res.msg = '睡得香香的，精力 +' + gain;
      state.stats.sleep++;
      res.speech = say(p, 'sleep');
    }

    p[lastKey] = now;
    p.lastTouched = now;
    p.sickSince = 0;

    const ev = checkStageUp(p);
    if (ev) res.stageup = ev;
    const ach = checkAchievements();
    if (ach.length) res.achievements = ach;
    save();
    return res;
  }

  function firstInventory(kind) {
    const table = kind === 'food' ? FOODS : kind === 'toy' ? TOYS : MEDS;
    const ids = Object.keys(table);
    for (const id of ids) if (state.inventory[id] > 0) return id;
    return null;
  }

  function checkStageUp(p) {
    let newStage = p.stage;
    while (newStage < 2 && p.xp >= STAGE_XP[newStage]) newStage++;
    if (newStage > p.stage) {
      const old = p.stage;
      p.stage = newStage;
      const bonus = newStage === 1 ? 30 : 60;
      state.coins += bonus;
      pushLog('🎉 ' + p.name + ' 长大啦！现在是' + STAGES[newStage] + '，奖励 ' + bonus + ' 金币。' + (newStage === 2 ? '再攒 3000 金币就可以领养新伙伴啦！' : ''));
      return { stage: newStage, bonus };
    }
    return null;
  }

  /* ---------------- 商店 ---------------- */
  function buyItem(kind, id, now) {
    now = now || Date.now();
    const table = kind === 'food' ? FOODS : kind === 'toy' ? TOYS : kind === 'med' ? MEDS : kind === 'gear' ? GEAR : HOUSES;
    const item = table[id];
    if (!item) return { ok: false, msg: '没有这个商品' };
    if (state.coins < item.price) return { ok: false, msg: '金币不够啦，去游乐场赚点吧', goto: 'games' };
    state.coins -= item.price;
    if (kind === 'gear') {
      state.wardrobe[id] = true;
    } else if (kind === 'house') {
      state.houses[id] = true;
      state.stats.houses++;
    } else {
      state.inventory[id] = (state.inventory[id] || 0) + 1;
    }
    pushLog('买了一个' + item.label + '（-' + item.price + '金币）');
    checkAchievements();
    save();
    return { ok: true, item: item };
  }

  function buyTheme(id, now) {
    now = now || Date.now();
    const theme = ROOMS.THEMES.find(t => t.id === id);
    if (!theme) return { ok: false, msg: '没有这个主题' };
    if (state.ownedThemes.indexOf(id) >= 0) { state.theme = id; save(); return { ok: true, owned: true }; }
    if (state.coins < theme.price) return { ok: false, msg: '金币不够啦，去游乐场赚点吧', goto: 'games' };
    state.coins -= theme.price;
    state.ownedThemes.push(id);
    state.theme = id;
    pushLog('换上了「' + theme.label + '」装修，小窝焕然一新！');
    save();
    return { ok: true };
  }

  /* ---------------- 小游戏结算 ---------------- */
  function finishGame(gameId, score) {
    score = Math.max(0, Math.floor(score));
    state.coins += score;
    state.stats.coinsEarned += score;
    state.stats.games++;
    if (gameId === 'rain') state.stats.bestRain = Math.max(state.stats.bestRain, score);
    if (gameId === 'bubble') state.stats.bestBubble = Math.max(state.stats.bestBubble, score);
    if (gameId === 'fishing') state.stats.bestFishing = Math.max(state.stats.bestFishing, score);
    if (gameId === 'memory') state.stats.bestMemory = Math.max(state.stats.bestMemory, score);
    if (gameId === 'math') state.stats.bestMath = Math.max(state.stats.bestMath, score);
    if (gameId === 'riddle') state.stats.bestRiddle = Math.max(state.stats.bestRiddle, score);
    const gname = { rain: '零嘴雨', bubble: '泡泡乐', fishing: '钓鱼大师', memory: '记忆翻翻乐', math: '算术速算', riddle: '猜字谜' }[gameId] || '小游戏';
    if (score > 0) pushLog('在「' + gname + '」中赚到 ' + score + ' 金币');
    const ach = checkAchievements();
    save();
    return { coins: score, achievements: ach };
  }

  /* ---------------- 成就 ---------------- */
  function checkAchievements() {
    const unlocked = [];
    ACHIEVEMENTS.forEach(a => {
      if (state.achievements.indexOf(a.id) < 0 && a.cond(state)) {
        state.achievements.push(a.id);
        pushLog('🏆 成就解锁：' + a.name + ' — ' + a.desc);
        unlocked.push(a);
      }
    });
    return unlocked;
  }

  /* ---------------- 复活 ---------------- */
  function revive(petId) {
    const p = state.pets.find(x => x.id === petId);
    if (!p || p.alive) return { ok: false, msg: '它好好的呀' };
    const cost = 100 + p.reviveCount * 50;
    if (state.coins < cost) return { ok: false, msg: '需要 ' + cost + ' 金币召回它，先去赚金币吧', goto: 'games' };
    state.coins -= cost;
    p.alive = true; p.sick = false; p.sickSince = 0; p.lowAffSince = 0;
    p.affection = Math.max(40, p.affection);
    p.hunger = Math.max(50, p.hunger);
    p.energy = Math.max(60, p.energy);
    p.reviveCount++;
    pushLog('✨ 回忆之光闪烁，' + p.name + ' 回来啦！它扑进你怀里，呜呜地叫。');
    state.activePetId = p.id;
    save();
    return { ok: true, cost: cost };
  }

  function medicate(petId) {
    const p = state.pets.find(x => x.id === petId);
    if (!p || !p.alive) return { ok: false, msg: '它不需要吃药哦' };
    const medId = firstInventory('med');
    if (!medId) return { ok: false, msg: '没有药…去小卖部买点感冒药吧', goto: 'shop' };
    state.inventory[medId]--;
    state.stats.meds++;
    const med = MEDS[medId];
    p.sick = false; p.sickRandom = false; p.sickSince = 0; p.lowAffSince = 0; p.sickAt = 0;
    if (med.energy) p.energy = clamp(p.energy + med.energy, 0, 100);
    if (med.hunger) p.hunger = clamp(p.hunger + med.hunger, 0, 100);
    if (med.aff) p.affection = clamp(p.affection + med.aff, 0, 100);
    p.affection = clamp(p.affection + 2, 0, 100);
    pushLog('给 ' + p.name + ' 喂了' + med.label + '，它看起来好多了。');
    const ach = checkAchievements();
    save();
    return { ok: true, med: med, achievements: ach };
  }

  /* ---------------- 寻回跑出去的宠物 ---------------- */
  function findPet(petId) {
    const p = state.pets.find(x => x.id === petId);
    if (!p) return { ok: false, msg: '找不到这只伙伴' };
    if (!p.runaway) return { ok: false, msg: '它就在家里乖乖待着呢' };
    if (!state.inventory.tracker || state.inventory.tracker <= 0) return { ok: false, msg: '需要定位器才能找到它，去商店买一个吧（500金币）', goto: 'shop' };
    state.inventory.tracker--;
    p.runaway = false;
    p.runawaySince = 0;
    p.hunger = clamp(p.hunger - 12, 0, 100);
    p.energy = clamp(p.energy - 10, 0, 100);
    p.affection = clamp(p.affection - 3, 0, 100);
    pushLog('📍 你用定位器找到了 ' + p.name + '，它委屈巴巴地跟你回了家，饿了也累了。');
    save();
    return { ok: true, pet: p };
  }

  function equipGear(petId, slot, itemId) {
    const p = state.pets.find(x => x.id === petId);
    if (!p) return { ok: false, msg: '找不到伙伴' };
    if (itemId === null) { p.gear[slot] = null; save(); return { ok: true }; }
    const g = GEAR[itemId];
    if (!g || g.slot !== slot) return { ok: false, msg: '不能戴在这里' };
    if (!state.wardrobe[itemId]) return { ok: false, msg: '还没买这件配饰哦', goto: 'shop' };
    p.gear[slot] = itemId;
    const ach = checkAchievements();
    save();
    return { ok: true, achievements: ach };
  }

  function setHouse(petId, houseId) {
    const p = state.pets.find(x => x.id === petId);
    if (!p) return { ok: false, msg: '找不到伙伴' };
    if (houseId === null) { p.house = null; save(); return { ok: true }; }
    if (!state.houses[houseId]) return { ok: false, msg: '还没买这间小窝哦', goto: 'shop' };
    p.house = houseId;
    save();
    return { ok: true };
  }

  const api = {
    SAVE_KEY, STAGES, STAGE_XP, FOODS, TOYS, MEDS, GEAR, TRACKERS, HOUSES, ACTIONS, ACHIEVEMENTS, MAX_PETS,
    defaultState, load, save, reset, simulate, action, adopt, adoptNew, findPet, switchPet,
    buyItem, buyTheme, finishGame, revive, checkAchievements,
    activePet, randomName, say, dailyLine, petSound, fmtMin, tier, nowKey,
    medicate, equipGear, setHouse
  };
  global.Game = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
