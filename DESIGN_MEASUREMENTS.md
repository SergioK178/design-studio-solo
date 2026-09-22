# Design Measurement Pack — 3D Studio

Короткий фактический справочник для следующего system pass. Значения подтверждены кодом и, где указано, computed style в dev-рендере (1440×900/1000 и 390×844). Не является redesign-предложением.

## 1. Core typography

| Role | Current value | Source / actual location | Desktop 1440 | Mobile 390 |
|---|---|---|---|---|
| Hero display | Unbounded, 800, `clamp(44px,5.2vw,66px)`, `1.08`, `-.015em` | `HeroWall.astro` H1 | 66 / 71.28 px / `-.99px` | 40 / 43.2 px / `-.6px` (explicit `<=520`) |
| PageHeader H1 | Unbounded, 800, `clamp(42px,6vw,72px)`, `1.06`, `-.015em` | `PageHeader.astro` | 72 / 76.32 px / `-1.08px` | 42 / 44.52 px / `-.63px` |
| Major section H2 | Unbounded, 800, `clamp(34px,4vw,48px)`, `1.1` | Home `.section-head h2`, brief CTA | 48 / 52.8 px | 34 / 37.4 px |
| Product/proof H2 | Unbounded, normal, `clamp(30px,4vw,44px)`, `1.12` | `ProofModule`, product gains/steps/options | 44 / 49.28 px | 30 / 33.6 px |
| Rule-row title | Unbounded, 700 (directions) or 400 (product row), `20–23px`, `1.2–1.25` | Home directions; `/products/` | 23 / 27.6 px; product 20 / 25 px | directions 20 / 24 px; product unchanged 20 / 25 px |
| Content heading | Unbounded, 400, `clamp(26px,3vw,38px)`, `1.16`, `-.01em` | `ContentShell.astro` prose H2 | 38 / 44.08 px | 26 / 30.16 px |
| Lead | Golos Text, 400, 18px, `1.5` hero / `1.55` PageHeader | `HeroWall`, `PageHeader` | hero 18 / 27; page 18 / 27.9 | same |
| Body / reading | Golos Text, 400, 17px, `1.65–1.7` | product page / `ContentShell` | 17 / 28.05 or 28.9 px | same |
| Small / muted | Golos Text, 400, 14px, `1.5` | product term; detail text variants | 14 / 21 px | same |
| Standard meta | Golos Text, 650, 13px, normal LH, normal tracking | global `.mono`, PageHeader eyebrow | 13 px | same |
| Technical mono | JetBrains Mono, 400, 11px, `+.06em`, uppercase | `ProofModule`, product card term | 11 px | same |
| Price / term | price: Unbounded 700, `clamp(16px,1.4vw,19px)`, `1.3`; term: Golos 400 14px / 1.5 | `/products/` `.product-meta` | 19 / 24.7 px; 14 / 21 px | 16 / 20.8 px; 14 / 21 px |
| Primary button | Golos Text, 600, 15.5px / 1.5 | global `.btn-gold` | 15.5 / 23.25 px | same |
| Nav CTA exception | Golos Text, 600, 14px / 1.5 | `Nav.astro` `.nav-cta` | 14 / 21 px | hidden below 900px |

Observed important exception: `CasePreview` heading computes as Unbounded 400, 25px / 28.75px at 1440; it is not the same weight as rule/product titles.

## 2. Layout and geometry

| Element | Source | 1440 | 1024 / 768 | 390 / 320 |
|---|---|---|---|---|
| `.wrap` | `global.css` | max 1240px; x=100; content width 1144px after 48px gutters | at 1024: full width, 48px gutters / 768 content 672px | 20px gutters; content 350 / 280px |
| PageHeader | `PageHeader.astro` | padding `120 0 70`; H1 max 920; lead max 720 | unchanged at 768 | unchanged; H1/lead fill available content width |
| Reading shell | `ContentShell.astro` | `.prose` max-width 860px including inherited gutters; readable inner width 764px | full available under max | 390/320: 350/280px available |
| Hero copy | `HeroWall.astro` | max 640px, x=148 | max remains 640 while space permits | x=20, width 350 / 280px |
| Hero wall, untransformed declared geometry | `HeroWall.astro` | right −40, top −120, `620×1140`, two 250px columns + 20 gap, rotate −8° | below 820: right −260, opacity .5 | same below 820; transformed bounding rect ~773×1215; x≈−46 at 390 |
| Products group | `/products/` | outer 1240px; content grid `300px 794px`, 50 gap; row `506px 200px 24px`, 28 gap | `<=900`: one 672px column; row at 768 `418px 170px 20px` | group 350 / 280px one column; row `1fr 20px` => 308/238px + 20px, `12px 14px` gap |
| Product proof real-interface | `ProofModule.astro` | inner 1144px; `672px 448px`, 24 gap (`1.5fr 1fr`) | `<=900`: one column | one column |
| Product fit | product detail | `634.8px 469.2px`, 40 gap | `<=900`: one column | one column |
| Case index | `/cases/` | inner 1144px; two columns of 562px, 20 gap | remains 2 until `<=760` | one 350 / 280px column |
| Brief interview | `Brief.svelte` | two columns until 960 (main input + sticky live document) | `<=960`: one column, desktop doc hidden / mobile doc available | one column |

## 3. Section rhythm

| Area | Component spacing | Section / scene spacing | Source |
|---|---|---|---|
| Hero → Directions | hero min-height 800; computed 870.1 at 1440 / 906.9 at 390 from content | Directions begins immediately after hero; its wrap `72/80`, mobile `48/52` | `HeroWall`, home page |
| Directions | head bottom 46, rows `22px 4px` vertical padding | section bottom 80; mobile head bottom 28, rows 18px vertical | home page |
| Works | head bottom 46; grid gap 18 (home) | section wrap 72/80, mobile 48/52 | home page |
| Guarantees | internal main 34px vertical; support 38px vertical | uses ink scene; home section shell uses `72/80` | `ApproachInfographics`, home |
| Process | component-local scene (inspect actual implementation separately if altering it) | follows core home wrap rhythm | `ProcessChat`, home |
| Team | row padding 27px; internal gap 24px | ink scene in core home wrap | home page |
| Brief CTA | grid padding `80px 48px`; mobile keeps 80px vertical / 20px horizontal | isolated gold conversion scene | home page |
| FAQ | cell padding 24px | core home wrap `72/80`; mobile `48/52` | home page |
| Product major sections | rule → 24px top; gains→steps and steps→fit: 74px; options 74px; CTA 70px | product main `80px 0 100px`; proof ends with 70px margin | product detail |
| PageHeader | eyebrow bottom 18; lead top 24 | `120px 0 70px` | `PageHeader` |
| Legal / reading | H2 margin `44px 0 16px`; list top 18 | shell `70px 0 100px` | `ContentShell` |

## 4. CTA / action geometry

| Action | Current value / source | Hover / focus / transition |
|---|---|---|
| Primary gold | background `#e5a43b`; padding `19px 28px`; Golos 600 15.5px/23.25px; no border/radius | hover paper background; `data-magnetic`: transform .4s ease-site plus color/bg/border .2s; global focus 2px gold / 4px offset |
| Outline | 1.5px `rgb(244 242 236 /.4)`; `17.5px 26px`; Golos 600 15.5px/23.25px | hover border paper; same magnetic transition/focus |
| Nav CTA | min-height 52px; `12px 22px`; 14px/21px; gold | same magnetic implementation; disappears at `<=900` |
| Brief submit | `.btn-dark`: `18px 30px`; Golos 600 15.5px/18.6px; ink fill, no border/radius | hover blue; disabled opacity .45; local controls retain browser/global focus behavior |
| Text / inline link | typically weight 700; ochre or current ink; no box | product text link underlines: gold 2px, offset 6px |
| Rolling nav link | 13.5px, 500 (main nav); Telegram 13.5px 600 | nested span translates Y −100% over .5s ease-site on hover/focus |

## 5. Colors and repeating alphas

| Role | Exact current value | Repeating use |
|---|---|---|
| Paper | `#f4f2ec` | core paper scene / inverse text |
| Ink | `#17150f` | core ink scene / main text |
| Gold | `#e5a43b` | primary action, focus, offset accent |
| Blue | `#2743e0` | labels/meta / links; dark `#1f35b8` also exists |
| Ochre | `#c24a12` | secondary/action text; dark `#a83d0c` exists |
| Surface white | `white` / `#fff` | CasePreview, AssetSlot, input/panel surfaces |
| muted ink text | `rgb(23 21 15 / .60–.62)` | rows, summaries, explanatory text |
| muted inverse text | `rgb(244 242 236 / .60–.62)` | dark rows / copy |
| faint ink | `.52`, `.55` and `.48` in localized support/meta contexts | term, secondary note, asset placeholder |
| subtle ink border | `rgb(23 21 15 / .16–.20)` | AssetSlot `.16`; product/Card `.18–.20` |
| default inverse border | `rgb(244 242 236 / .25–.40)` | dark rows, outline CTA, nav controls |

## 6. Borders, shadows and depth

| Pattern | Exact current value | Source |
|---|---|---|
| Major rule | `2px solid` ink; dark equivalent `paper /.35` | catalogue/group, direction top |
| Row rule | `1px solid ink /.20–.25` | product/direction rows |
| Product options card | `1.5px solid ink /.18`; no shadow, no radius; 22px padding | product detail |
| CasePreview | `1.5px solid ink /.20`; white, no radius | `CasePreview` |
| Hard gold depth | hover `box-shadow: 10px 10px 0 #e5a43b; transform: translate(-3px,-3px)` | `CasePreview` |
| AssetSlot | `1px solid ink /.16`; browser-frame shadow `0 16px 36px ink /.08`; no radius | `AssetSlot` |
| Browser chrome | bottom `1px ink /.14`; 34px high; chrome bar radius 999px | `AssetSlot` |
| Global focus | `outline: 2px solid #e5a43b; outline-offset: 4px` | `global.css` |

## 7. Motion

| Motion | Current value | Source |
|---|---|---|
| Shared easing | `cubic-bezier(.16,1,.3,1)` | `--ease-site` |
| Scroll reveal | .9s ease-site, stagger `calc(index × 90ms)`, hidden `translateY(28px)` | global reveal |
| Mask reveal | .9s ease-site, initial `translateY(.45em)` / clip-path | global reveal |
| Scene/background | background-color .7s ease-site | `body.theme-scroll` |
| Rolling label | transform .5s ease-site, Y −100% | `.roll` |
| Magnetic CTA | transform .4s; bg/border/color .2s | global magnetic |
| Rule/product hover | padding .3s; background .35s; text .25s; arrow `translate(5px,-5px)` .35s | home / products |
| CasePreview | box-shadow and transform .25s ease-site | `CasePreview` |
| Conveyor | `wallScroll`: 26s linear infinite; reverse column 34s, reverse direction | `HeroWall` / global keyframe |
| Ticker | `tickerMove` keyframe exists but has no active `site/src` consumer | global CSS |
| Reduced motion | all animation/transition disabled; smooth scrolling disabled | global `prefers-reduced-motion: reduce` |

## 8. Media frames

| Pattern | Geometry / treatment | Source |
|---|---|---|
| CasePreview | media asset frame followed by 22px copy; 1.5px border card; no radius; hover hard offset | `CasePreview` |
| AssetSlot browser | default ratio from caller (product proof shown `16/10`); 1px border, 34px chrome, browser shadow, `object-fit: cover` | `AssetSlot` |
| AssetSlot mobile / Telegram | 18px device chrome; variants commonly `9/16`, `9/14`; `object-fit: cover`; no declared radius | `AssetSlot` |
| ProofModule real interface | main `1.5fr` / side `1fr`, gap 24; sample actual width 672 + 448; side frames `4/3` | `ProofModule` |
| Hero cards | declared 250px wide + 14px padding; slot height 140px; 1px ink/.16; image cover; no radius/shadow | `HeroWall` |

## 9. Responsive breakpoint map

| Max width | Actual current changes |
|---:|---|
| 1100 | Home works 4→2 columns. Products index 5→3 columns. Catalog case has local changes. |
| 960 | Brief interview 2→1; sticky document hidden and mobile document available. Showroom case local tablet changes. |
| 900 | Nav desktop links/actions → menu; product group 2-column → one; product proof/pair → one; product detail grids compress; several case scenes change. |
| 860 | Brief page vertical padding/min-height changes; price, ProcessChat and case-specific systems have their own switches. |
| 820 | Hero wall moves right to −260 and opacity .5; home section header and Brief grid stack. |
| 760 | Case index 2→1; case mock components adapt. |
| 640 | global gutters 48→20; Brief local mobile layout changes. |
| 620 | Home core section padding `72/80→48/52`; product catalogue 3/5→2 index columns, rows use two-column compact layout and hide index summaries; product grids become one column. |

At 1024 the declared core gutter is still 48px (usable 928px). At 768 it is 48px (usable 672px); at 390 / 320 it is 20px (350 / 280px). The browser session confirmed 390 and 320 product row geometry; no new breakpoint is inferred between listed rules.

## 10. Case source pack (existing rendered case implementations)

The four published cases are implemented inside this repository; no unambiguously mapped sibling project was required or started. Their best future-proof sources are the current case covers and their internal mock/interface scenes, not invented covers.

| Case | Fonts / primary palette | Surface language | Distinctive motifs and existing proof candidates |
|---|---|---|---|
| `car-rental` / Showroom | core Unbounded + Golos; paper/ink/gold/ochre | mostly square, circles used as intentional accents; gold outline rules | large display with gold text-stroke; circular sticker/marker; two browser and two mobile `AssetSlot` screens; `/assets/works/car-rental/cover.webp` |
| `catalog-med` / CatalogCase | core fonts + JetBrains Mono; teal `#0e6b86`, mist `#eef2f5`, ink/paper | product UI includes rounded device shell: 7px ink border, 30px outer / 22px inner radius, shadow `0 22px 46px ink/.16` | teal technical labels, dense catalogue tables/cards, phone mock; `/assets/works/catalog-med/cover.webp` and existing catalogue mock states |
| `suture` / SuturesCase | Onest plus project display/text variables, JetBrains Mono | deliberately rounded interface subsystem (4, 7–16, 38px radii) with dark device shadow `0 26px 60px rgb(16 20 26/.28)` | request cards, choice controls, system/device screen, material/product states; `/assets/works/suture/cover.webp` |
| `guest-house` / OlginkaCase | project font variables plus core display/mono | rounded app/device language (12–20px, 38px device; 999px pills); dark image overlays | gold vertical rule and tabs, fact strip, scenarios and interface scenes, phone/device screen; `/assets/works/guest-house/cover.webp` |

## Evidence / scope

Code sources: `site/src/styles/global.css`, `PageHeader.astro`, `HeroWall.astro`, `ProofModule.astro`, `AssetSlot.astro`, `CasePreview.astro`, product, home, cases, brief and content-shell pages/components. Browser observations used Playwright MCP against the local dev server at 1440, 768, 390 and 320 widths.

Only this Markdown reference was added. Production UI/code was not changed and no commit was created.
