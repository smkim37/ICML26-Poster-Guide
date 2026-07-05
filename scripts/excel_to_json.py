#!/usr/bin/env python3
"""
excel_to_json.py — `data/ICML2026 Poster Guide.xlsx` → `src/data/posters.json`

사용법 (repo 루트에서):
    python3 scripts/excel_to_json.py

- 엑셀이 갱신되면(특히 "일정 미정" 논문의 세션 배정) 이 스크립트를 다시 실행하고
  data/*.xlsx 와 src/data/posters.json 을 함께 커밋한다.
- 기존 posters.json 이 있으면 세션이 바뀐 논문의 diff 를 출력한다.
- localStorage 는 OpenReview forum id 를 PK 로 쓰므로 재변환해도 사용자 데이터는 유지된다.

의존성: openpyxl (pip install openpyxl)
"""
import json
import re
import sys
from pathlib import Path
from urllib.parse import parse_qs, urlparse

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
XLSX = ROOT / "data" / "ICML2026 Poster Guide.xlsx"
OUT = ROOT / "src" / "data" / "posters.json"

# 시트명 → day id (None = 일정 미정)
SHEET_DAY = {
    "7.7 (화)": "tue",
    "7.8 (수)": "wed",
    "7.9 (목)": "thu",
    "일정 미정": None,
}
TIER_MAP = {"핵심": "core", "관련": "related", "참고": "reference"}
TYPE_MAP = {"Poster": "poster", "Spotlight": "spotlight", "Oral": "oral"}
INST_TYPES = {"학교", "학교+기업", "기업"}
DAY_ORDER = {"tue": 0, "wed": 1, "thu": 2, None: 3}


def session_id(raw: str | None) -> str | None:
    """'Poster Session 3' → 'PS3', 'Oral 1F ...' → 'ORAL1', '미정'/빈값 → None"""
    if not raw or raw.strip() == "미정":
        return None
    m = re.match(r"Poster Session (\d+)", raw.strip())
    if m:
        return f"PS{m.group(1)}"
    if raw.strip().startswith("Oral"):
        return "ORAL1"
    raise ValueError(f"알 수 없는 세션명: {raw!r}")


def openreview_id(url: str) -> str:
    qs = parse_qs(urlparse(url.strip()).query)
    ids = qs.get("id")
    if not ids or not ids[0]:
        raise ValueError(f"OpenReview URL에서 id 추출 실패: {url!r}")
    return ids[0]


def clean(v):
    if v is None:
        return None
    s = str(v).strip()
    return s if s else None


def parse_sheet(ws, day):
    """헤더 행(첫 셀이 '구분')을 찾고 그 다음 행부터 파싱한다."""
    rows = list(ws.iter_rows(values_only=True))
    header_idx = next(
        i for i, r in enumerate(rows) if clean(r[0]) == "구분"
    )
    papers = []
    for r in rows[header_idx + 1:]:
        if clean(r[6]) is None:  # 논문 제목 없으면 스킵
            continue
        tier_ko, sess, time_s, place, num_s, type_ko = (clean(r[i]) for i in range(6))
        title, intro, authors, affil_s, inst, subcat = (clean(r[i]) for i in range(6, 12))
        or_url, icml_url = clean(r[12]), clean(r[13])

        poster_num = None
        if num_s:
            m = re.fullmatch(r"#(\d+)", num_s)
            if not m:
                raise ValueError(f"포스터 번호 형식 오류: {num_s!r} ({title[:40]})")
            poster_num = int(m.group(1))

        papers.append({
            "id": openreview_id(or_url),
            "tier": TIER_MAP[tier_ko],
            "day": day,
            "session": session_id(sess),
            "posterNum": poster_num,
            "type": TYPE_MAP[type_ko],
            "title": title,
            "intro": intro,
            "authors": authors,
            "affiliations": [a.strip() for a in (affil_s or "").split(";") if a.strip()],
            "instType": inst,
            "subcategory": subcat,
            "openreview": or_url,
            "icmlUrl": icml_url,
        })
    return papers


def validate(papers):
    errors = []
    ids = [p["id"] for p in papers]
    if len(ids) != len(set(ids)):
        dup = sorted({i for i in ids if ids.count(i) > 1})
        errors.append(f"OpenReview id 중복: {dup}")
    for p in papers:
        t = p["title"][:40]
        if p["instType"] not in INST_TYPES:
            errors.append(f"기관유형 이상 {p['instType']!r}: {t}")
        if not p["intro"] or not p["authors"] or not p["affiliations"]:
            errors.append(f"소개/저자/소속 결측: {t}")
        if p["day"] is not None:  # 일정이 잡힌 논문은 세션 정보 필수
            if p["session"] is None:
                errors.append(f"배정 논문에 세션 없음: {t}")
            # 포스터 번호는 Oral(발표만)인 경우에만 없을 수 있음
            if p["posterNum"] is None and p["type"] != "oral":
                errors.append(f"포스터 번호 없음(oral 아님): {t}")
    if errors:
        print("\n[검증 실패]", file=sys.stderr)
        for e in errors:
            print(" -", e, file=sys.stderr)
        sys.exit(1)


def main():
    wb = openpyxl.load_workbook(XLSX, data_only=True)
    papers = []
    per_sheet = {}
    for sheet, day in SHEET_DAY.items():
        parsed = parse_sheet(wb[sheet], day)
        per_sheet[sheet] = len(parsed)
        papers.extend(parsed)

    papers.sort(key=lambda p: (
        DAY_ORDER[p["day"]],
        p["session"] or "ZZ",
        p["posterNum"] if p["posterNum"] is not None else 10**9,
        p["id"],
    ))
    validate(papers)

    # 기존 JSON과 세션 배정 diff (재수출 시 무엇이 바뀌었는지 확인용)
    if OUT.exists():
        old = {p["id"]: p for p in json.loads(OUT.read_text(encoding="utf-8"))}
        moved = [
            (p["title"][:50], old[p["id"]].get("session"), p["session"])
            for p in papers
            if p["id"] in old and old[p["id"]].get("session") != p["session"]
        ]
        if moved:
            print(f"\n[세션 변경 {len(moved)}편]")
            for title, a, b in moved:
                print(f"  {a or '미정'} → {b or '미정'} | {title}")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        json.dumps(papers, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    total = len(papers)
    tiers = {t: sum(1 for p in papers if p["tier"] == t) for t in ("core", "related", "reference")}
    days = {d: sum(1 for p in papers if p["day"] == d) for d in ("tue", "wed", "thu", None)}
    print(f"\n✓ {OUT.relative_to(ROOT)} 생성")
    print(f"  시트별: {per_sheet}")
    print(f"  총 {total}편 | 핵심 {tiers['core']} / 관련 {tiers['related']} / 참고 {tiers['reference']}")
    print(f"  화 {days['tue']} / 수 {days['wed']} / 목 {days['thu']} / 미정 {days[None]}")
    if total != 137:
        print(f"\n{'!' * 60}\n! 주의: 총 편수가 137이 아님 ({total}편) — 의도한 변경인지 확인 !\n{'!' * 60}")


if __name__ == "__main__":
    main()
