import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const locales = ['ko', 'en', 'ja', 'zh-cn', 'zh-tw', 'es', 'fr', 'de', 'pt', 'vi', 'th'];
const adsenseScript = 'pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1837000267504503';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(relativePath) {
  return fs.readFileSync(path.join(dist, relativePath), 'utf8');
}

for (const locale of locales) {
  const homeHtml = read(path.join(locale, 'index.html'));
  assert(homeHtml.includes('id="birth-form"'), `${locale}: missing birth form`);
  assert(homeHtml.includes(`rel="canonical" href="https://showmethesaju.com/${locale}/"`),
    `${locale}: canonical URL does not use the custom domain`);
  assert(homeHtml.includes('href="/_astro/') && !homeHtml.includes('/showmethesaju/_astro/'),
    `${locale}: production assets are not rooted at the custom domain`);
  assert(homeHtml.includes(adsenseScript) &&
    homeHtml.includes('crossorigin="anonymous"'), `${locale}: AdSense publisher script is missing`);
  assert(!/<(?:script|link)[^>]+(?:src|href)="http:\/\//i.test(homeHtml),
    `${locale}: insecure active-content reference would break HTTPS`);
  assert(homeHtml.includes('id="profile-list"') && homeHtml.includes('id="save-profile"') && homeHtml.includes('id="onboarding-dialog"'),
    `${locale}: local profiles or guided onboarding are missing`);
  assert(homeHtml.includes(`/${locale}/#birth-form`), `${locale}: reading navigation must lead to the birth form`);
  assert((homeHtml.match(/class="fortune-card fortune-card--/g) || []).length === 9,
    `${locale}: homepage must contain nine themed reading cards`);
  assert(homeHtml.includes('name="focus"') && homeHtml.includes('value="basic"') && homeHtml.includes('value="wealth"') &&
    homeHtml.includes('value="health"') && homeHtml.includes('value="career"') &&
    homeHtml.includes('value="relationships"') && homeHtml.includes('value="timing"') &&
    homeHtml.includes('value="personality"') && homeHtml.includes('value="noble"') && homeHtml.includes('value="movement"'),
    `${locale}: themed reading choices are incomplete`);
  assert((homeHtml.match(/data-input-step=/g) || []).length === 4, `${locale}: birth form must contain four input cards`);
  assert(homeHtml.includes('name="gender"') && homeHtml.includes('value="f"') && homeHtml.includes('value="m"'),
    `${locale}: required gender input is missing`);
  assert(homeHtml.includes('id="summary-date"') && homeHtml.includes('id="summary-time"') && homeHtml.includes('id="summary-gender"') && homeHtml.includes('id="summary-place"'),
    `${locale}: missing live birth-data review strip`);
  assert(homeHtml.includes('name="date"') && homeHtml.includes('name="time"') && homeHtml.includes('name="city"'),
    `${locale}: native birth inputs are missing`);
  assert(homeHtml.includes("window.gtag('set', 'send_page_view', false)"),
    `${locale}: global automatic GA4 page views are not disabled`);
  assert(homeHtml.includes("ad_storage: 'denied'") && homeHtml.includes("ad_user_data: 'denied'") &&
    homeHtml.includes("ad_personalization: 'denied'"),
    `${locale}: advertising consent must default to denied`);

  const html = read(path.join(locale, 'reading', 'index.html'));
  assert(html.includes('id="loading-state"'), `${locale}: missing non-blank loading fallback`);
  assert(html.includes('id="render-error"'), `${locale}: missing visible render error`);
  assert(html.includes('class="reading-empty"') && (html.match(/class="reading-empty__feature"/g) || []).length === 6,
    `${locale}: no-data reading route must show six feature cards`);
  assert(html.includes('id="element-radar"'), `${locale}: missing Five Elements chart`);
  assert(html.includes('id="reading-focus"') && (html.match(/data-reading-focus=/g) || []).length === 9,
    `${locale}: reading page must contain nine switchable themed summaries`);
  assert(html.includes('class="reading-jumpbar"') && (html.match(/data-scroll-target=/g) || []).length === 8,
    `${locale}: reading page must contain the eight-section quick navigator`);
  assert(html.includes('id="focus-metrics"') && html.includes('id="focus-details"'),
    `${locale}: themed summary metrics or evidence link is missing`);
  assert(html.includes('id="focus-evidence"') && html.includes('id="focus-evidence-copy"') && html.includes('id="focus-evidence-sources"'),
    `${locale}: themed summary evidence drawer is missing`);
  assert((html.match(/data-reading-mode=/g) || []).length === 3 && html.includes('id="focus-structure"') &&
    html.includes('id="focus-timing"') && html.includes('id="health-disclaimer"'),
    `${locale}: beginner/expert modes or expanded focus guidance are missing`);
  assert(html.includes('class="card chart-matrix-panel"') && html.includes('id="chart-facts"'),
    `${locale}: missing detailed original-chart matrix or fact grid`);
  assert((html.match(/data-layer-toggle=/g) || []).length === 4,
    `${locale}: original-chart matrix must expose four detail-layer controls`);
  assert(html.includes('id="hidden-stems"'), `${locale}: missing hidden-stem panel`);
  assert(html.includes('id="ten-god-distribution"') && html.includes('id="current-timing-cards"'),
    `${locale}: missing Ten-God family distribution or current-cycle snapshot`);
  assert(html.includes('id="branch-relations"') && html.includes('id="stem-relations"') && html.includes('id="harmony-groups"') && html.includes('id="shinsal-list"'),
    `${locale}: missing branch, stem, harmony, or Shinsal panel`);
  assert(html.includes('id="daeun-list"') && html.includes('id="seun-list"'), `${locale}: missing Daeun or annual-luck panel`);
  assert((html.match(/data-timing-target=/g) || []).length === 3 && html.includes('id="timing-path-wolun"'),
    `${locale}: connected Daeun-Seun-Wolun navigator is missing`);
  assert(html.includes('id="analytics-consent"'), `${locale}: missing consent controls`);
  assert(html.includes("window.gtag('consent', 'default'"), `${locale}: consent default is not in the document head`);
  assert(!html.includes('<script async src="https://www.googletagmanager.com/gtag/js'), `${locale}: GA must not load before consent`);
  assert(!html.includes(adsenseScript), `${locale}: AdSense must not load on the noindex reading/results page`);

  const compatibilityHtml = read(path.join(locale, 'compatibility', 'index.html'));
  assert(compatibilityHtml.includes('id="gunghap-form"') && (compatibilityHtml.match(/data-person=/g) || []).length === 2,
    `${locale}: Gunghap must contain two complete person forms`);
  assert(compatibilityHtml.includes('id="gunghap-result"') && compatibilityHtml.includes('id="gunghap-sections"'),
    `${locale}: Gunghap result shell is missing`);
  assert(compatibilityHtml.includes('id="pair-signature"') && compatibilityHtml.includes('id="pair-charts"') &&
    (compatibilityHtml.match(/data-gunghap-target=/g) || []).length === 8,
    `${locale}: Gunghap pair signature, chart comparison, or result navigator is missing`);
  const compatibilityCss = [...compatibilityHtml.matchAll(/href="[^"]*\/_astro\/([^"]+\.css)"/g)]
    .map((match) => read(path.join('_astro', match[1])))
    .join('\n');
  assert(compatibilityCss.includes('.mini-chart{') && compatibilityCss.includes('.signature-person{') &&
    compatibilityCss.includes('.gsection__head{'),
    `${locale}: Gunghap dynamic-result selectors are missing from production CSS`);
  assert(compatibilityCss.includes('.card.gunghap-result-hero{') &&
    compatibilityCss.includes('.card.gsection{') && compatibilityCss.includes('.element-text--fire{') &&
    compatibilityCss.includes('.element-bg-soft--earth{') && compatibilityCss.includes('.cross-pillar-grid{') &&
    compatibilityCss.includes('.spouse-palace-grid{'),
    `${locale}: Gunghap card overrides or shared Five-Element utilities are missing`);
  assert(compatibilityHtml.includes('id="compat-summary-grid"') && compatibilityHtml.includes('id="comparison-history"') &&
    compatibilityHtml.includes('id="share-compatibility-png"'),
    `${locale}: compatibility summary, local history, or sharing controls are missing`);
  assert(!compatibilityCss.includes('.mini-chart[data-astro-cid-') &&
    !compatibilityCss.includes('.signature-person[data-astro-cid-'),
    `${locale}: Gunghap dynamic-result CSS was incorrectly Astro-scoped`);
  assert(!compatibilityHtml.includes('REPLACE_ME') && !compatibilityHtml.includes('formspree.io/f/'),
    `${locale}: broken placeholder form endpoint remains in Gunghap`);
  assert(!compatibilityHtml.includes(adsenseScript), `${locale}: AdSense must not load on the interactive compatibility page`);

  const methodologyHtml = read(path.join(locale, 'methodology', 'index.html'));
  assert(methodologyHtml.includes('class="methodology-grid"') && methodologyHtml.includes('verification-note'),
    `${locale}: localized calculation methodology page is missing`);
  assert(methodologyHtml.includes(adsenseScript), `${locale}: AdSense is missing from the methodology page`);

  const learnHtml = read(path.join(locale, 'learn', 'index.html'));
  assert(learnHtml.includes(adsenseScript), `${locale}: AdSense is missing from the learning hub`);
  const glossaryHtml = read(path.join(locale, 'glossary', 'index.html'));
  assert(glossaryHtml.includes(adsenseScript), `${locale}: AdSense is missing from the glossary`);
  const privacyHtml = read(path.join(locale, 'privacy', 'index.html'));
  assert(!privacyHtml.includes(adsenseScript), `${locale}: AdSense must not load on the privacy page`);
  assert(privacyHtml.includes('ca-pub-1837000267504503'),
    `${locale}: privacy page is missing the AdSense publisher disclosure`);
  const aboutHtml = read(path.join(locale, 'about', 'index.html'));
  assert(!aboutHtml.includes(adsenseScript), `${locale}: AdSense must not load on the thin About page`);
}

assert(!read(path.join('404.html')).includes(adsenseScript), 'AdSense must not load on the 404 page');

assert(read('ads.txt').trim() === 'google.com, pub-1837000267504503, DIRECT, f08c47fec0942fa0',
  'ads.txt is missing or does not match the AdSense publisher record');

const jsDirectory = path.join(dist, '_astro');
const bundles = fs.readdirSync(jsDirectory)
  .filter((name) => name.endsWith('.js'))
  .map((name) => ({ name, source: fs.readFileSync(path.join(jsDirectory, name), 'utf8') }));
const allBundleSource = bundles.map(({ source }) => source).join('\n');

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
assert(homeBundle.source.includes('reading_focus_select') && homeBundle.source.includes('reading_focus'),
  'Birth-form bundle does not carry or measure the selected reading focus');
assert(homeBundle.source.includes('profile_save') && homeBundle.source.includes('onboarding_complete') && allBundleSource.includes('birth-profiles.v1'),
  'Birth-form bundle is missing local profiles or onboarding behavior');
assert(homeBundle.source.includes('`#${') || homeBundle.source.includes('`#${D}`') || homeBundle.source.includes('`#${q}`'),
  'Birth-form bundle does not keep chart state in the URL fragment');

assert(readingBundle.source.includes('hidden-stems') && readingBundle.source.includes('daeun-list') && readingBundle.source.includes('seun-list'),
  'Reading bundle is missing advanced 만세력 rendering behavior');
assert(readingBundle.source.includes('chart_layer_toggle') && readingBundle.source.includes('pillar-stage-layer') &&
  readingBundle.source.includes('pillar-nayin-layer') && readingBundle.source.includes('twelveShinsal'),
  'Reading bundle is missing chart-layer analytics or advanced pillar detail behavior');
assert(readingBundle.source.includes('reading_focus_select') && readingBundle.source.includes('focus-metrics') &&
  readingBundle.source.includes('annualPillar'),
  'Reading bundle is missing themed summary switching, metrics, or annual-cycle support');
assert(readingBundle.source.includes('reading_evidence_open') && readingBundle.source.includes('focus-evidence-sources'),
  'Reading bundle is missing expandable evidence behavior');
assert(readingBundle.source.includes('reading_mode_select') && readingBundle.source.includes('timing_tier_navigate') &&
  readingBundle.source.includes('health-disclaimer'),
  'Reading bundle is missing display modes, connected timing navigation, or health safeguards');
assert(readingBundle.source.includes('reading_section_navigate') && readingBundle.source.includes('ten-god-family') &&
  readingBundle.source.includes('current-timing-card'),
  'Reading bundle is missing section navigation, Ten-God family summaries, or current solar-month timing');
assert(readingBundle.source.includes('location.hash') && readingBundle.source.includes('location.replace'),
  'Reading bundle does not support private fragment state and query-free migration');

const gunghapBundle = bundles.find(({ source }) => source.includes('gunghap_submit') && source.includes('gunghap_view'));
assert(gunghapBundle, 'Could not identify the built Gunghap bundle');
assert(gunghapBundle.source.includes('location.hash') && gunghapBundle.source.includes('location.replace'),
  'Gunghap bundle does not keep two-person birth state in the private URL fragment');
assert(gunghapBundle.source.includes('gunghap_section_navigate') && gunghapBundle.source.includes('element-compare') &&
  gunghapBundle.source.includes('signature-person') && gunghapBundle.source.includes('gsection--wide') &&
  gunghapBundle.source.includes('crossPillarRelations') && gunghapBundle.source.includes('spouse-hidden-chip') &&
  gunghapBundle.source.includes('compat-matrix__cell') && gunghapBundle.source.includes('comparison_history_open') &&
  gunghapBundle.source.includes('share-compatibility-png'),
  'Gunghap bundle is missing result navigation, pair signature, or comparative result visualizations');

const analyticsBundle = bundles.find(({ source }) => source.includes('google-analytics-script'));
assert(analyticsBundle, 'Could not identify the built analytics bundle');
assert(analyticsBundle.source.includes('G-RMFH4E7NGS'), 'GA4 measurement ID missing from analytics bundle');
assert(analyticsBundle.source.includes('send_page_view:!1'),
  'GA4 must keep automatic page views disabled');
assert(analyticsBundle.source.includes('location.origin') && analyticsBundle.source.includes('location.pathname'),
  'Analytics page locations are not built from the query-free origin and path');
assert(!analyticsBundle.source.includes('location.search'), 'Analytics bundle must not read or send URL query parameters');

console.log(`Smoke-tested ${locales.length} home, reading, and Gunghap pages; nine localized reading themes with evidence drawers; redesigned compatibility results; result navigation; Ten-God and current-cycle summaries; private fragment state; rich chart layers; consent defaults; and query-free GA4 wiring.`);
