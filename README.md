# Show Me the Saju (쇼미더사주)

A privacy-first, multilingual Korean Saju (Four Pillars) calculator and learning experience. It turns birth information into an interactive Manseryeok-style chart with themed, traceable summaries—without sending birth data to a server.

**Live site:** https://showmethesaju.com/ko/

## What it does

- Calculates the Four Pillars locally in the browser for solar or lunar birth dates.
- Supports gender-dependent Daeun direction, ten-year Daeun cycles, annual Seun, monthly luck, Hidden Stems, Ten Gods, Twelve Life Stages, Five Elements, Yin–Yang, Nayin, Gongmang, branch/stem relations, and supplementary Shinsal.
- Offers nine clickable views of the same calculated chart: Core Saju, Health & Balance, Wealth Flow, Personality & Strengths, Career & Achievement, Love & Relationships, Noble Help & Opportunities, Movement & Change, and Daeun & Annual Timing.
- Includes a two-person Gunghap view, learning pages, a glossary, and methodology disclosures.
- Adds beginner/expert result modes, a connected Daeun–Seun–Wolun navigator, local-only saved profiles and comparison history, and shareable chart/compatibility cards.
- Supports Korean, English, Japanese, Simplified Chinese, Traditional Chinese, Spanish, French, German, Portuguese, Vietnamese, and Thai with locale-key and placeholder validation.
- Uses optional, consent-gated Google Analytics with a strict personal-data boundary.

This is a traditional interpretation and education tool. It does not provide medical, legal, financial, or other professional advice.

## Judge testing path

1. Open the [Korean home page](https://showmethesaju.com/ko/).
2. Try the reference input: `1987-11-22`, `14:30`, female, Seoul, solar calendar.
3. Select any of the nine fortune cards, calculate the chart, and switch themes without re-entering the birth data.
4. On the result page, inspect the Four Pillars, Hidden Stems, Ten Gods, Twelve Life Stages, Shinsal, Daeun, Seun, monthly luck, element balance, and relation panels.
5. Open Gunghap and add a second example, such as `1990-06-15`, `14:30`, male, Seoul.
6. Switch languages from the header and confirm that navigation and calculation remain available.
7. Open the privacy settings to accept or reject analytics; calculation works in either state.

## Hackathon demo mode (README)

For a sub-three-minute judge walkthrough, use these prepared local-calculation links. The birth state is in the URL fragment, so GitHub Pages never receives it:

- [Open the reference Saju directly](https://showmethesaju.com/ko/reading/#y=1987&m=11&d=22&h=14&mi=30&tu=0&tz=540&lon=126.98&ts=0&g=f&focus=basic)
- [Open the reference Gunghap directly](https://showmethesaju.com/ko/compatibility/#ay=1987&am=11&ad=22&ah=14&ai=30&au=0&az=540&ag=f&by=1990&bm=6&bd=15&bh=14&bi=30&bu=0&bz=540&bg=m)

Suggested sequence: switch Beginner → Expert, open the evidence drawer, move through Daeun → Seun → Wolun, then open the compatibility summary and select a cell in the 4×4 matrix. Saved profiles and comparison history can be demonstrated afterward; both use browser-local storage only.

## Local setup

Requirements: Node.js 22 and npm.

```bash
npm install
npm run dev
```

Then open `http://localhost:4321/ko/`.

Run the complete local verification gate before submitting a change:

```bash
npm run check
```

The gate runs deterministic engine fixtures, locale/schema validation, a production Astro build, and static output smoke tests. Individual commands are also available:

```bash
npm run test:engine
npm run validate
npm run build
npm run smoke
```

## Architecture and privacy

- Astro 4 generates the static site; TypeScript modules perform the calculations in the browser.
- `korean-lunar-calendar` converts lunar inputs. The Saju engine applies the documented solar-term and traditional-rule conventions.
- New reading and Gunghap state is stored in the URL fragment (`#...`). Fragments are not included in HTTP requests to GitHub Pages. Older query-string links are migrated to the fragment format in the browser.
- Optional saved profiles, display preference, onboarding completion, and recent comparisons use browser-local storage. They are never sent to the application or analytics.
- GA4 (`G-RMFH4E7NGS`) is not loaded until analytics consent is granted. The analytics wrapper sends query-free, hash-free page locations and rejects sensitive event parameters.
- No birth date, time, gender, city, longitude, calculated pillar, or compatibility input is sent to an application backend.

## How Codex and GPT-5.6 were used

Codex was the primary engineering workspace for the project. GPT-5.6 supported iterative reasoning, implementation, and review across the repository, while the final product remains a deterministic static application and does **not** call an OpenAI model at runtime.

The collaboration included:

- diagnosing the GitHub Pages/Jekyll deployment mismatch and moving deployment to the Astro GitHub Actions workflow;
- reviewing and extending Saju calculations, gender-dependent Daeun, Hidden Stems, Shinsal, luck cycles, and Gunghap;
- turning raw tables into an accessible card-based homepage and traceable result views;
- checking all 11 locale files for key and placeholder parity;
- adding consent-gated analytics and preventing birth state from leaking through request URLs;
- designing deterministic regression fixtures and production-output smoke checks; and
- creating judge instructions, the demo narrative, and accuracy/methodology disclosures.

Traditional-rule choices are documented in [docs/saju-methodology.md](docs/saju-methodology.md). AI-assisted changes are treated like any other engineering contribution: they must pass the automated gate and remain subject to human review, especially where Saju schools use different conventions.

The same core disclosures are available to visitors on the localized `/[language]/methodology/` page.

## Verification status and known limits

- The engine suite currently passes six pinned astronomical/calendar reference fixtures and deterministic invariants for the expanded rule layers.
- Two boundary fixtures remain explicitly pending, and the broader Korea Astronomy and Space Science Institute launch checklist has not yet been completed. Do not describe the calculator as independently certified or perfectly matching every commercial Manseryeok app.
- True-solar correction adjusts civil time by longitude relative to the time-zone meridian; the equation of time is not applied.
- Strength, favorable elements, structure, Shinsal, Johu, and some relationship tables are school-dependent reference layers. The interface labels them as interpretive rather than deterministic predictions.
- Automated checks guarantee translation structure and interpolation safety across 11 locales; native-speaker editorial review is still recommended before claiming perfect translation quality.

## Deployment

The workflow in `.github/workflows/deploy.yml` validates the engine and locale data, builds with Astro, and deploys the generated artifact with GitHub Pages Actions.

1. Push to `main`.
2. In repository **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Wait for the **Deploy to GitHub Pages** workflow to finish.

A future custom domain only requires the GitHub Pages DNS/domain configuration plus updating `site` in `astro.config.mjs` and the GA4 stream URL.

## Project map

```text
src/lib/                  calculation, analytics, locale, and Gunghap logic
src/pages/[lang]/         localized pages and interactive result views
src/i18n/                 11 locale dictionaries
scripts/test-engine.mjs   deterministic calculation fixtures
scripts/validate.mjs      content, locale, route, and privacy validation
scripts/smoke-dist.mjs    production artifact smoke tests
docs/                     methodology, analytics, demo, and submission notes
```

Hackathon materials are in [HACKATHON_SUBMISSION.md](HACKATHON_SUBMISSION.md) and [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md).
