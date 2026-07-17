/**
 * Chart extras beyond the verified core engine (PLAN.md §7.4 pattern:
 * new features live in new files; saju-engine.ts stays untouched).
 *
 * 태원(胎元)  conception pillar  — month stem +1, month branch +3 (classical rule).
 * 명궁(命宮)  life palace        — 중기-based month number + hour number, 14/26 rule;
 *                                  stem from the year-stem month cycle (오호둔).
 * 신강/신약   day-master strength — simplified 억부 weighting, method disclosed in UI.
 * 희신/기신   favorable elements  — derived from the strength verdict (억부 reference).
 */
import {
  BRANCHES_HANJA, BRANCHES_KO, STEMS_HANJA, STEMS_KO,
  type Element, type SajuResult, type TenGod,
} from './saju-engine';

export interface MiniPillar {
  stem: number; branch: number;
  hanja: string; ko: string;
  stemElement: Element; branchElement: Element;
}

const ELEMENTS: Element[] = ['wood', 'fire', 'earth', 'metal', 'water'];
const STEM_ELEMENT = (s: number): Element => ELEMENTS[Math.floor(s / 2)];
const BRANCH_ELEMENT: Element[] = [
  'water', 'earth', 'wood', 'wood', 'earth', 'fire',
  'fire', 'earth', 'metal', 'metal', 'earth', 'water',
];

const mini = (stem: number, branch: number): MiniPillar => ({
  stem, branch,
  hanja: STEMS_HANJA[stem] + BRANCHES_HANJA[branch],
  ko: STEMS_KO[stem] + BRANCHES_KO[branch],
  stemElement: STEM_ELEMENT(stem),
  branchElement: BRANCH_ELEMENT[branch],
});

/** 태원: the conception month — month stem advanced 1, month branch advanced 3. */
export function taewonPillar(r: SajuResult): MiniPillar {
  return mini((r.month.stem + 1) % 10, (r.month.branch + 3) % 12);
}

/** Branch → traditional palace number (寅=1 … 丑=12). */
const gungNumber = (branch: number) => ((branch - 2 + 12) % 12) + 1;

/**
 * 명궁: month is counted by 중기 (mid-terms sit at solar longitude 330°+30k;
 * births before the month's mid-term count as the previous month), then
 * A = month number + hour number → palace number = A<14 ? 14−A : 26−A.
 * The palace stem follows the year-stem month cycle. Null without a birth time.
 */
export function myeonggungPillar(r: SajuResult): MiniPillar | null {
  if (!r.hour) return null;
  const shift = Math.floor(((((r.solarLongitude - 330) % 360) + 360) % 360) / 30);
  const jungqiMonthBranch = (2 + shift) % 12;
  const a = gungNumber(jungqiMonthBranch) + gungNumber(r.hour.branch);
  const palaceNo = a < 14 ? 14 - a : 26 - a;
  const gungBranch = (2 + (palaceNo - 1)) % 12;
  // 오호둔: 갑·기년 → 병인월 시작; offset counted from 인월.
  const monthOffset = (gungBranch - 2 + 12) % 12;
  const gungStem = ((r.year.stem % 5) * 2 + 2 + monthOffset) % 10;
  return mini(gungStem, gungBranch);
}

export type StrengthVerdict = 'extremeStrong' | 'strong' | 'balanced' | 'weak' | 'extremeWeak';

const SUPPORTING: ReadonlySet<TenGod> = new Set<TenGod>(['비견', '겁재', '편인', '정인']);

export interface StrengthResult {
  supportWeight: number;
  totalWeight: number;
  verdict: StrengthVerdict;
  deukryeong: boolean;   // 득령: month main qi supports the day master
  deukji: boolean;       // 득지: day-branch hidden stems root the day master
  deukse: boolean;       // 득세: supporters hold ≥ half the remaining weight
}

/**
 * Simplified 억부 scoring, method disclosed in the UI: every visible position
 * except the day master counts 1 point (branches judged by their 정기 main-qi
 * ten god), the month branch counts 2 (월령). A reference verdict, not a ruling.
 */
export function strengthAnalysis(r: SajuResult): StrengthResult {
  const mainQi = (role: 'year' | 'month' | 'day' | 'hour') =>
    (r.hiddenStems[role] ?? []).find((h) => h.phase === 'main') ?? null;

  const entries: { god: TenGod | null; weight: number }[] = [
    { god: r.year.tenGod, weight: 1 },
    { god: r.month.tenGod, weight: 1 },
    { god: r.hour?.tenGod ?? null, weight: 1 },
    { god: mainQi('year')?.tenGod ?? null, weight: 1 },
    { god: mainQi('month')?.tenGod ?? null, weight: 2 },
    { god: mainQi('day')?.tenGod ?? null, weight: 1 },
    { god: r.hour ? mainQi('hour')?.tenGod ?? null : null, weight: 1 },
  ];
  const totalWeight = entries.reduce((s, e) => s + (e.god ? e.weight : 0), 0);
  const supportWeight = entries.reduce((s, e) => s + (e.god && SUPPORTING.has(e.god) ? e.weight : 0), 0);
  const ratio = totalWeight ? supportWeight / totalWeight : 0;

  const monthMain = mainQi('month');
  const deukryeong = !!monthMain && SUPPORTING.has(monthMain.tenGod);
  const deukji = (r.hiddenStems.day ?? []).some((h) => SUPPORTING.has(h.tenGod));
  const restTotal = totalWeight - 2;
  const restSupport = supportWeight - (deukryeong ? 2 : 0);
  const deukse = restTotal > 0 && restSupport >= restTotal / 2;

  const verdict: StrengthVerdict =
    ratio >= 0.8 ? 'extremeStrong'
    : ratio > 0.55 ? 'strong'
    : ratio >= 0.45 ? 'balanced'
    : ratio > 0.2 ? 'weak'
    : 'extremeWeak';

  return { supportWeight, totalWeight, verdict, deukryeong, deukji, deukse };
}

const PRODUCES: Record<Element, Element> = { wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood' };
const PRODUCED_BY: Record<Element, Element> = { fire: 'wood', earth: 'fire', metal: 'earth', water: 'metal', wood: 'water' };
const CONTROLS: Record<Element, Element> = { wood: 'earth', earth: 'water', water: 'fire', fire: 'metal', metal: 'wood' };
const CONTROLLED_BY: Record<Element, Element> = { earth: 'wood', water: 'earth', fire: 'water', metal: 'fire', wood: 'metal' };

export interface FavorableResult {
  favorable: Element[];   // 희신 후보
  unfavorable: Element[]; // 기신 후보
  balanced: boolean;
}

/** 억부-based favorable/unfavorable element candidates; near-balance returns balanced=true. */
export function favorableElements(dayElement: Element, verdict: StrengthVerdict): FavorableResult {
  if (verdict === 'balanced') return { favorable: [], unfavorable: [], balanced: true };
  const weak = verdict === 'weak' || verdict === 'extremeWeak';
  return weak
    ? { favorable: [PRODUCED_BY[dayElement], dayElement],
        unfavorable: [CONTROLLED_BY[dayElement], CONTROLS[dayElement]], balanced: false }
    : { favorable: [PRODUCES[dayElement], CONTROLS[dayElement], CONTROLLED_BY[dayElement]],
        unfavorable: [PRODUCED_BY[dayElement], dayElement], balanced: false };
}
