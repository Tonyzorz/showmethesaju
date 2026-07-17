export const GA_MEASUREMENT_ID = 'G-RMFH4E7NGS';
export const ANALYTICS_CONSENT_KEY = 'showmethesaju.analytics-consent.v1';

type ConsentChoice = 'granted' | 'denied';
type AnalyticsValue = string | number | boolean;
type AnalyticsParams = Record<string, AnalyticsValue | null | undefined>;
type QueuedEvent = { name: string; params: Record<string, AnalyticsValue> };

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
    __sajuAnalyticsReady?: boolean;
    __sajuAnalyticsConsent?: ConsentChoice;
    __sajuAnalyticsQueue?: QueuedEvent[];
    __sajuAnalyticsInitialized?: boolean;
    __sajuClickTrackingInstalled?: boolean;
    __sajuPageViewSent?: boolean;
  }
}

const EVENT_NAME = /^[a-z][a-z0-9_]{0,39}$/;
const SENSITIVE_PARAM = /(birth|date|year|month|day|hour|minute|gender|sex|longitude|latitude|coordinate|query|email|phone|address|full_name)/i;

function sanitizedParams(params: AnalyticsParams): Record<string, AnalyticsValue> {
  const safe: Record<string, AnalyticsValue> = {};
  for (const [key, value] of Object.entries(params)) {
    if (SENSITIVE_PARAM.test(key) || value == null) continue;
    if (typeof value === 'number') {
      if (Number.isFinite(value)) safe[key] = value;
    } else if (typeof value === 'boolean') {
      safe[key] = value;
    } else {
      safe[key] = value.slice(0, 100);
    }
  }
  return safe;
}

function queuedEvents(): QueuedEvent[] {
  return window.__sajuAnalyticsQueue ??= [];
}

/**
 * Sends a GA4 event only after analytics consent. Events created before the
 * consent controller initializes are held in memory, never persisted.
 */
export function trackEvent(name: string, params: AnalyticsParams = {}) {
  if (typeof window === 'undefined' || !EVENT_NAME.test(name)) return;
  const event = { name, params: sanitizedParams(params) };
  if (window.__sajuAnalyticsReady && window.__sajuAnalyticsConsent === 'granted') {
    window.gtag('event', event.name, { ...event.params, transport_type: 'beacon' });
    return;
  }
  if (window.__sajuAnalyticsConsent !== 'denied') {
    const queue = queuedEvents();
    if (queue.length < 30) queue.push(event);
  }
}

function storageChoice(): ConsentChoice | null {
  try {
    const value = localStorage.getItem(ANALYTICS_CONSENT_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

function persistChoice(choice: ConsentChoice) {
  try { localStorage.setItem(ANALYTICS_CONSENT_KEY, choice); } catch { /* Storage can be blocked. */ }
}

function safePageLocation() {
  return `${location.origin}${location.pathname}`;
}

function clearAnalyticsCookies() {
  for (const item of document.cookie.split(';')) {
    const name = item.split('=')[0]?.trim();
    if (name === '_ga' || name?.startsWith('_ga_')) {
      document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
    }
  }
}

function updateGoogleConsent(choice: ConsentChoice) {
  window.gtag('consent', 'update', {
    analytics_storage: choice,
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
}

function loadGoogleAnalytics() {
  if (window.__sajuAnalyticsReady) return;

  updateGoogleConsent('granted');
  const safeLocation = safePageLocation();
  window.gtag('set', {
    page_location: safeLocation,
    page_title: document.title,
  });
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    cookie_expires: 60 * 60 * 24 * 90,
  });

  if (!document.getElementById('google-analytics-script')) {
    const script = document.createElement('script');
    script.id = 'google-analytics-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.append(script);
  }

  window.__sajuAnalyticsReady = true;
  if (!window.__sajuPageViewSent) {
    window.gtag('event', 'page_view', {
      page_title: document.title,
      page_location: safeLocation,
      language: document.documentElement.lang,
      transport_type: 'beacon',
    });
    window.__sajuPageViewSent = true;
  }

  for (const event of queuedEvents().splice(0)) {
    window.gtag('event', event.name, { ...event.params, transport_type: 'beacon' });
  }
}

function installClickTracking() {
  if (window.__sajuClickTrackingInstalled) return;
  window.__sajuClickTrackingInstalled = true;
  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element
      ? (event.target.closest('[data-analytics-event]') as HTMLElement | null)
      : null;
    if (!target) return;
    trackEvent(target.dataset.analyticsEvent!, {
      destination: target.dataset.analyticsDestination,
      link_area: target.dataset.analyticsArea,
      language: document.documentElement.lang,
    });
  });
}

interface ConsentControllerOptions {
  banner: HTMLElement;
  acceptButton: HTMLButtonElement;
  rejectButton: HTMLButtonElement;
  settingsButton: HTMLButtonElement | null;
}

/** Initializes consent once per page and wires the localized controls. */
export function initializeAnalyticsConsent(options: ConsentControllerOptions) {
  if (window.__sajuAnalyticsInitialized) return;
  window.__sajuAnalyticsInitialized = true;
  installClickTracking();

  const showBanner = () => {
    options.banner.hidden = false;
    options.acceptButton.focus({ preventScroll: true });
  };
  const hideBanner = () => { options.banner.hidden = true; };

  options.acceptButton.addEventListener('click', () => {
    persistChoice('granted');
    window.__sajuAnalyticsConsent = 'granted';
    hideBanner();
    loadGoogleAnalytics();
    trackEvent('analytics_consent_update', { consent_choice: 'granted' });
  });

  options.rejectButton.addEventListener('click', () => {
    const analyticsWasLoaded = Boolean(document.getElementById('google-analytics-script'));
    persistChoice('denied');
    window.__sajuAnalyticsConsent = 'denied';
    window.__sajuAnalyticsReady = false;
    window.__sajuAnalyticsQueue = [];
    updateGoogleConsent('denied');
    clearAnalyticsCookies();
    hideBanner();
    if (analyticsWasLoaded) location.reload();
  });

  options.settingsButton?.addEventListener('click', showBanner);

  const choice = storageChoice();
  window.__sajuAnalyticsConsent = choice ?? undefined;
  if (choice === 'granted') loadGoogleAnalytics();
  else if (choice === 'denied') window.__sajuAnalyticsQueue = [];
  else showBanner();
}
