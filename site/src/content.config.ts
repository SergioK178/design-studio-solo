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

/** Editorial-презентация (guest-house): журнальный кейс с двумя сценариями и арт-дирекшном. */
const editorialPresentation = z.object({
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
});

/** Showroom-презентация (car-rental): тёмный hero с продуктовым ассетом и маршрут заявки. */
const showroomPresentation = z.object({
  variant: z.literal('showroom'),
  facts: z.array(z.object({ label: z.string(), value: z.string() })).min(2).max(5),
  ticket: z.object({
    route: z.string(),
    period: z.string(),
    status: z.string(),
  }),
  statement: z.object({
    before: z.string(),
    strike: z.string(),
    middle: z.string(),
    accent: z.string(),
    after: z.string(),
  }),
  flow: z.array(z.object({ title: z.string(), note: z.string() })).min(3).max(5),
  tech: z.array(z.object({ label: z.string(), title: z.string(), text: z.string() })).min(3).max(4),
  cta: z.object({
    title: z.string(),
    copy: z.string(),
  }),
});

/** Detail-презентация (car-rental): светлый редакционный layout — meta-полоса, «Как мы решили», tech-карточки. */
const detailPresentation = z.object({
  variant: z.literal('detail'),
  industry: z.string(),
  services: z.string(),
  meta: z.array(z.object({ label: z.string(), value: z.string(), icon: z.string().optional() })).min(2).max(5),
  solutionsIntro: z.string().optional(),
  screensIntro: z.string().optional(),
  solutionShort: z.string().optional(),
  statement: z.object({
    before: z.string(),
    strike: z.string(),
    middle: z.string(),
    accent: z.string(),
    after: z.string(),
  }),
  solutions: z
    .array(z.object({ title: z.string(), note: z.string(), icon: z.string().optional() }))
    .min(3)
    .max(6),
  tech: z
    .array(z.object({ label: z.string(), title: z.string(), text: z.string(), icon: z.string().optional() }))
    .min(3)
    .max(6),
  cta: z.object({
    title: z.string(),
    copy: z.string(),
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
      .discriminatedUnion('variant', [editorialPresentation, showroomPresentation, detailPresentation])
      .optional(),
    status: z.enum(['published']),
  }),
});

export const collections = { lab, cases };
