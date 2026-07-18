// Engine fixture runner. Node 22 strips erasable TypeScript syntax directly,
// so the suite does not need a bundler or a writable node_modules cache.
// Usage: npm run test:engine
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { computeAnnualLuck, computeSaju, hiddenStemsForBranch } from '../src/lib/saju-engine.ts';
import { branchPair, computeGunghap, dayStemPair } from '../src/lib/gunghap.ts';
import { favorableElements, monthlyLuck, samjae, taewonPillar } from '../src/lib/saju-extras.ts';
import { parseComparisonHistory, parseProfiles } from '../src/lib/local-data.ts';

const root = resolve(import.meta.dirname, '..');
const { cases } = JSON.parse(readFileSync(resolve(root, 'tests/engine-fixtures.json'), 'utf8'));

let pass = 0, fail = 0, pending = 0;
for (const c of cases) {
  if (c.status === 'pending') { pending++; continue; }
  const r = computeSaju(c.input);
  const errors = [];
  for (const [role, expected] of Object.entries(c.expect)) {
    const actual = r[role]?.hanja ?? '(null)';
    if (actual !== expected) errors.push(`${role}: expected ${expected}, got ${actual}`);
  }
  if (errors.length) {
    fail++;
    console.error(`✗ ${c.name}`);
    for (const e of errors) console.error(`    ${e}`);
  } else {
    pass++;
    console.log(`✓ ${c.name}`);
  }
}

console.log(`\n${pass} passed, ${fail} failed, ${pending} pending KASI verification (see KASI-CHECKLIST.md)`);
if (fail > 0) process.exit(1);

// New presentation layers still get deterministic invariant coverage.
assert.deepEqual(dayStemPair(0, 5), { type: 'combination', transformElement: 'earth' }, '甲己 must combine toward Earth.');
assert.deepEqual(branchPair(0, 4), ['halfHarmony'], '子辰 must appear once as a half harmony.');
for (let left = 0; left < 12; left++) {
  for (let right = 0; right < 12; right++) {
    assert.deepEqual([...branchPair(left, right)].sort(), [...branchPair(right, left)].sort(),
      `Branch relations must be symmetric for ${left}/${right}.`);
  }
}
assert.deepEqual(hiddenStemsForBranch(0, 0).map((stem) => [stem.stemHanja, stem.phase]), [['壬', 'residual'], ['癸', 'main']],
  '子 must preserve the documented Korean residual/main hidden-qi ordering.');
assert.deepEqual(favorableElements('wood', 'weak').unfavorable, ['metal', 'earth', 'fire'], 'A weak Wood reference must include Authority, Wealth, and Output among unfavorable candidates.');
assert.equal(monthlyLuck(2, 3, 2026)[0].pillar.hanja, '庚寅', 'The first month of a 丙 year must be 庚寅.');
assert.equal(samjae(8, 2026).stage, 0, 'A 申-year birth is outside Samjae in 丙午 2026.');

const reference = computeSaju({ year: 1987, month: 11, day: 22, hour: 14, minute: 30, gender: 'female', tzOffsetMinutes: 540 });
assert.equal(taewonPillar(reference).hanja, '壬寅', '辛亥 month must produce 壬寅 Taewon.');
const comparison = computeGunghap(
  { year: 1987, month: 11, day: 22, hour: 14, minute: 30, gender: 'female', tzOffsetMinutes: 540 },
  { year: 1990, month: 6, day: 15, hour: 14, minute: 30, gender: 'male', tzOffsetMinutes: 540 },
);
assert.ok(comparison.a.day && comparison.b.day && comparison.stems.type, 'Gunghap must compute two charts and a day-stem relation.');
assert.ok(comparison.crossPillarRelations.length > 0 && comparison.crossPillarRelations.every((item) => item.relations.length > 0),
  'Gunghap must expose only relation-bearing cross-chart pillar pairs.');
assert.ok(comparison.a.hiddenStems.day.length > 0 && comparison.b.hiddenStems.day.length > 0,
  'Both spouse palaces must retain their hidden-stem evidence.');
assert.ok(comparison.crossPillarRelations.length <= 16, 'A full 4×4 cross-chart scan cannot exceed sixteen pillar pairs.');
const referenceMale = computeSaju({ year: 1987, month: 11, day: 22, hour: 14, minute: 30, gender: 'male', tzOffsetMinutes: 540 });
assert.notEqual(reference.daeun?.direction, referenceMale.daeun?.direction,
  'Changing gender must reverse Daeun direction for the same non-null birth chart.');
const annual = computeAnnualLuck(reference, 2026, 2);
assert.equal((annual[1].pillar.stem - annual[0].pillar.stem + 10) % 10, 1, 'Annual stems must advance by one.');
assert.deepEqual(parseProfiles('[{"id":"bad"}]'), [], 'Malformed local profiles must be rejected.');
assert.deepEqual(parseComparisonHistory('not json'), [], 'Malformed local comparison history must fail closed.');
console.log('✓ extras and Gunghap invariants');
