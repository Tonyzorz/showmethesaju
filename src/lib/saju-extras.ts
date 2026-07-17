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

// ───────────────────────── 격국 (chart structure) ─────────────────────────

export type GyeokgukName =
  | 'geonrok' | 'yangin' | 'siksin' | 'sanggwan' | 'pyeonjae'
  | 'jeongjae' | 'pyeongwan' | 'jeonggwan' | 'pyeonin' | 'jeongin';

const GOD_TO_GYEOKGUK: Record<TenGod, GyeokgukName> = {
  '비견': 'geonrok', '겁재': 'yangin',
  '식신': 'siksin', '상관': 'sanggwan',
  '편재': 'pyeonjae', '정재': 'jeongjae',
  '편관': 'pyeongwan', '정관': 'jeonggwan',
  '편인': 'pyeonin', '정인': 'jeongin',
};

export interface GyeokgukResult {
  name: GyeokgukName;
  god: TenGod;
  stemHanja: string;   // the month hidden stem that defines the 격
  tugan: boolean;      // whether that stem protrudes to a visible stem
}

/**
 * 십정격 determination, method disclosed in the UI: among the month branch's
 * hidden stems, the first (정기 → 중기 → 여기) that protrudes (투간) to a
 * visible stem defines the 격; with no protrusion the 정기 does. 비견 month →
 * 건록격, 겁재 month → 양인격. External/special 격 are out of scope.
 */
export function gyeokguk(r: SajuResult): GyeokgukResult {
  const hidden = r.hiddenStems.month ?? [];
  const byPhase = (phase: 'main' | 'middle' | 'residual') =>
    hidden.find((h) => h.phase === phase) ?? null;
  const visible = new Set([r.year.stem, r.month.stem, ...(r.hour ? [r.hour.stem] : [])]);
  for (const phase of ['main', 'middle', 'residual'] as const) {
    const h = byPhase(phase);
    if (h && visible.has(h.stem)) {
      return { name: GOD_TO_GYEOKGUK[h.tenGod], god: h.tenGod, stemHanja: h.stemHanja, tugan: true };
    }
  }
  const main = byPhase('main') ?? hidden[hidden.length - 1];
  return { name: GOD_TO_GYEOKGUK[main.tenGod], god: main.tenGod, stemHanja: main.stemHanja, tugan: false };
}

// ───────────────────────── 삼재 (three-year folk cycle) ─────────────────────────

export interface SamjaeResult {
  /** The three samjae year branches for this birth-year trine group. */
  groupBranches: [number, number, number];
  /** 0 = not in a window this year; 1 들삼재, 2 눌삼재, 3 날삼재. */
  stage: 0 | 1 | 2 | 3;
  /** Gregorian year the current window started, or the next window starts. */
  windowStartYear: number;
}

/**
 * 삼재: the birth-year branch's trine group maps to a fixed 3-year window
 * every 12 years — 신자진→인묘진년, 인오술→신유술년, 사유축→해자축년,
 * 해묘미→사오미년. `sajuYear` should be ipchun-adjusted.
 */
export function samjae(birthYearBranch: number, sajuYear: number): SamjaeResult {
  const startByGroup = [2, 11, 8, 5]; // trine group (branch % 4) → window start branch
  const start = startByGroup[birthYearBranch % 4];
  const groupBranches: [number, number, number] = [start, (start + 1) % 12, (start + 2) % 12];
  const yearBranch = (((sajuYear - 4) % 12) + 12) % 12;
  const idx = groupBranches.indexOf(yearBranch);
  const untilStart = (((start - yearBranch) % 12) + 12) % 12;
  return {
    groupBranches,
    stage: (idx === -1 ? 0 : idx + 1) as SamjaeResult['stage'],
    windowStartYear: idx === -1 ? sajuYear + untilStart : sajuYear - idx,
  };
}

// ───────────────────────── 조후용신 (climate adjustment) ─────────────────────────

/**
 * 궁통보감-lineage 조후용신 lookup (아베타이잔전집 제6권 조후용신간법 table):
 * day stem × month branch → primary 조후용신 + supporting stems.
 * Month order 인묘진사오미신유술해자축 (offset 0 = 인월).
 */
const JOHU_PRIMARY: string[][] = [
  ['丙', '庚', '庚', '癸', '癸', '癸', '庚', '庚', '庚', '庚', '丁', '丁'], // 甲
  ['丙', '丙', '癸', '癸', '癸', '癸', '丙', '癸', '癸', '丙', '丙', '丙'], // 乙
  ['壬', '壬', '壬', '壬', '壬', '壬', '壬', '壬', '甲', '甲', '壬', '壬'], // 丙
  ['甲', '庚', '甲', '甲', '壬', '甲', '甲', '甲', '甲', '甲', '甲', '甲'], // 丁
  ['丙', '丙', '甲', '甲', '壬', '癸', '丙', '丙', '甲', '丙', '丙', '丙'], // 戊
  ['丙', '甲', '丙', '癸', '癸', '癸', '丙', '丙', '甲', '丙', '丙', '丙'], // 己
  ['戊', '丁', '甲', '壬', '壬', '丁', '丁', '丁', '甲', '丁', '丁', '丙'], // 庚
  ['己', '壬', '壬', '壬', '壬', '壬', '壬', '壬', '壬', '壬', '丙', '丙'], // 辛
  ['庚', '戊', '甲', '壬', '癸', '辛', '戊', '甲', '甲', '戊', '戊', '丙'], // 壬
  ['辛', '庚', '丙', '辛', '庚', '庚', '丁', '辛', '辛', '庚', '丙', '丙'], // 癸
];
const JOHU_SECONDARY: string[][] = [
  ['癸', '丙丁戊己', '丁壬', '丁庚', '丁庚', '丁庚', '丁壬', '丙丁', '甲丁壬癸', '丁丙戊', '庚丙', '庚丙'],
  ['癸', '癸', '丙戊', '庚辛', '丙', '丙', '癸己', '丙丁', '辛', '戊', '', ''],
  ['庚', '己', '甲', '庚癸', '庚', '庚', '戊', '癸', '壬', '戊庚壬', '戊己', '甲'],
  ['庚', '甲', '庚', '庚', '庚癸', '壬庚', '庚丙戊', '庚丙戊', '庚戊', '庚', '庚', '庚'],
  ['甲癸', '甲癸', '丙癸', '丙癸', '甲丙', '甲丙', '甲癸', '癸', '丙癸', '丙', '甲', '甲'],
  ['庚甲', '丙癸', '甲癸', '丙', '丙', '丙', '癸', '癸', '丙癸', '甲戊', '甲戊', '甲戊'],
  ['甲壬丙丁', '甲庚丙', '丁壬癸', '戊丙丁', '癸', '甲', '甲', '甲丙', '壬', '丙', '甲丙', '丁甲'],
  ['壬庚', '甲', '甲', '甲癸', '己癸', '庚甲', '甲戊', '甲', '甲', '丙', '戊壬甲', '壬戊己'],
  ['丙戊', '辛庚', '庚', '辛庚癸', '庚辛', '甲', '丁', '庚', '丙', '丙庚', '丙', '丁甲'],
  ['丙', '辛', '辛甲', '', '辛壬癸', '辛壬癸', '', '丙', '甲壬癸', '辛戊丁', '辛', '丁'],
];

const STEM_HANJA_ELEMENT: Record<string, Element> = {
  '甲': 'wood', '乙': 'wood', '丙': 'fire', '丁': 'fire', '戊': 'earth',
  '己': 'earth', '庚': 'metal', '辛': 'metal', '壬': 'water', '癸': 'water',
};

export interface JohuResult {
  primary: { hanja: string; element: Element };
  secondary: { hanja: string; element: Element }[];
}

/** 조후용신 for the chart's day stem × month branch. */
export function johuYongsin(r: SajuResult): JohuResult {
  const m = (r.month.branch - 2 + 12) % 12;
  const primary = JOHU_PRIMARY[r.day.stem][m];
  const secondary = [...(JOHU_SECONDARY[r.day.stem][m] ?? '')];
  return {
    primary: { hanja: primary, element: STEM_HANJA_ELEMENT[primary] },
    secondary: secondary.map((h) => ({ hanja: h, element: STEM_HANJA_ELEMENT[h] })),
  };
}

// ───────────────────────── extra 신살 (홍염·암록·금여·천의) ─────────────────────────

export type ExtraShinsalName = 'hongYeom' | 'amNok' | 'geumYeo' | 'cheonUi';

export interface ExtraShinsalOccurrence {
  name: ExtraShinsalName;
  targetRole: 'year' | 'month' | 'day' | 'hour';
  targetBranch: number;
}

/** Day stem → 홍염 branches (갑오 을신 병인 정미 무진 기진 경술·신 신유 임자·신 계신). */
const HONG_YEOM: number[][] = [[6], [8], [2], [7], [4], [4], [10, 8], [9], [0, 8], [8]];
/** Day stem → 건록 branch (갑인 을묘 병사 정오 무사 기오 경신 신유 임해 계자). */
const GEONROK: number[] = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0];
/** 육합 pairs: 자축 인해 묘술 진유 사신 오미. */
const YUKHAP: number[] = [1, 0, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];

/**
 * Popular reference 신살 beyond the engine's set, computed here so the
 * verified engine stays untouched: 홍염(day stem table), 암록(육합 of the
 * day stem's 건록), 금여(건록 + 2), 천의(the branch just before the month
 * branch, sought outside the month pillar).
 */
export function extraShinsal(r: SajuResult): ExtraShinsalOccurrence[] {
  const out: ExtraShinsalOccurrence[] = [];
  const dayStem = r.day.stem;
  const hong = HONG_YEOM[dayStem];
  const amnok = YUKHAP[GEONROK[dayStem]];
  const geumyeo = (GEONROK[dayStem] + 2) % 12;
  const cheonui = (r.month.branch + 11) % 12;
  const roles = [
    ['year', r.year], ['month', r.month], ['day', r.day], ['hour', r.hour],
  ] as const;
  for (const [role, p] of roles) {
    if (!p) continue;
    if (hong.includes(p.branch)) out.push({ name: 'hongYeom', targetRole: role, targetBranch: p.branch });
    if (p.branch === amnok) out.push({ name: 'amNok', targetRole: role, targetBranch: p.branch });
    if (p.branch === geumyeo) out.push({ name: 'geumYeo', targetRole: role, targetBranch: p.branch });
    if (role !== 'month' && p.branch === cheonui) out.push({ name: 'cheonUi', targetRole: role, targetBranch: p.branch });
  }
  return out;
}
