import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://tonyzorz.github.io/showmethesaju/',
  base: '/showmethesaju',
  integrations: [
    sitemap({ filter: (page) => !page.includes('/reading') }),
  ],
});
