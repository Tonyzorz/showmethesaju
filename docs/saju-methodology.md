# Saju calculation methodology

This document records the conventions implemented by the browser-side calculator. It is a reproducibility note, not an interpretation guide. Saju schools and commercial Manseryeok apps can use different rounding, day-boundary, true-solar-time, hidden-stem, and Shinsal conventions.

## Four pillars

- The year changes at Ipchun (solar longitude 315°), not January 1 or Lunar New Year.
- Solar months change at the twelve 30° solar-longitude Jie boundaries. The Tiger month begins at Ipchun.
- Day pillars use 2000-01-07 as a verified Jia-Zi anchor. The default day boundary is 23:00; a midnight convention remains available in the engine.
- Hour pillars use twelve two-hour branches. If time is unknown, the hour pillar is omitted and noon is used to estimate the year/month boundary position and Daeun start age; the UI marks the resulting one-to-two-month uncertainty.
- Optional true-solar correction adjusts civil time by longitude relative to the time-zone meridian. The equation of time is intentionally not applied.

## Gender and Daeun (ten-year cycles)

Gender is required for new charts because the traditional direction rule depends on it:

- Yang-year male and yin-year female: forward.
- Yin-year male and yang-year female: reverse.

The cycles continue from the month pillar in that direction. The first-cycle age is the absolute time from birth to the next Jie for forward charts or the previous Jie for reverse charts, converted with the traditional rule `3 days = 1 year`. The result retains month precision, then displays ten consecutive ten-year cycles. Apps may differ by several months because some round to whole days or whole years.

## Hidden stems (Jijanggan)

The UI follows the Korean Wolryul Bun-ya ordering `residual → middle → main`:

| Branch | Hidden stems |
| --- | --- |
| 子 | 壬 癸 |
| 丑 | 癸 辛 己 |
| 寅 | 戊 丙 甲 |
| 卯 | 甲 乙 |
| 辰 | 乙 癸 戊 |
| 巳 | 戊 庚 丙 |
| 午 | 丙 己 丁 |
| 未 | 丁 乙 己 |
| 申 | 戊 壬 庚 |
| 酉 | 庚 辛 |
| 戌 | 辛 丁 戊 |
| 亥 | 戊 甲 壬 |

Each hidden stem is also classified as a Ten God relative to the natal day stem.

## Branch relations

The result detects all pairwise natal relations and repeats the comparison for each selected luck cycle:

- Clash (충): 子午, 丑未, 寅申, 卯酉, 辰戌, 巳亥.
- Harm (해): 子未, 丑午, 寅巳, 卯辰, 申亥, 酉戌.
- Break (파): 子酉, 丑辰, 寅亥, 卯午, 巳申, 未戌.
- Punishment (형): 子卯, the pairwise members of 寅巳申 and 丑戌未, plus self-punishment for 辰午酉亥.

Pairwise display means a three-branch punishment can appear before all three members are present. Interpretation should consider the complete chart.

## Shinsal

The first release includes six widely used markers:

- Cheon-eul Nobleman and Munchang use the day stem.
- Peach Blossom, Traveling Horse, and Flower Canopy use both the day-branch and year-branch trine groups.
- Gongmang uses the ten-day xun containing the day pillar.

Shinsal naming and bases vary more than the core pillar arithmetic, so the UI labels these as reference indicators rather than deterministic conclusions.

## Seun (annual cycles)

Annual pillars follow the sexagenary year beginning at each Ipchun. The selected annual branch is compared with the natal branches for hidden stems, relations, and Shinsal.

## Verification sources

- Korea Astronomy and Space Science Institute calendar/astronomy service: https://astro.kasi.re.kr
- ILI Korean Myeongri lecture material used for Daeun direction, Jie-distance conversion, and Korean hidden-stem convention: https://www.ili.or.kr/upfiledata/Board/%EB%AA%85%EB%A6%AC%EC%8B%AC%EB%A6%AC%EC%83%81%EB%8B%B4%EC%82%AC_%EC%A0%84%EC%A0%95%ED%9B%88_%EA%B0%95%EC%9D%98%EA%B5%90%EC%95%88%EB%AA%A8%EC%9D%8C%5B1%5D.pdf
- `만세력 천을귀인` was used as a feature-coverage reference, not as a copied calculation source: https://play.google.com/store/apps/details?id=com.gooddaytoday.mynobleman

The automated validation suite pins representative hidden-stem tables, relation pairs, Shinsal rules, opposite Daeun directions by gender, and known annual pillars.
