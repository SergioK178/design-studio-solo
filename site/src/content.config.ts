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
 * Editorial-презентация (guest-house): кейс-повествование в девяти сценах, где
 * интерфейс объекта пересобран нативно, а не показан скриншотами. Поэтому схема
 * держит не только копирайт кейса, но и материал самого проекта — фото, режимы
 * hero, части интерфейса, шаги мобильной сцены.
 */
const editorialPresentation = z.object({
  variant: z.literal('editorial'),
  projectUrl: z.string().url(),
  location: z.string(),
  year: z.string(),
  /** Короткая отрасль для кикера шапки: длинная category туда не помещается. */
  sector: z.string(),
  /** Лид шапки построчно: переносы здесь часть композиции, а не случайность. */
  lead: z.array(z.string()).min(2).max(4),
  /** Врезка под лидом: одна мысль, ради которой стоит листать дальше. */
  pullquote: z.string(),
  facts: z.array(z.object({ label: z.string(), value: z.string(), sub: z.string().optional() })),
  /** Сцена 2: короткая постановка задачи. Длинный task из frontmatter туда не выводим. */
  taskTitle: z.array(z.string()).min(2).max(4),
  taskShort: z.string(),
  /** Полоса фактов объекта. text: значение не число — кегль мельче, перенос разрешён. */
  objectFacts: z.array(z.object({
    value: z.string(),
    unit: z.string().optional(),
    label: z.string(),
    text: z.boolean().optional(),
  })).min(3).max(4),
  /** Подпись к доказательному фотоблоку сцены 2. */
  photoNote: z.object({ title: z.string(), text: z.string() }),
  /** Кадры объекта, перенесённые из проекта: путь + осмысленный alt + подпись-плашка. */
  photos: z.record(
    z.string(),
    z.object({ src: z.string(), alt: z.string(), caption: z.string().optional() }),
  ),
  /**
   * Два сценария покупки. heroCopy повторяет реальный ModeContext проекта:
   * тумблер меняет не картинку, а весь разговор — заголовок, подзаголовок и CTA.
   */
  scenarios: z.array(z.object({
    id: z.string(),
    label: z.string(),
    title: z.string(),
    description: z.string(),
    caption: z.string(),
    /** Глиф сценария для пилюли-переключателя: белая маска, цвет даёт CSS. */
    icon: z.string().optional(),
    /** Плашки-аргументы сценария: подпись + собственный глиф. */
    bullets: z.array(z.object({ text: z.string(), icon: z.string().optional() })).min(2).max(4),
    /** Оптика аудитории для сцены 2: те же характеристики, прочитанные по-разному. */
    audience: z.object({
      label: z.string(),
      /** Глиф аудитории: терракотовая обводка проекта на прозрачном фоне. */
      icon: z.string().optional(),
      bullets: z.array(z.string()).min(2).max(4),
    }),
    heroCopy: z.object({
      eyebrow: z.string(),
      headTop: z.string(),
      headEm: z.string(),
      sub: z.string(),
      cta: z.string(),
      ctaSub: z.string(),
    }),
  })).min(2).max(2),
  /**
   * Инвесторская карточка без единой финансовой цифры: собственник не раскрывает
   * экономику публично, поэтому кейс показывает закрытость данных как решение,
   * а не рисует выдуманный прогноз доходности.
   */
  confidential: z.object({
    title: z.string(),
    note: z.string(),
    icon: z.string().optional(),
    /** Состав объекта тремя мини-блоками: крупное значение и подпись под ним. */
    specs: z
      .array(z.object({ value: z.string(), label: z.string(), icon: z.string().optional() }))
      .min(2)
      .max(4),
    cta: z.string(),
  }),
  artDirection: z.object({
    title: z.string(),
    description: z.string(),
    /** Тип-шкала донора: реальные значения из gh-landing, а не декоративные. */
    typeScale: z
      .array(z.object({ name: z.string(), size: z.string(), detail: z.string() }))
      .min(3)
      .max(5),
    /** Строки-доказательства для линии-разделителя: ей и правда хватает. */
    structure: z.array(z.object({ label: z.string(), value: z.string() })).min(2).max(4),
    structureNote: z.string(),
    voice: z.string(),
    /** Голос: факт против клише, которое он заменил. */
    voicePairs: z.array(z.object({ fact: z.string(), cliche: z.string() })).min(2).max(4),
    palette: z.array(z.object({ hex: z.string(), name: z.string() })).min(3).max(6),
  }),
  /** Сцена цены: главное число кейса и лестница расстояний вокруг него. */
  price: z.object({
    value: z.string(),
    unit: z.string(),
    perMeter: z.string(),
    note: z.string(),
    evidence: z.string(),
    distances: z.array(z.object({ value: z.string(), label: z.string() })).min(3).max(6),
  }),
  /**
   * Сцена интерфейса: три состояния экрана телефона и три тезиса рядом с ним.
   * Ровно три, и не больше: выбор → информация → действие. Четвёртый шаг
   * превращает доказательство пользовательского пути обратно в walkthrough.
   */
  mobileSteps: z.array(z.object({
    id: z.string(),
    label: z.string(),
    title: z.string(),
    text: z.string(),
    /** Глиф тезиса в круглом медальоне. */
    icon: z.string().optional(),
  })).min(3).max(3),
  /** Инженерная часть на языке клиента: четыре показателя, три решения и одна строка технологий. */
  engineering: z.object({
    /** Заголовок построчно: пара утверждений стоит в две строки, а не как выйдет. */
    title: z.array(z.string()).min(1).max(3),
    /** value — крупно, label — короткая подпись, note — одна строка объяснения. */
    stats: z.array(z.object({ value: z.string(), label: z.string(), note: z.string() })).min(3).max(4),
    points: z.array(z.object({ title: z.string(), text: z.string(), icon: z.string().optional() })).min(2).max(3),
    techNote: z.string(),
  }),
  /**
   * Финал: утверждение на кадре, служебная строка, измеримые факты — без
   * выдуманных процентов — и по одному абзацу про результат и роль студии.
   */
  finale: z.object({
    statement: z.string(),
    credits: z.string(),
    proof: z.array(z.object({ value: z.string(), label: z.string() })).min(2).max(4),
    result: z.string(),
    studio: z.string(),
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

/**
 * Catalog-презентация (catalog-med): сложная номенклатура → сценарий закупки.
 * Четыре секции: архитектура каталога, бирюзовый блок сбора
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
 * Кейс «ИМЭКС · Шовные материалы»: девять глав об упаковке B2B-продукта —
 * от позиционирования до собственной почты. Интерфейс проекта пересобран
 * нативно, поэтому схема держит не только копирайт, но и материал самого
 * продукта: кадры, параметры конфигуратора, состав подборки, адреса почты.
 *
 * Отдельный вариант, а не переиспользованный editorial: у олгинковской схемы
 * своя предметная область (цена за метр, ровно два сценария покупки,
 * закрытая экономика объекта), и натягивать её на медизделие — значит
 * заводить поля, которые в этом кейсе никогда не будут заполнены.
 *
 * Правило источника: каждое число здесь обязано находиться в
 * mzkrs-imex/data/mzkrs_suture_materials.json или в коде донора. Параметров
 * USP, диаметра нити и длины иглы в проекте нет — в текстах их быть не должно.
 */
const suturesPresentation = z.object({
  variant: z.literal('sutures'),
  projectUrl: z.string().url(),
  /** Короткая отрасль для кикера шапки: длинная category туда не помещается. */
  sector: z.string(),
  year: z.string(),
  /** Полоса ролей студии под лидом — масштаб работы одной строкой. */
  roles: z.array(z.string()).min(3).max(6),
  /** Лид шапки построчно: переносы здесь часть композиции. */
  lead: z.array(z.string()).min(2).max(4),
  /** Заголовок в две строки: вторая — мятная, как на макете. */
  heroTitle: z.object({ top: z.string(), em: z.string() }),
  facts: z.array(z.object({ label: z.string(), value: z.string(), sub: z.string().optional() })).min(3).max(4),
  /** Кадры продукта, перенесённые из проекта: путь + осмысленный alt. */
  photos: z.record(
    z.string(),
    z.object({ src: z.string(), alt: z.string(), caption: z.string().optional() }),
  ),

  /** Главы 01–02: почему каталога было мало и какой путь построили взамен. */
  context: z.object({
    eyebrow: z.string(),
    title: z.array(z.string()).min(1).max(3),
    text: z.array(z.string()).min(2).max(3),
    /** Ступени пути продукта к клиенту — та же цепочка, что и в финале. */
    flow: z.array(z.object({ label: z.string(), note: z.string(), icon: z.string() })).min(4).max(5),
    approachEyebrow: z.string(),
    approachTitle: z.array(z.string()).min(1).max(3),
    approachText: z.string(),
  }),

  /** Глава 03: физический продукт как основа языка и разворот сценария. */
  product: z.object({
    eyebrow: z.string(),
    title: z.array(z.string()).min(1).max(3),
    text: z.array(z.string()).min(2).max(3),
    palette: z.array(z.object({ hex: z.string(), name: z.string() })).min(3).max(6),
    typeNote: z.string(),
    /** Строка-переход: позиционирование вырастает из продукта, а не начинается заново. */
    bridge: z.array(z.string()).min(1).max(2),
    compareEyebrow: z.string(),
    compareTitle: z.array(z.string()).min(1).max(3),
    compareText: z.string(),
    /** Опорная строка левой колонки: держит вес против правого поля сравнения. */
    compareLead: z.string(),
    /** Микровывод под сравнением. */
    compareOutro: z.string(),
    /** Две дорожки сравнения: обычный каталог и путь ИМЭКС. */
    compare: z.array(z.object({
      label: z.string(),
      steps: z.array(z.object({ label: z.string(), note: z.string() })).min(3).max(5),
      accent: z.boolean().optional(),
    })).min(2).max(2),
  }),

  /**
   * Глава 04, акт A: линейка как плоскость сравнения, а не список SKU.
   *
   * Свойства лежат матрицей: колонка — материал, строка — параметр. Значения
   * строк берутся из полей самого материала, поэтому подписи строк живут в
   * компоненте, а данные — здесь, по одному разу на материал.
   */
  materials: z.object({
    eyebrow: z.string(),
    title: z.array(z.string()).min(1).max(3),
    text: z.array(z.string()).min(2).max(3),
    /** Опорная строка левой колонки. */
    lead: z.string(),
    /** Оговорка про условные вехи сроков — она есть и на живом сайте. */
    scaleNote: z.string(),
    items: z.array(z.object({
      id: z.string(),
      name: z.string(),
      group: z.string(),
      /** Срок полного рассасывания; у нерассасывающихся его нет. */
      term: z.string().optional(),
      /** Подпись срока над колонкой: у нерассасывающихся — «Нерассасывающийся». */
      termLabel: z.string(),
      /** Время рассасывания словом — из properties донора. */
      pace: z.string(),
      structure: z.string(),
      composition: z.string(),
      sterilization: z.string(),
      supply: z.string(),
      /** Какой ассет нити подставлять в сцену конфигуратора. */
      thread: z.enum(['braided', 'mono']),
      icon: z.string(),
      /** Реальный цвет нити материала из configurator.ts. */
      tint: z.string(),
    })).min(4).max(6),
  }),

  /** Глава 04, акт B: конфигуратор, предметность параметров и телефон. */
  configurator: z.object({
    eyebrow: z.string(),
    title: z.array(z.string()).min(1).max(3),
    text: z.array(z.string()).min(2).max(3),
    /** Переходная строка между актами A и B. */
    bridge: z.string(),
    /** Шаги ровно те, что в доноре: материал, формат, длина, игла. */
    steps: z.array(z.object({
      num: z.string(),
      label: z.string(),
      options: z.array(z.string()).min(2).max(6),
      active: z.string(),
    })).min(3).max(4),
    summaryTitle: z.string(),
    summary: z.array(z.object({ label: z.string(), value: z.string() })).min(3).max(5),
    cta: z.string(),
    /**
     * Инженерные врезки под конфигуратором: тонирование нити и живой текст
     * этикетки. Это не отдельная глава, а полоса из двух заметок с кадром.
     */
    craft: z.array(z.object({
      title: z.string(),
      text: z.string(),
      image: z.string(),
      alt: z.string(),
      /** Нужно ли тонировать кадр цветом активного материала. */
      tinted: z.boolean().optional(),
    })).min(2).max(2),
    /** Эпилог главы: тот же выбор на телефоне, без отдельной сцены. */
    mobile: z.object({
      eyebrow: z.string(),
      title: z.array(z.string()).min(1).max(2),
      text: z.string(),
      checks: z.array(z.string()).min(3).max(4),
    }),
  }),

  /** Главы 08–09: подборка и путь запроса до поставщика. */
  request: z.object({
    eyebrow: z.string(),
    title: z.array(z.string()).min(1).max(3),
    text: z.array(z.string()).min(2).max(3),
    limitNote: z.string(),
    items: z.array(z.object({ name: z.string(), spec: z.string() })).min(2).max(4),
    channels: z.array(z.object({ label: z.string(), note: z.string(), icon: z.string() })).min(3).max(4),
    flow: z.array(z.string()).min(3).max(5),
    /** Честная оговорка про архитектуру: сервера и базы лидов в пути нет. */
    honesty: z.object({ title: z.string(), text: z.string() }),
  }),

  /** Глава 10: почтовый контур бренда. */
  infra: z.object({
    eyebrow: z.string(),
    title: z.array(z.string()).min(1).max(3),
    text: z.array(z.string()).min(2).max(3),
    boxes: z.array(z.object({ address: z.string(), purpose: z.string(), icon: z.string() })).min(3).max(3),
    tags: z.array(z.string()).min(3).max(6),
    note: z.string(),
  }),

  /** Главы 11–12: мобильный сценарий и связность слоёв продукта. */
  system: z.object({
    eyebrow: z.string(),
    title: z.array(z.string()).min(1).max(3),
    text: z.array(z.string()).min(2).max(3),
    mobileSteps: z.array(z.object({
      id: z.string(),
      label: z.string(),
      title: z.string(),
      text: z.string(),
      icon: z.string(),
    })).length(3),
    layers: z.array(z.object({ title: z.string(), text: z.string(), icon: z.string() })).length(4),
    stats: z.array(z.object({ value: z.string(), label: z.string(), note: z.string() })).min(3).max(4),
    techNote: z.string(),
  }),

  /** Глава 13 + финал + CTA студии. */
  finale: z.object({
    eyebrow: z.string(),
    title: z.array(z.string()).min(1).max(3),
    text: z.array(z.string()).min(2).max(3),
    chain: z.array(z.string()).min(4).max(6),
    statement: z.array(z.string()).min(1).max(3),
    statementNote: z.string(),
    /** Домен в адресной строке единственного скриншота кейса. */
    screenshotUrl: z.string(),
    screenshotSrc: z.string(),
    cta: z.object({ title: z.array(z.string()).min(1).max(3), copy: z.string() }),
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
      .discriminatedUnion('variant', [
        editorialPresentation,
        suturesPresentation,
        showroomPresentation,
        catalogPresentation,
      ])
      .optional(),
    status: z.enum(['published']),
  }),
});

export const collections = { lab, cases };
