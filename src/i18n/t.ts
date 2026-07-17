import { DEFAULT_LOCALE } from './locales';

// Eagerly import every locale file; missing keys fall back to English.
const files = import.meta.glob<Record<string, unknown>>('./*.json', { eager: true });

type Dict = Record<string, string>;
const flatten = (obj: Record<string, unknown>, prefix = '', out: Dict = {}): Dict => {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object') flatten(v as Record<string, unknown>, key, out);
    else out[key] = String(v);
  }
  return out;
};

const dicts: Record<string, Dict> = {};
for (const [path, mod] of Object.entries(files)) {
  const code = path.replace('./', '').replace('.json', '');
  dicts[code] = flatten((mod as { default?: Record<string, unknown> }).default ?? mod);
}

export function t(lang: string, key: string, vars?: Record<string, string | number>): string {
  let s = dicts[lang]?.[key] ?? dicts[DEFAULT_LOCALE]?.[key];
  if (s === undefined) {
    console.warn(`[i18n] missing key "${key}" (${lang})`);
    return key;
  }
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

/** Whole namespace as a plain object — for embedding into client scripts. */
export function ns(lang: string, prefix: string): Dict {
  const out: Dict = {};
  const pick = (d: Dict) => {
    for (const [k, v] of Object.entries(d)) if (k.startsWith(prefix + '.')) out[k.slice(prefix.length + 1)] ??= v;
  };
  pick(dicts[lang] ?? {});
  pick(dicts[DEFAULT_LOCALE] ?? {});
  return out;
}
