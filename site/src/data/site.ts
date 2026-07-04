// Служебные данные сайта. Живые значения штампа (TTFB, вес, рев., собрано)
// в v1 приходят из мини-API (tech-spec §5); до него — плейсхолдеры сборки.
export const site = {
  name: '3K Studio',
  tagline: 'сайты, каталоги, заявки',
  telegram: '@camicie_nere',
  telegramUrl: 'https://t.me/camicie_nere',
};

// TODO(api): заменить на данные мини-API / переменные сборки CI.
export const stampLive = {
  builtAt: '03.07.2026 14:02',
  rev: '47',
  ttfbMs: '94',
  weightKb: '212',
};

export const nav = [
  { label: 'проекты', href: '#cases' },
  { label: 'цены', href: '#products' },
  { label: 'процесс', href: '#process' },
  { label: 'кто делает', href: '#team' },
  { label: 'контакты', href: '#contact' },
];
