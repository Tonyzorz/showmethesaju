# showmethesaju.com — Static Web Master Plan (v2)

Phase 1 scope: fully static site on GitHub Pages. No server, no accounts, no payments, no AI calls.
v2 adds: market research findings, dual-audience (KR + global) UX principles, differentiation strategy,
sharper page specs, keyword/SEO strategy per market, and updated phase checklists.

---

## 0. Market snapshot (researched 2026-07, informs every decision below)

**Korea (validation + saturation):**
- 점신: ~17M cumulative downloads, ~790k MAU; 포스텔러: ~7.5M members, ~630k MAU. Both growing ~8–12%/mo.
- 65%+ of 점신 users are in their 20s–30s. Young Koreans also just ask ChatGPT/Gemini for saju directly.
- Anxiety-driven usage ("보면 불안이 해소된다"). Apps are ad-heavy (점신 sells an ad-removal "행운패스").
- 점신 already sells fortune goods in-app and runs reward gimmicks → mom's goods idea is validated, not unique.
- AI saju apps (도사 etc.) market "±1분 정밀 계산, 진태양시·절기·자시 보정" as a credibility feature.
→ Conclusion: do NOT compete head-on in Korean daily-fortune breadth. Compete on: no ads, no sign-up,
  beautiful/shareable, accurate 만세력, and a real human master (mom) behind it.

**Global (window of opportunity, but not empty):**
- K-content is actively driving saju curiosity abroad (Netflix's K-Pop Demon Hunters ritual aesthetics; the
  "Battle of Fates" fate-reader show; saju cafés in Hongdae/Myeongdong serving foreigners via Creatrip etc.).
- Foreign clients ask the same things Koreans do: career, love, marriage, money. Americans are the largest group.
- Westerners are less familiar with the format; readers report needing a more indirect, explanatory approach.
- Framings that land in English media: "Korea's answer to the natal chart", "a spiritual DNA report",
  "big data accumulated over millennia", "far more granular than 12 star signs".
- English competitors already exist:
  | Competitor | Model | Weakness we exploit |
  |---|---|---|
  | Sajumuse | Premium human-written 90-page reports | Paid-first; no free depth; no Korean-culture content hub |
  | Sajugazer | Free browser calculator (십성/신살/12운성) | Utility only; no human master, no story, no goods |
  | Cheonmyeongdang | 9-language freemium readings | Salesy landing; sign-up/payment pressure |
  | GoldSaju | AI readings + AI talisman | AI-generated talismans ≠ authentic goods |
  | K-Saju Guide (app) | Multi-language calculator app | App-store only; not a content/SEO play |
→ Conclusion: the open lane = **free, no-sign-up, privacy-absolute, culturally rich, mom-as-real-master,
  authentic physical goods**. Nobody combines all of these.

**Our differentiators (say these on the landing page, in this order):**
1. Free chart, no sign-up, **your birth data never leaves your device** (everything computes in-browser —
   uniquely true for us because we're static; every competitor collects birth data).
2. Built with a practicing Korean saju master (mom = face of authenticity; photo + story).
3. Made for your timezone — foreign births handled correctly in local time (competitors often assume KST).
4. Authentic Korean goods (real 부적/원석, not AI-generated talisman PNGs).

---

## 1. Goals & non-goals

**Goals**
- Free client-side 사주명식 calculator as the traffic engine, correct for ANY birthplace/timezone
- Dual-audience from day one: Korean users (Naver) + global users (Google), architecture for 11 locales
- Funnels: email waitlist → future AI readings; Smart Store (goods); booking (mom's live readings)
- Every fortune-adjacent claim wrapped in the "cultural tradition / self-reflection" register, not medical/financial advice

**Non-goals (Phase 2+, do not build now)**
- AI interpretation (serverless later), payments, accounts, native app (Capacitor later)
- 궁합 engine, 대운/세운 timeline, 신살/12운성 (engine expansions listed in §7.4)

---

## 2. Tech stack (unchanged from v1)

Astro 4 static output · plain CSS tokens · TypeScript engine (provided) · `korean-lunar-calendar` for 음력 input ·
GitHub Pages + Actions · Plausible analytics · Formspree/Buttondown waitlist.

---

## 3. Folder structure (v1 + additions marked ★)

```
src/
├── i18n/  locales.ts + 11 json files + t.ts
├── lib/
│   ├── saju-engine.ts          # PROVIDED
│   ├── cities.ts               # ★ static city → {tz offset rule, longitude} dataset (top ~300 cities)
│   └── share-card.ts           # ★ client-side canvas PNG export of the result card
├── styles/tokens.css           # PROVIDED
├── components/
│   ├── Header / LangSwitcher / Footer
│   ├── BirthForm.astro
│   ├── PillarCard.astro
│   ├── Glossary.astro          # ★ tooltip term component (see §5.2)
│   └── ShareCard.astro         # ★
└── pages/[lang]/ index · reading · compatibility · learn/ · about · glossary ★ · privacy · 404
```

★ cities.ts: ship a small static JSON (city name, IANA tz, longitude). Timezone offset resolution at runtime via
`Intl.DateTimeFormat(..., {timeZone})` — handles historical DST correctly without shipping tz databases.
Default: browser timezone; the picker is for "born elsewhere".

---

## 4. Locales & language strategy

`ko en ja zh-cn zh-tw es fr de pt vi th` — launch polish: ko + en. Others render with en fallback.

- Fortune/interpretation namespace (`reading.*`) = human-translated only, per locale, before that locale "launches".
- **Terminology policy (critical for foreigners):** every technical term appears as
  *English name + romanization + hanja* on first use: "Day Master (ilgan, 日干)". Korean UI shows 한글(한자).
  Never hanja-only anywhere a foreigner can land.
- Romanization: Revised Romanization, consistent everywhere (ilgan, sipseong, sinsal, gunghap, ohaeng).
- ko locale tone: 해요체, warm but efficient (users compare against slick apps).
  en locale tone: curious, explanatory, zero mysticism-kitsch; the "Korea's natal chart" register.

---

## 5. Dual-audience UX principles

### 5.1 For Koreans
- Credibility = correct 만세력. Show the full 명식 (년/월/일/시, 한자+한글, 십성) prominently — Korean users
  can spot a wrong 만세력 instantly and will screenshot-roast it.
- 진태양시/야자시 options visible (advanced accordion) — signals "우리 만세력 진짜다" to knowledgeable users.
- KakaoTalk share button on results (Kakao share works with a plain URL scheme — no SDK needed for static).
- No ads, no sign-up = state it. Korean fortune apps exhaust users with ads; this is a spoken differentiator.
- Naver: Search Advisor registration, and the blog (토니이츠얼랏 know-how) cross-posts saju content linking in.

### 5.2 For foreigners
- **Explain-first UI.** Every term is a <Glossary> tooltip: tap "Ten Gods" → 2-sentence plain-English definition.
  A full /glossary page doubles as an SEO magnet ("what is day master in saju").
- **Local birth time, not KST.** Say explicitly: "Enter your local birth time — we handle the conversion."
  (Competitor FAQs tell foreigners to convert to Korean time; ours must not.)
- **Result page answers "so what?"** Foreigners don't know what to do with 八字. Structure results as:
  1) Your chart (visual) → 2) Your Day Master in plain words → 3) Your element balance and what it suggests →
  4) "What Koreans do with this" cultural note (career timing, gunghap before marriage, naming babies).
- Onboarding strip on landing (en only): "Never heard of saju? 60-second primer" → expands inline.
- Comparison content is the top-of-funnel: saju vs astrology, saju vs BaZi ("same roots, Korean lineage"),
  saju vs MBTI (huge with the K-drama demographic).
- Social share = growth loop: canvas-rendered PNG card (pillars + seal stamp + showmethesaju.com) sized for
  Instagram story 1080×1920 and square 1080×1080. This is how it spreads on K-culture Twitter/TikTok/IG.
- Hook content pegged to K-content moments (Battle of Fates, K-drama saju scenes) in Learn articles.

### 5.3 Age-segment insight (mom's) → product mapping
- 20s–30s "빨리 되요/안되요": the free instant chart + share card IS this product. Landing headline speaks to it.
- Deep/psychological + middle-aged longer answers: Phase 2 AI readings + mom's live booking (link now).
- Seniors "내 얘기 들어줘": live consultation only — booking funnel, never a product feature.

---

## 6. Page specs (v2)

### 6.1 Landing `/[lang]/`
Hero = BirthForm (date · time · time-unknown · gender · 양력/음력+윤달 · birth city w/ browser-tz default ·
advanced: 진태양시, 야자시 boundary). Submit → /reading with all state in querystring.
Under the form, one quiet trust line: "Free · No sign-up · Your birth data never leaves your device."
Below fold: (en: 60-second primer strip) → 3-step What-is-Saju → sample pillar visual → latest 3 articles →
waitlist band → footer. No carousel, no popups.

### 6.2 Reading `/[lang]/reading` (noindex)
1. 사주단자 pillar cards (signature) + seal stamp
2. Day Master panel: plain-language paragraph (i18n `reading.dm.*`, mom-derived, original prose)
3. Five-element balance bar + one-line "what an imbalance means" per dominant element
4. Ten Gods table — every label is a Glossary tooltip
5. "What Koreans do with this" cultural note (en-weighted)
6. Share: copy-URL + **Download share card (PNG)** + Kakao share (ko)
7. Term-boundary warning: engine exposes `solarLongitude`; if within 0.15° (~3–4h) of a 30° boundary, or
   입춘 within ±1 day, show `reading.termBoundaryNote` and suggest checking exact birth time
8. CTAs: "Book a live reading with our master" + "Deep AI reading — join waitlist"
Time-unknown births: 3 pillars + friendly note, hour-dependent modules hidden, no crash.

### 6.3 Learn `/[lang]/learn/`
Content collection, per-locale folders, `translationKey` for hreflang.
Launch set (ko+en): 10 day-master profiles · "Saju vs Western astrology" · "Saju vs BaZi" · "Saju vs MBTI" ·
"How to read your four pillars" · "What is 오행" · "Why Koreans check gunghap before marriage" ·
"Saju in K-dramas: what's real". (Foreigner comparison pieces are the Google winners; day-master profiles win both.)

### 6.4 Compatibility `/[lang]/compatibility` — teaser + waitlist (unchanged)

### 6.5 About `/[lang]/about`
Mom front and center: name/photo/years of practice/lineage(교수님)/how she reads. Booking link.
Goods section: 2–3 items with the story of each (부적 meaning, stone symbolism) → Smart Store.
Ethics line: readings are a tradition of self-reflection, not medical/financial/legal advice.

### 6.6 Glossary `/[lang]/glossary` ★ — every term card: EN name / romanization / hanja / 2–3 sentences. SEO magnet + tooltip source of truth.

### 6.7 System — localized 404, privacy policy (emphasize: no birth data collected/stored — it's true and it's the brand), root language-detect redirect.

---

## 7. Saju engine

7.1–7.3 unchanged (provided engine: exact day pillar; astronomical 입춘/절기; configurable 진태양시/자시 boundary;
십성; element counts; lunar input via `korean-lunar-calendar` at UI layer).

**7.4 Phase-2 engine backlog (do NOT build now, keep interfaces in mind):**
- 대운 (10-year luck pillars): direction depends on year-stem polarity × gender; start-age from distance to the
  adjacent 절기. This is why the form collects gender — currently unused by the engine; note this in UI copy honestly.
- 세운/월운 (yearly/monthly), 신살 highlights, 12운성 — competitors' table stakes for depth; ours after launch.

**7.5 Verification gate (unchanged, non-negotiable):** ≥20 KASI 만세력 matches incl. 절기-boundary, 23:00–01:00,
음력 윤달 cases, plus ≥5 non-Korean birthplaces hand-checked for tz handling. Do not launch publicly before this passes.

---

## 8. SEO & discovery strategy (v2, per market)

**Google (en):** target long-tails first: "saju calculator", "korean fortune telling online", "four pillars of
destiny free chart", "saju vs astrology", "what is my day master", "korean compatibility gunghap", "saju reading
english". Comparison + glossary pages carry this. JSON-LD (WebSite, Article, FAQPage on glossary).
**Naver (ko):** Search Advisor + sitemap; 블로그 크로스포스팅 from 토니이츠얼랏 with links; target "무료 사주",
"사주명식 무료", "만세력", "진태양시 사주". Naver rewards fresh Korean-language content — reuse blog muscle.
**Social:** the PNG share card carries the domain; that's the only "campaign" at launch.
Technical: hreflang+x-default, canonical, sitemap (exclude /reading), per-locale OG images, robots.txt.

---

## 9. Deployment (unchanged) — Pages + Actions + CNAME + HTTPS.

---

## 10. Build phases (updated where marked ★)

### Phase 0 — Repo + deploy pipeline (unchanged checklist)
### Phase 1 — i18n skeleton (unchanged checklist)

### Phase 2 — Design system + shell
★ add: Glossary tooltip component (accessible: focusable, Esc to close, works on touch).
- [ ] previous checklist, plus: tooltip usable via keyboard only and on mobile tap

### Phase 3 — Landing
★ add: birth-city picker backed by cities.ts with browser-tz default; advanced accordion (진태양시/야자시);
trust line under form; en 60-second primer strip.
- [ ] previous checklist, plus:
- [ ] Tokyo birth resolves tz +540, São Paulo resolves with correct historical DST via Intl
- [ ] Primer strip renders only where locale content exists (en at launch)

### Phase 4 — Engine + result page
★ add: share-card.ts canvas PNG export (story + square), Kakao share (ko), term-boundary warning via
solarLongitude proximity, "What Koreans do with this" section, honest gender note (used for future 대운).
- [ ] previous checklist (incl. KASI 20+ dates), plus:
- [ ] ≥5 foreign-birthplace cases hand-verified (NY, London, São Paulo, Sydney, Tokyo)
- [ ] PNG export renders hanja correctly (embed font in canvas), file < 400KB
- [ ] Boundary warning fires for a birth 2h before 입춘, silent for mid-month birth

### Phase 5 — Learn + Glossary ★
- [ ] previous checklist, plus: glossary FAQPage JSON-LD validates; tooltips pull from the same source as /glossary

### Phase 6 — SEO/analytics/system pages (unchanged + privacy page states no-data-collection truthfully)
### Phase 7 — Launch pass (unchanged + share card posts correctly to IG story/X/Kakao from a real phone)

---

## 11. Offline prep (for you and mom) — v2
1. 10 day-master texts ko→en, original prose (never verbatim from scanned books — copyright + grant diligence).
2. Mom's story/photo/lineage for About; goods photos + the story of each item.
3. 8 launch articles per §6.3 list, ko+en.
4. Glossary definitions pass: mom reviews accuracy of ~25 term definitions.
5. Booking channel + waitlist provider accounts.
6. Tone rule for all fortune copy, both languages: reflective, non-deterministic, never medical/financial/legal claims.
