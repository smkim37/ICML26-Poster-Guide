# 06 — 배포 (GitHub Pages via Actions)

## 1. 1회 수동 설정 (사용자 or 안내)

GitHub repo **Settings → Pages → Build and deployment → Source: "GitHub Actions"** 선택. 이거 안 하면 워크플로가 성공해도 사이트가 안 뜬다.

## 2. `.github/workflows/deploy.yml` (verbatim — Phase 1에서 커밋)

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- CI에 Python 없음 — `posters.json`은 로컬에서 생성해 커밋하는 산출물이다.
- `npm ci`는 `package-lock.json` 필수 — 스캐폴드 후 lock 파일을 반드시 커밋.

## 3. 배포 확인 절차 (Phase 1 acceptance)

1. push → Actions 탭에서 build/deploy 두 잡 green
2. https://smkim37.github.io/ICML26-Poster-Guide/ 접속 → 렌더 확인
3. DevTools Network: 404 자산 0개 (404가 있으면 docs/02 R1 — base path 문제)

## 4. 트러블슈팅

| 증상 | 원인/조치 |
|---|---|
| 사이트 404 | Pages Source가 "GitHub Actions"인지 확인 (§1) |
| 백지 + 콘솔에 JS 404 | `vite.config.ts`의 `base` 누락/오타 |
| 로고만 깨짐 | `/`로 시작하는 절대 경로 사용 — `import.meta.env.BASE_URL` 로 수정 |
| Actions 실패: npm ci | package-lock.json 미커밋 |
| 배포됐는데 안 바뀜 (Phase 6 이후) | SW autoUpdate는 다음 실행에 반영 — 탭 완전 종료 후 재접속. 그래도면 docs/02 R3 |
