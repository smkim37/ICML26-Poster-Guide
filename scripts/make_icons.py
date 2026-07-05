#!/usr/bin/env python3
"""
make_icons.py — PWA 아이콘 생성 (1회 실행 후 public/icons/ 커밋)

사용법: python3 scripts/make_icons.py   (의존성: Pillow)

디자인: 다크 슬레이트 라운드 사각형 + 'ICML' / '26' 화이트 텍스트.
폰트는 시스템 DejaVu Sans Bold(리눅스 기본) 사용 — 재현 가능, 디자인툴 불필요.
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "icons"
OUT.mkdir(parents=True, exist_ok=True)

BG = (24, 24, 27)        # zinc-900
FG = (255, 255, 255)
ACCENT = (139, 159, 232) # accent-dark #8B9FE8


def find_font(size: int) -> ImageFont.FreeTypeFont:
    for path in [
        "/usr/share/fonts/dejavu-sans-fonts/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf",
    ]:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    raise SystemExit("DejaVuSans-Bold.ttf 를 찾을 수 없음 — 폰트 경로를 추가하세요")


def draw_icon(size: int, *, maskable: bool) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # maskable은 풀블리드(iOS/안드로이드가 자체 마스킹), 일반은 라운드 사각형
    radius = 0 if maskable else round(size * 0.22)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=BG)

    # 텍스트: 'ICML' 위, '26' 아래 (safe zone 80% 안)
    f1 = find_font(round(size * 0.24))
    f2 = find_font(round(size * 0.30))
    b1 = d.textbbox((0, 0), "ICML", font=f1)
    b2 = d.textbbox((0, 0), "26", font=f2)
    h1, h2 = b1[3] - b1[1], b2[3] - b2[1]
    gap = round(size * 0.05)
    top = (size - (h1 + gap + h2)) / 2
    d.text(((size - (b1[2] - b1[0])) / 2 - b1[0], top - b1[1]), "ICML", font=f1, fill=FG)
    d.text(
        ((size - (b2[2] - b2[0])) / 2 - b2[0], top + h1 + gap - b2[1]),
        "26", font=f2, fill=ACCENT,
    )
    return img


def save(img: Image.Image, name: str) -> None:
    path = OUT / name
    img.save(path, "PNG")
    print(f"✓ {path.relative_to(ROOT)} ({img.width}x{img.height})")


save(draw_icon(180, maskable=False), "apple-touch-icon.png")
save(draw_icon(192, maskable=False), "icon-192.png")
save(draw_icon(512, maskable=False), "icon-512.png")
save(draw_icon(512, maskable=True), "icon-512-maskable.png")
