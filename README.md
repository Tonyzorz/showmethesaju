# showmethesaju.com

Static multilingual saju site (Astro 4). See PLAN.md for the full spec and phase checklists.

## Quickstart
```bash
npm install
npm run dev        # local dev at localhost:4321
npm run build      # static output in dist/
```

## Deploy (GitHub Pages)
1. Push this repo to GitHub (`main` branch).
2. Repo Settings → Pages → Source: **GitHub Actions**. The included workflow (.github/workflows/deploy.yml) deploys on every push.
3. DNS: point `showmethesaju.com` A records to GitHub Pages IPs; `public/CNAME` is already set. Enforce HTTPS in settings.

## What's implemented (≈ Phases 0–4 of PLAN.md)
- 11-locale path routing (`/ko/ … /th/`) with English fallback + hreflang/x-default + canonical
- Landing with birth form: solar/lunar (+leap month) via korean-lunar-calendar, time-unknown,
  birth-city picker with DST-correct timezone resolution (browser tz default), 진태양시 option
- Client-side saju engine (src/lib/saju-engine.ts): exact day pillar, astronomical 입춘/절기,
  십성, element counts — verified against anchors; **run the KASI verification in PLAN.md §7.5 before launch**
- Reading page: 사주단자 pillar cards, element bars, ten-gods table, day-master text slots,
  term-boundary warning, copy-URL share, PNG share-card export, noindex
- Glossary (12 terms + FAQPage JSON-LD), compatibility teaser, about, privacy, localized-ready 404,
  root language redirect, sitemap excluding /reading, GitHub Actions deploy

## Before launch — search for `TODO` and `REPLACE_ME`
- Formspree/Buttondown endpoint (landing + compatibility waitlists)
- Smart Store + Kakao booking URLs (Base footer, About)
- Mom's story/photo on About; 10 day-master texts in src/i18n/{ko,en}.json (`reading.dm.*` are placeholders)
- Self-host fonts (currently CDN), per-locale OG images, analytics script
- PLAN.md Phase 4 checklist: 20+ KASI 만세력 verifications + 5 foreign birthplaces
