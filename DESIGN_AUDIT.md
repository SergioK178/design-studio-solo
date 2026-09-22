# DESIGN FORENSICS / VISUAL SYSTEM AUDIT — 3D Studio

Дата аудита: 2026-09-20. Это снимок фактически работающего интерфейса, а не спецификация и не план редизайна. Код продукта не менялся.

Метод: чтение Astro/Svelte/CSS/data и проверка локальной сборки через Playwright MCP. Проверены `/`, `/products/`, семь representative product details (`start`, `landing`, `catalog`, `shop`, `app`, `web-service`, `support`), `/brief/`, `/price/`, `/cases/`, `/legal/` и cases `car-rental`, `catalog-med`, `suture`, `guest-house`; ширины 1440, 1024, 768, 390 и 320 px. Состояния: desktop/mobile nav, FAQ, hover-паттерны из CSS, wizard, focus/reduced-motion по коду и browser DOM. «Использование» ниже означает активный источник в `site/src`, не существование неиспользуемой декларации.

## 1. Executive summary

Core-сайт — контрастная, почти плоская editorial-композиция: тёмный ink и бумажный фон переключаются большими полосами; тяжёлый геометрический display-шрифт сталкивается с спокойным текстовым набором; иерархию строят длинные тонкие rules, номера, большие поля и gold/blue как редкие сигналы. Это не карточный SaaS-интерфейс: карточки есть, но большинство группировок происходит линией, сеткой и расстоянием.

У core есть маленькая, явно объявленная палитра (10 theme colors), три глобальные font-role variables, один container и одна motion-кривая. Однако spacing, type sizes, border-alpha и CTA-построение пока преимущественно локальны. Кейсы — намеренно самостоятельные продукты: showroom и catalog сохраняют core-шрифты/палитру, sutures и guest-house добавляют собственные системы (Inter/Prata и Onest соответственно). Это объясняет высокую визуальную divergence без вывода о качестве.

Главные системные риски: нет canonical spacing/type/radius scale; `.mono` глобально не mono; одинаковые CTA реализованы несколькими способами; mobile overflow на 320 px у product index, price и legal; у case-shell не изолированы загружаемые font assets (они загружаются Base на каждой странице). В следующем проходе сначала фиксировать решение владельца, затем canonical tokens и shared primitives — не начинать с cases.

## 2. Visual identity

**Фактический характер.** Плотность средняя: большие вертикальные интервалы (core section 72/80 px desktop, 48/52 px mobile) чередуются с плотными списками/таблицами. Это editorial marketing shell с application-like интерактивностью только в Brief и демонстрациях кейсов. Геометрия строгая и прямоугольная: core radius намеренно сброшены (`--radius-*: initial`), почти все core surfaces квадратные; 1–2 px rules задают ритм сильнее теней. Контраст строится парой `#17150f`/`#f4f2ec`; gold используется как активатор и blue/ochre — как смысловые акценты на светлой поверхности.

Whitespace — структурный, а не декоративный: hero занимает 870 px при desktop 1440, типовая секция 152 px padding; затем rows/tiles несут содержание. Typography доминирует над imagery на core; изображения сидят в белых, тонко обведённых browser/media frames. UI chrome экономный: ни rounded pills, ни постоянных shadows. Исключения — mock UI и case worlds: там появляются radius, тени, device/browser chrome, палитры и иллюстративная плотность.

Движение заметное, но не непрерывное: stagger reveal, rolling labels, magnetic CTA, circular cursor label на works, меняющийся page background; все выключаются при reduced motion. Deliberate visual breaks: gold brief-band, dark process/team blocks, полноширинный footer wordmark и каждая case presentation.

**Узнаваемое как 3D Studio:** бумага/ink/gold; Unbounded-заголовки рядом с сухими numbered/rule rows; square surfaces; смена полноширинных тёмных и бумажных сцен; крупный финальный wordmark; ↑/↗ и CTA vocabulary. **Обычный web UI:** стандартные form controls, browser mock chrome, white bordered product cards, `details` FAQ, right-side mobile drawer.

## 3. Signature / anchor elements

| Anchor | Описание и источник | Где / повторяемость | Статус |
|---|---|---|---|
| Rule + numbered row | Толстый 2 px верхний rule, тонкие разделители; blue two-digit ordinal, display title и arrow. `pages/index.astro`, `products/index.astro`, product/case details. | Directions 5, product groups/rows 21 SKU, steps/team/context. | brand-defining recurring pattern |
| Ink/paper scene switch | Full-width planes без radius; body background следует `[data-bg]` в `motion.ts`. | Home, product/catalog/price/legal shells, footer. | brand-defining |
| Display/text collision | Unbounded 700/800 for hierarchy; Golos Text for prose; compact colored eyebrow. `global.css`, `PageHeader`, page-local styles. | Все core public routes. | brand-defining |
| Gold action signal | `#e5a43b` fill for primary CTA, dot in wordmark, focus and cursor label; gold becomes paper on hover for global button. | Nav, home brief band, product/case CTAs, footer. | brand-defining |
| Oversized footer wordmark | `clamp(40px,10.2vw,148px)`, gradient text-fill rolls on hover. `SiteFooter.astro`. | Every public page. | brand-defining one shared component |
| Rolling navigation labels | Duplicate `data-text` translates -100% on hover/focus. `global.css .roll`. | Desktop nav, Telegram. | useful recurring interaction |
| Square white media tile + gold offset shadow | CasePreview 1 px border, no radius, hover `10px 10px 0 gold`. | Home/cases index published works. | useful recurring pattern |
| Mono-looking metadata is not mono | `.mono` globally uses Golos Text 13/650; actual JetBrains Mono is selectively used in product/case metadata. | PageHeader/product sections/Brief vs case general templates. | legacy naming inconsistency |

## 4. Typography

### Families actually available and applied

| Family / role | Source and weights | Actual use / fallback |
|---|---|---|
| Unbounded — global display | `Base.astro`: `@fontsource/unbounded` 500, 700, 800 (static CSS import; default font-display from package). | `--font-display: 'Unbounded', sans-serif`; nav brand, H1/H2/H3, row titles/numbers, footer wordmark. 500 is loaded but core declarations mostly 700/800. |
| Golos Text — global text | Base imports 400/500/600. | `--font-text: 'Golos Text', sans-serif`; body and UI/buttons. `650` occurs frequently although no 650 face is imported, so browser synthesizes/maps it. |
| JetBrains Mono — metadata | Base imports 400/500. | `--font-mono: 'JetBrains Mono', monospace`; actual product price term (11 px) and generic case metadata (11–12 px). |
| Onest — guest-house only | Self-hosted `styles/fonts-onest.css`, separate cyrillic/latin WOFF2 400/500/600/700, `font-display: swap`. | `--font-project: 'Onest', sans-serif` within `.olginka-case`; loaded as stylesheet by that case. |
| Inter — sutures only | Fontsource imports in `SuturesCase.astro` (400/500/600). | `--font-project: 'Inter', sans-serif`, UI labels/body. |
| Prata — sutures display | Fontsource import in `SuturesCase.astro` (400). | `--font-project-display: 'Prata', Georgia, serif`, project hero display. |
| Georgia/Times — mock only | `mock-ui.css --m-display`. | Media simulation in CatalogCase mock components; not studio core. |

Browser check at all baseline pages confirms global imported faces; case-page font lists also contain Onest/Inter/Prata because Base/client stylesheet loading is global in session. That is availability, not proof that every case renders all four. No external network font dependency was observed.

### Core effective type table

| Semantic reality | Values at desktop → mobile | Source/examples |
|---|---|---|
| Page H1 | Unbounded 800, `clamp(42px,6vw,72px)`, 1.06, -0.015em | `PageHeader.astro`; core product/legal/price/case generic headers |
| Home section H2 | Unbounded 800, `clamp(34px,4vw,48px)`, 1.1 | `pages/index.astro` |
| Product section H2 | Unbounded default weight, `clamp(30px,4vw,44px)`, 1.12 | `products/[slug].astro` |
| Generic reading H2 | Unbounded, `clamp(26px,3vw,38px)`, 1.16, -0.01em | `ContentShell.astro` |
| Row/card title | Unbounded 700/800: 16, 19, 20, 22, 25 px; a few clamps 18–25 | catalog/product rows, CasePreview, FAQ, team |
| Lead | Golos 18 px / 1.55 (PageHeader); product body 17/1.65 | headers/product pages |
| Body | Golos default 16/24; explicitly 15, 16, 17, 18 with 1.48–1.7 | pages/components |
| Small/meta | 10, 10.5, 11, 12, 12.5, 13, 13.5, 14, 14.5, 15 px | nav 13.5, eyebrow 13, terms 11 mono, brief 12–14.5 |
| Button | Golos 600: 14 nav, 15/15.5 elsewhere; line-height 1–1.2 | Nav, global buttons, Brief |
| Actual mono | JetBrains Mono 11/500 uppercase and 0.06em in generic case; 11 px term uppercase | cases generic/product options |

The core has a recognizable *role* scale, but not a canonical numeric scale: 15/15.5/16/16.5/17/18 and 12/12.5/13/13.5/14/14.5 coexist. Similar heading clamps differ per page. Hierarchy is strongest in PageHeader + section heads and in numbered rows; it fragments in page-local cards and Brief/result sheet. Case typography is deliberately separate: sutures defines 13–18 px project vars but overrides them at `min-width:1001` to 10–17/31; guest-house defines 13–18 and clamp displays.

## 5. Color system

### Global/core palette

| Token/value | Current semantic use | Evidence / approximate reach |
|---|---|---|
| `--color-paper #f4f2ec` | primary light plane, inverse ink text | all core routes |
| `--color-ink #17150f` | primary dark plane and ink | all core routes |
| `--color-gold #e5a43b` | primary CTA, focus, active accent, cursor | global + most public pages |
| `--color-blue #2743e0` | informational numbering/eyebrow/price/link | core light pages |
| `--color-blue-dk #1f35b8` | declared; no direct active reference found | dead/unused candidate |
| `--color-ochre #c24a12` | secondary action/link/check/accent | product/brief/case preview |
| `--color-ochre-dk #a83d0c` | Brief error | status-local |
| `--color-ink-soft #26231a` | dark AssetSlot frame | media-local |
| `--color-teal #0e6b86`, `--color-teal-dk #0a5468`, `--color-mist #eef2f5` | mock catalog UI | `mock-ui.css`; not core brand palette |
| literal `white/#fff` | product/card/media surface | CasePreview, AssetSlot, product/case cards |

Core also repeatedly derives text/borders as `rgb(23 21 15 / .18–.78)` and inverse `rgb(244 242 236 / .14–.9)`: visible muted copy commonly .62/.72; row lines .20/.25; dark line .14/.16/.25/.30. They are systematic *behavior* but not tokens. Nearly identical alpha variants are a major normalization candidate, not an audit-time choice.

**Case-specific:** sutures has 14 project colors (`#10141a`, `#151821`, `#1d222c`, `#11161c`, `#151a21`, `#f7f3ec`, `#f5f0e8`, `#e8ebe4`, mint `#a4ead7/#8dd7c1/#5fb9a2/#3d8070`, violet `#8b73d9`, burgundy `#7b2636`); guest-house has nine (`#f4eee3`, `#211b14`, `#0c0910`, `#1a1620`, terracotta `#c5602e/#a94e24`, amber `#e8a06b/#f3d9be`, cream `#e9e2d4`). Catalog mock adds `#ffffff/#f4f8f9/#16232a/#6b7a80/#dceff3/#9fb0b6`; showroom uses core. They are visual worlds, not candidates for core palette merge.

Obvious visual contrast flags: muted inverse text `.55` on ink and several `.5/.55` notes are deliberately subdued but need measured review later; brief error is ochre-dark on paper; blue focus on white is visually clear. No WCAG certification performed.

## 6. Existing tokens

| Token group | Defined in | Used by / status |
|---|---|---|
| 10 `--color-*` values | `styles/global.css @theme` | paper/ink/gold/blue/ochre active canonical; teal/mist mock-specific; blue-dk likely dead |
| `--font-display/text/mono` | global `@theme` | actively canonical; `mono` semantic label conflicts with its global implementation |
| `--radius-*: initial`, `--shadow-*: initial` | global `@theme` | active reset/policy, not a reusable value scale |
| `--ease-site cubic-bezier(.16,1,.3,1)` | `:root` | actively canonical: reveals, roll, magnetic, cards/footer |
| `--reveal-dur .9s` | `:root` | active canonical only for reveal |
| `--page-bg` | `:root`, updated by `motion.ts` | active runtime token |
| local `--row-muted`, `--band-bg` | home/product index | active component-scoped semantic tokens |
| local media variables (`--asset-ratio`, `--chrome-h`) | AssetSlot | active component API |
| mock `--m-*` | mock-ui.css | case/catalog-local |
| project `--p-*`, `--font-project*`, `--scene-gap`, `--col-gap` | the two case CSS files | active case-specific tokens |

No global spacing, width, border, radius, shadow, z-index or breakpoint tokens exist. `z-index` is literal 40/50/80/90 in nav/grain/cursor. Core components often hardcode token-equivalent literals (white, alpha ink/paper, 1/1.5/2 px border) rather than consume semantic variables.

## 7. Spacing system

Static declaration frequency across all `site/src` styles is dominated by 24 (86), 16 (79), 18 (75), 20 (74), 12 (71), 10 (70), 14 (67), 28 (48), 8 (47), 22 (42), 26 (39), 32 (34), 48 (29), 40 (28), 72 (27), 34 (26), 56 (24), 30 (21), 64 (19), 80 (14), 44/36 (11 each). This count includes case/mocks; it is frequency evidence, not a prescribed scale.

Core rhythm: page gutters 48 desktop / 20 at <=640; nav top 26; PageHeader 120/70; core section 72/80 desktop and 48/52 <=620; product body 80/100; repeated inter-section margins 70/72/74/90/96; card pads 22–24; controls 12–19 vertical / 22–30 horizontal; small gaps 6/8/12/14/16/18/24. Thus there is an emergent 4-ish grid but many un-tokenized exceptions (17.5, 19, 25, 27, 46, 54, 70, 74).

Text rhythm is generally 9–18 px title-to-copy and 1.48–1.7 line height. Case scenes use intentionally larger clamped scene gaps (sutures 76–112, guest-house 88–128) then override sutures desktop to 42, an atypical inversion that needs owner/context confirmation.

## 8. Layout / grid / containers

`.wrap`: max-width **1240 px**, centered, `padding-inline:48px`; actual outer at 1440 is x=100,width=1240, content width=1144. At <=640 it is 20 px gutter. No separate global wide/narrow token: `ContentShell .prose` caps entire wrapped box at 860; PageHeader title 920/lead 720; product prose/card maxes are local.

Observed patterns: 1-column reading/legal; split header (title left, description right); four-column work tiles (to 2 at <=1100, 1 <=620); 4-column process (2 <=900, 1 <=620); 3-column generic case context; product 300px sticky group-head + fluid rows; product rows 1fr/200/24; two-column FAQ; two-column fit/gains; Brief desktop 2-column interview with sticky live document; full bleed hero/ink/paper/gold bands. Grids are centered and symmetric in core; asymmetric is mostly the fixed 300px catalog sidebar and case scenes.

Effective core breakpoints are 900 (nav and major columns), 820 (home), 860 (several content pages), 760 (cases index), 640/620 (gutters/mobile layouts), plus 1100 (grid). These are independently authored, not a breakpoint token system. Cases/mocks add 420/460/520/560/680/720/800/960/1000/1080/1100/1147/1200/1240.

## 9. Page archetypes

| Archetype | Routes | Shell and responsive behavior |
|---|---|---|
| Marketing home | `/` | Nav over dark HeroWall; alternating scenes; CTA band; global footer. Header splits to stacked at 820, cards 4→2→1. |
| Catalog/index | `/products/`, `/cases/`, `/price/` | paper body after header; rules/list/tile collection; product sidebar becomes normal flow <=900 and rows collapse metadata <=620. |
| Product detail | `/products/[slug]` | gold PageHeader, paper long-form sections, white option cards, dual CTA; grids 2/3/4 to 1/2/1. |
| Brief wizard | `/brief/` | dark host, Svelte interview screen + paper sticky document; document becomes toggle block <=960. |
| Legal/readable | `/legal/` | PageHeader + `ContentShell` narrow prose. |
| Case index | `/cases/` | PageHeader + shared CasePreview tiles. |
| Case story / application | four case URLs | shared Nav/Footer only; each selects one specific presentation component rather than a common case template. |

## 10. Shared component inventory

| Pattern | Implementation / usage | States and system notes |
|---|---|---|
| Global shell | `Base`, `Nav`, `SiteFooter` | all public pages; tokens/motion global |
| Page header | `PageHeader` | dark/paper/gold, title/lead; used catalog/product/legal/generic cases |
| Wrap/prose | `.wrap`, `ContentShell` | one global container, local reading cap |
| Primary/outline CTA | `.btn-gold`, `.btn-outline`, local `.outline/.btn-dark` | duplicate implementations |
| Work preview | `CasePreview` | tile hover shadow/translate, no radius |
| Media frame | `AssetSlot` | browser/mobile/plain, light/dark, hide unavailable production asset |
| Product list/row | pages home/products index | visually equivalent but separately implemented |
| Product option card | product detail | white 1.5px outline, local |
| Proof module / price table | `ProofModule`, `PriceTable` | shared but page-specific visual modules |
| FAQ | native `details` on home | open state browser-default plus content expansion |
| Process chat / guarantees | dedicated home components | one-off sections |
| Brief controls/results | `Brief.svelte` | only interactive core subsystem |
| Case visual systems | `ShowroomCase`, `CatalogCase`, `SuturesCase`, `OlginkaCase` | separate implementations, not duplicates to merge now |

There are about 14 core recurring visual patterns (plus 4 case systems). Visually equivalent independently built items: row lists home/products; global/local outline CTAs; global `.mono` and true case mono; white bordered cards (CasePreview/product options/AssetSlot); square action links across page sections.

## 11. Buttons, links and CTA

CTA vocabulary present in public UI: **«Пройти бриф»** → `/brief/`; **«Обсудить проект»** → Telegram; **«Смотреть работу»** for case navigation (plus older presentational arrows/«Все форматы и цены» links). Core primary: gold, square, `19px 28px`, 15.5/600; nav variation is 52px min-height, 12×22, 14 px. Global outline: 1.5 px inverse border, `17.5×26`; product has separately implemented dark outline at same values. Home gold band has dark primary and 1.5px ink secondary, `19×30`. Brief submit is local dark/blue hover, `18×30`.

Text links vary: nav rolling link; ochre non-underlined section link; blue prose links; underlined gold-offset brief link; product catalog index uses gold underline on hover. Hover/focus: global gold → paper; outline border brightens; row shifts 12px and reverses color; roll translates .5s; focus visible global 2px gold/4px offset, Brief inputs override with blue 2px/1px. Disabled is explicit only `.btn-dark:disabled` (opacity .45); product anchor variants have no disabled state. Icons are glyph arrows, not a unified icon button system.

## 12. Cards / surfaces / panels

Core policy is mostly no-radius/no-shadow. `CasePreview`: white, 1px alpha border, zero radius, hover gold hard shadow. Product options: white, 1.5px alpha border, 22px padding/min-height 230. FAQ: half-white fill within grid rules. AssetSlot: white or ink frame, optional browser chrome, 16×36 soft shadow; this is media-specific. Brief uses a paper document panel on ink but no visible card radius. Selectable brief options are rule rows, not cards. Nested card treatment mainly exists in mock and cases; mock UI uses .9em/.5em radius and multi-shadow, intentionally simulating a client interface.

## 13. Forms / Brief UI

Brief is a dedicated wizard, not a general form kit: stage/progress, choice rows, back/next controls, live sticky document (then mobile disclosure), estimate sheet, contact form and send state. It uses ink host/paper active surfaces, gold progress/action and ochre document accent. Inputs are white, `1px rgb(ink/.3)`, 13×14 padding, Golos 15/500/1.4; focused controls use blue 2px outline. Labels are stacked with 8 px gap and small `.mono` label; textarea vertical resize. Option rows are text/rule selection rather than pill/card; mobile options become 15px and 14×2 padding. Error is ochre-dark, consent muted/underlined, disabled submit opacity .45. Reduced motion disables the blinking caret.

Systemic: controls share typography/palette and focus logic with core, but screen, progress, document, estimate sheet and ghost buttons are unique wizard patterns. Loading/success are state-dependent Svelte UI; visual behavior is local, not reusable primitives.

## 14. Navigation

Desktop header is absolute over hero/page header, z40, top padding 26, brand Unbounded 17/800; links Golos 13.5/500 and Telegram gold. Active link adds a 2px gold underline at -6px. CTA at right. At <=900 links/actions disappear and a 44px-min square outline «Меню» control appears. It opens fixed z50 right drawer (max 360), ink surface, 22/28/32 padding, dim overlay; menu type is Unbounded 20, rules, gold current item; Escape, focus trap, close/backdrop and focus restoration are implemented.

Footer is ink, 44/26 link row then 64 top padding large responsive wordmark. Links are 12.5; it wraps naturally. No breadcrumbs. Page anchors occur at home/product catalog; `scroll-behavior:smooth` global and `scroll-margin-top:40px` only `.band` product groups; deep links are ordinary hash behavior.

## 15. Interaction inventory

| Trigger | Response | Implementation / mobile/fallback |
|---|---|---|
| Viewport entry | opacity + 28px Y reveal, or clip-mask title; stagger 90ms | `motion.ts`, IntersectionObserver; 0.9s ease-site; reduced motion disables |
| Hover/focus `.roll` | duplicate label rolls upward | 0.5s ease-site; desktop relevant |
| Hover row | 12px side inset, inverse background/text, arrow +5/-5 | home/products list, .25–.35s |
| Hover CasePreview | translate and 10px gold hard shadow | .25s; touch has no hover substitute |
| Magnetic CTA | pointer-driven transform | `motion.ts`, 0.4s; should be absent/limited touch |
| Work hover | fixed circular gold cursor label | `motion.ts`, 96px; desktop pointer pattern |
| Nav menu | drawer, focus trap/Escape | plain mobile behavior |
| FAQ | native disclosure | no bespoke animation |
| Brief | choice/select/back/progress/document/submit | Svelte state; mobile document toggle |
| Case demos | chips/configurator/interactive mock scenes | case-local scripts and components |

Signature interactions are reveal/roll/magnetic/cursor; FAQ/nav/form are conventional utilities.

## 16. Motion

One declared site easing (`cubic-bezier(.16,1,.3,1)`) is consistently used in reveal, roll, magnetic, rows, cards and footer gradient. Durations: .2 color, .25 card, .3 row padding, .35 row background/arrow, .4 magnetic/cursor, .5 roll, .7 body background, .9 reveal/footer, plus 1.1s caret keyframe. `wallScroll` and `tickerMove` keyframes support hero content. `prefers-reduced-motion: reduce` globally forces animation/transition/scroll behavior off with `!important`; cases add local safeguards. Coherent core motion language exists; case interaction motion is separate.

## 17. Icons / graphic language

Core uses text arrows (`→`, `↗`), check glyph, × close, dot and custom `CaseIcon`; no icon library. The visual weight is textual/technical rather than iconographic. AssetSlot browser chrome is CSS dots/lines. Sutures contains project SVG glyphs and product/needle SVGs; guest-house uses local Glyph components; catalog mock has application glyphs. FavIcon is custom SVG. Icons vary by case by design, so core has no formal common size/stroke system beyond arrows embedded in text.

## 18. Images / media

`AssetSlot` mediates core generic media: explicit aspect-ratio property; `object-fit:cover`; plain/browser/mobile chrome modes; zero radius; white/light or ink/dark frame; browser chrome 34px (18 compact), 16×36 shadow. It hides unresolved production assets rather than exposing placeholder labels. CasePreview has image area + textual copy; product promotional imagery uses slots. Cases use real webp/screens, editorial photos, custom compositions and mock browser/device frames, each case-specific. Browser check found no layout overflows at 390/768/1024/1440 baseline routes except the listed 320/Legal issues; no universal media ratio policy beyond component props.

## 19. Data / price / metric presentation

Price/term appears as display-weight bold price (product row `clamp(16,1.4vw,19)`, options 18 blue) paired with a small 11px JetBrains Mono uppercase term. Rows use baseline alignment and 6–9px gaps. Product labels sometimes put price in a gold `em` chip. Brief sheet uses tabular numbers (`font-variant-numeric:tabular-nums`) with 14px label / 15.5px value and ruled definition rows. Core has no public proof metrics invented by UI; case numeric strips are case content. This gives a recurring, restrained price/term language but not a universal table component.

## 20. Responsive behavior

At 1440: `.wrap` is 1240 outer/1144 content; desktop nav, four tiles, sticky catalog heads, Brief two columns. At ~1024: nav remains desktop; home cards are already 2 columns by <=1100; most fixed grids remain comfortable. At 768: nav drawer mode (<=900); home heading/brief stack (<=820); case index mobile layout begins <=760 only just below. At 390: 20px global gutter on <=640; home tile/FAQ single column; product rows compact; Brief one-column document disclosure. At 320: checked horizontal overflow: `/` 324px (minor 4px), `/products/` 384px, `/price/` 372px, `/legal/` 420px, `/cases/catalog-med/` 333px. Other tested pages fit.

Responsive architecture is local media queries, with several almost-equivalent thresholds. Awkward intermediate risk is strongest around 760–960 because Nav changes at 900, Brief at 960, home at 820 and generic content at 860. No core horizontal collections/carousels were observed. Sticky behavior: catalog group header desktop, Brief document desktop; each becomes normal/non-sticky on smaller width.

## 21. Accessibility visual baseline

Visible keyboard focus exists for anchors/buttons globally (gold) and inputs (blue); mobile drawer has focus trapping, Escape and restored trigger focus. Native `details` preserves keyboard operation. Labels wrap Brief inputs, consent/error links are textual. Reduced motion is unusually well covered. Risks: non-form `summary`/rows must be rechecked with real keyboard in regression; hover-only gold shadow/cursor/row inversion have no touch equivalent (not blocking); some links only differ by color/no underline; muted text contrast should be measured; 320 overflow harms usability; desktop nav CTA and menu controls are >=44px high, but text links/row links do not have consistently measured target heights. Heading hierarchy is structurally good on core headers but case scenes need separate semantic check.

## 22. Content hierarchy

Actual levels: eyebrow/kicker (usually Golos 13 650 blue/gold; not all mono); page H1; large section H2; display row/card H3; lead; body; muted supporting body; true mono technical metadata; price/term pairing; caption in AssetSlot; rule-delimited list/definition rows. Section numbers are blue Unbounded two-digit markers. Cases add project labels, fact strips and palette/technical notation. There is no shared `SectionHeader` component: the repeated visual grammar lives in page-local `.section-head`, `.mono`, rules and CSS.

## 23. Styling architecture

**GLOBAL:** `styles/global.css` imports Tailwind 4 and defines theme colors/fonts plus resets, `.wrap`, two global CTA classes, focus, grain, reveal/roll/magnetic/cursor. `Base.astro` imports Fontsource. **SHARED:** scoped styles in Nav/Footer/PageHeader/ContentShell/CasePreview/AssetSlot/ProofModule/PriceTable. **PAGE-LOCAL:** every page has an Astro `<style>`; `Brief.svelte` owns its large local subsystem. **CASE-LOCAL:** `case-sutures.css`, `case-olginka.css`, individual scene styles; `CatalogCase.astro` and `ShowroomCase.astro` are very large single-file presentation systems. **MOCK-LOCAL:** `mock-ui.css` and mock components.

Tailwind is imported but visual styling is overwhelmingly authored CSS; no broad utility-class system is visible. Inline custom properties feed ratio/progress/color/data-specific presentation. `!important` appears appropriately in global reduced-motion reset and one CatalogCase case-specific override. Main coupling risks are broad selectors in page `<style>` (e.g. `details`, `summary`, `p`, `li` scoped by Astro but still page-wide) and duplicated properties across page components; no evidence that case CSS leaks outside their root scope.

## 24. Token coverage

Approximate core-site coverage, based on declarations and rendered use: colors **~65% named tokens**, with the remaining material use being repeated alpha literals/white; typography **~75% role-tokenized** (families yes, numeric size/line-height no); spacing **~15% tokenized** (container gutter only); layout widths **~25% systematic** (`wrap` plus local caps); radius/shadows **~10% tokenized** (reset policy, values local); borders **~20% systematic** (recurring values but literal); motion **~80% tokenized** (one easing/duration, local timings around it); breakpoints **0% tokenized**. Case token coverage within each project CSS is high but deliberately not shared with core.

## 25. Cases divergence

| Case type / actual URL | Global inherited | Case-specific | Divergence |
|---|---|---|---|
| Showroom / `/cases/car-rental/` | Base, Nav/Footer, core display/text/mono, ink/paper/gold | one large `ShowroomCase` composition, car imagery, tailored grids/demos | MEDIUM |
| Catalog / `/cases/catalog-med/` | Base, Nav/Footer, core colors/type | `CatalogCase`, mock UI with teal/serif/radii/shadows, very long interactive story | HIGH |
| Sutures / `/cases/suture/` | Base/Nav/Footer plus selective core gold/display/text | dark clinical palette, Inter + Prata, own tokens/scenes/glyphs/configurator/motion | EXTREME |
| Editorial guest-house / `/cases/guest-house/` | Base/Nav/Footer, some core display/text/mono | Onest, warm editorial palette, photo framing, own scene/parts and mode UI | EXTREME |

Potentially transferable only after later design review: sutures’ explicitly named scene/typographic variables and configuration state clarity; guest-house FactStrip/PhotoFrame compositional discipline; catalog’s contained mock UI framing. They are not current core primitives and should not be merged by assumption.

## 26. Consistency matrix

| System area | Consistency | Main pattern | Exceptions / risk |
|---|---|---|---|
| Color | MEDIUM | ink/paper/gold with blue/ochre signals | repeated alpha literals, mock/case worlds |
| Typography | MEDIUM | 3 global role families | many numeric near-values; `.mono` mismatch; cases |
| Spacing | LOW | emergent 4px-ish rhythm | local 17.5/25/27/74 etc. |
| Layout | MEDIUM | one wrap, editorial rules/grids | local caps/breakpoints |
| Radius | HIGH core | square/zero | mock and cases intentionally rounded |
| Borders | MEDIUM | 1/1.5/2px rules | alpha values proliferate |
| Shadows | HIGH core | mostly none/hard gold | AssetSlot/mock/case exceptions |
| Buttons | LOW | gold square action | duplicate primary/outline implementations |
| Links | MEDIUM | text-first, accent colors | underline treatment varies |
| Cards | MEDIUM | white squared outline | several independently built equivalents |
| Forms | HIGH inside Brief | rules + paper controls | not a shared form system |
| Navigation | HIGH | one Nav/Footer | no issue observed |
| Responsive | MEDIUM | grid collapse/drawer | many thresholds, 320 overflow |
| Motion | HIGH core | shared easing/reveal | local timings and case motion |
| Icons | LOW | textual arrows | no shared icon system |
| Media | MEDIUM | AssetSlot frame policy | cases intentionally bespoke |
| Cases | LOW globally | shell only shared | 4 independent systems |

## 27. Design debt register

| ID | Area | Description / affected pages | Severity | Scope | Likely later fix |
|---|---|---|---|---|---|
| DD-01 | Responsive | 320px overflow: products 384, price 372, legal 420; home 324; catalog-med 333. | P1 for product/price/legal, P2 others | local/page | diagnose min-width/content overflow and establish mobile overflow test |
| DD-02 | Tokens | Core spacing/border alpha/type metrics are repeated literals, no canonical scales. | P1 | systemic | canonical tokens after owner choices |
| DD-03 | Typography | Global `.mono` renders Golos, while real technical mono is JetBrains; 650 font weight not loaded explicitly. | P2 | systemic | rename/split roles and choose supported weights later |
| DD-04 | CTA | Global and local primary/outline/dark/ghost actions look related but are independently styled. | P1 | systemic | shared action primitive/variants |
| DD-05 | Breakpoints | 620/640/760/820/860/900/960/1100 independently define behavior. | P2 | systemic | breakpoint policy without changing existing behavior blindly |
| DD-06 | Core colors | near-identical ink/paper alpha literals and literal white bypass semantic names. | P2 | systemic | semantic foreground/border/surface variables |
| DD-07 | Components | repeated rule-row, section head and bordered-white surface patterns have no shared implementation. | P2 | systemic | adopt shared primitives selectively |
| DD-08 | A11y visual | muted contrast/link distinguishability and hover-only enhancement unmeasured. | P2 | systemic | contrast/focus/touch verification pass |
| DD-09 | Fonts | Base imports three global families; case-specific availability confuses network/session inspection; static weight usage lacks one registry. | P3 | shared | font-loading/role audit during normalization |
| DD-10 | Case architecture | Catalog/Showroom large single presentation components; Sutures/Olginka independent systems. | P2 | case-local | defer to Phase D; do not homogenize |

## 28. Visual characteristics worth preserving

- Ink/paper alternation and square, rule-led surfaces rather than generic soft card UI.
- Unbounded display hierarchy paired with restrained Golos prose.
- Numbered, two-dimensional editorial rows and precise arrow micro-accents.
- Gold as a scarce action/focus/attention color, not a general decoration fill.
- Large breathing section rhythm and full-width deliberate color-scene breaks.
- Footer’s oversized interactive wordmark and restrained UI chrome.
- Motion’s single soft-fast easing plus a robust reduced-motion fallback.
- Case freedom: different project worlds can coexist under the core shell.

## 29. Likely accidental / implementation noise

- 15/15.5/16/16.5/17/18 and 12/12.5/13/13.5/14/14.5 text sizes without established semantic ownership.
- 17.5px outline padding and numerous almost-equal ink/paper opacity values.
- `--color-blue-dk` declared without an active reference found.
- `.mono` naming conflict and `font-weight:650` with 400/500/600 imported Golos faces.
- duplicate CTA and section-head/row implementations.
- isolated 320px horizontal overflow and local breakpoint proliferation.

These are candidates, not decisions; case-specific project palettes, radius and typography are excluded from this list.

## 30. Owner decisions

| Question | Option A | Option B | Where each exists | Visual consequence |
|---|---|---|---|---|
| What does “mono” mean in the core language? | Keep compact Golos label role, rename it | Make `.mono` actual JetBrains Mono | Golos label in PageHeader/product/Brief vs real mono product/case metadata | Changes technical/editorial tone and width/line breaks |
| Is core spacing a compact 4px-derived scale or should scene gaps remain bespoke? | Canonicalize common 8/12/16/24/32/48/72/80 | Preserve two tiers: semantic section rhythm + component scale | home/product/core local values | Determines whether large 70/72/74/80 values converge |
| Is blue informational and ochre secondary action, or should one be link accent? | Retain two semantic accents | Reduce core link/action accents to one | blue eyebrow/price, ochre links/checks | Determines link recognition and palette economy |
| How much case shell convergence is desired? | Keep only Nav/Footer/Base common | Later share media/spacing/action primitives | current four case systems | Determines Phase D scope, not immediate implementation |

## 31. Proposed scope for NEXT design-system pass

**Phase A — canonical tokens.** Decide owner questions; inventory-to-token mapping for semantic foreground/surface/border alpha, spacing, typography roles/sizes/line heights, radius/shadow policy, z-index and breakpoints. Do not silently choose between near values; create aliases/migration map first.

**Phase B — shared components.** Normalize Nav/Footer/PageHeader/Section header, CTA/link variants, rule row, bordered surface/media frame and core form field where visual equivalence is proven. Preserve square/flat policy and CTA vocabulary.

**Phase C — core page adoption.** Apply primitives incrementally to `/`, catalog, product details, price, legal, cases index and Brief; resolve responsive overflow; add visual/browser regression checks per archetype. Keep product data/prices/terms unchanged.

**Phase D — cases integration later.** Audit each project contract separately; optionally extract only proven transferable patterns. Do not migrate cases to StandardCase or erase their palettes/fonts/compositions as a normalization side effect.

## Verification / change boundary

Playwright MCP baseline pages returned HTTP 200 at 1440 and were resized through 320/390/768/1024/1440. Browser inspection confirmed desktop `.wrap` geometry (1240 outer / 48 px desktop padding), 900px nav switch and the overflow values recorded above. No production source was edited. This audit adds only this Markdown file; the worktree already contained extensive unrelated user changes before the audit, which are not attributed to this pass.
