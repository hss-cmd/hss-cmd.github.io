# -*- coding: utf-8 -*-
"""
云端小窝 CloudNest · OpenAI AI 生图素材生成器
================================================
用 OpenAI gpt-image-1 生成宠物与房间素材，直接落到 assets/ 正确路径。

依赖：仅标准库（urllib），无需 requests / Pillow。

使用方法
--------
1) 设置 API key（三选一）：
   - 命令行临时：  export OPENAI_API_KEY=sk-YOUR_OPENAI_API_KEY
   - 项目根目录建 .env 文件：  OPENAI_API_KEY=sk-YOUR_OPENAI_API_KEY
   - 直接传参：      python tools/gen_ai_assets.py --key sk-xxx

2) 先小成本试一张，确认风格与 key 都 OK：
   python tools/gen_ai_assets.py --only cat

3) 满意后再全量生成：
   python tools/gen_ai_assets.py

其他参数：
   --force        覆盖已存在的文件（默认跳过已生成的）
   --only cat     只生成某只动物（cat/dog/pig/rabbit/bird/chick/fish）
   --only room:minimal  只生成某主题（minimal/cute/retro/forest/beach）
   --dry-run      不调用 API，只打印将生成的清单与提示词
   --model xxx    覆盖模型（默认 gpt-image-1）

成本参考：gpt-image-1 单张约几美分，全量 19 张通常 1~3 美元以内。
"""
import os
import sys
import json
import time
import base64
import argparse
import urllib.request
import urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PETS_DIR = os.path.join(ROOT, "assets", "pets")
ROOMS_DIR = os.path.join(ROOT, "assets", "rooms")

MODEL = "gpt-image-1"
PET_SIZE = "1024x1024"
ROOM_SIZE = "1536x1024"
QUALITY = "medium"          # low / medium / high

# ----------------------------------------------------------------------
# 提示词
# ----------------------------------------------------------------------
# 关键约定：宠物用「橙色底 + 白肚皮 + 深色描边」的平涂贴纸风，
# 游戏用 hue-rotate 染色成 8 种颜色，所以不能有渐变/复杂光影。
PET_STYLE = (
    "Flat 2D kawaii pet sticker, thick clean dark-brown outline, flat cel-shaded "
    "colors with minimal soft two-tone shading, NO gradients, NO textures, NO 3D, "
    "NO photorealism. Solid warm apricot-orange (#e8a34f) body with a cream-white "
    "belly and muzzle, simple round dark eyes with a small white highlight, cute "
    "and friendly. Fully centered, full body, facing forward, isolated on a "
    "transparent background, no text, no watermark, no shadow."
)

BABY_PREFIX = (
    "Chibi baby version with an oversized round head, tiny body and extra-large "
    "sparkling eyes: "
)

ANIMALS = {
    "cat":    "a small cat with two pointy ears, pink inner ears and a long tail",
    "dog":    "a small puppy with floppy ears and a short tail",
    "pig":    "a round piglet with two tiny ears and a curly tail",
    "rabbit": "a rabbit with two long upright ears and a fluffy tail",
    "bird":   "a small round songbird with folded wings and a short orange beak",
    "chick":  "a round fluffy baby chick with a small orange beak",
    "fish":   "a small round fish with side fins and a fan tail",
}

ROOM_STYLE = (
    "Cozy 2D flat-illustration interior, soft pastel palette, clean simple shapes, "
    "gentle cel-shading, warm and healing mood, no text, no watermark, no people, "
    "no characters."
)

ROOMS = {
    "minimal": "minimalist modern living room: cream-white wall, light wood floor, one small potted green plant, a simple sofa, a large window with soft daylight",
    "cute":    "kawaii pink bedroom: pastel pink walls, pastel balloons, a white shelf holding heart plushies, a fluffy pink rug, soft daylight",
    "retro":   "cozy retro living room: warm beige wall, brown checkered floor, an old-fashioned TV on a wooden stand, a small wooden cabinet, warm nostalgic light",
    "forest":  "cozy forest cabin: soft green wall, a glowing mushroom lamp, tree-silhouette wall art, a moss-green rug, wood floor, warm natural light",
    "beach":   "beach house room: light sky-blue wall, a striped beach umbrella in a corner, seashells on the floor, a window showing the sea, bright seaside light",
}


# ----------------------------------------------------------------------
# OpenAI 调用
# ----------------------------------------------------------------------
def generate_image(key, prompt, size, transparent, model=MODEL, quality=QUALITY):
    url = "https://api.openai.com/v1/images/generations"
    body = {
        "model": model,
        "prompt": prompt,
        "n": 1,
        "size": size,
        "quality": quality,
        "output_format": "png",
        "background": "transparent" if transparent else "opaque",
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=600) as resp:
        data = json.loads(resp.read().decode("utf-8"))

    item = data["data"][0]
    if "b64_json" in item and item["b64_json"]:
        return base64.b64decode(item["b64_json"])
    if "url" in item and item["url"]:
        with urllib.request.urlopen(item["url"], timeout=600) as r:
            return r.read()
    raise RuntimeError("响应里既没有 b64_json 也没有 url: " + json.dumps(data)[:300])


def load_key(args):
    if args.key:
        return args.key
    if os.environ.get("OPENAI_API_KEY"):
        return os.environ["OPENAI_API_KEY"]
    env_file = os.path.join(ROOT, ".env")
    if os.path.exists(env_file):
        for line in open(env_file, encoding="utf-8"):
            line = line.strip()
            if line.startswith("OPENAI_API_KEY="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    print("未找到 OPENAI_API_KEY。请用 --key 传入，或设置环境变量，或在项目根目录建 .env 文件。")
    sys.exit(1)


def save_bytes(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        f.write(data)
    print(f"  ✓ {os.path.relpath(path, ROOT)}  ({len(data)} bytes)")


# ----------------------------------------------------------------------
# 主流程
# ----------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser(description="OpenAI AI 生图素材生成器")
    ap.add_argument("--key", help="OpenAI API key")
    ap.add_argument("--force", action="store_true", help="覆盖已存在的文件")
    ap.add_argument("--only", help="只生成某个：cat / dog / ... 或 room:minimal")
    ap.add_argument("--dry-run", action="store_true", help="只打印清单，不调用 API")
    ap.add_argument("--model", default=MODEL, help="模型名（默认 gpt-image-1）")
    args = ap.parse_args()

    # 组装任务清单：(输出路径, 提示词, 尺寸, 是否透明)
    jobs = []
    for a, noun in ANIMALS.items():
        if args.only and args.only != a:
            continue
        # 阶段 0：幼年（大头萌版）
        jobs.append((os.path.join(PETS_DIR, f"{a}-0.png"),
                     BABY_PREFIX + noun + ". " + PET_STYLE, PET_SIZE, True))
        # 阶段 1/2：成年全身（游戏会把阶段 1 缩得更小）
        jobs.append((os.path.join(PETS_DIR, f"{a}-2.png"),
                     noun + ". " + PET_STYLE, PET_SIZE, True))
    for t, desc in ROOMS.items():
        tag = f"room:{t}"
        if args.only and args.only not in (t, tag):
            continue
        jobs.append((os.path.join(ROOMS_DIR, f"{t}.png"),
                     desc + ". " + ROOM_STYLE, ROOM_SIZE, False))

    if args.dry_run:
        print(f"将生成 {len(jobs)} 张图（模型 {args.model}）：\n")
        for path, prompt, size, trans in jobs:
            print(f"- {os.path.basename(path)}  ({size}, {'透明' if trans else '不透明'})")
            print(f"    {prompt[:120]}...\n")
        return

    key = load_key(args)

    for path, prompt, size, trans in jobs:
        # 阶段 1 复用阶段 2 的成年图
        if path.endswith("-2.png"):
            adult_src = path
            stage1_path = path.replace("-2.png", "-1.png")
        else:
            adult_src = stage1_path = None

        if os.path.exists(path) and not args.force:
            print(f"  · 跳过 {os.path.basename(path)}（已存在）")
            if stage1_path and os.path.exists(stage1_path):
                print(f"  · 跳过 {os.path.basename(stage1_path)}（已存在）")
            elif stage1_path:
                # 成年图已存在但阶段1缺失：复制过去
                data = open(path, "rb").read()
                save_bytes(stage1_path, data)
            continue

        print(f"  生成 {os.path.basename(path)} ...")
        try:
            data = generate_image(key, prompt, size, trans, model=args.model)
            save_bytes(path, data)
            if stage1_path:
                save_bytes(stage1_path, data)  # 阶段1与成年同图
            time.sleep(1.5)
        except urllib.error.HTTPError as e:
            print(f"  ✗ {os.path.basename(path)} 失败: HTTP {e.code}")
            print("    " + (e.read().decode("utf-8", "ignore")[:400]))
        except Exception as e:
            print(f"  ✗ {os.path.basename(path)} 失败: {e}")

    print("完成。")


if __name__ == "__main__":
    main()
