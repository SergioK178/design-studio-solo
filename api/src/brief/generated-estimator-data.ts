/**
 * AUTO-GENERATED — DO NOT EDIT.
 * Источник: site/src/data/brief-estimator.ts, site/src/data/products.ts.
 * Генератор: scripts/generate-brief-estimator.ts (`bun scripts/generate-brief-estimator.ts`).
 * Синхронность с сайтом: `bun scripts/verify-estimate-parity.ts`.
 */

export type ProductSlug = 'start' | 'landing' | 'quiz' | 'company' | 'catalog' | 'shop' | 'wholesale' | 'migration' | 'event' | 'expert' | 'booking' | 'multi-landing' | 'redesign' | 'tma' | 'bot' | 'app' | 'web-service' | 'leads-inbox' | 'data-exchange' | 'documents' | 'support';

interface Range {
  min: number;
  max: number;
}

export interface PublicProduct extends Range {
  name: string;
  priceKind: 'fixed' | 'range' | 'monthly-range';
  termLow: number;
  termHigh: number;
  priceLabel: string;
  deliveryLabel: string;
}

export const publicProducts: Record<ProductSlug, PublicProduct> = {
  "start": {
    "name": "Промо-лендинг",
    "priceKind": "fixed",
    "min": 49000,
    "max": 49000,
    "termLow": 5,
    "termHigh": 7,
    "priceLabel": "49 000 ₽ фикс",
    "deliveryLabel": "5–7 раб. дней"
  },
  "landing": {
    "name": "Лендинг под рекламу",
    "priceKind": "range",
    "min": 100000,
    "max": 200000,
    "termLow": 2,
    "termHigh": 3,
    "priceLabel": "100 тыс.–200 тыс. ₽",
    "deliveryLabel": "2–3 нед."
  },
  "quiz": {
    "name": "Квиз-лендинг",
    "priceKind": "range",
    "min": 120000,
    "max": 190000,
    "termLow": 2,
    "termHigh": 3,
    "priceLabel": "120 тыс.–190 тыс. ₽",
    "deliveryLabel": "2–3 нед."
  },
  "company": {
    "name": "Корпоративный сайт",
    "priceKind": "range",
    "min": 220000,
    "max": 450000,
    "termLow": 4,
    "termHigh": 6,
    "priceLabel": "220 тыс.–450 тыс. ₽",
    "deliveryLabel": "4–6 нед."
  },
  "catalog": {
    "name": "Каталог компании",
    "priceKind": "range",
    "min": 300000,
    "max": 650000,
    "termLow": 5,
    "termHigh": 8,
    "priceLabel": "300 тыс.–650 тыс. ₽",
    "deliveryLabel": "5–8 нед."
  },
  "shop": {
    "name": "Интернет-магазин",
    "priceKind": "range",
    "min": 450000,
    "max": 900000,
    "termLow": 8,
    "termHigh": 12,
    "priceLabel": "450 тыс.–900 тыс. ₽",
    "deliveryLabel": "8–12 нед."
  },
  "wholesale": {
    "name": "Оптовый каталог с запросом КП",
    "priceKind": "range",
    "min": 300000,
    "max": 600000,
    "termLow": 5,
    "termHigh": 8,
    "priceLabel": "300 тыс.–600 тыс. ₽",
    "deliveryLabel": "5–8 нед."
  },
  "migration": {
    "name": "Переезд с конструктора",
    "priceKind": "range",
    "min": 100000,
    "max": 250000,
    "termLow": 2,
    "termHigh": 4,
    "priceLabel": "100 тыс.–250 тыс. ₽",
    "deliveryLabel": "2–4 нед."
  },
  "event": {
    "name": "Лендинг мероприятия/курса",
    "priceKind": "range",
    "min": 110000,
    "max": 220000,
    "termLow": 2,
    "termHigh": 3,
    "priceLabel": "110 тыс.–220 тыс. ₽",
    "deliveryLabel": "2–3 нед."
  },
  "expert": {
    "name": "Сайт эксперта",
    "priceKind": "range",
    "min": 150000,
    "max": 350000,
    "termLow": 3,
    "termHigh": 5,
    "priceLabel": "150 тыс.–350 тыс. ₽",
    "deliveryLabel": "3–5 нед."
  },
  "booking": {
    "name": "Сайт с онлайн-записью",
    "priceKind": "range",
    "min": 240000,
    "max": 480000,
    "termLow": 4,
    "termHigh": 6,
    "priceLabel": "240 тыс.–480 тыс. ₽",
    "deliveryLabel": "4–6 нед."
  },
  "multi-landing": {
    "name": "Мультилендинг",
    "priceKind": "range",
    "min": 200000,
    "max": 400000,
    "termLow": 3,
    "termHigh": 5,
    "priceLabel": "200 тыс.–400 тыс. ₽",
    "deliveryLabel": "3–5 нед."
  },
  "redesign": {
    "name": "Редизайн",
    "priceKind": "range",
    "min": 180000,
    "max": 400000,
    "termLow": 4,
    "termHigh": 6,
    "priceLabel": "180 тыс.–400 тыс. ₽",
    "deliveryLabel": "4–6 нед."
  },
  "tma": {
    "name": "Приложение внутри Telegram",
    "priceKind": "range",
    "min": 220000,
    "max": 450000,
    "termLow": 4,
    "termHigh": 6,
    "priceLabel": "220 тыс.–450 тыс. ₽",
    "deliveryLabel": "4–6 нед."
  },
  "bot": {
    "name": "Telegram-бот",
    "priceKind": "range",
    "min": 90000,
    "max": 240000,
    "termLow": 2,
    "termHigh": 4,
    "priceLabel": "90 тыс.–240 тыс. ₽",
    "deliveryLabel": "2–4 нед."
  },
  "app": {
    "name": "Личный кабинет",
    "priceKind": "range",
    "min": 650000,
    "max": 1300000,
    "termLow": 8,
    "termHigh": 14,
    "priceLabel": "650 тыс.–1,3 млн ₽",
    "deliveryLabel": "8–14 нед."
  },
  "web-service": {
    "name": "Рабочий веб-сервис",
    "priceKind": "range",
    "min": 800000,
    "max": 1700000,
    "termLow": 10,
    "termHigh": 16,
    "priceLabel": "800 тыс.–1,7 млн ₽",
    "deliveryLabel": "10–16 нед."
  },
  "leads-inbox": {
    "name": "Заявки в одну систему",
    "priceKind": "range",
    "min": 80000,
    "max": 190000,
    "termLow": 2,
    "termHigh": 3,
    "priceLabel": "80 тыс.–190 тыс. ₽",
    "deliveryLabel": "2–3 нед."
  },
  "data-exchange": {
    "name": "Обмен данными между системами",
    "priceKind": "range",
    "min": 180000,
    "max": 480000,
    "termLow": 3,
    "termHigh": 6,
    "priceLabel": "180 тыс.–480 тыс. ₽",
    "deliveryLabel": "3–6 нед. после обследования"
  },
  "documents": {
    "name": "Документы и отчёты по шаблону",
    "priceKind": "range",
    "min": 120000,
    "max": 300000,
    "termLow": 2,
    "termHigh": 4,
    "priceLabel": "120 тыс.–300 тыс. ₽",
    "deliveryLabel": "2–4 нед."
  },
  "support": {
    "name": "Поддержка и развитие",
    "priceKind": "monthly-range",
    "min": 40000,
    "max": 120000,
    "termLow": 0,
    "termHigh": 0,
    "priceLabel": "40 тыс.–120 тыс. ₽/мес.",
    "deliveryLabel": "по SLA / постоянно"
  }
};

export type FormatId = 'landing' | 'company' | 'catalog' | 'shop' | 'cabinet' | 'tool' | 'automation' | 'update' | 'custom';

export interface Adder {
  price: Range;
  weeks?: Range;
}

export interface FormatBase {
  price: Range;
  weeks: Range;
  includesActions: string[];
  includesManage: string[];
  includesDataflow: string[];
}

export const formats: Record<FormatId, FormatBase> = {
  "landing": {
    "price": {
      "min": 100000,
      "max": 200000
    },
    "weeks": {
      "min": 2,
      "max": 3
    },
    "includesActions": [
      "view",
      "lead"
    ],
    "includesManage": [],
    "includesDataflow": [
      "notify",
      "store"
    ]
  },
  "company": {
    "price": {
      "min": 220000,
      "max": 450000
    },
    "weeks": {
      "min": 4,
      "max": 6
    },
    "includesActions": [
      "view",
      "lead"
    ],
    "includesManage": [
      "texts"
    ],
    "includesDataflow": [
      "notify",
      "store"
    ]
  },
  "catalog": {
    "price": {
      "min": 300000,
      "max": 650000
    },
    "weeks": {
      "min": 5,
      "max": 8
    },
    "includesActions": [
      "view",
      "lead",
      "pick",
      "choose"
    ],
    "includesManage": [
      "texts",
      "goods"
    ],
    "includesDataflow": [
      "notify",
      "store"
    ]
  },
  "shop": {
    "price": {
      "min": 450000,
      "max": 900000
    },
    "weeks": {
      "min": 8,
      "max": 12
    },
    "includesActions": [
      "view",
      "lead",
      "pick",
      "choose",
      "buy"
    ],
    "includesManage": [
      "texts",
      "goods",
      "orders"
    ],
    "includesDataflow": [
      "notify",
      "store",
      "email"
    ]
  },
  "cabinet": {
    "price": {
      "min": 650000,
      "max": 1300000
    },
    "weeks": {
      "min": 8,
      "max": 14
    },
    "includesActions": [
      "view",
      "lead",
      "login",
      "data",
      "notify"
    ],
    "includesManage": [
      "texts",
      "users"
    ],
    "includesDataflow": [
      "notify",
      "store"
    ]
  },
  "tool": {
    "price": {
      "min": 800000,
      "max": 1700000
    },
    "weeks": {
      "min": 10,
      "max": 16
    },
    "includesActions": [
      "view",
      "login",
      "data",
      "notify"
    ],
    "includesManage": [
      "texts",
      "users",
      "orders",
      "leads"
    ],
    "includesDataflow": [
      "notify",
      "store"
    ]
  },
  "automation": {
    "price": {
      "min": 80000,
      "max": 600000
    },
    "weeks": {
      "min": 1,
      "max": 3
    },
    "includesActions": [
      "view",
      "data",
      "notify"
    ],
    "includesManage": [],
    "includesDataflow": [
      "notify",
      "store",
      "sheet"
    ]
  },
  "update": {
    "price": {
      "min": 70000,
      "max": 260000
    },
    "weeks": {
      "min": 1,
      "max": 3
    },
    "includesActions": [
      "view",
      "lead"
    ],
    "includesManage": [
      "texts"
    ],
    "includesDataflow": [
      "notify",
      "store"
    ]
  },
  "custom": {
    "price": {
      "min": 90000,
      "max": 400000
    },
    "weeks": {
      "min": 2,
      "max": 5
    },
    "includesActions": [],
    "includesManage": [],
    "includesDataflow": [
      "notify",
      "store"
    ]
  }
};

export const actionAdders: Record<string, Adder> = {
  "pick": {
    "price": {
      "min": 25000,
      "max": 50000
    }
  },
  "calc": {
    "price": {
      "min": 25000,
      "max": 50000
    }
  },
  "book": {
    "price": {
      "min": 30000,
      "max": 60000
    }
  },
  "buy": {
    "price": {
      "min": 60000,
      "max": 120000
    },
    "weeks": {
      "min": 1,
      "max": 1
    }
  },
  "login": {
    "price": {
      "min": 80000,
      "max": 160000
    },
    "weeks": {
      "min": 1,
      "max": 2
    }
  },
  "data": {
    "price": {
      "min": 60000,
      "max": 120000
    },
    "weeks": {
      "min": 1,
      "max": 2
    }
  }
};

export const manageAdders: Record<string, Adder> = {
  "texts": {
    "price": {
      "min": 15000,
      "max": 30000
    }
  },
  "goods": {
    "price": {
      "min": 30000,
      "max": 60000
    }
  },
  "leads": {
    "price": {
      "min": 15000,
      "max": 30000
    }
  },
  "users": {
    "price": {
      "min": 50000,
      "max": 100000
    },
    "weeks": {
      "min": 0,
      "max": 1
    }
  },
  "orders": {
    "price": {
      "min": 40000,
      "max": 80000
    }
  }
};

export const dataflowAdders: Record<string, Adder> = {
  "crm": {
    "price": {
      "min": 25000,
      "max": 50000
    }
  },
  "sheet": {
    "price": {
      "min": 15000,
      "max": 30000
    }
  },
  "email": {
    "price": {
      "min": 15000,
      "max": 30000
    }
  },
  "site": {
    "price": {
      "min": 20000,
      "max": 40000
    }
  },
  "onec": {
    "price": {
      "min": 60000,
      "max": 120000
    },
    "weeks": {
      "min": 1,
      "max": 2
    }
  },
  "doc": {
    "price": {
      "min": 30000,
      "max": 60000
    }
  }
};

export const updateGoalPrice: Record<string, Range> = {
  "features": {
    "min": 100000,
    "max": 280000
  },
  "fix": {
    "min": 60000,
    "max": 180000
  }
};

export const productTaskExpectation: Partial<Record<ProductSlug, string>> = {
  "start": "launch",
  "landing": "launch",
  "quiz": "launch",
  "event": "launch",
  "multi-landing": "launch",
  "company": "present",
  "expert": "present",
  "booking": "present",
  "catalog": "assortment",
  "wholesale": "assortment",
  "shop": "sell",
  "tma": "cabinet",
  "bot": "manual",
  "app": "cabinet",
  "web-service": "tool",
  "migration": "update",
  "redesign": "update",
  "support": "update",
  "leads-inbox": "manual",
  "data-exchange": "manual",
  "documents": "manual"
};
