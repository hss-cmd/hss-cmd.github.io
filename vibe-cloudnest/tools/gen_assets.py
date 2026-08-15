# -*- coding: utf-8 -*-
"""
云端小窝 CloudNest · 像素素材生成器
=====================================
仅用 Python 标准库（zlib + struct）生成 PNG，无需 Pillow。

输出：
  assets/pets/{animal}-{stage}.png   7 种动物 x 3 成长阶段（共 21 张）
  assets/rooms/{theme}.png           5 套装修主题（简约/可爱/复古/森林/海边）

关键约定（与 js/sprites.js 对齐）：
  - 宠物基础毛色必须为 #e8a34f，游戏用 hue-rotate 染色成 8 种颜色
  - 房间主画面画布为 360x300（见 index.html homeCanvas）
"""
import os
import zlib
import struct

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PETS_DIR = os.path.join(ROOT, "assets", "pets")
ROOMS_DIR = os.path.join(ROOT, "assets", "rooms")

# ----------------------------------------------------------------------
# PNG 编码（RGBA, 8bit）
# ----------------------------------------------------------------------
def _chunk(tag, data):
    payload = tag + data
    crc = struct.pack(">I", zlib.crc32(payload) & 0xFFFFFFFF)
    return struct.pack(">I", len(data)) + payload + crc


def write_png(path, w, h, rgba):
    """rgba: 扁平 bytearray，长度 w*h*4。"""
    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)
    raw = bytearray()
    stride = w * 4
    for y in range(h):
        raw.append(0)  # filter: None
        raw += rgba[y * stride:(y + 1) * stride]
    idat = zlib.compress(bytes(raw), 9)
    with open(path, "wb") as f:
        f.write(sig)
        f.write(_chunk(b"IHDR", ihdr))
        f.write(_chunk(b"IDAT", idat))
        f.write(_chunk(b"IEND", b""))


def hexrgb(s):
    s = s.lstrip("#")
    return (int(s[0:2], 16), int(s[2:4], 16), int(s[4:6], 16))


# ----------------------------------------------------------------------
# 画布辅助：房间用固定 360x300 网格
# ----------------------------------------------------------------------
class Canvas:
    def __init__(self, w, h, bg=(0, 0, 0, 0)):
        self.w, self.h = w, h
        self.buf = [list(bg) for _ in range(w * h)]

    def px(self, x, y, w, h, color):
        r, g, b = color
        for yy in range(max(0, int(y)), min(self.h, int(y + h))):
            for xx in range(max(0, int(x)), min(self.w, int(x + w))):
                self.buf[yy * self.w + xx] = [r, g, b, 255]

    def px_a(self, x, y, w, h, color, alpha):
        """半透明覆盖（用于地毯高光）。"""
        r, g, b = color
        for yy in range(max(0, int(y)), min(self.h, int(y + h))):
            for xx in range(max(0, int(x)), min(self.w, int(x + w))):
                i = yy * self.w + xx
                dr, dg, db, _ = self.buf[i]
                self.buf[i] = [int(dr * (1 - alpha) + r * alpha),
                               int(dg * (1 - alpha) + g * alpha),
                               int(db * (1 - alpha) + b * alpha), 255]

    def to_rgba(self):
        out = bytearray()
        for c in self.buf:
            out += bytes(c)
        return out


# ======================================================================
# 一、宠物像素素材
# ======================================================================
# 基础调色板（所有动物共用）：毛色用 #e8a34f 作为 hue-rotate 的基准色。
BASE_PAL = {
    "f": "#e8a34f",  # 毛色主体（可染色）
    "F": "#c4772c",  # 毛色阴影
    "l": "#f8c37e",  # 毛色高光
    "w": "#fff6e8",  # 肚皮/口鼻 奶油白
    "p": "#f7a8c0",  # 耳内/腮红 粉
    "d": "#4a3322",  # 描边 深棕
    "e": "#2b1f15",  # 眼睛
    "E": "#ffffff",  # 高光点
    "n": "#c96b5a",  # 鼻子
    "m": "#7a4a33",  # 嘴巴
    "b": "#f2a33c",  # 喙（鸟/鸡）
    "B": "#ffd08a",  # 喙高光
}

# 像素地图（来自 js/sprites.js 的 MAPS）
MAPS = {
    "cat": [
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
        "...d........d...",
    ],
    "dog": [
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
        "...d........d...",
    ],
    "pig": [
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
        "...d........d...",
    ],
    "rabbit": [
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
        "...d........d...",
    ],
    "bird": [
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
        "................",
    ],
    "chick": [
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
        "...dd..dd.....",
    ],
    "fish": [
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
        ".................",
    ],
}

# 幼年体：取头部区域（x,y,w,h），与 HEAD_BOX 一致
HEAD_BOX = {
    "cat":    (3, 0, 11, 9),
    "dog":    (3, 0, 11, 9),
    "pig":    (2, 0, 12, 8),
    "rabbit": (3, 0, 11, 8),
    "bird":   (4, 0, 9, 9),
    "chick":  (2, 0, 10, 9),
    "fish":   (2, 0, 9, 9),
}

ANIMALS = ["cat", "dog", "pig", "rabbit", "bird", "chick", "fish"]
CELL = 8  # 每个像素格的放大倍数


def crop_map(rows, x, y, w, h):
    return [row[x:x + w] for row in rows[y:y + h]]


def trim_map(rows):
    """去掉四周透明边界，得到紧凑包围盒。"""
    ys = [i for i, r in enumerate(rows) if any(c != "." for c in r)]
    if not ys:
        return []
    top, bottom = ys[0], ys[-1]
    xs = []
    for r in rows:
        for i, c in enumerate(r):
            if c != ".":
                xs.append(i)
    left, right = min(xs), max(xs)
    return [r[left:right + 1] for r in rows[top:bottom + 1]]


def render_sprite(rows, out_path):
    rows = trim_map(rows)
    h = len(rows)
    w = max(len(r) for r in rows)
    pal = {k: hexrgb(v) for k, v in BASE_PAL.items()}
    # 透明底
    buf = bytearray([0, 0, 0, 0]) * (w * CELL * h * CELL)
    full_w = w * CELL
    for y, row in enumerate(rows):
        for x, ch in enumerate(row):
            if ch == "." or ch not in pal:
                continue
            r, g, b = pal[ch]
            for dy in range(CELL):
                for dx in range(CELL):
                    i = ((y * CELL + dy) * full_w + (x * CELL + dx)) * 4
                    buf[i] = r
                    buf[i + 1] = g
                    buf[i + 2] = b
                    buf[i + 3] = 255
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    write_png(out_path, full_w, h * CELL, buf)
    return full_w, h * CELL


def generate_pets():
    made = []
    for a in ANIMALS:
        full = MAPS[a]
        # 阶段 0：幼年（头部特写）
        bx, by, bw, bh = HEAD_BOX[a]
        head = crop_map(full, bx, by, bw, bh)
        p0 = os.path.join(PETS_DIR, f"{a}-0.png")
        made.append(render_sprite(head, p0))
        # 阶段 1：青年（全身）
        p1 = os.path.join(PETS_DIR, f"{a}-1.png")
        made.append(render_sprite(full, p1))
        # 阶段 2：成年（全身）
        p2 = os.path.join(PETS_DIR, f"{a}-2.png")
        made.append(render_sprite(full, p2))
    return made


# ======================================================================
# 二、房间场景像素素材（360x300，白天版本）
# ======================================================================
ROOM_PAL = {
    "minimal": dict(wall="#f2eee4", wall2="#e7e0d2", floor="#d8c8a8", plank="#c0ac88",
                    wood="#a98f67", accent="#7aa98d", rug="#c7d8cb", rugLine="#a9c0b0",
                    sky="#a9d4ef", skyNight="#24344f", sofa="#e8e4da", sofaDark="#c9c4b8",
                    plant="#7ba05f", window="#f7f4ec"),
    "cute":    dict(wall="#ffe9f0", wall2="#ffd9e5", floor="#f2cfd8", plank="#e2b5c2",
                    wood="#d9aab6", accent="#ff9ec3", rug="#ffd1e3", rugLine="#f3aac7",
                    sky="#bfe3f2", skyNight="#3a3358", sofa="#ffc2d6", sofaDark="#e8a0ba",
                    plant="#9ecf9a", window="#fff6f9"),
    "retro":   dict(wall="#ecd3a3", wall2="#dfbd87", floor="#c98d52", plank="#a86f3a",
                    wood="#8a5a3a", accent="#d9a066", rug="#b56a5a", rugLine="#94503f",
                    sky="#f2c98a", skyNight="#4a3a5a", sofa="#a86a4a", sofaDark="#8a5338",
                    plant="#6f9a4f", window="#f5e7cd"),
    "forest":  dict(wall="#dce8cf", wall2="#c6d9b4", floor="#b08a5e", plank="#8f6d45",
                    wood="#6f5336", accent="#7ba05f", rug="#a9c8a2", rugLine="#84a87c",
                    sky="#bfe3d2", skyNight="#2f3f55", sofa="#8fae78", sofaDark="#6f8f5a",
                    plant="#5f8a48", window="#eef6e4"),
    "beach":   dict(wall="#dff2f7", wall2="#c9e7ef", floor="#ecd3a0", plank="#d8b87f",
                    wood="#b08a5e", accent="#7ec4d8", rug="#f4d9a8", rugLine="#dfbb7f",
                    sky="#bfe8f5", skyNight="#3a4a66", sofa="#8fc7d8", sofaDark="#6aa5b8",
                    plant="#7ba05f", window="#eaf9fc"),
}


def c(hexstr):
    return hexrgb(hexstr)


def draw_window(cv, p, x, y, w, h, night=False):
    cv.px(x - 5, y - 5, w + 10, h + 10, c(p["wood"]))
    cv.px(x, y, w, h, c(p["skyNight"] if night else p["sky"]))
    if night:
        for sx, sy in [(x + 18, y + 14), (x + 44, y + 34), (x + 70, y + 18)]:
            cv.px(sx, sy, 2, 2, (255, 255, 255))
        cv.px(x + w - 28, y + 8, 16, 16, (245, 233, 168))
        cv.px(x + w - 24, y + 8, 6, 6, (0, 0, 0))
    else:
        for (cx, cy, cw, ch) in [(x + 14, y + 12, 22, 8), (x + 24, y + 8, 16, 12),
                                 (x + 44, y + 30, 26, 8), (x + 58, y + 26, 16, 12)]:
            cv.px(cx, cy, cw, ch, (255, 255, 255))
    cv.px(x + w // 2 - 2, y, 4, h, c(p["window"]))
    cv.px(x, y + h // 2 - 2, w, 4, c(p["window"]))
    cv.px(x - 5, y + h, w + 10, 5, c(p["wood"]))
    cv.px(x - 10, y - 5, 5, h + 15, c(p["accent"]))
    cv.px(x + w + 5, y - 5, 5, h + 15, c(p["accent"]))
    cv.px(x - 10, y - 8, w + 25, 5, c(p["accent"]))


def draw_rug(cv, p, cx, cy, w, h):
    cv.px(cx - w // 2, cy - h // 2, w, h, c(p["rug"]))
    cv.px_a(cx - w // 2 + 6, cy - h // 2 + 6, w - 12, h - 12, (255, 255, 255), 0.25)
    cv.px(cx - w // 2 + 2, cy - h // 2 + 2, w - 4, 4, c(p["rugLine"]))
    cv.px(cx - w // 2 + 2, cy + h // 2 - 6, w - 4, 4, c(p["rugLine"]))


def draw_plant(cv, p, x, y):
    cv.px(x, y, 34, 8, (138, 106, 74))
    cv.px(x + 4, y - 4, 26, 6, (154, 122, 85))
    cv.px(x + 14, y - 16, 6, 14, c(p["plant"]))
    cv.px(x + 6, y - 22, 12, 10, c(p["plant"]))
    cv.px(x + 20, y - 26, 14, 12, (95, 138, 72))
    cv.px(x + 24, y - 18, 10, 10, c(p["plant"]))


def _base_floor(cv, p):
    cv.px(0, 0, 360, 300, c(p["wall"]))
    cv.px(0, 226, 360, 74, c(p["floor"]))
    cv.px(0, 226, 360, 4, c(p["plank"]))


def room_minimal(cv, p):
    _base_floor(cv, p)
    for i in range(6):
        cv.px(i * 62 + 30, 230, 60, 2, c(p["plank"]))
    cv.px(250, 48, 56, 46, c(p["window"]))
    cv.px(254, 52, 48, 38, c(p["accent"]))
    cv.px(272, 60, 12, 10, c(p["wall"]))
    cv.px(262, 82, 30, 8, c(p["wood"]))
    cv.px(216, 172, 120, 58, c(p["sofa"]))
    cv.px(222, 162, 108, 16, c(p["sofa"]))
    cv.px(230, 224, 18, 8, c(p["sofaDark"]))
    cv.px(306, 224, 18, 8, c(p["sofaDark"]))
    cv.px(222, 162, 8, 30, c(p["sofaDark"]))
    cv.px(322, 162, 8, 30, c(p["sofaDark"]))
    draw_window(cv, p, 28, 48, 96, 76)
    draw_plant(cv, p, 150, 216)
    draw_rug(cv, p, 180, 224, 130, 52)


def room_cute(cv, p):
    _base_floor(cv, p)
    for i in range(6):
        cv.px(i * 62 + 30, 230, 60, 2, c(p["plank"]))
    # 气球
    cv.px(260, 36, 22, 26, (255, 158, 195))
    cv.px(302, 52, 18, 22, (255, 215, 122))
    cv.px(270, 60, 1, 26, (201, 139, 160))
    cv.px(310, 72, 1, 18, (201, 163, 95))
    # 架子
    cv.px(228, 120, 100, 110, c(p["wood"]))
    for sy in [124, 158, 192]:
        cv.px(232, sy, 92, 26, (255, 246, 249))
    # 架子上爱心
    for (hx, hy) in [(244, 130), (262, 130), (280, 130), (246, 166), (268, 166), (290, 166), (252, 200), (276, 200)]:
        cv.px(hx, hy + 3, 4, 4, (247, 106, 138))
        cv.px(hx + 3, hy + 3, 4, 4, (247, 106, 138))
        cv.px(hx + 1, hy, 4, 4, (247, 106, 138))
        cv.px(hx, hy + 1, 6, 4, (247, 106, 138))
    draw_window(cv, p, 28, 48, 96, 76)
    draw_plant(cv, p, 150, 216)
    draw_rug(cv, p, 180, 224, 130, 52)


def room_retro(cv, p):
    cv.px(0, 0, 360, 300, c(p["wall"]))
    for y in range(0, 240, 16):
        cv.px(0, y, 360, 4, c(p["wall2"]))
    # 棋盘格地板
    for y in range(226, 300, 18):
        for x in range(0, 360, 18):
            color = c(p["floor"]) if ((x // 18 + y // 18) % 2 == 0) else (181, 121, 64)
            cv.px(x, y, 18, 18, color)
    cv.px(0, 226, 360, 4, c(p["plank"]))
    # 老电视
    cv.px(232, 130, 96, 74, c(p["wood"]))
    cv.px(242, 140, 76, 52, (143, 183, 216))
    cv.px(258, 152, 14, 10, (255, 255, 255))
    cv.px(282, 152, 10, 10, (255, 255, 255))
    cv.px(252, 172, 22, 10, (255, 255, 255))
    cv.px(268, 196, 10, 14, c(p["wood"]))
    cv.px(262, 210, 22, 6, c(p["wood"]))
    cv.px(232, 204, 96, 6, c(p["wood"]))
    # 壁炉/柜子
    cv.px(60, 190, 56, 36, c(p["wood"]))
    cv.px(68, 198, 40, 20, (58, 44, 34))
    cv.px(80, 202, 16, 16, (232, 185, 119))
    cv.px(86, 208, 4, 4, (58, 44, 34))
    draw_window(cv, p, 150, 44, 74, 64)
    draw_plant(cv, p, 300, 216)
    draw_rug(cv, p, 180, 224, 130, 52)


def room_forest(cv, p):
    _base_floor(cv, p)
    for y in range(0, 240, 20):
        cv.px(0, y, 360, 3, c(p["wall2"]))
    for i in range(5):
        cv.px(i * 76 + 20, 232, 56, 3, c(p["plank"]))
    # 蘑菇灯
    cv.px(250, 150, 40, 8, (138, 106, 74))
    cv.px(262, 128, 16, 26, (232, 224, 208))
    cv.px(254, 120, 32, 12, (217, 122, 106))
    cv.px(262, 118, 16, 6, (242, 216, 200))
    cv.px(258, 124, 4, 3, (255, 255, 255))
    cv.px(270, 124, 4, 3, (255, 255, 255))
    # 树形壁饰
    cv.px(210, 52, 10, 34, (111, 83, 54))
    cv.px(196, 34, 38, 24, (123, 160, 95))
    cv.px(204, 24, 22, 14, (143, 174, 120))
    draw_rug(cv, p, 180, 224, 130, 52)
    draw_window(cv, p, 28, 44, 96, 80)
    draw_plant(cv, p, 150, 216)


def room_beach(cv, p):
    _base_floor(cv, p)
    for i in range(7):
        cv.px(i * 52 + 12, 232, 40, 3, c(p["plank"]))
    # 遮阳伞
    cv.px(262, 146, 6, 44, c(p["plank"]))
    for i in range(5):
        y = 132 - i * 6
        left = 238 - i * 4
        right = 292 + i * 4
        cv.px(left, y, right - left, 6, (242, 163, 94))
    cv.px(265, 128, 10, 6, (255, 255, 255))
    # 贝壳
    cv.px(222, 200, 10, 8, (242, 217, 184))
    cv.px(224, 196, 6, 6, (247, 232, 210))
    cv.px(304, 206, 8, 6, (232, 201, 168))
    # 海景窗
    draw_window(cv, p, 28, 44, 96, 80)
    cv.px(32, 84, 90, 34, (126, 196, 216))
    cv.px(96, 90, 12, 8, (255, 255, 255))
    cv.px(98, 82, 2, 18, (106, 79, 51))
    draw_plant(cv, p, 150, 216)
    draw_rug(cv, p, 180, 224, 130, 52)


ROOM_PAINTERS = {
    "minimal": room_minimal,
    "cute": room_cute,
    "retro": room_retro,
    "forest": room_forest,
    "beach": room_beach,
}


def generate_rooms():
    made = []
    for theme, painter in ROOM_PAINTERS.items():
        cv = Canvas(360, 300)
        painter(cv, ROOM_PAL[theme])
        out = os.path.join(ROOMS_DIR, f"{theme}.png")
        os.makedirs(os.path.dirname(out), exist_ok=True)
        write_png(out, 360, 300, cv.to_rgba())
        made.append((out, 360, 300))
    return made


# ======================================================================
def main():
    print("生成宠物素材 ...")
    for path_size in generate_pets():
        print("  ", path_size)
    print("生成房间场景 ...")
    for (out, w, h) in generate_rooms():
        print(f"  {out}  ({w}x{h})")
    print("完成。")


if __name__ == "__main__":
    main()
