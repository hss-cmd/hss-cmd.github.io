/* 白底转透明 PNG 工具（sharp）
   用法: node remove_bg.js 输入.png 输出.png [阈值]
   阈值默认 240：RGB 三通道都 >= 阈值的像素视为背景
*/
const sharp = require(process.env.SHARP_PATH || 'C:/Users/ASUS/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const fs = require('fs');
const path = require('path');

async function main() {
  const [inPath, outPath, thrStr] = process.argv.slice(2);
  if (!inPath || !outPath) {
    console.log('用法: node remove_bg.js 输入.png 输出.png [阈值]');
    process.exit(1);
  }
  const threshold = thrStr ? parseInt(thrStr, 10) : 240;
  if (isNaN(threshold)) { console.error('阈值必须是数字'); process.exit(1); }
  const { data, info } = await sharp(inPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.from(data);
  let removed = 0;
  const soft = 28; // 边缘柔化范围
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const min = Math.min(r, g, b);
    if (min >= threshold) {
      out[i + 3] = 0;
      removed++;
    } else if (min >= threshold - soft) {
      out[i + 3] = Math.round(255 * (threshold - min) / soft);
      // 去白边（despill）：把残留白色向最近的彩色靠拢
      const k = 0.65;
      out[i] = Math.round(r * (1 - k) + Math.max(g, b) * k);
      out[i + 1] = Math.round(g * (1 - k) + Math.max(r, b) * k);
      out[i + 2] = Math.round(b * (1 - k) + Math.max(r, g) * k);
    }
  }
  await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toFile(outPath);
  const pct = (removed / (data.length / 4) * 100).toFixed(1);
  console.log('完成:', inPath, '->', outPath);
  console.log('尺寸:', info.width + 'x' + info.height, '| 移除背景像素:', removed, '(' + pct + '%)');
  console.log('提示: 打开输出图确认主体边缘干净；若主体内有白色空洞，降低阈值（如 230）。');
}
main().catch(e => { console.error('失败:', e.message); process.exit(1); });
