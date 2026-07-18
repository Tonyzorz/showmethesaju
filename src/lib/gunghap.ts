/**
 * 궁합 structural comparison (client-side, two charts in, structure out).
 * Rule-based only: 합/충/형/파/해/원진 tables, ten-god pairing, element
 * complementarity, strength balance. NO scoring, NO outcome claims — the UI
 * presents structure with educational notes; interpretation stays human.
 */
import {
  branchRelationTypes, computeSaju, tenGod,
  type BranchRelationType, type Element, type SajuInput, type SajuResult, type TenGod,
} from './saju-engine.ts';
import { strengthAnalysis, type StrengthVerdict } from './saju-extras.ts';

const ELEMENTS: Element[] = ['wood', 'fire', 'earth', 'metal', 'water'];
const STEM_ELEMENT = (s: number): Element => ELEMENTS[Math.floor(s / 2)];
const PRODUCES: Record<Element, Element> = { wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood' };
const CONTROLS: Record<Element, Element> = { wood: 'earth', earth: 'water', water: 'fire', fire: 'metal', metal: 'wood' };

export type StemPairType = 'combination' | 'clash' | 'same' | 'aGeneratesB' | 'bGeneratesA' | 'aControlsB' | 'bControlsA';

export interface StemPair {
  type: StemPairType;
  /** 합화 element for 천간합 (갑기→토 …), else null. */
  transformElement: Element | null;
}

/** 일간 pair: 천간합 (diff 5), 천간충 (甲庚 乙辛 丙壬 丁癸), else element flow. */
export function dayStemPair(a: number, b: number): StemPair {
  const lo = Math.min(a, b), diff = Math.abs(a - b);
  if (diff === 5) {
    const HAP: Element[] = ['earth', 'metal', 'water', 'wood', 'fire'];
    return { type: 'combination', transformElement: HAP[lo] };
  }
  if (diff === 6 && lo <= 3) return { type: 'clash', transformElement: null };
  const ea = STEM_ELEMENT(a), eb = STEM_ELEMENT(b);
  if (ea === eb) return { type: 'same', transformElement: null };
  if (PRODUCES[ea] === eb) return { type: 'aGeneratesB', transformElement: null };
  if (PRODUCES[eb] === ea) return { type: 'bGeneratesA', transformElement: null };
  return { type: CONTROLS[ea] === eb ? 'aControlsB' : 'bControlsA', transformElement: null };
}

/** Branch pair relations. Half-harmony already represents shared 삼합 membership. */
export type PairRelation = BranchRelationType | 'sameBranch';
export function branchPair(a: number, b: number): PairRelation[] {
  const out: PairRelation[] = [...branchRelationTypes(a, b)];
  if (a === b) out.unshift('sameBranch');
  return out;
}

export interface GunghapResult {
  a: SajuResult;
  b: SajuResult;
  /** 겉궁합: year branches (띠). */
  yearRelations: PairRelation[];
  /** 속궁합: day branches (배우자궁). */
  dayRelations: PairRelation[];
  stems: StemPair;
  /** What B's day master is to A, and vice versa. */
  tenGodOfBForA: TenGod;
  tenGodOfAForB: TenGod;
  /** Elements absent in A's visible chart that B has ≥2 of (and vice versa). */
  bFillsForA: Element[];
  aFillsForB: Element[];
  strengthA: StrengthVerdict;
  strengthB: StrengthVerdict;
}

export function computeGunghap(inputA: SajuInput, inputB: SajuInput): GunghapResult {
  const a = computeSaju(inputA);
  const b = computeSaju(inputB);
  const fills = (self: SajuResult, other: SajuResult): Element[] =>
    ELEMENTS.filter((el) => self.elementCounts[el] === 0 && other.elementCounts[el] >= 2);
  return {
    a, b,
    yearRelations: branchPair(a.year.branch, b.year.branch),
    dayRelations: branchPair(a.day.branch, b.day.branch),
    stems: dayStemPair(a.day.stem, b.day.stem),
    tenGodOfBForA: tenGod(a.day.stem, b.day.stem),
    tenGodOfAForB: tenGod(b.day.stem, a.day.stem),
    bFillsForA: fills(a, b),
    aFillsForB: fills(b, a),
    strengthA: strengthAnalysis(a).verdict,
    strengthB: strengthAnalysis(b).verdict,
  };
}
