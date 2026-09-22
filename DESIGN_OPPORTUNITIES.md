# DESIGN OPPORTUNITY MAP — 3D Studio

Дата: 2026-09-20. Это исследовательская карта для следующего design-system прохода, а не спецификация изменений. Основания: `DESIGN_AUDIT.md`, исходный Astro/Svelte/CSS/data и проверка текущего UI через Playwright MCP на 1440 и 390 px. Production UI не менялся.

## Executive reading

У core уже есть собственный язык, на котором можно строить дальнейшую выразительность: ink/paper-сцены, Unbounded рядом с Golos, rule-rows, редкий gold, квадратные поверхности, жёсткое смещение media и motion только при взаимодействии. Наиболее ценная возможность — не добавлять новый визуальный жанр, а дать существующим спокойным строкам **контекстное доказательство при intent**: в idle остаётся типографика/цена/срок/rule, при hover или focus появляется реальный интерфейс, crop или схема.

Это не универсальная механика. Для `/products/` она физически помещается на desktop благодаря 300 px sticky group-head и 794 px row-column; для homepage directions — только как сдержанная preview-зона, потому что сама строка уже занята длинным summary; на 390 px hover нельзя имитировать. Case tiles уже являются постоянным доказательством и не нуждаются в ещё одном floating preview.

## 1. Hero — conveyor / moving mockups

### Что работает сейчас

`HeroWall.astro` держит dark scene, левую копию и диагональную wall из двух вертикальных колонок справа. На 1440 hero имеет ~870 px высоты; copy занимает max 640 px, wall — ~620×1140 px, повернута на -8°, затемнена градиентом. Это даёт один понятный фокус: headline слева; периферийный диапазон готовых работ — справа. Gold внутри `h1` и CTA формирует иерархию, а не отдельную декорацию.

Сигнатурны именно: диагональная «стена», видимые маленькие product-like cards, две встречные скорости, paper-поверхности в ink-сцене и живой, но не scroll-jacking motion. `wallScroll` объявлен в `global.css`; первая колонка движется 26 s linear infinite, `.reverse` — 34 s в обратную сторону. `tickerMove` объявлен рядом, но не имеет активного потребителя в `site/src`: это не текущая hero-механика и не повод строить на нём решение.

Технически hero рендерит только записи с `assetSrc`: сейчас это три реальные covers (`guest-house`, `car-rental`, `catalog-med`) из `wallColA`; они дублируются для бесконечных двух лент. Резерв `wallColB` сознательно не рендерится без assets. Это делает wall реальной, но пока узкой витриной трёх работ — не диапазоном всех продуктов.

На 390 px wall не убирается: она смещена вправо, opacity 0.5, но фактически проходит за copy (hero ~907 px, copy ~721 px). Это сохраняет характер, однако увеличивает фоновую визуальную активность в узком поле. Идея остаётся читаемой благодаря fade и верхнему слою copy.

### Возможности refinement позже — без смены идеи

| Возможность | Почему соответствует текущему hero | Ограничение / риск |
|---|---|---|
| Связать каждую видимую wall-card с реальным case/product identity: точное название, тип задачи, настоящий crop; при появлении готового asset добавить его из существующего data reserve | Превращает conveyor из «движущихся mockups» в visual index фактических возможностей | Нельзя показывать planned как завершённую работу и нельзя раскрывать `asset pending`; нужны только готовые content/asset записи |
| Уменьшить повторяемость трёх covers после появления новых реальных assets | Повышает ощущение диапазона, не меняя движение или композицию | Не подменять отсутствие material generic декоративными карточками |
| Проверить темп/контраст specifically на mobile и reduced-motion | На 390 фоновая wall крупнее видимого поля и уже служит texture, а не proof | Не останавливать/заменять hero без проверки perception; reduced motion уже отключает animation глобально |
| Дать карточкам semantic route mapping только если это не создаёт конкурирующие CTA | Пользователь видит, что студия делает; HTML сейчас `aria-hidden`, поэтому это именно визуальный слой | Не превращать wall в кликабельный carousel; primary CTA остаются два |

**Verdict: KEEP + REFINE.** Перегруз не структурный: headline, copy и CTA не спорят друг с другом. Недогруженность — доказательная: движение показывает 3 repeated covers, а не достаточно широкий реальный portfolio/product range. Удаление или полная замена нарушили бы один из наиболее узнаваемых anchor элементов без необходимости.

## 2. Product / work hover previews

### Карта мест

| Route / section | Current pattern | Available space at 1440 / 390 | Potential design device | Why it fits | Desktop behavior | Mobile behavior | Risk | Priority | Complexity |
|---|---|---|---|---|---|---|---|---|---|
| `/products/` — product rows | 21 rule rows: title + summary, price/term, arrow; existing hover inverts row and shifts 16 px | **Высокое:** list column 794 px beside 300 px sticky head. Row 127–132 px. At 390 row is 350 px / 165–190 px and meta moves below title | Cursor-following or right-aligned fixed-within-row preview, one crop/interface fragment; preserve row text | This is the clearest idle → proof interaction and existing motion script already has dormant `data-cursor-preview` support | Preview may occupy the summary/right part, stay clipped inside active row or float to its right only within group; keyboard focus needs equivalent non-pointer reveal | No hover simulation. Keep text/price first; optional tap-expander or a single inline proof only where an existing real asset exists | High if preview obscures price or turns catalog into gallery; assets sparse for all SKU | **P1** | M |
| `/` — directions (5 groups) | Numbered rule rows link into catalog; title and group summary | Medium: full wrap ~1144 px; existing 4-column row grammar spends large third column on summary. At 390 row is 350 px and 164–188 px tall | Quiet edge preview or a bounded preview panel in the row’s summary field, only on desktop focus/hover | Strong match for taxonomy: a screenshot/diagram could make «Каталоги и продажи» concrete | One persistent preview slot per active row, not cursor-sized; other rows remain typographic | Do not add hover behavior. Existing rows are already tall; keep as text links | Data is group-level, while current assets/proof are product-level; requires a deliberate group-to-proof choice | P2 | M–L |
| `/products/[slug]/` — `ProofModule` | Dedicated proof scene already supports real interface, scenario, management, integration, before/after | High: this is explicitly a proof block; varied grid (1.5fr + 1fr, pair, flow) | Improve asset completeness/content sequencing, not a hover preview | It already embodies thesis → visual → CTA and should remain the main rich proof | Static media carries proof; hover only for detail affordance if it adds comprehension | Existing grids collapse in module CSS; proofs stay readable inline | Adding floating preview duplicates existing evidence | P1 for content readiness, not interaction | L/content |
| `/` and `/cases/` — `CasePreview` grid | Permanent image tile + metadata, hover hard gold offset and cursor label | Low for additional visual: at home 4×272.5 px; cases 2 columns. At mobile single 350 px tiles | No new hover preview; optional future richer crop is inside existing `AssetSlot` | Already follows proof-first tile composition | Keep offset/translate and cursor label; image is already the contextual proof | Image remains visibly inline; no cursor label on touch | Extra overlay would make cards noisy and compete with title | **DO NOT ADD PREVIEW** | — |
| Related products / product detail options | White option cards / price sections, not a shared related-product gallery | Depends on individual page; no current related products pattern | Do not invent a preview system here before content relation exists | No existing data model or IA evidence | — | — | Would create a new content/data model and a competing navigation scheme | **DO NOT USE NOW** | — |
| Hero conveyor | Background non-interactive visual cards | Visual room exists but intentionally decorative/aria-hidden | Map cards to real work internally, but do not make hover previews | Hero already has its own moving proof syntax | Passive animated range | Passive background texture | Interaction conflicts with headline/CTAs | Keep passive | S/content |

### Data readiness

Product details already contain `ProductProof` data across the detailed-product set, including explicit variants (`real-interface`, `scenario`, `management`, `integration-diagram`, `before-after`) and asset keys. It is a much stronger source for product-detail proof than a new data model. However catalog rows render only `Product` fields (`name`, `summary`, pricing, delivery); a row preview needs an explicit decision about whether to reuse the product’s existing `proof.assets[0]`, show nothing when unavailable, or add a curated catalog-preview field. It must never use a generic placeholder as proof.

**Product-hover verdict: pursue as a focused desktop signature pattern for `/products/` first; test homepage directions only after a group-level proof mapping is editorially defensible. Do not add it to case tiles, hero, or mobile by default.**

## 3. Rule-row grammar

| Classification | Existing / candidate locations | Reason |
|---|---|---|
| **CURRENT** | Homepage directions; `/products/` rows and catalog index; `PriceTable`; ProcessChat stage dividers; guarantee/team lists; generic case metadata/context | Number + long rule + title + secondary fact is the core’s most recognizable way to compare structured information without card chrome |
| **GOOD CANDIDATE** | Product catalog preview interaction (inside existing rows); product-detail project steps; selected price/add-on entries; compact case-index metadata if images remain permanent | These have discrete comparable choices, clear next action, and can use price/term/technical fact as the right-side column |
| **DO NOT USE** | Hero, case narrative scenes, Brief choice controls, FAQ answers, product proof galleries, all media blocks, footer wordmark | A rule would turn singular visual scenes into a list, suppress narrative media, or make wizard controls harder to scan |

Rule rows should remain a comparison/navigation grammar, not a universal replacement for cards. White cards are justified where an object needs a bounded media frame or selectable control; scenes are justified where one idea needs room.

## 4. Media / product proof opportunities

| Route / section | Current evidence gap | Natural media candidate | Readiness / caveat |
|---|---|---|---|
| `/products/` catalog rows | Summary explains outcome, but no immediate visual distinction between products | Real product screen, flow fragment, before/after or integration diagram on activation | Existing detail proof may supply it; only if asset is published and specific |
| Homepage directions | Five abstract groups lead to a catalog; summary is text-only | One representative interface/crop per group in a bounded active-row area | Requires curation at group level; do not derive a false representative from a random SKU |
| Product detail sections before/around `ProofModule` | The module is structurally correct, but content proof coverage depends on asset availability | Existing variant-specific ProofModule media, especially scenario/diagram/before-after | Content/assets, not new component language, are the main opportunity |
| `/price/` / additions | Numeric information is inherently textual; excessive media would weaken comparability | No generic screenshot; possibly a tiny architecture/flow only when it explains an option | Mostly **do not add media**; preserve table/list clarity |
| Homepage guarantees / team | Dense explanatory copy in otherwise strong dark scenes | No generic image. A small technical artifact only if it substantiates a claim (e.g. actual handoff/estimate structure) | Current static rules are more aligned than decorative proof |
| ProcessChat | Already a coded scenario visualization of collaboration | Keep as authored simulation; no extra screenshot required | It is a deliberate visual break, not an empty text field |
| Case index | Covers provide the proof, and click opens a deep case | Improve cover quality/crops when real assets warrant it | Do not layer another demo on top of a cover tile |

## 5. Ink / paper scene map

| Route / scene | Current function | Assessment | Opportunity later |
|---|---|---|---|
| Hero ink | Establishes focus, lets paper conveyor emerge as material | Justified, signature | Keep; improve proof specificity rather than add color events |
| Homepage directions + works paper | Comparison and reading of choices/work | Justified; calm base plane | Keep neutral; media activation may provide a local break |
| Homepage guarantees ink | Commercial confidence / contract-like information | Justified semantic reset | Keep. Do not add decorative gradients/cards |
| Process paper | Human process narrative and chat simulation | Justified as a quieter transition | Keep its distinct chat logic case-like and bounded |
| Team ink | Separates people/proof from transactional process | Justified but adjacent to guarantees within one dark run | Keep; avoid another separate dark block inside it |
| Brief gold | A direct conversion scene | Justified: gold has a specific action meaning | Keep scarce; no more gold scenes on same route |
| FAQ paper | Reading and disclosure | Justified | Keep plain; no scene effect needed |
| `/products/` paper bands + apps ink band | Catalog reading; ink marks applications/systems | Semantically plausible but partially decorative because only one group turns dark | Owner decision: either retain meaningful category emphasis or make all bands neutral; do not choose now |
| Product header gold → product paper | Signals offer/entry then evidence | Justified hierarchy | Preserve; avoid introducing more color planes per detail page |
| Brief ink | Application/wizard mode rather than marketing reading | Strong and semantic | Keep; paper live document already provides inner contrast |
| Core case stories | Each owns a project world; core Nav/Footer frame them | Intended divergence | Do not normalize scenes inside cases during core pass |

## 6. Gold map

| Role | Current sites | Assessment |
|---|---|---|
| Primary action | `.btn-gold`, hero/nav/product/case CTA; home brief primary action | Correct use: immediate next step, rare enough to retain force |
| Focus | Global `:focus-visible` outline | Correct accessibility signal; not merely decorative |
| Signature accent | Gold word/spot in hero, blue→gold hover changes, labels in ink scenes, footer/CasePreview hard offset | Strong core identity when paired with movement or selected action |
| Conversion scene | Homepage Brief band and product PageHeader tone | Strong but already near maximum scarcity on a route |
| Decorative/noise risk | Wall-card CTA color accents, gold underline and some multiple CTA variants | Mostly small; danger only if product previews or every card gain gold framing |

Gold should not become a default media border, generic badge fill, or permanent product-category marker. Its highest-value future use is the existing hard-offset/layer cue when a real preview is intentionally activated.

## 7. Restrained depth / “3D” language

Current depth vocabulary: CasePreview uses `translate(-3px,-3px)` plus `10px 10px 0 gold`; list arrows shift 5px/-5px; product/direction rows shift their internal padding; magnetic CTAs move under pointer; hero has literal layered wall/copy/fade; AssetSlot provides flat browser/device frames. It is enough to read as dimensional without 3D graphics.

Maximum four viable future extensions:

1. **Active `/products/` row preview:** a real crop can leave the row plane by the already-known hard gold offset, then settle back on leave. Keep the offset small, one preview only.
2. **CasePreview on desktop:** retain current hard offset; at most make the existing media crop slightly lead the card transform. Do not add parallax or a second shadow vocabulary.
3. **Product-detail ProofModule:** allow one main frame to sit one offset plane above supporting small frames when the existing variant has a real hierarchy. This is composition, not animation.
4. **Hero wall:** preserve its behind-copy z-layer. Content-specific cards can create depth through different truthful crops, not added WebGL/float effects.

No opportunity is recommended for blobs, cubes, cursor parallax, universal elevation, or a new shadow system.

## 8. Signature interaction verdicts

| Interaction | Status | Reason / future constraint |
|---|---|---|
| Conveyor hero (`wallScroll`) | **KEEP + REFINE** | Brand anchor. Refine source material/repetition/tempo perception; retain passive background role |
| Rolling labels (`.roll`) | **KEEP** | Restrained, specific, applied to nav/Telegram where compact text makes the effect legible |
| Rule-row shift/inversion | **KEEP** | Strong signal of intent in otherwise print-like lists; a natural host for contextual proof |
| Hard-shadow CasePreview | **KEEP** | Existing depth syntax and one of few intentional surface elevations; stay case/work-specific |
| Cursor label (`data-cursor`) | **REFINE** | Useful on large case tiles for desktop intent; ensure it remains additive, never sole action affordance; no touch equivalent needed because visible text already exists |
| Dormant cursor preview (`data-cursor-preview`) | **REFINE / activate selectively** | Implementation exists but has no current markup consumer. Best candidate is catalog rows after keyboard/touch behavior and asset availability are defined |
| Magnetic CTA | **REFINE** | Appropriate for primary actions in hero/CTA bands; avoid applying to every link or row, and preserve focus/reduced-motion behavior |
| Scroll reveal / background transition | **KEEP** | Supports scene discipline; keep one shared easing and avoid stacking with new per-item animation |
| Process chat animation | **CASE-ONLY / page-specific** | Its narrative form suits the collaboration/process scene but would be gimmicky as a shared UI pattern |
| FAQ native disclosure | **KEEP** | Utility interaction; should remain quiet, not receive signature motion |

## 9. Available space and composition

| Zone | 1440 reality | 390 reality | Design capacity |
|---|---|---|---|
| Hero | Copy left, peripheral wall right; scene already full | Copy occupies most of 350 px content width over muted wall | No new object; only content refinement inside existing wall |
| Homepage direction rows | 1144 px internal width; summary column creates a usable but not empty field | Rows are 164–188 px; title/summary stack and arrow occupies top-right | Desktop-only active preview is possible; mobile must stay text-first |
| Homepage works | Four ~272.5 px tiles | One 350 px tile at a time | Already proof-dense; do not add media/interactions |
| Guarantees | Two-column, one major claim and two supporting | Single column | Preserve breathing room; not an image slot |
| Process | 360 px sticky thesis plus broad chat column | Becomes stacked | Existing chat fills available proof role; no extra media |
| `/products/` group/list | 300 px sticky heading + 794 px list, row 127–132 px | Single 350 px list, row 165–190 px and price below | Best desktop interaction capacity; mobile no floating device |
| Product detail proof | Intentional wide proof grids | Naturally stackable proof media | Highest capacity for actual media, not need for hover |
| `/cases/` | Two wide permanent preview tiles | One tile | Case cover is already the main visual object |
| `/brief/` | Wizard + sticky paper document | Mobile toggle documents | Do not introduce marketing media; hierarchy depends on task completion |
| `/legal/`, `/price/` | Reading/compare surfaces | Narrow text/table | Do not add interaction/media without a direct explanatory need |

## 10. Best future signature-design locations

1. `/products/` desktop rows: contextual preview of a real product proof, activated by hover/focus, with strict one-active-row policy.
2. Product detail `ProofModule`: complete and order real interface/diagram/scenario material so the existing story structure does more of the persuasion.
3. Hero conveyor: diversify only with ready, truthful work/product material; retain movement and composition.
4. Homepage directions: desktop-only bounded group proof after editorial group-to-asset mapping exists.
5. Existing CasePreview: preserve the hard-offset hover as the work-navigation depth signal; improve actual cover crops rather than add UI.
6. Product-detail multi-frame proof scenes: use modest existing offset/layer hierarchy where main/supporting proof is real.
7. Homepage ProcessChat: retain as one deliberately authored product-storytelling break; tune only if reading flow proves weak.

### Better not touch

1. Hero’s fundamental conveyor + left-copy composition.
2. Homepage works/case cards with an extra preview overlay or cursor-following media.
3. Brief wizard with marketing/media/scene tricks.
4. Legal and price reading/comparison surfaces with decorative proof.
5. Case-specific internal visual systems during core normalization.

## 11. Decisions and dependencies before implementation

| Decision | Options evidenced by current system | Consequence |
|---|---|---|
| Catalog preview source | Reuse first existing `ProductProof` asset when actually ready; curate a dedicated preview field; show none | Controls truthfulness and whether every SKU can participate without placeholders |
| Preview placement in product rows | Cursor-following inside clipped row; fixed/right-aligned panel tied to active row | Cursor form is more signature but less stable/accessibility-friendly; panel is calmer and more legible |
| Mobile treatment | No preview; optional explicit inline reveal; one permanently visible proof at group level | Must not fake hover or obscure price/term |
| `/products/` ink apps band | Preserve as semantic category break; later make category breaks neutral | Determines whether scene switch is meaning or decoration |
| Hero content inclusion | Published work only; also concrete studio products once their visual proof is ready | Cannot treat planned assets as portfolio evidence |

## 12. Recommended scope for the next design pass

**Phase 0 — preserve and validate.** Do not redesign hero, cases, content IA or CTA meanings. Confirm real assets and a11y behavior before any interaction work.

**Phase A — core primitives.** Normalize only the already-audited shared foundations needed to make an interaction safe: row geometry, media frame, focus/reduced-motion handling, constrained gold offset. Keep existing visual syntax.

**Phase B — one proof interaction pilot.** Implement and test a single `/products/` desktop catalog-row preview with a keyboard equivalent and a non-hover mobile policy. Measure against hierarchy at 1440, 1024, 768, 390 and 320 before spreading it.

**Phase C — proof content adoption.** Populate/refine product `ProofModule` and hero conveyor solely from ready truthful assets; then assess homepage group previews.

**Phase D — cases later.** Keep case worlds separate; only borrow a validated core primitive where it does not dilute their project-specific systems.

## Verification / repository scope

Observed via Playwright MCP: homepage and catalog at 1440/390, including hero geometry, responsive rows, case tile sizing, and animation/computed layout; source review covered `HeroWall`, `motion.ts`, homepage/catalog/product/case components and product/work data. No UI, CSS, data, component, token or case file was changed by this pass. The only repository file added is this report; no commit was made.
