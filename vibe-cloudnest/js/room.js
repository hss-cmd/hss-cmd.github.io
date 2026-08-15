/* =====================================================================
   云端小窝 · 房间场景模块：简约 / 可爱 / 复古 / 森林 / 海边
   优先使用 AI 背景图（assets/rooms/{theme}.png），缺失时回退到代码绘制
   ===================================================================== */
(function (global) {
  'use strict';

  const THEMES = [
    { id: 'minimal', label: '简约高级风', emoji: '🪴', price: 0,   desc: '干净的奶油白与木色，一盆绿植刚刚好' },
    { id: 'cute',    label: '可爱风',     emoji: '🎀', price: 150, desc: '粉色小窝、气球和毛绒玩具，甜度超标' },
    { id: 'retro',   label: '复古风',     emoji: '📻', price: 150, desc: '老电视、唱片机与格子地板，温暖怀旧' },
    { id: 'forest',  label: '森林小屋',   emoji: '🍄', price: 200, desc: '蘑菇灯与树影，像住在森林里' },
    { id: 'beach',   label: '海边度假',   emoji: '🏖', price: 200, desc: '推开窗就是海风与沙滩' }
  ];

  const P = {
    minimal: { wall: '#f2eee4', wall2: '#e7e0d2', floor: '#d8c8a8', plank: '#c0ac88', wood: '#a98f67', accent: '#7aa98d', rug: '#c7d8cb', rugLine: '#a9c0b0', sky: '#a9d4ef', skyNight: '#24344f', sofa: '#e8e4da', sofaDark: '#c9c4b8', plant: '#7ba05f', window: '#f7f4ec' },
    cute:   { wall: '#ffe9f0', wall2: '#ffd9e5', floor: '#f2cfd8', plank: '#e2b5c2', wood: '#d9aab6', accent: '#ff9ec3', rug: '#ffd1e3', rugLine: '#f3aac7', sky: '#bfe3f2', skyNight: '#3a3358', sofa: '#ffc2d6', sofaDark: '#e8a0ba', plant: '#9ecf9a', window: '#fff6f9' },
    retro:  { wall: '#ecd3a3', wall2: '#dfbd87', floor: '#c98d52', plank: '#a86f3a', wood: '#8a5a3a', accent: '#d9a066', rug: '#b56a5a', rugLine: '#94503f', sky: '#f2c98a', skyNight: '#4a3a5a', sofa: '#a86a4a', sofaDark: '#8a5338', plant: '#6f9a4f', window: '#f5e7cd' },
    forest: { wall: '#dce8cf', wall2: '#c6d9b4', floor: '#b08a5e', plank: '#8f6d45', wood: '#6f5336', accent: '#7ba05f', rug: '#a9c8a2', rugLine: '#84a87c', sky: '#bfe3d2', skyNight: '#2f3f55', sofa: '#8fae78', sofaDark: '#6f8f5a', plant: '#5f8a48', window: '#eef6e4' },
    beach:  { wall: '#dff2f7', wall2: '#c9e7ef', floor: '#ecd3a0', plank: '#d8b87f', wood: '#b08a5e', accent: '#7ec4d8', rug: '#f4d9a8', rugLine: '#dfbb7f', sky: '#bfe8f5', skyNight: '#3a4a66', sofa: '#8fc7d8', sofaDark: '#6aa5b8', plant: '#7ba05f', window: '#eaf9fc' }
  };

  function px(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  function drawWindow(ctx, p, night, x, y, w, h) {
    px(ctx, x - 5, y - 5, w + 10, h + 10, p.wood);
    px(ctx, x, y, w, h, night ? p.skyNight : p.sky);
    if (night) {
      ctx.fillStyle = '#fff';
      [[x + 18, y + 14], [x + 44, y + 34], [x + 70, y + 18]].forEach(([sx, sy]) => px(ctx, sx, sy, 2, 2, '#fff'));
      px(ctx, x + w - 28, y + 8, 16, 16, '#f5e9a8');
      px(ctx, x + w - 24, y + 8, 6, 6, night);
    } else {
      px(ctx, x + 14, y + 12, 22, 8, '#ffffff');
      px(ctx, x + 24, y + 8, 16, 12, '#ffffff');
      px(ctx, x + 44, y + 30, 26, 8, '#ffffff');
      px(ctx, x + 58, y + 26, 16, 12, '#ffffff');
    }
    px(ctx, x + w / 2 - 2, y, 4, h, p.window);
    px(ctx, x, y + h / 2 - 2, w, 4, p.window);
    px(ctx, x - 5, y + h, w + 10, 5, p.wood);
    px(ctx, x - 10, y - 5, 5, h + 15, p.accent);
    px(ctx, x + w + 5, y - 5, 5, h + 15, p.accent);
    px(ctx, x - 10, y - 8, w + 25, 5, p.accent);
  }

  function drawRug(ctx, p, cx, cy, w, h) {
    px(ctx, cx - w / 2, cy - h / 2, w, h, p.rug);
    px(ctx, cx - w / 2 + 6, cy - h / 2 + 6, w - 12, h - 12, 'rgba(255,255,255,0.25)');
    px(ctx, cx - w / 2 + 2, cy - h / 2 + 2, w - 4, 4, p.rugLine);
    px(ctx, cx - w / 2 + 2, cy + h / 2 - 6, w - 4, 4, p.rugLine);
  }

  function drawPlant(ctx, p, x, y) {
    px(ctx, x, y, 34, 8, '#8a6a4a');
    px(ctx, x + 4, y - 4, 26, 6, '#9a7a55');
    px(ctx, x + 14, y - 16, 6, 14, p.plant);
    px(ctx, x + 6, y - 22, 12, 10, p.plant);
    px(ctx, x + 20, y - 26, 14, 12, '#5f8a48');
    px(ctx, x + 24, y - 18, 10, 10, p.plant);
  }

  function drawMinimal(ctx, p, night) {
    px(ctx, 0, 0, 360, 240, p.wall);
    px(ctx, 0, 226, 360, 74, p.floor);
    px(ctx, 0, 226, 360, 4, p.plank);
    for (let i = 0; i < 6; i++) px(ctx, i * 62 + 30, 230, 60, 2, p.plank);
    px(ctx, 250, 48, 56, 46, p.window);
    px(ctx, 254, 52, 48, 38, p.accent);
    px(ctx, 272, 60, 12, 10, p.wall);
    px(ctx, 262, 82, 30, 8, p.wood);
    px(ctx, 216, 172, 120, 58, p.sofa);
    px(ctx, 222, 162, 108, 16, p.sofa);
    px(ctx, 230, 224, 18, 8, p.sofaDark);
    px(ctx, 306, 224, 18, 8, p.sofaDark);
    px(ctx, 222, 162, 8, 30, p.sofaDark);
    px(ctx, 322, 162, 8, 30, p.sofaDark);
    drawWindow(ctx, p, night, 28, 48, 96, 76);
    drawPlant(ctx, p, 150, 216);
    drawRug(ctx, p, 180, 224, 130, 52);
  }

  function drawCute(ctx, p, night) {
    px(ctx, 0, 0, 360, 240, p.wall);
    px(ctx, 0, 226, 360, 74, p.floor);
    px(ctx, 0, 226, 360, 4, p.plank);
    for (let i = 0; i < 6; i++) px(ctx, i * 62 + 30, 230, 60, 2, p.plank);
    px(ctx, 260, 36, 22, 26, '#ff9ec3');
    px(ctx, 302, 52, 18, 22, '#ffd77a');
    px(ctx, 270, 60, 1, 26, '#c98ba0');
    px(ctx, 310, 72, 1, 18, '#c9a35f');
    px(ctx, 228, 120, 100, 110, p.wood);
    px(ctx, 232, 124, 92, 26, '#fff6f9');
    px(ctx, 232, 158, 92, 26, '#fff6f9');
    px(ctx, 232, 192, 92, 26, '#fff6f9');
    ctx.fillStyle = '#f76a8a';
    [[244, 130], [262, 130], [280, 130], [246, 166], [268, 166], [290, 166], [252, 200], [276, 200]].forEach(([hx, hy]) => {
      px(ctx, hx, hy + 3, 4, 4, '#f76a8a'); px(ctx, hx + 3, hy + 3, 4, 4, '#f76a8a');
      px(ctx, hx + 1, hy, 4, 4, '#f76a8a'); px(ctx, hx, hy + 1, 6, 4, '#f76a8a');
    });
    drawWindow(ctx, p, night, 28, 48, 96, 76);
    drawPlant(ctx, p, 150, 216);
    drawRug(ctx, p, 180, 224, 130, 52);
  }

  function drawRetro(ctx, p, night) {
    px(ctx, 0, 0, 360, 240, p.wall);
    for (let y = 0; y < 240; y += 16) px(ctx, 0, y, 360, 4, p.wall2);
    for (let y = 226; y < 300; y += 18) {
      for (let x = 0; x < 360; x += 18) {
        px(ctx, x, y, 18, 18, ((x / 18 + y / 18) % 2 === 0) ? p.floor : '#b57940');
      }
    }
    px(ctx, 0, 226, 360, 4, p.plank);
    px(ctx, 232, 130, 96, 74, p.wood);
    px(ctx, 242, 140, 76, 52, night ? '#24344f' : '#8fb7d8');
    if (!night) {
      px(ctx, 258, 152, 14, 10, '#fff'); px(ctx, 282, 152, 10, 10, '#fff');
      px(ctx, 252, 172, 22, 10, '#fff');
    }
    px(ctx, 268, 196, 10, 14, p.wood);
    px(ctx, 262, 210, 22, 6, p.wood);
    px(ctx, 232, 204, 96, 6, p.wood);
    px(ctx, 60, 190, 56, 36, p.wood);
    px(ctx, 68, 198, 40, 20, '#3a2c22');
    px(ctx, 80, 202, 16, 16, '#e8b977');
    px(ctx, 86, 208, 4, 4, '#3a2c22');
    drawWindow(ctx, p, night, 150, 44, 74, 64);
    drawPlant(ctx, p, 300, 216);
    drawRug(ctx, p, 180, 224, 130, 52);
  }

  function drawForest(ctx, p, night) {
    px(ctx, 0, 0, 360, 240, p.wall);
    for (let y = 0; y < 240; y += 20) px(ctx, 0, y, 360, 3, p.wall2);
    px(ctx, 0, 226, 360, 74, p.floor);
    px(ctx, 0, 226, 360, 4, p.plank);
    for (let i = 0; i < 5; i++) px(ctx, i * 76 + 20, 232, 56, 3, p.plank);
    // 蘑菇灯
    px(ctx, 250, 150, 40, 8, '#8a6a4a');
    px(ctx, 262, 128, 16, 26, '#e8e0d0');
    px(ctx, 254, 120, 32, 12, '#d97a6a');
    px(ctx, 262, 118, 16, 6, '#f2d8c8');
    px(ctx, 258, 124, 4, 3, '#fff');
    px(ctx, 270, 124, 4, 3, '#fff');
    // 树形壁纸装饰
    px(ctx, 210, 52, 10, 34, '#6f5336');
    px(ctx, 196, 34, 38, 24, '#7ba05f');
    px(ctx, 204, 24, 22, 14, '#8fae78');
    // 地毯是苔藓绿
    drawRug(ctx, p, 180, 224, 130, 52);
    drawWindow(ctx, p, night, 28, 44, 96, 80);
    drawPlant(ctx, p, 150, 216);
  }

  function drawBeach(ctx, p, night) {
    px(ctx, 0, 0, 360, 240, p.wall);
    px(ctx, 0, 226, 360, 74, p.floor);
    px(ctx, 0, 226, 360, 4, p.plank);
    for (let i = 0; i < 7; i++) px(ctx, i * 52 + 12, 232, 40, 3, p.plank);
    // 遮阳伞
    px(ctx, 262, 146, 6, 44, '#d8b87f');
    ctx.fillStyle = '#f2a35e';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(265, 132 - i * 6);
      ctx.lineTo(238 - i * 4, 132);
      ctx.lineTo(292 + i * 4, 132);
      ctx.closePath();
      ctx.fill();
    }
    px(ctx, 265, 128, 10, 6, '#fff');
    // 贝壳
    px(ctx, 222, 200, 10, 8, '#f2d9b8');
    px(ctx, 224, 196, 6, 6, '#f7e8d2');
    px(ctx, 304, 206, 8, 6, '#e8c9a8');
    // 海景窗
    drawWindow(ctx, p, night, 28, 44, 96, 80);
    if (!night) {
      // 窗外大海与帆船
      const wx = 30, wy = 46;
      px(ctx, wx + 2, wy + 38, 90, 34, '#7ec4d8');
      px(ctx, wx + 66, wy + 44, 12, 8, '#fff');
      px(ctx, wx + 70, wy + 36, 2, 18, '#6a4f33');
    }
    drawPlant(ctx, p, 150, 216);
    drawRug(ctx, p, 180, 224, 130, 52);
  }

  /* 小窝（宠物屋）绘制，放在宠物旁边 */
  function drawHouse(ctx, houseId, cx, cy, cell) {
    if (!houseId || !global.SPRITES) return;
    const S = global.SPRITES;
    const mapKey = { cloud: 'house_cloud', cabin: 'house_cabin', pod: 'house_pod' }[houseId];
    if (!mapKey) return;
    const built = S.buildPet ? null : null; // no-op
    S.drawIcon(ctx, mapKey, cx, cy, cell || 6);
  }

  function draw(ctx, w, h, themeId, night) {
    const p = P[themeId] || P.minimal;
    // AI 背景优先
    if (global.SPRITES && global.SPRITES.getAsset('rooms', themeId)) {
      const img = global.SPRITES.getAsset('rooms', themeId);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, 0, 0, w, h);
      return;
    }
    const painter = themeId === 'cute' ? drawCute
      : themeId === 'retro' ? drawRetro
      : themeId === 'forest' ? drawForest
      : themeId === 'beach' ? drawBeach
      : drawMinimal;
    painter(ctx, p, night);
  }

  global.ROOMS = { THEMES, P, draw, drawHouse };
  if (typeof module !== 'undefined' && module.exports) module.exports = { THEMES, P, draw, drawHouse };
})(typeof window !== 'undefined' ? window : globalThis);
