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
  year: z.string(),
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
  /** Инженерная часть на языке клиента: четыре показателя, три пояснения и одна строка технологий. */
  engineering: z.object({
    title: z.string(),
    stats: z.array(z.object({ value: z.string(), label: z.string() })).min(3).max(4),
    points: z.array(z.object({ title: z.string(), text: z.string() })).min(2).max(3),
    techNote: z.string(),
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
 * Catalog-презентация (catalog-med): сложная номенклатура → сценарий закупки.
 * Отличается от detail четырьмя секциями: архитектура каталога, бирюзовый блок сбора
 * заявки, два сценария закупки (B2B/B2G) и документы.
 */
const catalogPresentation = z.object({
  variant: z.literal('catalog'),
  subtitle: z.string(),
  tagline: z.string(),
  /** Описание в hero — 3–4 строки; длинный solution из frontmatter сюда не выводим. */
  lead: z.string(),
  industry: z.string(),
  services: z.string(),
  meta: z.array(z.object({ label: z.string(), value: z.string(), icon: z.string().optional() })).min(2).max(5),
  /** Низ hero: каталог продукции, адаптивный интерфейс, сценарий заявки, раздел для учреждений. */
  markers: z.array(z.object({ title: z.string(), icon: z.string().optional() })).min(3).max(4),
  /** Сжатые версии client/audience, task и constraints — на странице не дублируем длинные поля. */
  contextShort: z.string(),
  taskShort: z.string(),
  constraintsShort: z.string(),
  statement: z.object({
    before: z.string(),
    strike: z.string(),
    middle: z.string(),
    accent: z.string(),
    after: z.string(),
  }),
  architecture: z.object({
    kicker: z.string(),
    title: z.string(),
    text: z.string(),
    categories: z.array(z.string()).min(4).max(8),
    flow: z.array(z.object({ title: z.string(), note: z.string(), icon: z.string().optional() })).min(3).max(6),
    tags: z.array(z.string()).max(6),
    /** Схема миграции каталога: источники слева, шаги конвейера, итоговые цифры справа. */
    migration: z.object({
      title: z.string(),
      sources: z.array(z.string()).min(2).max(3),
      steps: z.array(z.object({ title: z.string(), note: z.string() })).min(3).max(3),
    }),
  }),
  solutionsIntro: z.string().optional(),
  solutions: z.array(z.object({ title: z.string(), note: z.string(), icon: z.string().optional() })).min(3).max(6),
  features: z.array(z.string()),
  request: z.object({
    kicker: z.string(),
    title: z.string(),
    text: z.string(),
    badges: z.array(z.string()).max(3),
    steps: z.array(z.object({ title: z.string(), note: z.string() })).min(4).max(4),
  }),
  tracks: z
    .array(z.object({
      kicker: z.string(),
      title: z.string(),
      points: z.array(z.string()).min(2).max(4),
      /** Что уходит клиенту по этому маршруту — рисуется карточками, без скриншота. */
      docs: z.array(z.string()).min(2).max(4),
      action: z.string().optional(),
    }))
    .min(2)
    .max(2),
  catalogDetail: z.object({
    kicker: z.string(),
    title: z.string(),
    text: z.string(),
    /** Тезис между мобильными экранами во втором ряду раскладки. */
    mobileStatement: z.string(),
    /**
     * Экраны как экспонаты: номер и аннотация слева, нарисованная сцена справа.
     * mock — идентификатор сцены из реестра в CatalogCase.astro.
     */
    plates: z
      .array(z.object({ title: z.string(), note: z.string(), mock: z.string() }))
      .min(3)
      .max(6),
  }),
  documents: z.object({
    kicker: z.string(),
    title: z.string(),
    items: z.array(z.object({ title: z.string(), note: z.string(), icon: z.string().optional() })).min(3).max(4),
  }),
  outcome: z.object({
    title: z.string(),
    planning: z.array(z.string()).min(3),
    /** Крупный итоговый текст правой колонки — один сильный вывод, а не список. */
    summary: z.string(),
  }),
  markersOut: z.array(z.string()),
  cta: z.object({ title: z.string(), copy: z.string() }),
});

export type CatalogPresentation = z.infer<typeof catalogPresentation>;

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
      .discriminatedUnion('variant', [editorialPresentation, showroomPresentation, detailPresentation, catalogPresentation])
      .optional(),
    status: z.enum(['published']),
  }),
});

export const collections = { lab, cases };
