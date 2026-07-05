import { defineCollection, z } from 'astro:content';

const cases = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    tag: z.string(),
    term: z.string(),
    digit: z.string(),
    summary: z.string(),
    productType: z.string(),
    order: z.number(),
    accent: z.enum(['blue', 'ochre', 'ink', 'gold']).default('gold'),
    flow: z.array(z.string()).default([]),
  }),
});

const lab = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.string(),
    status: z.enum(['draft', 'published']),
  }),
});

export const collections = { cases, lab };
