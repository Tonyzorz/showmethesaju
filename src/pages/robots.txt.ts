import type { APIRoute } from 'astro';

/**
 * robots.txt generated from the configured site URL so it stays correct
 * across the github.io preview and the showmethesaju.com cutover.
 * Note: only effective at the domain root (i.e. after cutover); GitHub
 * serves project pages under a sub-path where robots.txt is not consulted.
 * /reading is intentionally NOT disallowed — its noindex meta must remain
 * crawlable to be honored.
 */
export const GET: APIRoute = ({ site }) => {
  const root = (site?.toString() ?? 'https://showmethesaju.com/').replace(/\/$/, '');
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${root}/sitemap-index.xml\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
