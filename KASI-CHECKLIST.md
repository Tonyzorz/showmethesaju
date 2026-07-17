# KASI 만세력 verification checklist (PLAN.md §7.5 — launch gate)

**Goal:** ≥20 KASI matches + ≥5 foreign birthplaces before public launch.
**Reference:** KASI 만세력 — https://astro.kasi.re.kr/life/pageView/8 (또는 음양력 변환 + 일진).
**Cross-check (optional):** 만세력 천을귀인 앱 or 원광만세력.

## How to verify one row
1. Open the site's reading page for the birth data (use the birth form; for foreign cases pick the city so the timezone is correct).
2. Look up the same date/time in KASI 만세력 (KASI uses KST — for foreign births convert local → KST first, e.g. NY 14:30 EDT = 03:30 KST next day).
3. Compare 년주/월주/일주/시주 hanja. Mark ✓ or record the mismatch.
4. When a row passes, add it to `tests/engine-fixtures.json` with `"status": "anchor"` and the expected hanja, then run `npm run test:engine`. That locks the case in forever.

## A. Spread of ordinary dates (10)
| # | Birth (KST) | KASI 년월일시주 | Site | ✓ |
|---|---|---|---|---|
| A1 | 1955-03-21 06:00 | | | |
| A2 | 1962-11-04 21:15 | | | |
| A3 | 1971-07-30 04:40 | | | |
| A4 | 1980-12-25 15:00 | | | |
| A5 | 1988-09-17 09:30 | | | |
| A6 | 1994-05-08 18:20 | | | |
| A7 | 2001-10-31 11:11 | | | |
| A8 | 2008-08-08 08:08 | | | |
| A9 | 2015-04-14 22:45 | | | |
| A10 | 2023-06-06 13:05 | | | |

## B. 절기 경계 (5) — the year/month pillar must flip at the right instant
| # | Birth (KST) | Why | KASI | Site | ✓ |
|---|---|---|---|---|---|
| B1 | 1995-02-04 09:00 vs 17:00 | 입춘 straddle | | | |
| B2 | 2010-02-04 05:00 vs 08:00 | 입춘 straddle | | | |
| B3 | 1987-03-06 straddle 경칩 | month flip | | | |
| B4 | 2019-08-08 straddle 입추 | month flip | | | |
| B5 | 1975-11-08 straddle 입동 | month flip | | | |

## C. 자시 경계 23:00–01:00 (4) — day pillar convention
| # | Birth (KST) | Note | KASI | Site | ✓ |
|---|---|---|---|---|---|
| C1 | 1990-01-15 23:10 | day should flip (자시) | | | |
| C2 | 1990-01-15 22:50 | day should NOT flip | | | |
| C3 | 2003-07-22 00:30 | 조자시 | | | |
| C4 | any date 23:59 | flip check | | | |

## D. 음력/윤달 (3) — verifies korean-lunar-calendar at the form layer
| # | Lunar input | Solar per KASI | Site | ✓ |
|---|---|---|---|---|
| D1 | 음력 1984-10-15 | | | |
| D2 | 음력 1987-윤6-10 | | | |
| D3 | 음력 2020-윤4-01 | | | |

## E. 진태양시 (2) — advanced option ON
| # | Birth | Note | ✓ |
|---|---|---|---|
| E1 | Seoul birth ±16 min around a 시 boundary | −32 min shift can change hour pillar | |
| E2 | 부산 (lon 129.08) same test | −24 min shift | |

## F. Foreign birthplaces (5) — local time in, correct pillars out
| # | Birth (local) | KST equivalent | KASI | Site | ✓ |
|---|---|---|---|---|---|
| F1 | New York 1990-06-15 14:30 (EDT) | 06-16 03:30 | | | |
| F2 | London 1985-01-20 08:00 (GMT) | 01-20 17:00 | | | |
| F3 | São Paulo 1999-12-31 23:00 (BRST, DST!) | 2000-01-01 10:00 | | | |
| F4 | Sydney 2005-04-03 02:30 (AEDT→AEST edge) | 04-03 01:30 | | | |
| F5 | Tokyo 1978-08-15 10:00 (JST=KST) | same | | | |

## Status
- [x] Harness in place: `npm run test:engine` (6 anchor cases green)
- [ ] Sections A–F verified and promoted into fixtures
- [ ] Launch gate sign-off
