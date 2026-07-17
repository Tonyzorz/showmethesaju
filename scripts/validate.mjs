import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import KoreanLunarCalendar from 'korean-lunar-calendar';
import {
  branchRelationTypes,
  cheonEulBranchesForDayStem,
  computeAnnualLuck,
  computeSaju,
  hiddenStemsForBranch,
  ipchunUtcMs,
  nayinForPillar,
  shinsalNamesForBranch,
  sunApparentLongitude,
  twelveShinsalForBranch,
  twelveStageForStemBranch,
  voidBranchesForPillar,
} from '../src/lib/saju-engine.ts';
import { CITIES, tzOffsetMinutes } from '../src/lib/cities.ts';
import { TERMS } from '../src/lib/glossary.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const localeDir = path.join(root, 'src', 'i18n');
const localeFiles = fs.readdirSync(localeDir).filter((name) => name.endsWith('.json')).sort();

const flatten = (object, prefix = '', output = {}) => {
  for (const [key, value] of Object.entries(object)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object') flatten(value, fullKey, output);
    else output[fullKey] = String(value);
  }
  return output;
};
const variables = (text) => [...text.matchAll(/\{([^}]+)\}/g)].map((match) => match[1]).sort();
const dictionaries = Object.fromEntries(localeFiles.map((file) => [
  file.replace('.json', ''),
  flatten(JSON.parse(fs.readFileSync(path.join(localeDir, file), 'utf8'))),
]));
const english = dictionaries.en;
const expectedKeys = Object.keys(english).sort();

assert.equal(localeFiles.length, 11, 'Expected 11 locale files.');
for (const [locale, dictionary] of Object.entries(dictionaries)) {
  assert.deepEqual(Object.keys(dictionary).sort(), expectedKeys, `${locale}: locale keys differ from English.`);
  for (const key of expectedKeys) {
    assert.ok(dictionary[key].trim(), `${locale}.${key}: translation is empty.`);
    assert.doesNotMatch(dictionary[key], /PLACEHOLDER|REPLACE_ME|coming soon|goes here/i, `${locale}.${key}: placeholder text remains.`);
    assert.deepEqual(variables(dictionary[key]), variables(english[key]), `${locale}.${key}: interpolation variables differ.`);
  }
  for (const term of TERMS) {
    assert.ok(dictionary[`glossary.terms.${term.key}.name`], `${locale}: missing glossary name for ${term.key}.`);
    assert.ok(dictionary[`glossary.terms.${term.key}.def`], `${locale}: missing glossary definition for ${term.key}.`);
  }
}

// The installed Korean calendar follows KASI data and provides independent day-cycle fixtures.
for (const [year, month, day] of [
  [1900, 1, 1], [1956, 3, 3], [1984, 2, 4], [2000, 1, 7],
  [2017, 6, 24], [2024, 2, 3], [2024, 2, 5], [2050, 12, 31],
]) {
  const calendar = new KoreanLunarCalendar();
  assert.equal(calendar.setSolarDate(year, month, day), true, `Calendar fixture is outside the supported range: ${year}-${month}-${day}`);
  const expectedDay = calendar.getChineseGapja().day.replace('日', '');
  const actualDay = computeSaju({ year, month, day, hour: 12, tzOffsetMinutes: 540 }).day.hanja;
  assert.equal(actualDay, expectedDay, `Day pillar differs on ${year}-${month}-${day}.`);
}

const inputAtUtc = (utcMs, offset = 540) => {
  const local = new Date(utcMs + offset * 60_000);
  return {
    year: local.getUTCFullYear(), month: local.getUTCMonth() + 1, day: local.getUTCDate(),
    hour: local.getUTCHours(), minute: local.getUTCMinutes(), tzOffsetMinutes: offset,
  };
};
const ipchun2024 = ipchunUtcMs(2024);
assert.equal(computeSaju(inputAtUtc(ipchun2024 - 60_000)).year.hanja, '癸卯', 'Year pillar should remain 癸卯 before 2024 Ipchun.');
assert.equal(computeSaju(inputAtUtc(ipchun2024 + 60_000)).year.hanja, '甲辰', 'Year pillar should change to 甲辰 after 2024 Ipchun.');
assert.equal(computeSaju({ year: 2000, month: 1, day: 7, hour: 0, minute: 30, tzOffsetMinutes: 540 }).hour?.branch, 0, '00:30 should be the Rat hour.');
assert.equal(computeSaju({ year: 2000, month: 1, day: 7, hour: 23, minute: 30, tzOffsetMinutes: 540 }).day.hanja, '乙丑', 'Default 23:00 boundary should advance the day pillar.');
assert.throws(() => computeSaju({ year: 2024, month: 2, day: 30, hour: 12, tzOffsetMinutes: 540 }), RangeError);
assert.throws(() => computeSaju({ year: 2024, month: 2, day: 3, hour: 25, tzOffsetMinutes: 540 }), RangeError);

assert.deepEqual(hiddenStemsForBranch(1, 0).map((item) => item.stemHanja), ['癸', '辛', '己'], '丑 hidden stems should be 癸辛己.');
assert.deepEqual(hiddenStemsForBranch(6, 0).map((item) => item.stemHanja), ['丙', '己', '丁'], '午 hidden stems should follow the Korean 월률분야 convention.');
assert.ok(branchRelationTypes(0, 6).includes('clash'), '子午 should form a clash.');
assert.ok(branchRelationTypes(2, 5).includes('punishment') && branchRelationTypes(2, 5).includes('harm'), '寅巳 should form punishment and harm.');
assert.ok(branchRelationTypes(5, 8).includes('punishment') && branchRelationTypes(5, 8).includes('break'), '巳申 should form punishment and break.');
assert.ok(branchRelationTypes(5, 8).includes('combination'), '巳申 should also form a Six Combination.');
assert.ok(branchRelationTypes(11, 3).includes('halfHarmony'), '亥卯 should be recognized as a trine-group half combination.');
assert.ok(shinsalNamesForBranch(0, 0, 4, 1).includes('cheonEul'), '甲 day should recognize 丑 as 천을귀인.');
assert.ok(shinsalNamesForBranch(0, 0, 4, 11).includes('gongMang'), '甲子 day should recognize 戌亥 공망.');
assert.equal(twelveStageForStemBranch(1, 7), 'nurture', '乙 over 未 should be 养 in the day-stem Twelve Stages.');
assert.equal(twelveStageForStemBranch(1, 11), 'death', '乙 over 亥 should be 死.');
assert.equal(twelveStageForStemBranch(7, 11), 'bath', '辛亥 should be 沐浴 by the pillar-stem method.');
assert.equal(nayinForPillar(9, 7).hanja, '楊柳木', '癸未 Naeum should be 楊柳木.');
assert.equal(nayinForPillar(7, 11).hanja, '釵釧金', '辛亥 Naeum should be 釵釧金.');
assert.deepEqual(voidBranchesForPillar(3, 3), [10, 11], '丁卯 year pillar should have 戌亥 void.');
assert.deepEqual(voidBranchesForPillar(1, 11), [8, 9], '乙亥 day pillar should have 申酉 void.');
assert.deepEqual(cheonEulBranchesForDayStem(1), [0, 8], '乙 day stem should have 子申 as Cheon-eul branches.');
assert.equal(twelveShinsalForBranch(3, 7), 'canopy', '亥卯未 basis should assign 未 as Flower Canopy.');
assert.equal(twelveShinsalForBranch(3, 11), 'land', '亥卯未 basis should assign 亥 as Land Star.');
assert.equal(twelveShinsalForBranch(3, 3), 'general', '亥卯未 basis should assign 卯 as General Star.');

const referenceChart = computeSaju({ year: 1987, month: 11, day: 22, hour: 14, minute: 30, gender: 'female', tzOffsetMinutes: 540, longitude: 127.5, useTrueSolarTime: true });
assert.deepEqual([referenceChart.hour?.hanja, referenceChart.day.hanja, referenceChart.month.hanja, referenceChart.year.hanja], ['癸未', '乙亥', '辛亥', '丁卯'], 'Reference screenshot pillars should match after longitude correction.');
assert.ok(referenceChart.shinsal.some((item) => item.name === 'cheonDeok' && item.targetRole === 'day'), '亥 month should place Cheon-deok on 乙 day stem.');
assert.ok(referenceChart.shinsal.some((item) => item.name === 'hyeonChim' && item.targetRole === 'month'), '辛 month stem should mark Hyeonchim.');
assert.ok(referenceChart.shinsal.some((item) => item.name === 'goRan' && item.targetRole === 'month'), '辛亥 month pillar should mark Goran under the selected convention.');
assert.ok(referenceChart.shinsal.some((item) => item.name === 'geonRok' && item.targetRole === 'year'), '乙 day stem should mark 卯 as Geonrok.');

const yangYearMale = computeSaju({ year: 2024, month: 7, day: 2, hour: 12, gender: 'male', tzOffsetMinutes: 540 });
const yangYearFemale = computeSaju({ year: 2024, month: 7, day: 2, hour: 12, gender: 'female', tzOffsetMinutes: 540 });
assert.equal(yangYearMale.year.stemYang, true, 'Fixture must use a Yang year stem.');
assert.equal(yangYearMale.daeun?.direction, 'forward', '양남 should run Daeun forward.');
assert.equal(yangYearFemale.daeun?.direction, 'reverse', '양녀 should run Daeun in reverse.');
assert.ok((yangYearMale.daeun?.startAgeMonths ?? -1) >= 0 && (yangYearMale.daeun?.startAgeMonths ?? 121) <= 120, 'Daeun start age should fall within one solar month converted at 3 days per year.');
assert.notEqual(yangYearMale.daeun?.cycles[0].pillar.hanja, yangYearFemale.daeun?.cycles[0].pillar.hanja, 'Opposite Daeun directions must produce different first cycles.');
assert.deepEqual(computeAnnualLuck(yangYearMale, 2026, 2).map((item) => item.pillar.hanja), ['丙午', '丁未'], '2026–2027 annual pillars should be 丙午 and 丁未.');

assert.equal(tzOffsetMinutes('America/New_York', 2024, 1, 15, 12), -300, 'New York winter offset should be UTC-5.');
assert.equal(tzOffsetMinutes('America/New_York', 2024, 7, 15, 12), -240, 'New York summer offset should be UTC-4.');
assert.equal(new Set(CITIES.map((city) => city.name)).size, CITIES.length, 'City names must be unique.');
for (const city of CITIES) {
  assert.ok(city.lon >= -180 && city.lon <= 180, `${city.name}: invalid longitude.`);
  assert.doesNotThrow(() => new Intl.DateTimeFormat('en', { timeZone: city.tz }), `${city.name}: invalid IANA time zone.`);
}
for (const jd of [2_415_020.5, 2_451_545, 2_500_000]) {
  const longitude = sunApparentLongitude(jd);
  assert.ok(longitude >= 0 && longitude < 360, 'Solar longitude must be normalized.');
}

console.log(`Validated ${localeFiles.length} locales × ${expectedKeys.length} strings, ${TERMS.length} glossary terms, ${CITIES.length} cities, and core Saju fixtures.`);
