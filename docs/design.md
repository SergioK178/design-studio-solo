# Design — compact working reference

Compact working version of `DESIGN-SYSTEM-V1.md` (v1.0, 2026-09-21). This file is what to check day-to-day; the full document at repo root is deep reference only — don't read it by default. Note: the full doc's header says "implementation pending," but core tokens below are already live in `site/src/styles/global.css` — verify the specific component rather than trusting either the "done" or "pending" label blindly (`docs/project-state.md`).

## Character
Minimal / calm / technical / editorial / confident.

## Core language
- Palette: paper / ink / gold / blue (cobalt).
- Type: Unbounded (studio statement/structure) + Golos Text (content/UI) + JetBrains Mono (real fact/data/technical metadata only).
- Numbered rule rows as the primary structural language for taxonomy, comparisons, navigation — not a universal replacement for every component.
- Square surfaces, radius 0 by default; radius only inside project-specific coded UI/device simulations where truthful to the demonstrated product.
- Gold is sparse — a signal, not a fill language; rare conversion/high-intent scenes only.
- Ink / Paper / Gold are scene modes with semantic meaning (identity/reset vs. reading/catalog vs. rare conversion) — don't alternate just because a new section starts.
- **Proof Window** (primary pilot: desktop `/products/`): idle = rule row + title + explanation + price + term + arrow; on intent, one stable proof plane appears with one real proof object, small hard-gold depth, never obscuring price/term, one active row at a time. Mobile stays text-first, no fake hover.
- **Rule → Proof composition**: proof should emerge from the same geometry as the structural row it belongs to — compositionally related, not a popup card on top.
- **Plane → Depth**: core surfaces are flat at rest; a meaningful object leaves the plane only on intent (small translation, hard offset, controlled layer overlap) — depth is a reward for attention, not a permanent elevation system.
- Oversized footer wordmark closes the page as a brand scene.
- Hard geometric depth via offset/layer separation, not soft floating-card shadows.

## Anti-patterns
Do not introduce: generic SaaS cards, fake telemetry/decorative technical labels, coordinates, terminal decoration, dot grids, gradient mesh/slop, glowing borders, glassmorphism, pill-heavy SaaS chrome, bento-as-default, chrome spheres, generic 3D blobs, cubes-because-3D, WebGL spectacle without a product reason, fake AI analysis, literal 3D/WebGL for its own sake.

## Colors
| Token | Value | Role |
|---|---:|---|
| `--color-paper` | `#F4F2EC` | default light scene |
| `--color-ink` | `#17150F` | default dark scene / primary ink |
| `--color-surface` | `#FFFFFF` | bounded digital/product surface |
| `--color-gold` | `#E5A43B` | primary action / focus / depth |
| `--color-blue` | `#3552C7` | information / link / selection |

Text levels (on paper): primary = ink 100%, secondary = ink 72%, muted = ink 60%, faint = ink ~52% (nonessential only, never required copy). Mirror on ink with paper-derived levels.
Border alpha: subtle 16%, default 24%, strong 40%.
Project/case visual material may use its own palette but must not leak into global nav/buttons/chrome.

## Type roles
- Unbounded — identity/structure.
- Golos Text — content/UI.
- JetBrains Mono — real fact/data/technical metadata only, never decorative.

## Spacing scale
Core steps: 8 / 12 / 16 / 24 / 32 / 48px (4/20/40 valid intermediates). Don't invent arbitrary values (17.5, 22, 27...) unless it's geometry, not spacing.

Scene rhythm (desktop / mobile):
- Compact: 48 / 40
- Standard (default section rhythm): 72 top·80 bottom / 48·52
- Spacious (major proof/showcase): 96 top·112 bottom / 64·72
- Hero/Opening: 120 top·80 bottom / 80·56

Bounded surface padding: 24px default, 16px compact, 32px spacious.

## Container / read widths
- Container max-width 1240px, content max-width ~1144px, gutter `clamp(20px, 4vw, 48px)`.
- Reading measure ~760px; main content plane ~1144px.

## Breakpoints
1120 (wide layouts simplify, Proof Window toggles) / 960 (nav → drawer, Brief goes one column) / 768 (2-col → 1-col, case index collapses) / 640 (mobile spacing, 20px min gutter). Minimum supported width 320. Zero horizontal overflow at any acceptance width (1440/... down to 320) is a hard contract.

## Borders
1px normal border/rule; 2px major rule/emphasis. Phase out ambiguous 1.5px.

## Actions & forms
- CTA vocabulary is fixed to three meanings — see `AGENTS.md`/`docs/project-state.md`; don't invent synonyms.
- Primary action = gold (rare), on paper or ink per scene mode.
- Field geometry stays square/flat like other surfaces; focus states distinguish navigation/action controls from data-entry controls.

## Motion
Roles: feedback, standard, editorial, ambient (hero conveyor, rolling nav labels). `prefers-reduced-motion` must disable nonessential transitions, conveyor/reveal animation and smooth scroll, while preserving all information and interactions — mandatory contract, not a nice-to-have.

## Proof / media
Format follows evidence: screenshot, coded UI, diagram, before/after, device frame — pick the one that's actually truthful to what's being shown, not for visual variety. No fabricated proof (`AGENTS.md`).

## Homepage section order (fixed)
Hero → Directions → Works → Guarantees → Process → Team → Brief CTA → FAQ → Footer. Don't reorder without an explicit product decision.

## Page notes
- **Products (catalog)**: Proof Window pilot page (see above); numbered rule rows, potential preview is desktop-only/secondary.
- **Product detail**: content contract is *what it is → situation it solves → what client receives → proof → delivery/process → included/excluded → price/term → next step*, rhythm text → proof → text → proof, not stacked generic card grids.
- **Cases (index)**: 2 columns desktop / 1 below tablet, 16:10 covers, permanent proof/cover, no second hover-preview layer.
- **Case boundary**: core owns global shell/nav/footer/accessibility/responsive safety/outer spacing; a case may own local palette/type/motion/demo UI, but may not silently redefine global nav/footer. Case internals are out of core-redesign scope (`AGENTS.md`).
- **Brief**: goes to one column at ≤960px.
- **Price/legal**: reading-first, no signature motion beyond normal disclosure.

---
`DESIGN-SYSTEM-V1.md` is the deep reference (full rationale, reference systems, exact component specs, AI case-cover formulas, accessibility baseline). Read it only when this file doesn't answer the question.
