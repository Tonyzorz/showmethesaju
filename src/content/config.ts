import { defineCollection, z } from 'astro:content';

/**
 * Learn articles (PLAN.md §6.3). Folder = locale: src/content/learn/<locale>/<slug>.md
 * `translationKey` ties translations of the same article together for hreflang.
 * Educational content only — fortune interpretation copy is owner-written.
 */
const learn = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    translationKey: z.string(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { learn };
