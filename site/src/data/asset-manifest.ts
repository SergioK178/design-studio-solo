import { detailedProducts } from './products';
import { publishedWorks, works } from './works';

export type AssetKind = 'image' | 'video' | 'svg';

export interface AssetManifestEntry {
  id: string;
  route: string;
  kind: AssetKind;
  ratio: string;
  formats: string[];
  altRequired: boolean;
  /** false — плановый/concept-слот: «asset pending» допустим до готовности реального проекта. */
  required: boolean;
}

const IMAGE_FORMATS = ['avif', 'webp'];

const CASE_SCREEN_SLOTS: { id: string; ratio: string }[] = [
  { id: 'desktop-01', ratio: '16 / 10' },
  { id: 'desktop-02', ratio: '16 / 10' },
  { id: 'mobile-01', ratio: '9 / 14' },
  { id: 'mobile-02', ratio: '9 / 14' },
];

// Обложка кейса — используется в CasePreview на главной и на /cases/ для любого статуса.
const coverEntries: AssetManifestEntry[] = works.map((work) => ({
  id: work.assetKey,
  route: work.status === 'published' ? `/cases/${work.slug}/` : '/cases/',
  kind: 'image',
  ratio: '16 / 10',
  formats: IMAGE_FORMATS,
  altRequired: true,
  required: work.status === 'published',
}));

// Hero и экраны детальной страницы кейса — только для реально опубликованных работ.
const caseDetailEntries: AssetManifestEntry[] = publishedWorks.flatMap((work) => [
  {
    id: `works/${work.slug}/cover-desktop`,
    route: `/cases/${work.slug}/`,
    kind: 'image',
    ratio: '16 / 9',
    formats: IMAGE_FORMATS,
    altRequired: true,
    required: true,
  },
  {
    id: `works/${work.slug}/cover-mobile`,
    route: `/cases/${work.slug}/`,
    kind: 'image',
    ratio: '9 / 16',
    formats: IMAGE_FORMATS,
    altRequired: true,
    required: true,
  },
  ...CASE_SCREEN_SLOTS.map((screen) => ({
    id: `works/${work.slug}/screens/${screen.id}`,
    route: `/cases/${work.slug}/`,
    kind: 'image' as AssetKind,
    ratio: screen.ratio,
    formats: IMAGE_FORMATS,
    altRequired: true,
    required: true,
  })),
]);

// Proof-модуль на детальной странице продукта (§4 master-spec) — 1..N ассетов в зависимости от варианта.
const productProofEntries: AssetManifestEntry[] = detailedProducts
  .filter((product) => product.proof)
  .flatMap((product) =>
    product.proof!.assets.map((asset) => ({
      id: asset.assetKey,
      route: `/products/${product.slug}/`,
      kind: 'image' as AssetKind,
      ratio: product.proof!.variant === 'before-after' ? '4 / 3' : '16 / 10',
      formats: IMAGE_FORMATS,
      altRequired: true,
      required: product.proof!.status === 'published',
    })),
  );

// Showroom-кейс Loft Rent: продуктовый ассет авто в тёмном hero (кладётся вручную, не блокирует релиз).
const showroomEntries: AssetManifestEntry[] = [
  { id: 'works/car-rental/hero-car', route: '/cases/car-rental/', kind: 'image', ratio: '16 / 10', formats: IMAGE_FORMATS, altRequired: true, required: false },
];

// Именованные UI-иллюстрации главной (content-assets.md §5).
const uiEntries: AssetManifestEntry[] = [
  { id: 'ui/estimate-fragment', route: '/', kind: 'image', ratio: '16 / 9', formats: IMAGE_FORMATS, altRequired: true, required: true },
  { id: 'ui/ownership-schema', route: '/', kind: 'image', ratio: '16 / 9', formats: IMAGE_FORMATS, altRequired: true, required: true },
  { id: 'ui/extensions-widget', route: '/', kind: 'image', ratio: '16 / 9', formats: IMAGE_FORMATS, altRequired: true, required: true },
  // Курсор-превью строк «Выберите задачу» и мокап Telegram-секции: скрины кладёт
  // владелец, до этого AssetSlot показывает плейсхолдер — релиз не блокируют.
  { id: 'ui/solution-launch', route: '/', kind: 'image', ratio: '16 / 10', formats: IMAGE_FORMATS, altRequired: true, required: false },
  { id: 'ui/solution-company', route: '/', kind: 'image', ratio: '16 / 10', formats: IMAGE_FORMATS, altRequired: true, required: false },
  { id: 'ui/solution-commerce', route: '/', kind: 'image', ratio: '16 / 10', formats: IMAGE_FORMATS, altRequired: true, required: false },
  { id: 'ui/telegram-mini-app', route: '/', kind: 'image', ratio: '9 / 16', formats: IMAGE_FORMATS, altRequired: true, required: false },
];

function dedupe(entries: AssetManifestEntry[]): AssetManifestEntry[] {
  const byId = new Map<string, AssetManifestEntry>();
  for (const entry of entries) {
    const existing = byId.get(entry.id);
    if (!existing) {
      byId.set(entry.id, entry);
      continue;
    }
    // Один и тот же ассет может встречаться и как кейс, и как proof продукта —
    // required побеждает, если хотя бы один источник считает его обязательным.
    byId.set(entry.id, { ...existing, required: existing.required || entry.required });
  }
  return [...byId.values()];
}

export const assetManifest: AssetManifestEntry[] = dedupe([
  ...coverEntries,
  ...caseDetailEntries,
  ...showroomEntries,
  ...productProofEntries,
  ...uiEntries,
]);

export const assetManifestById: Record<string, AssetManifestEntry> = Object.fromEntries(
  assetManifest.map((entry) => [entry.id, entry]),
);
