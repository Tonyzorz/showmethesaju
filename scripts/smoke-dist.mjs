import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const locales = ['ko', 'en', 'ja', 'zh-cn', 'zh-tw', 'es', 'fr', 'de', 'pt', 'vi', 'th'];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(relativePath) {
  return fs.readFileSync(path.join(dist, relativePath), 'utf8');
}

for (const locale of locales) {
  const homeHtml = read(path.join(locale, 'index.html'));
  assert(homeHtml.includes('id="birth-form"'), `${locale}: missing birth form`);
  assert((homeHtml.match(/data-input-step=/g) || []).length === 4, `${locale}: birth form must contain four input cards`);
  assert(homeHtml.includes('name="gender"') && homeHtml.includes('value="f"') && homeHtml.includes('value="m"'),
    `${locale}: required gender input is missing`);
  assert(homeHtml.includes('id="summary-date"') && homeHtml.includes('id="summary-time"') && homeHtml.includes('id="summary-gender"') && homeHtml.includes('id="summary-place"'),
    `${locale}: missing live birth-data review strip`);
  assert(homeHtml.includes('name="date"') && homeHtml.includes('name="time"') && homeHtml.includes('name="city"'),
    `${locale}: native birth inputs are missing`);

  const html = read(path.join(locale, 'reading', 'index.html'));
  assert(html.includes('id="loading-state"'), `${locale}: missing non-blank loading fallback`);
  assert(html.includes('id="render-error"'), `${locale}: missing visible render error`);
  assert(html.includes('id="element-radar"'), `${locale}: missing Five Elements chart`);
  assert(html.includes('class="card chart-matrix-panel"') && html.includes('id="chart-facts"'),
    `${locale}: missing detailed original-chart matrix or fact grid`);
  assert((html.match(/data-layer-toggle=/g) || []).length === 4,
    `${locale}: original-chart matrix must expose four detail-layer controls`);
  assert(html.includes('id="hidden-stems"'), `${locale}: missing hidden-stem panel`);
  assert(html.includes('id="branch-relations"') && html.includes('id="stem-relations"') && html.includes('id="harmony-groups"') && html.includes('id="shinsal-list"'),
    `${locale}: missing branch, stem, harmony, or Shinsal panel`);
  assert(html.includes('id="daeun-list"') && html.includes('id="seun-list"'), `${locale}: missing Daeun or annual-luck panel`);
  assert(html.includes('id="analytics-consent"'), `${locale}: missing consent controls`);
  assert(html.includes("window.gtag('consent', 'default'"), `${locale}: consent default is not in the document head`);
  assert(!html.includes('<script async src="https://www.googletagmanager.com/gtag/js'), `${locale}: GA must not load before consent`);
}

const jsDirectory = path.join(dist, '_astro');
const bundles = fs.readdirSync(jsDirectory)
  .filter((name) => name.endsWith('.js'))
  .map((name) => ({ name, source: fs.readFileSync(path.join(jsDirectory, name), 'utf8') }));

const readingBundle = bundles.find(({ source }) => source.includes('Unable to render Saju chart'));
assert(readingBundle, 'Could not identify the built reading bundle');
const elementOrderIndex = readingBundle.source.indexOf('["wood","fire","earth","metal","water"]');
const renderBootIndex = readingBundle.source.indexOf('Unable to render Saju chart');
assert(elementOrderIndex >= 0 && elementOrderIndex < renderBootIndex,
  'Reading boot runs before the Five Elements constant is initialized');

const homeBundle = bundles.find(({ source }) => source.includes('summary-date') && source.includes('summary-gender') && source.includes('chart_submit'));
assert(homeBundle, 'Could not identify the built interactive birth-form bundle');
assert(homeBundle.source.includes('Intl.DateTimeFormat') && homeBundle.source.includes('data-input-step'),
  'Birth-form bundle is missing localized summary or card-state behavior');
assert(homeBundle.source.includes('gender'), 'Birth-form bundle does not carry gender into the chart query');

assert(readingBundle.source.includes('hidden-stems') && readingBundle.source.includes('daeun-list') && readingBundle.source.includes('seun-list'),
  'Reading bundle is missing advanced 만세력 rendering behavior');
assert(readingBundle.source.includes('chart_layer_toggle') && readingBundle.source.includes('pillar-stage-layer') &&
  readingBundle.source.includes('pillar-nayin-layer') && readingBundle.source.includes('twelveShinsal'),
  'Reading bundle is missing chart-layer analytics or advanced pillar detail behavior');

const analyticsBundle = bundles.find(({ source }) => source.includes('google-analytics-script'));
assert(analyticsBundle, 'Could not identify the built analytics bundle');
assert(analyticsBundle.source.includes('G-RMFH4E7NGS'), 'GA4 measurement ID missing from analytics bundle');
assert(analyticsBundle.source.includes('location.origin') && analyticsBundle.source.includes('location.pathname'),
  'Analytics page locations are not built from the query-free origin and path');
assert(!analyticsBundle.source.includes('location.search'), 'Analytics bundle must not read or send URL query parameters');

console.log(`Smoke-tested ${locales.length} home and reading pages, rich chart layers, interactive birth cards, rendering order, consent defaults, and query-free GA4 wiring.`);
