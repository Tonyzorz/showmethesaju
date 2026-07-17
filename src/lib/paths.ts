/**
 * Prefix an app-absolute path (must start with '/') with Astro's configured base.
 * No-op when base is '/' (production apex domain), so calls are safe to keep
 * permanently; only astro.config `base` changes behavior.
 *   base '/'              → withBase('/en/') === '/en/'
 *   base '/showmethesaju' → withBase('/en/') === '/showmethesaju/en/'
 */
const BASE = import.meta.env.BASE_URL;
export function withBase(path: string): string {
  return BASE.replace(/\/$/, '') + path;
}
