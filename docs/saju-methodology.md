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

The detailed result also reports:

- Six Combination, half of a Three Harmony, and pairs inside a seasonal Directional Combination.
- Wonjin (grudge) and Ghost Gate pairs as separate traditional reference layers.
- The five Heavenly-Stem combinations and the four commonly used opposing stem pairs.
- Complete and partial Three Harmony and Directional Combination groups. A group is complete only when all three distinct branches are present; duplicate branches do not complete it.

Several relation types can legitimately apply to the same pair. The UI therefore keeps every matched type instead of choosing one label.

## Twelve Life Stages

The chart displays two rows because Korean Manseryeok products commonly expose both conventions:

- **Day-stem basis:** the natal day stem is applied to every pillar branch.
- **Pillar-stem basis:** each pillar's own stem is applied to its branch.

Yang stems advance from Changsheng and yin stems run in reverse. The sequence is Changsheng, Bath, Attire, Office, Peak, Decline, Illness, Death, Tomb, Extinction, Conception, and Nurture. For example, the reference chart `癸未 · 乙亥 · 辛亥 · 丁卯` produces pillar-stem stages `養 · 死 · 沐浴 · 病` from hour through year.

## Nayin Five Elements

Each valid stem-branch pillar maps to one of the traditional thirty Nayin pairs. The implementation stores the complete 60-pillar table as thirty adjacent pairs and shows the classical Chinese name. Korean also shows its Korean reading; other languages show the resulting Five Element so the untranslated proper name remains identifiable.

## Void, month commander, and Heavenly Noble branches

- Day-pillar and year-pillar Void branches are calculated independently from their ten-day xun.
- Month commander is the main qi (the final hidden stem in the Korean residual-middle-main ordering) of the month branch, with its Ten God relative to the day stem.
- Heavenly Noble branches are shown from the day-stem table even when neither branch appears in the natal four pillars.

## Shinsal

The chart separates two related layers:

1. The full Twelve Shinsal sequence is calculated twice for every natal or luck branch: once from the year-branch trine group and once from the day-branch trine group. The sequence from Robbery is Robbery, Calamity, Heaven, Land, Year, Month, Loss, General, Saddle, Traveling Horse, Six Harm, and Flower Canopy.
2. Supplementary markers include Cheon-eul Nobleman, Munchang, Peach Blossom, Traveling Horse, Flower Canopy, Gongmang, Heavenly Virtue, Monthly Virtue, Yang Blade, Prosperity, Needle Star, Solitary Phoenix, White Tiger, and Strong Leader.

Cheon-eul Nobleman and Munchang use the day stem. Peach Blossom, Traveling Horse, and Flower Canopy use both day-branch and year-branch trine groups. Gongmang uses the day-pillar xun. Heavenly and Monthly Virtue use the natal month branch; Yang Blade and Prosperity use the day stem; the remaining pillar-specific markers use explicit traditional stem, branch, or sexagenary-pillar sets.

Shinsal tables and names vary more by school than the core pillar arithmetic. These are deliberately presented as filterable reference indicators, never as deterministic predictions. The exact implemented tables are pinned by automated fixtures so later changes must be intentional.

## Seun (annual cycles)

Annual pillars follow the sexagenary year beginning at each Ipchun. The selected annual branch is compared with the natal branches for hidden stems, relations, and Shinsal.

## Themed reading summaries

The six home-page cards are different views of the same locally calculated chart, not separate predictive engines:

- **Core Saju** summarizes the Day Master, visible Five-Element counts, and visible Yin-Yang positions.
- **Wealth flow** counts Direct and Indirect Wealth relationships across visible and hidden stems, identifies the Day Master's Wealth element, and links to Daeun and Seun timing. Counts are descriptive, not financial advice or a wealth score.
- **Health and balance** shows only the traditional visible Five-Element distribution. It is explicitly not a diagnosis, medical guidance, or a prediction of illness.
- **Career and achievement** counts Authority and Output relationships across visible and hidden stems and presents them beside the month pillar and current cycles.
- **Love and relationships** uses the day branch, unique natal pillar pairs with branch relations, and Peach Blossom occurrences. It does not claim compatibility with a person whose chart was not entered.
- **Daeun and annual timing** shows the active ten-year cycle by current full age and the annual pillar for the current Saju year. The Saju year changes at Ipchun.

Every theme links back to the supporting detailed chart section. Visitors can switch themes on the result page without recalculating or re-entering birth data.

## Verification sources

- Korea Astronomy and Space Science Institute calendar/astronomy service: https://astro.kasi.re.kr
- ILI Korean Myeongri lecture material used for Daeun direction, Jie-distance conversion, and Korean hidden-stem convention: https://www.ili.or.kr/upfiledata/Board/%EB%AA%85%EB%A6%AC%EC%8B%AC%EB%A6%AC%EC%83%81%EB%8B%B4%EC%82%AC_%EC%A0%84%EC%A0%95%ED%9B%88_%EA%B0%95%EC%9D%98%EA%B5%90%EC%95%88%EB%AA%A8%EC%9D%8C%5B1%5D.pdf
- `만세력 천을귀인` was used as a feature-coverage reference, not as a copied calculation source: https://play.google.com/store/apps/details?id=com.gooddaytoday.mynobleman

The automated validation suite pins representative hidden-stem tables, branch and stem relations, both Twelve Life Stage conventions, Nayin pairs, Void and Heavenly Noble branches, Twelve Shinsal rules, supplementary Shinsal, opposite Daeun directions by gender, known annual pillars, and the `1987-11-22 14:30` reference chart shown in the product brief.
