import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import KoreanLunarCalendar from 'korean-lunar-calendar';
import { computeSaju, ipchunUtcMs, sunApparentLongitude } from '../src/lib/saju-engine.ts';
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
