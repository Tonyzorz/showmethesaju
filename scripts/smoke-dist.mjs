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
  const html = read(path.join(locale, 'reading', 'index.html'));
  assert(html.includes('id="loading-state"'), `${locale}: missing non-blank loading fallback`);
  assert(html.includes('id="render-error"'), `${locale}: missing visible render error`);
  assert(html.includes('id="element-radar"'), `${locale}: missing Five Elements chart`);
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

const analyticsBundle = bundles.find(({ source }) => source.includes('google-analytics-script'));
assert(analyticsBundle, 'Could not identify the built analytics bundle');
assert(analyticsBundle.source.includes('G-RMFH4E7NGS'), 'GA4 measurement ID missing from analytics bundle');
assert(analyticsBundle.source.includes('location.origin') && analyticsBundle.source.includes('location.pathname'),
  'Analytics page locations are not built from the query-free origin and path');
assert(!analyticsBundle.source.includes('location.search'), 'Analytics bundle must not read or send URL query parameters');

console.log(`Smoke-tested ${locales.length} reading pages, rendering order, consent defaults, and query-free GA4 wiring.`);
