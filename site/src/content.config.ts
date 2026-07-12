import { defineCollection, z } from 'astro:content';

const lab = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.string(),
    status: z.enum(['draft', 'published']),
  }),
});

/**
 * 9-частная структура кейса из master-spec.md §4: контекст/аудитория, задача/ограничения,
 * решение, hero, экраны с подписями, техчасть (тело статьи), роль студии, результат, CTA к продукту.
 */
const cases = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    category: z.string(),
    client: z.string(),
    audience: z.string(),
    task: z.string(),
    constraints: z.array(z.string()),
    solution: z.string(),
    screens: z.array(z.object({ id: z.string(), caption: z.string() })),
    role: z.string(),
    result: z.array(z.string()),
    productSlug: z.string(),
    stack: z.array(z.string()),
    presentation: z
      .object({
        variant: z.literal('editorial'),
        projectUrl: z.string().url(),
        location: z.string(),
        facts: z.array(z.object({ label: z.string(), value: z.string() })),
        metrics: z.array(z.object({ value: z.string(), label: z.string() })),
        scenarios: z.array(z.object({
          id: z.string(),
          label: z.string(),
          title: z.string(),
          description: z.string(),
          caption: z.string(),
        })).min(2).max(2),
        artDirection: z.object({
          title: z.string(),
          description: z.string(),
          typography: z.string(),
          palette: z.array(z.string()).min(2).max(5),
          voice: z.string(),
        }),
        engineering: z.object({
          performance: z.array(z.object({ value: z.string(), label: z.string() })),
          conversion: z.array(z.string()),
          pipeline: z.array(z.string()).min(3),
        }),
        cta: z.object({
          title: z.string(),
          copy: z.string(),
        }),
      })
      .optional(),
    status: z.enum(['published']),
  }),
});

export const collections = { lab, cases };
