/**
 * saju-engine.ts — Four Pillars (사주명식) calculator, pure TypeScript, browser-safe.
 *
 * Scope:
 *  - Day pillar: exact sexagenary arithmetic (anchor: 2000-01-07 = 甲子일).
 *  - Year pillar: solar year boundary at 입춘 (sun's apparent longitude 315°),
 *    computed astronomically (Meeus low-precision solar theory, ~±1 min at terms).
 *  - Month pillar: month branch from the sun's apparent longitude interval
 *    (절기 boundaries every 30° from 315°), stem via 오호둔 rule.
 *  - Hour pillar: 12 double-hours, stem via 오서둔 rule from the day stem.
 *  - Extras: five-element counts, ten gods (십성) relative to the day master.
 *
 * NOT in scope: lunar→solar conversion. Convert 음력 input at the UI layer with
 * the `korean-lunar-calendar` npm package, then pass the solar date here.
 *
 * VERIFY BEFORE LAUNCH: cross-check ≥20 dates against KASI 만세력
 * (https://astro.kasi.re.kr), especially births within ±1 day of 입춘/절기,
 * 23:00–01:00 births, and lunar leap-month conversions. See PLAN.md Phase 4.
 */

// ───────────────────────────── constants ─────────────────────────────

export const STEMS_HANJA = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
export const STEMS_KO = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'] as const;
export const BRANCHES_HANJA = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
export const BRANCHES_KO = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'] as const;

export type Element = 'wood' | 'fire' | 'earth' | 'metal' | 'water';
const ELEMENTS: Element[] = ['wood', 'fire', 'earth', 'metal', 'water'];

/** Stem index → element (甲乙 wood, 丙丁 fire, 戊己 earth, 庚辛 metal, 壬癸 water). */
const STEM_ELEMENT = (s: number): Element => ELEMENTS[Math.floor(s / 2)];
/** Branch index → element (子water 丑earth 寅卯wood 辰earth 巳午fire 未earth 申酉metal 戌earth 亥water). */
const BRANCH_ELEMENT: Element[] = [
  'water', 'earth', 'wood', 'wood', 'earth', 'fire',
  'fire', 'earth', 'metal', 'metal', 'earth', 'water',
];

export type TenGod =
  | '비견' | '겁재' | '식신' | '상관' | '편재'
  | '정재' | '편관' | '정관' | '편인' | '정인';

// ───────────────────────────── types ─────────────────────────────

export interface SajuInput {
  /** Local birth date/time. `hour`/`minute` ignored when timeUnknown. */
  year: number; month: number; day: number;   // month 1–12
  hour?: number; minute?: number;             // local civil time
  timeUnknown?: boolean;
  /** Minutes east of UTC for the birth place, e.g. KST = +540. */
  tzOffsetMinutes: number;
  /** Birth place longitude in degrees east; only used when useTrueSolarTime. */
  longitude?: number;
  /**
   * Apply longitude-based local-mean-solar-time correction:
   * (longitude×4 − tzOffset) minutes.
   * Seoul (126.98°E, KST) ≈ −32 min. Equation of time is NOT applied (schools differ).
   */
  useTrueSolarTime?: boolean;
  /**
   * When the civil day flips for the day pillar.
   * '23:00' = day changes at 자시 start (common app convention).
   * '00:00' = day changes at midnight (야자시/조자시 school). Default '23:00'.
   */
  dayBoundary?: '23:00' | '00:00';
}

export interface Pillar {
  stem: number; branch: number;               // indices
  stemHanja: string; branchHanja: string;
  stemKo: string; branchKo: string;
  hanja: string;                              // e.g. '甲子'
  stemElement: Element; branchElement: Element;
  stemYang: boolean; branchYang: boolean;
  /** Ten god of this stem relative to the day master (null on the day pillar itself). */
  tenGod: TenGod | null;
}

export interface SajuResult {
  year: Pillar; month: Pillar; day: Pillar; hour: Pillar | null;
  dayMaster: { hanja: string; ko: string; element: Element; yang: boolean };
  /** Counts across all stems+branches present (hour excluded when unknown). */
  elementCounts: Record<Element, number>;
  /** Sun's apparent longitude at birth, degrees — useful for debugging term boundaries. */
  solarLongitude: number;
  /** UTC epoch ms of the birth instant used for year/month pillars. */
  utcMs: number;
}

// ───────────────────────── astronomy (Meeus low-precision) ─────────────────────────

const DEG = Math.PI / 180;
const mod = (n: number, m: number) => ((n % m) + m) % m;

/** Julian Day from UTC epoch milliseconds. */
const jdFromUtcMs = (ms: number) => ms / 86400000 + 2440587.5;

/** Sun's apparent geocentric longitude (degrees, 0–360). Accuracy ~0.01° (~15 min of time). */
export function sunApparentLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const Mr = M * DEG;
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mr) +
    0.000289 * Math.sin(3 * Mr);
  const trueLong = L0 + C;
  const omega = 125.04 - 1934.136 * T;
  const apparent = trueLong - 0.00569 - 0.00478 * Math.sin(omega * DEG);
  return mod(apparent, 360);
}

/**
 * UTC ms of 입춘 (longitude 315°) for a given calendar year.
 * Bisection between Jan 20 and Feb 20 — longitude rises ~300°→~330° there, no wrap.
 */
export function ipchunUtcMs(year: number): number {
  let lo = Date.UTC(year, 0, 20);
  let hi = Date.UTC(year, 1, 20);
  for (let i = 0; i < 48; i++) {
    const mid = (lo + hi) / 2;
    if (sunApparentLongitude(jdFromUtcMs(mid)) < 315) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

// ───────────────────────── pillar arithmetic ─────────────────────────

/** Days since Unix epoch for a local calendar date (pure calendar math, no tz). */
const dayNumber = (y: number, m: number, d: number) => Date.UTC(y, m - 1, d) / 86400000;

/** Anchor: 2000-01-07 was a 甲子 (index 0) day. */
const DAY_ANCHOR = dayNumber(2000, 1, 7);

/** 1984 (갑자년) anchors the year cycle; the saju year runs 입춘→입춘. */
const YEAR_ANCHOR = 1984;

const makePillar = (stem: number, branch: number, dayStem: number | null): Pillar => ({
  stem, branch,
  stemHanja: STEMS_HANJA[stem], branchHanja: BRANCHES_HANJA[branch],
  stemKo: STEMS_KO[stem], branchKo: BRANCHES_KO[branch],
  hanja: STEMS_HANJA[stem] + BRANCHES_HANJA[branch],
  stemElement: STEM_ELEMENT(stem), branchElement: BRANCH_ELEMENT[branch],
  stemYang: stem % 2 === 0, branchYang: branch % 2 === 0,
  tenGod: dayStem === null ? null : tenGod(dayStem, stem),
});

/** Ten god of `other` stem relative to `dayStem`. Returns null when other IS the day master slot. */
export function tenGod(dayStem: number, other: number): TenGod {
  const de = Math.floor(dayStem / 2);        // day element index 0–4
  const oe = Math.floor(other / 2);
  const samePol = dayStem % 2 === other % 2;
  if (oe === de) return samePol ? '비견' : '겁재';
  if (oe === mod(de + 1, 5)) return samePol ? '식신' : '상관';   // day generates other
  if (oe === mod(de + 2, 5)) return samePol ? '편재' : '정재';   // day controls other
  if (oe === mod(de + 3, 5)) return samePol ? '편관' : '정관';   // other controls day
  return samePol ? '편인' : '정인';                               // other generates day
}

// ───────────────────────── main ─────────────────────────

export function computeSaju(input: SajuInput): SajuResult {
  const {
    year, month, day,
    hour = 12, minute = 0,
    timeUnknown = false,
    tzOffsetMinutes,
    longitude,
    useTrueSolarTime = false,
    dayBoundary = '23:00',
  } = input;

  if (![year, month, day, hour, minute, tzOffsetMinutes].every(Number.isFinite)) {
    throw new RangeError('Saju input must contain finite numbers.');
  }
  if (!Number.isInteger(year) || year < 1000 || year > 9999 ||
      !Number.isInteger(month) || month < 1 || month > 12 ||
      !Number.isInteger(day) || day < 1 || day > 31) {
    throw new RangeError('Invalid birth date.');
  }
  const dateCheck = new Date(Date.UTC(year, month - 1, day));
  if (dateCheck.getUTCFullYear() !== year || dateCheck.getUTCMonth() !== month - 1 || dateCheck.getUTCDate() !== day) {
    throw new RangeError('Invalid calendar date.');
  }
  if (!Number.isInteger(hour) || hour < 0 || hour > 23 || !Number.isInteger(minute) || minute < 0 || minute > 59) {
    throw new RangeError('Invalid birth time.');
  }
  if (tzOffsetMinutes < -14 * 60 || tzOffsetMinutes > 14 * 60) {
    throw new RangeError('Invalid time-zone offset.');
  }
  if (longitude !== undefined && (!Number.isFinite(longitude) || longitude < -180 || longitude > 180)) {
    throw new RangeError('Invalid longitude.');
  }

  // Absolute instant (drives year & month pillars). Unknown time → assume local noon,
  // which is safe unless birth is on a term-boundary day (flag that in the UI).
  const localMs = Date.UTC(year, month - 1, day, timeUnknown ? 12 : hour, timeUnknown ? 0 : minute);
  const utcMs = localMs - tzOffsetMinutes * 60000;

  // Adjusted local clock for day/hour pillars (longitude-based local correction).
  let adjMs = localMs;
  if (useTrueSolarTime && !timeUnknown && longitude !== undefined) {
    adjMs += (longitude * 4 - tzOffsetMinutes) * 60000;
  }
  const adj = new Date(adjMs); // read with getUTC* — this Date wraps a local-clock value

  // ── Year pillar ──
  const beforeIpchun = utcMs < ipchunUtcMs(year);
  const sajuYear = beforeIpchun ? year - 1 : year;
  const yIdx = mod(sajuYear - YEAR_ANCHOR, 60);
  const yStem = yIdx % 10, yBranch = yIdx % 12;

  // ── Month pillar ── branch from solar longitude interval; 315°=寅 (branch idx 2).
  const lambda = sunApparentLongitude(jdFromUtcMs(utcMs));
  const monthIdx = Math.floor(mod(lambda - 315, 360) / 30); // 0=寅월 … 11=丑월
  const mBranch = mod(monthIdx + 2, 12);
  const mStem = mod(((yStem % 5) * 2 + 2) + monthIdx, 10);  // 오호둔: 甲己→丙寅 …

  // ── Day pillar ──
  let dY = adj.getUTCFullYear(), dM = adj.getUTCMonth() + 1, dD = adj.getUTCDate();
  if (dayBoundary === '23:00' && !timeUnknown && adj.getUTCHours() === 23) {
    const next = new Date(adjMs + 86400000);
    dY = next.getUTCFullYear(); dM = next.getUTCMonth() + 1; dD = next.getUTCDate();
  }
  const dIdx = mod(dayNumber(dY, dM, dD) - DAY_ANCHOR, 60);
  const dStem = dIdx % 10, dBranch = dIdx % 12;

  // ── Hour pillar ──
  let hourPillar: Pillar | null = null;
  if (!timeUnknown) {
    const minutes = adj.getUTCHours() * 60 + adj.getUTCMinutes();
    const hBranch = Math.floor(mod(minutes + 60, 1440) / 120) % 12; // 23:00–00:59 = 子
    const hStem = mod((dStem % 5) * 2 + hBranch, 10);               // 오서둔: 甲己→甲子시 …
    hourPillar = makePillar(hStem, hBranch, dStem);
  }

  const pillars = {
    year: makePillar(yStem, yBranch, dStem),
    month: makePillar(mStem, mBranch, dStem),
    day: makePillar(dStem, dBranch, null),
    hour: hourPillar,
  };

  // ── Element counts ──
  const elementCounts: Record<Element, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  for (const p of [pillars.year, pillars.month, pillars.day, pillars.hour]) {
    if (!p) continue;
    elementCounts[p.stemElement]++;
    elementCounts[p.branchElement]++;
  }

  return {
    ...pillars,
    dayMaster: {
      hanja: STEMS_HANJA[dStem], ko: STEMS_KO[dStem],
      element: STEM_ELEMENT(dStem), yang: dStem % 2 === 0,
    },
    elementCounts,
    solarLongitude: lambda,
    utcMs,
  };
}

// ───────────────────────── self-test scaffolding ─────────────────────────
/**
 * Vitest starter (Phase 4). The anchor test must pass immediately; the fixture
 * file must be filled with KASI-verified cases before public launch.
 *
 * import { describe, expect, it } from 'vitest';
 * import { computeSaju } from './saju-engine';
 *
 * describe('saju-engine anchors', () => {
 *   it('2000-01-07 12:00 KST is a 甲子 day', () => {
 *     const r = computeSaju({ year: 2000, month: 1, day: 7, hour: 12, tzOffsetMinutes: 540 });
 *     expect(r.day.hanja).toBe('甲子');
 *   });
 *   it('입춘 boundary flips the year pillar', () => {
 *     const before = computeSaju({ year: 2024, month: 2, day: 3, hour: 12, tzOffsetMinutes: 540 });
 *     const after  = computeSaju({ year: 2024, month: 2, day: 5, hour: 12, tzOffsetMinutes: 540 });
 *     expect(before.year.hanja).not.toBe(after.year.hanja);
 *   });
 *   // TODO Phase 4: add fixtures/kasi-verified.json with ≥20 cases from astro.kasi.re.kr
 * });
 */
