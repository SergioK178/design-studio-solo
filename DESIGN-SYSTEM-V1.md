# DESIGN-SYSTEM-V1 — 3D Studio

**Version:** 1.0  
**Date:** 2026-09-21  
**Status:** target design contract; implementation pending  
**Scope:** core public site. Case internals remain separate project worlds until the later case pass.

---

## 0. Purpose and authority

This document defines the target visual and interaction system for 3D Studio.

It is based on:

- `DESIGN_AUDIT.md` — forensic snapshot of the current interface;
- `DESIGN_OPPORTUNITIES.md` — opportunity map for signature design;
- `DESIGN_MEASUREMENTS.md` — measured typography, geometry, motion and responsive behavior;
- owner-approved design decisions made after the audit.

This document is **not** a description of the current code. It is the target system that future implementation passes must converge toward.

After owner approval, this file becomes the visual source of truth for core-site work.

### Authority

For core visual/UI decisions, the intended order is:

1. `DESIGN-SYSTEM-V1.md`
2. task-specific acceptance criteria
3. `UI_TASK_TEMPLATE.md` when created
4. current implementation
5. historical audits and analysis documents

Historical audit documents explain how decisions were reached; they must not override this specification after v1 is frozen.

### Core implementation rule

> Local problem → local diff.

A local UI task must not silently modify global tokens, shared primitives, unrelated pages, or case systems.

If a local task requires a global design-system change, stop and surface the dependency before making it.

---

# 1. Positioning and visual character

3D Studio is a technically strong boutique digital studio building websites, applications, internal systems and automation.

The visual system should feel:

- minimal;
- calm;
- technical;
- restrained;
- editorial;
- confident;
- authored rather than templated.

It must **not** feel:

- generic SaaS;
- generic developer tooling;
- luxury-theatrical;
- decorative for decoration's sake;
- like an AI-generated agency template;
- like a collage of Apple / Linear / Range Rover / Stripe conventions.

The site should communicate competence through:

- hierarchy;
- spacing;
- structure;
- real product proof;
- controlled interaction;
- precise typography;
- deliberate composition.

Not through decorative technical symbolism.

---

# 2. Reference principles

The target system borrows principles, not visual assets or brand signatures.

## 2.1 Range Rover — restraint

Take:

- calm confidence;
- strong proportions;
- large clean planes;
- minimal UI chrome;
- quality through composition and detail;
- premium feeling through reduction rather than decoration.

Do not take:

- luxury theatre;
- lifestyle dependence;
- fashion-editorial excess.

## 2.2 Apple — hierarchy and scene discipline

Take:

- one dominant thought per scene;
- one main visual object;
- no more than one or two actions in one visual context;
- media carrying a substantial part of the proof;
- strong editorial hierarchy.

Do not take:

- giant empty hardware-product hero scenes as a default;
- excessive product worship;
- advertising drama for its own sake.

## 2.3 Stripe — product storytelling

Take:

- thesis → proof → detail → next step;
- real interface and diagrams as explanatory media;
- structure for complex information;
- product visuals that explain rather than decorate.

Do not take:

- gradient-heavy fintech aesthetics;
- decorative complexity;
- homepage density as a style.

## 2.4 Linear — technical precision

Take:

- calm, functional UI;
- strong scanability;
- interface itself as visual material;
- precise spacing and states;
- low chrome.

Do not take:

- dark-SaaS aesthetics;
- pill/chip overload;
- dashboard language for marketing pages.

## 2.5 Vercel — engineering clarity

Take:

- concise taxonomy;
- precise headings;
- interface/code/architecture only where they prove something;
- disciplined information structures.

Do not take:

- generic black-and-white developer-template aesthetics;
- grid-everything;
- AI-infrastructure clichés.

## 2.6 Nothing — own syntax

Take:

- the principle that a brand should have its own repeated syntax;
- signature devices should be structural, not decorative stickers.

Do not take:

- dot-matrix imitation;
- industrial-tech gimmicks;
- brackets and pseudo-system notation.

---

# 3. Design principles

## P1. Hierarchy before decoration

Every scene must have one obvious focal point.

Do:

- use scale, whitespace, media and placement to create hierarchy;
- let one object dominate.

Do not:

- place two or three emotionally loud headlines next to each other;
- add decorative emphasis to compensate for weak structure.

---

## P2. One scene, one thought

A scene may contain detail, but it should answer one primary question.

Typical sequence:

> thesis → evidence → detail → action

If a section simultaneously tries to explain what the product is, how delivery works, why the studio is trustworthy and how much it costs, split the information.

---

## P3. Idle is calm; intent reveals depth

At rest, the core interface is almost print-like:

- typography;
- rules;
- spacing;
- contained media.

Interaction may reveal:

- product proof;
- depth;
- movement;
- state.

Do not keep the whole page in a permanent state of motion.

---

## P4. Rules and spacing before cards

Use:

- line;
- spacing;
- columns;
- typography;

before introducing a bounded card.

A card is justified when an object is:

- independently selectable;
- a bounded product/media object;
- a distinct navigation target;
- an interactive control requiring a surface.

---

## P5. Gold is scarce

Gold means:

- primary action;
- focus;
- high-intent state;
- selected depth;
- a rare brand accent.

Gold is not:

- a generic badge color;
- a default media border;
- decorative background on every other section;
- ordinary body/link color on paper.

---

## P6. Proof over claims

Whenever possible, demonstrate rather than describe.

Proof can be:

- a real screenshot;
- a coded interface;
- a real state reconstructed from actual tokens/components/logic;
- a diagram;
- a before/after;
- a flow;
- a real system fragment.

The best format is the one that explains the result most clearly.

---

## P7. Representation may be authored; evidence may not be fabricated

Allowed:

- curated crops;
- reconstructed coded UI from real product behavior;
- removal of irrelevant chrome;
- combining real states into a clear composition;
- AI-generated editorial environment around real product UI.

Not allowed:

- invented product features;
- invented metrics;
- fake customer outcomes;
- fake system states presented as delivered work.

---

## P8. Motion explains structure or intent

Motion should:

- acknowledge interaction;
- reveal hierarchy;
- show direction;
- reveal proof;
- create controlled depth.

Motion should not exist only to make the page feel active.

---

## P9. Technical competence is demonstrated, not imitated

Do not add decorative:

- IDs;
- coordinates;
- fake telemetry;
- pseudo-terminal labels;
- `SYSTEM / LIVE / 03`;
- meaningless monospace metadata.

JetBrains Mono is used only for real structured or technical information.

---

## P10. Mobile is a different composition, not compressed desktop

Desktop hover, sticky proof and pointer effects are enhancements.

Mobile uses:

- linear editorial flow;
- explicit content;
- inline proof where needed;
- touch-native controls.

Never simulate hover on touch devices.

---

## P11. No page-level horizontal overflow

At all supported widths:

> `document.scrollWidth <= document.clientWidth`

No tolerance for “only a few pixels.”

Local horizontal scrolling is allowed only inside a deliberately bounded component where the content is inherently horizontal, such as a wide table.

---

# 4. Signature language

The core identity uses a limited number of signature devices.

## 4.1 Existing signatures to preserve

### Ink / Paper / Gold scene modes

Background change has semantic meaning.

- Ink: identity, assurance, deliberate narrative reset, application mode.
- Paper: reading, comparison, catalog, ordinary product content.
- Gold: rare conversion/high-intent scene.

Do not alternate scene color simply because a new section begins.

### Number + Rule + Title

Numbered ruled rows are a primary structural language for:

- product taxonomy;
- comparable choices;
- navigation;
- structured information.

They are not a universal replacement for every component.

### Unbounded / Golos / Mono

- Unbounded = studio statement and structure.
- Golos = content and UI.
- JetBrains Mono = real fact/data/technical metadata.

### Sparse gold

Gold is a signal, not a fill language.

### Hard geometric depth

Depth is created by offset/layer separation rather than soft floating-card shadows.

### Rolling labels

Used only where compact text benefits from a restrained interactive treatment, primarily navigation.

### Hero conveyor

The moving wall of real work/product material remains a core ambient signature.

### Oversized footer wordmark

The footer closes the page as a brand scene.

---

## 4.2 New signature: Proof Window

Primary pilot: desktop `/products/`.

Idle state:

- rule row;
- title;
- concise explanation;
- price;
- term;
- arrow.

Intent state:

- one stable proof plane appears;
- contains one real proof object;
- may use a small hard-gold depth treatment;
- does not obscure price/term;
- one active row at a time.

On mobile, the catalog remains text-first. No fake hover behavior.

---

## 4.3 New signature: Rule → Proof composition

Where appropriate, proof should emerge from the same geometry as the structural row.

The rule/list structure and proof plane should feel compositionally related rather than like a popup card placed on top.

This is a compositional principle, not a literal mandatory border shape.

---

## 4.4 New signature: Plane → Depth

Core surfaces remain flat at rest.

A meaningful object may leave the plane on intent through:

- small translation;
- hard offset;
- controlled layer overlap.

Depth is a reward for attention, not a permanent elevation system.

---

## 4.5 Explicit anti-signatures

Do not introduce:

- pseudo-technical labels;
- decorative telemetry;
- dot grids;
- fake terminals;
- random coordinates;
- chrome spheres;
- generic 3D blobs;
- cubes because the brand is called “3D”;
- WebGL spectacle without a product reason;
- gradient mesh as brand filler;
- bento layout as a default;
- glowing borders;
- glassmorphism;
- pill-heavy SaaS chrome.

---

# 5. Color system

## 5.1 Core palette

| Token | Target value | Role |
|---|---:|---|
| `--color-paper` | `#F4F2EC` | default light scene |
| `--color-ink` | `#17150F` | default dark scene / primary ink |
| `--color-surface` | `#FFFFFF` | bounded digital/product surface |
| `--color-gold` | `#E5A43B` | primary action / focus / depth |
| `--color-blue` | `#3552C7` | information / link / selection |

The current ochre family is removed from core brand identity.

Project-specific case palettes remain local.

## 5.2 Text levels

On paper:

| Semantic level | Target |
|---|---|
| primary | ink 100% |
| secondary | ink 72% |
| muted | ink 60% |
| faint | ink ~50–52%, nonessential only |

On ink, use equivalent paper-derived levels.

`faint` must not be used for required body copy or critical instructions.

## 5.3 Border levels

| Token | Target alpha |
|---|---:|
| subtle | 16% |
| default | 24% |
| strong | 40% |

Major rules may use full ink / deliberate stronger inverse values.

## 5.4 Color semantics

### Paper mode

- background: paper;
- primary text: ink;
- links/information/selection: blue;
- gold: action/depth/high-intent only.

### Ink mode

- background: ink;
- text: paper;
- gold: primary action / rare accent;
- blue should be rare unless an accessible inverse implementation has a real semantic need.

### Gold mode

- background: gold;
- text: ink;
- no competing accent colors.

### Project/media mode

Project visual material may use its own palette.

Project color must not leak into global navigation, buttons or core brand chrome.

## 5.5 Status colors

Error/success/warning are functional semantic colors, not brand colors.

Do not derive them from gold/blue just to keep the palette small.

Their final implementation values must pass contrast and state checks. They must not be promoted to general brand accents.

---

# 6. Typography

## 6.1 Font roles

### Unbounded

Studio voice.

Use only for:

- hero/display;
- page H1;
- major section statement;
- structural rule-row title;
- oversized footer wordmark as a special exception.

Target weights:

- 700;
- 800.

Do not use Unbounded 400/500 as general UI typography.

### Golos Text

Content and interface voice.

Use for:

- lead;
- body;
- content headings;
- UI;
- actions;
- labels;
- form controls;
- navigation.

Target weights:

- 400;
- 500 when intermediate emphasis is genuinely needed;
- 600 for content headings, labels and actions.

Do not use synthetic 650.

### JetBrains Mono

Fact/data/technical voice.

Use only for real:

- price/term metadata where the monospace treatment is useful;
- technical parameters;
- version/reference/status data;
- code/config fragments when code itself is evidence.

Do not use Mono for decorative “technical” atmosphere.

---

## 6.2 Type scale

| Role | Family | Weight | Desktop | Mobile | Line-height | Tracking |
|---|---|---:|---:|---:|---:|---:|
| Display / Hero | Unbounded | 800 | 64px | 40px | 1.06 | -0.02em |
| H1 / Page title | Unbounded | 800 | 56px | 36px | 1.08 | -0.015em |
| Section statement | Unbounded | 700 | 40px | 30px | 1.10 | -0.01em |
| Rule-row title | Unbounded | 700 | 20px | 18px | 1.20 | -0.01em |
| Content heading | Golos Text | 600 | 24px | 22px | 1.25 | 0 |
| Content subheading | Golos Text | 600 | 18px | 18px | 1.35 | 0 |
| Lead | Golos Text | 400 | 18px | 17px | 1.50 | 0 |
| Body-lg / reading | Golos Text | 400 | 17px | 17px | 1.65 | 0 |
| Body / UI | Golos Text | 400 | 16px | 16px | 1.55 | 0 |
| Body-sm | Golos Text | 400 | 14px | 14px | 1.50 | 0 |
| Label / eyebrow | Golos Text | 600 | 12px | 12px | 1.25 | +0.04em |
| Mono / data | JetBrains Mono | 400/500 | 12px | 12px | 1.35 | +0.04em |
| Mono small / term | JetBrains Mono | 400 | 11px | 11px | 1.35 | +0.05em |
| Button / action | Golos Text | 600 | 15px | 15px | 1.20 | 0 |

Large roles may use fluid `clamp()` implementations, but their target min/max must remain equivalent to this table.

Small UI typography should remain stable rather than being fluid-scaled.

## 6.3 Emotional hierarchy

### Identity

Hero / H1 / major statement.

Large Unbounded + whitespace.

### Orientation

Numbers, rules, structural titles.

Compact Unbounded + clear information hierarchy.

### Evidence

Golos + media + real Mono facts.

Media is allowed to dominate.

### Detail

Predominantly Golos.

Reading clarity over visual drama.

### Action

Importance is expressed primarily through:

- placement;
- color;
- whitespace;

not oversized button typography.

## 6.4 Focal-point rule

One viewport scene should normally have one dominant typographic focal point.

Avoid:

- giant section title + giant claim + giant metric in the same visual context.

---

# 7. Spacing system

Spacing has two levels:

1. component spacing;
2. scene rhythm.

Do not force large editorial scene spacing into the same scale as input padding.

---

## 7.1 Component spacing scale

| Token | Value |
|---|---:|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 20px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-10` | 40px |
| `--space-12` | 48px |

Core working values are primarily:

> 8 / 12 / 16 / 24 / 32 / 48

4 / 20 / 40 are valid intermediate roles.

Do not introduce arbitrary spacing values such as 17.5, 19, 22, 27, 34 or 46 unless the number is actually geometry rather than spacing.

---

## 7.2 Scene rhythm

### Compact

Desktop: 48px  
Mobile: 40px

Use for:

- reading/comparison subscenes;
- closely related explanatory blocks;
- compact pricing/FAQ groups.

### Standard

Desktop: 72px top / 80px bottom  
Mobile: 48px top / 52px bottom

This is the default large-section rhythm.

### Spacious

Desktop: 96px top / 112px bottom  
Mobile: 64px top / 72px bottom

Use for:

- major proof;
- showcase;
- important mode transition.

Do not use it merely to create a “premium” feeling.

### Hero / Opening

Desktop: 120px top / 80px bottom  
Mobile: 80px top / 56px bottom

Use for:

- page opening;
- major statement;
- special opening composition.

---

## 7.3 Relationship spacing

Typical hierarchy:

- 8–16px: directly related;
- 24–32px: same component;
- 40–48px: neighboring groups in one scene;
- 72–80px: new semantic section;
- 96–112px: major compositional transition;
- 120px+: exceptional opening moment.

Whitespace expresses semantic distance.

---

## 7.4 Common internal relationships

Recommended target ranges:

- label → headline: 12–16px;
- headline → lead: 20–24px;
- heading → body: 16–24px;
- content → CTA: 24–32px;
- text block → proof/media: 32–48px;
- major component groups: 40–48px.

---

## 7.5 Bounded surfaces

Default internal padding: 24px.

Allowed:

- compact: 16px;
- spacious: 32px.

Do not invent a unique 22/26/28/30px card padding for every component.

---

# 8. Layout and geometry

## 8.1 Container

```text
container max-width: 1240px
content max-width: ~1144px
page gutter: clamp(20px, 4vw, 48px)
```

The gutter should transition fluidly rather than jumping from 48px directly to 20px at a single breakpoint.

## 8.2 Measures

| Role | Target |
|---|---:|
| reading measure | ~760px |
| main content plane | ~1144px |
| lead measure | ~720px |

Long text should not fill the complete content width.

## 8.3 Canonical layout patterns

### Single

One-column editorial/readable flow.

### Reading

Narrow measure for legal, prose, FAQ detail.

### 7 / 5 split

Use for:

- PageHeader;
- thesis + supporting explanation.

### 60 / 40 proof

Use for:

- primary media + supporting proof;
- thesis + proof where suitable.

### 1 / 1 balanced

Use for:

- case index;
- two equally important media objects;
- direct comparisons.

Do not introduce a universal 12-column grid unless a later product requirement genuinely needs it.

## 8.4 Alignment

Default: left aligned.

Center alignment is exceptional and appropriate mainly for:

- specific brand closure moments;
- isolated visual objects;
- deliberate final statements.

Avoid:

- alternating left-right zigzag layouts on every section;
- masonry;
- bento by default;
- random local offsets.

## 8.5 Shared rails

Normal content should align to a small number of consistent vertical rails.

Asymmetry is allowed only when it is a deliberate compositional choice.

---

# 9. Products layout

`/products/` is the main pilot of the new core language.

## 9.1 Wide desktop

Target conceptual layout:

```text
240px group rail
24px gap
fluid product list, min 420px
24px gap
280–320px proof plane
```

The exact CSS track calculation may be tuned in implementation, but the relative hierarchy must remain.

## 9.2 Behavior

### >=1120

- group rail may be sticky;
- product list visible;
- Proof Window active;
- one proof at a time.

### 960–1119

- simplify to group + list;
- Proof Window removed;
- no attempt to squeeze it into an unstable composition.

### <960

- single main flow;
- group navigation no longer behaves as a fixed desktop sidebar.

### Mobile

- text-first catalog;
- no floating proof;
- no hover emulation;
- price/term move naturally under the main row content.

---

# 10. Breakpoints

Canonical global breakpoints:

| Name | Width |
|---|---:|
| wide | 1120px |
| layout | 960px |
| tablet | 768px |
| mobile | 640px |

## 10.1 Intended use

### 1120

- dense wide layouts simplify;
- Proof Window turns on/off;
- 4-column visual grids may reduce.

### 960

- desktop navigation → drawer;
- sidebars/sticky split layouts simplify;
- Brief becomes one column;
- major proof splits may stack.

### 768

- balanced 2-column layouts commonly collapse;
- cases index becomes one column.

### 640

- mobile spacing;
- 20px minimum gutter behavior;
- compact rule-row geometry.

## 10.2 Exceptions

A component-specific breakpoint outside this set is allowed only when:

- content demonstrably breaks at a different width;
- the exception is local;
- the reason is documented next to the component;
- it does not become a new informal global breakpoint.

---

# 11. Responsive contract

## 11.1 Acceptance widths

Every core implementation pass must be visually checked at:

- 1440;
- 1120;
- 960;
- 768;
- 640;
- 390;
- 320.

## 11.2 Horizontal overflow invariant

For core pages:

```text
document.scrollWidth <= document.clientWidth
```

at every acceptance width.

No exceptions for “minor” 2–4px overflow.

## 11.3 Core safeguards

Where necessary:

- `min-width: 0` on flex/grid children;
- `max-width: 100%` on media;
- wrapping for long text/URLs;
- no fixed sidebar after it stops fitting;
- transformed decorative elements must not grow document width;
- hard offsets must remain clipped/bounded appropriately.

## 11.4 Local horizontal scrolling

Permitted only for inherently horizontal content in a bounded region.

Examples:

- large data table;
- deliberate timeline.

It must never create page-level body scrolling.

## 11.5 Mobile composition

Default mobile order:

> statement → explanation → proof → action

Do not preserve desktop visual order when it harms comprehension.

---

# 12. Surfaces, borders and shape

## 12.1 Shape

Core default:

- square;
- radius 0.

Radius is permitted inside:

- project-specific coded UI;
- device simulations;
- components where radius is truthful to the demonstrated product.

Do not introduce rounded core cards for softness.

## 12.2 Border widths

Canonical:

- 1px — normal border / rule;
- 2px — major rule / emphasis.

Target: phase out ambiguous 1.5px core borders.

## 12.3 Border opacity

Use semantic levels:

- subtle 16%;
- default 24%;
- strong 40%.

Do not create a new alpha for every page.

## 12.4 Shadows

Core policy:

- no soft floating-card shadow by default.

Soft shadow is allowed for:

- browser/device object when a physical object needs separation.

Hard offset is the signature depth treatment.

---

# 13. Depth

Two signature scales are allowed.

## 13.1 Proof depth

Target:

- hard offset: ~6px;
- translation: ~-2px / -2px.

Use for:

- small/medium active proof;
- Proof Window;
- bounded high-intent media.

## 13.2 Work/case depth

Target:

- hard offset: 10px;
- translation: -3px / -3px.

Use for:

- large case/work preview;
- existing CasePreview signature.

## 13.3 Rules

Do not combine signature hard depth with:

- blur shadow;
- parallax;
- 3D rotation;
- glass effect.

One depth vocabulary is enough.

---

# 14. Media and product proof

## 14.1 Format follows evidence

Choose the medium that explains the product most clearly.

### Screenshot

Use when the visual surface itself is important.

### Coded UI

Use when it better explains:

- state;
- interaction;
- process;
- structure;
- transitions.

Coded UI may be reconstructed from real product tokens/components/logic and does not need to reproduce irrelevant application chrome.

### Diagram

Use when relationships or integrations are the proof.

### Before / after

Use when change itself is the proof.

### Device frame

Use only when device context matters.

---

## 14.2 Canonical media ratios

| Role | Ratio |
|---|---|
| desktop/interface proof | 16:10 |
| supporting interface/diagram | 4:3 |
| phone screen | 9:16 |
| editorial mobile crop | 9:14 |
| case index cover | 16:10 |

Do not proliferate arbitrary ratios without a content reason.

---

## 14.3 Browser frame

Use only where web context improves comprehension.

Core treatment:

- minimal browser chrome;
- thin border;
- no fake browser branding;
- no photorealistic laptop shell.

## 14.4 Phone frame

Use only for genuinely mobile interactions such as:

- booking;
- TMA;
- mobile-specific workflow.

Do not show a phone simply because a responsive website can run on mobile.

## 14.5 Frameless media

A clean crop is often preferable to a device shell.

“No frame” is a first-class media mode.

---

# 15. AI case covers

AI cover is permitted as **editorial art direction**, not as product evidence.

## 15.1 Recommended formula

> real product artifact + believable context + controlled editorial composition

Allowed:

- real screen in a desktop display;
- real screen in a phone;
- real interface embedded in a generated environment;
- domain-relevant object;
- project palette;
- controlled depth;
- negative space.

Avoid:

- floating UI everywhere;
- holograms;
- generic cyberpunk;
- random glass objects;
- “future technology” imagery;
- fake product states.

## 15.2 Cover vs proof

**Cover = interpretation.**  
**Proof = evidence.**

A cover may be generated. A claim about what was built must still be supported by real product/UI/system material.

## 15.3 Art-direction consistency

Case covers do not need one identical template.

Consistency comes from:

- controlled composition;
- real product artifact;
- disciplined device framing;
- coherent depth;
- consistent 16:10 index ratio;
- restrained supporting environment.

Not from identical decorative overlays.

---

# 16. Generative video

Generative video is **not part of v1**.

Do not add it during the initial core redesign.

Reconsider only after:

- static cover language works;
- proof system is complete;
- motion system is stable;
- there is a specific narrative need.

---

# 17. Content system

## 17.1 Voice

3D Studio copy should be:

- calm;
- specific;
- factual;
- technically competent;
- concise without becoming cryptic.

Avoid inflated agency language.

## 17.2 Content flow

Default:

> thesis → evidence → detail → action

## 17.3 Content roles

| Role | Purpose |
|---|---|
| eyebrow | category / real context |
| statement | main idea of the scene |
| lead | short clarification |
| body | explanation |
| fact/meta | price, term, parameter, status |
| proof | real visual/system evidence |
| action | next step |

## 17.4 Claims

Do not invent:

- metrics;
- testimonials;
- logos;
- outcomes;
- scale;
- customer quotes.

Claims must be supportable.

## 17.5 Anti-copy

Avoid generic phrases such as:

- “инновационный”;
- “уникальный”;
- “революционный”;
- “передовой”;
- “индивидуальный подход”;
- “решения под ключ”;
- “превращаем идеи в реальность”;
- “на стыке технологий и дизайна”;

unless the specific context genuinely requires the wording.

## 17.6 Progressive disclosure

Content density should vary by route.

- Hero: very low.
- Index/catalog: low.
- Product detail: medium.
- Proof scene: visual-first.
- FAQ: as much as needed.
- Legal: complete and readable.

Do not force the entire site into ultra-short Apple-like copy.

## 17.7 Public vs internal

Public UI may show:

- result;
- client-facing process;
- limitations;
- price/term;
- required inputs;
- truthful technical detail where relevant.

Do not expose merely for “transparency”:

- internal agent workflow;
- internal hours;
- margin/cost model;
- VPS topology;
- database implementation;
- relay/admin mechanics;
- internal IDs;
- deployment details.

---

# 18. Actions

## 18.1 Action hierarchy

Four roles only:

1. Primary
2. Secondary
3. Text action
4. Inline link

Do not create independent visual systems for `dark`, `ghost`, `soft`, `tertiary`, etc. unless a later functional requirement proves necessary.

---

## 18.2 Button sizes

| Size | Height | Horizontal padding | Type |
|---|---:|---:|---|
| Standard | 52px | 24px | Golos 600 / 15px |
| Large | 56px | 28px | Golos 600 / 15px |

Radius: 0.

Mobile tap targets must not drop below 44px; target remains 48–52px.

---

## 18.3 Primary button

Default:

- gold fill;
- ink text;
- no radius.

Hover uses contextual inversion:

### On ink

gold → paper.

### On paper

gold → ink, with an appropriate inverse text color.

Magnetic interaction is allowed only for selected primary actions such as:

- hero primary;
- major conversion CTA.

It is not automatically applied to every primary button.

---

## 18.4 Secondary button

Transparent with semantic border.

On ink:

- paper text;
- paper-derived border.

On paper:

- ink text;
- ink-derived border.

No gold border.

---

## 18.5 Text action

Default language:

- text;
- directional arrow;
- restrained hover movement/underline.

Examples:

- `Смотреть работу →`
- `Все продукты →`

Do not wrap ordinary text actions in pills or cards.

---

## 18.6 Inline links

On paper:

- blue;
- meaningful underline treatment.

On reading/legal pages, persistent underline is preferred.

A link must not be distinguishable by color alone where this harms accessibility.

---

# 19. Arrow semantics

Use arrows consistently.

- `→` = internal continuation / next step / internal navigation.
- `↗` = external destination or genuinely separate external context.

Do not use arrows as decoration.

---

# 20. Forms and controls

## 20.1 Field geometry

Target:

- minimum height: 52px;
- horizontal padding: 16px;
- text: Golos 16px;
- radius: 0;
- border: 1px;
- light bounded surface where appropriate.

## 20.2 Labels

- Golos;
- 600;
- 12–14px depending context;
- never decorative Mono.

## 20.3 Hint/error

- Golos 14px;
- clear semantic treatment;
- no excessive iconography.

## 20.4 Focus

### Navigation/actions

Gold focus treatment.

Target core pattern:

- 2px outline;
- 4px offset.

### Data-entry controls

Blue focus treatment.

The distinction is semantic, not accidental.

## 20.5 Choice controls

Prefer rule-based/selectable rows over soft cards.

Selection should use one or two signals, such as:

- stronger rule;
- marker;
- blue selection state;
- text emphasis.

Do not simultaneously add fill + border + badge + shadow + icon unless a real usability problem requires it.

## 20.6 Checkbox/radio

- familiar geometry;
- checkbox square;
- target 20–22px visual size;
- full tap target >=44px;
- selection uses informational/blue semantics rather than gold by default.

## 20.7 Loading

Keep the control footprint stable.

Example:

> Отправить → Отправляем… → Отправлено

No layout shift.

## 20.8 Success

Quiet process state.

Include:

- confirmation;
- what happens next;
- optional next action.

No confetti or celebration UI.

## 20.9 Error

Distinguish:

- field-level error;
- form/submission error.

Errors must be textual, not color-only.

---

# 21. Navigation

## 21.1 Desktop

- text-first;
- not sticky by default;
- part of the opening composition;
- rolling interaction allowed;
- primary Nav CTA uses the shared Button primitive.

## 21.2 Mobile

At <=960:

- drawer mode;
- clear menu trigger;
- no horizontal overflow;
- preserve Escape/focus trap/focus restoration;
- drawer width bounded to viewport.

Do not redesign the existing interaction for novelty.

---

# 22. Footer

Keep:

- ink scene;
- restrained links;
- oversized 3D Studio wordmark;
- brand closure role.

Do not add by default:

- newsletter card;
- social badge collection;
- extra CTA panels;
- decorative content grid.

The footer is a closing brand scene, not another sales page.

---

# 23. Motion system

Existing site easing remains the core curve:

```text
cubic-bezier(.16, 1, .3, 1)
```

## 23.1 Motion roles

### Feedback

~150–250ms.

Use for:

- hover;
- focus;
- small color/state changes.

### Standard

~250–450ms.

Use for:

- row movement;
- proof activation;
- depth;
- small structural transition.

### Editorial

~600–900ms.

Use for:

- section reveal;
- large scene transition;
- major media entrance.

### Ambient

Multi-second continuous movement.

Use for:

- hero conveyor only or similarly justified passive background behavior.

---

## 23.2 Current signature timings to preserve as reference

- reveal: ~900ms;
- scene/background: ~700ms;
- rolling label: ~500ms;
- magnetic CTA: ~400ms;
- CasePreview depth: ~250ms;
- conveyor: 26s / 34s opposing columns.

Exact implementation may be normalized around these values, but do not create a large timing library.

---

## 23.3 Reveal

Use for:

- major heading;
- new scene;
- important media;
- grouped rows where useful.

Do not stagger every paragraph and minor label.

## 23.4 Reduced motion

`prefers-reduced-motion` must:

- disable nonessential transitions;
- disable conveyor/reveal animation;
- disable smooth scroll where necessary;
- preserve all information and interactions.

This is a mandatory contract.

---

# 24. Product Preview / Proof Window behavior

## 24.1 Desktop

Trigger:

- hover;
- keyboard focus.

Response:

- stable proof plane updates;
- one active proof;
- restrained opacity/translate/clip behavior;
- optional small signature hard offset;
- no price/term occlusion.

## 24.2 Mobile

Default:

- no preview plane;
- no hover simulation;
- catalog remains text-first.

An explicit inline reveal may be added only where it materially improves comprehension and does not overload the list.

## 24.3 Missing proof

If no truthful, strong proof asset exists:

> show no proof.

Do not show placeholders, generic generated UI or fake examples merely for consistency.

---

# 25. Homepage composition

Order is fixed:

1. Hero
2. Directions
3. Works
4. Guarantees
5. Process
6. Team
7. Brief CTA
8. FAQ
9. Footer

The information architecture is not part of the redesign scope unless a later product decision explicitly changes it.

## 25.1 Hero

Keep fundamental structure:

- left thesis;
- moving conveyor wall;
- real proof material;
- maximum two actions.

Refine later through:

- more diverse truthful covers;
- less repetition;
- tempo/contrast calibration;
- stronger relationship between shown work and actual capability.

Do not replace the conveyor by default.

## 25.2 Directions

Keep:

- full-width ruled list;
- number;
- structural title;
- concise explanation;
- arrow.

Potential preview is desktop-only and secondary to the row.

## 25.3 Works

Target:

- larger proof objects;
- 2 columns desktop;
- 1 column mobile.

Do not add an extra floating preview over a case tile that already contains permanent media.

## 25.4 Guarantees

Keep:

- one strong statement;
- concrete operational guarantees;
- minimal media;
- no icon-card grid.

## 25.5 Process

Existing coded scenario may remain the authored visual break.

Do not add extra screenshots merely to make the section more visual.

## 25.6 Team

Keep restrained.

Use:

- name;
- role;
- one factual competency/context line.

Avoid HR-style biographies.

## 25.7 Brief CTA

Gold conversion scene remains rare.

Use:

- one statement;
- concise explanation;
- primary action;
- optional secondary action.

## 25.8 FAQ

Reading-first.

No signature motion required beyond normal disclosure behavior.

---

# 26. Product-detail composition

Typical content contract:

1. What it is
2. What situation it solves
3. What the client receives
4. Proof
5. Delivery/process information relevant to the client
6. Included / excluded scope
7. Price / term
8. Next step

Use a rhythm of:

> text → proof → text → proof

rather than successive generic card grids.

---

# 27. Case index

Case index uses:

- 2 columns on desktop;
- 1 column below tablet;
- 16:10 covers;
- permanent visual proof/cover;
- restrained metadata;
- existing hard-offset depth interaction.

Do not add a second hover-preview layer.

---

# 28. Case boundary

Case internals are not part of the core v1 redesign.

## 28.1 Core owns

- global shell;
- navigation;
- footer;
- accessibility baseline;
- global responsive safety;
- shared action language where appropriate;
- outer spacing contracts.

## 28.2 Case may own

- local palette;
- local typography where justified;
- storytelling composition;
- local coded demo;
- local project UI;
- local imagery;
- local motion;
- device/project radii.

## 28.3 Case may not silently redefine

- global navigation;
- global footer;
- core button system;
- site-wide typography tokens;
- site-wide spacing tokens;
- global breakpoints;
- global form language.

Legacy cases remain exceptions until the dedicated later case pass.

---

# 29. Icons and graphic language

Core does not require a general icon library.

Prefer:

- text arrows;
- close;
- check;
- essential functional glyphs.

Do not add icons merely to decorate sections.

Project/case demos may use their own icons inside the project world.

---

# 30. Accessibility baseline

This is a design-system requirement, not an optional polish pass.

## 30.1 Focus

Every interactive element must have visible keyboard focus.

## 30.2 Touch

Minimum interactive target:

- 44px absolute minimum;
- 48–52px preferred.

## 30.3 Color

State/information must not depend on color alone.

## 30.4 Forms

- explicit labels;
- readable errors;
- stable loading;
- clear disabled state.

## 30.5 Hover

Hover-only interactions must never contain required information unavailable elsewhere.

## 30.6 Motion

Reduced-motion path required.

## 30.7 Text

Long-form reading width must remain bounded.

## 30.8 Zoom/responsiveness

Core flow must remain usable at narrow widths and browser zoom; no fixed geometry may force page-level horizontal scrolling.

---

# 31. Content visibility contract

## PUBLIC

Information required for the client to:

- understand the product;
- evaluate fit;
- understand price/term;
- see proof;
- submit a request;
- understand relevant conditions.

## LEGAL

Only legally necessary disclosure at the required level.

## INTERNAL

Do not expose as explanatory UI unless explicitly approved:

- VPS;
- DB implementation;
- relay;
- admin queue;
- internal IDs;
- agent/AI workflow;
- internal hours;
- cost model;
- margins;
- deployment mechanics.

---

# 32. Migration principles

Implementation must be semantic, not global search/replace.

Typical normalization targets:

### Spacing

- 70 → 72 where it is section rhythm;
- 74 → 72 where semantically equivalent;
- 46/44 → 48 or 40 depending role;
- 38 → 40 where it is group spacing;
- 34 → 32 where it is spacing;
- 22 → 24 where it is component padding.

Do not alter geometry values such as browser chrome height merely because the number is not in the spacing scale.

### Borders

- phase out 1.5px core borders;
- normalize to 1px or 2px by semantic role.

### Typography

- remove synthetic 650;
- stop using `.mono` for Golos metadata;
- reserve Mono naming for actual JetBrains Mono roles;
- reduce Unbounded use to approved roles.

### Color

- core blue migrates toward `#3552C7`;
- ochre exits core brand semantics;
- repeated alpha literals migrate to semantic text/border levels.

### Breakpoints

- migrate toward 1120 / 960 / 768 / 640;
- preserve documented local exceptions only where content genuinely requires them.

---

# 33. Implementation sequence

Do not implement the entire design system in one redesign diff.

Recommended order:

## Pass 1 — tokens and foundations

- color tokens;
- type roles;
- spacing;
- layout tokens;
- breakpoint constants/policy;
- no page redesign.

## Pass 2 — shared primitives

- buttons;
- links;
- form fields;
- rule rows;
- common containers;
- section heading primitives where proven useful.

## Pass 3 — shared shell

- Nav;
- Footer;
- PageHeader;
- common page shell.

## Pass 4 — homepage

Apply the system without changing the approved section order.

## Pass 5 — `/products/`

- apply catalog system;
- implement one Proof Window pilot;
- test interaction/accessibility before spreading the pattern.

## Pass 6 — product details

- media/proof system;
- content hierarchy;
- canonical proof compositions.

## Pass 7 — cases index

- 16:10 cover system;
- art-direction-ready media;
- no case-internal refactor.

## Pass 8 — Brief

- form primitives;
- responsive polish;
- preserve business logic.

## Pass 9 — Price / Legal / remaining utility pages

Reading/comparison-first normalization.

## Pass 10 — responsive and accessibility regression

- 1440;
- 1120;
- 960;
- 768;
- 640;
- 390;
- 320;
- no horizontal overflow;
- keyboard/focus;
- reduced motion;
- console/network sanity.

## Later — dedicated case pass

Cases consume only validated transferable core primitives.

---

# 34. Verification protocol for every implementation pass

At minimum:

1. build;
2. relevant tests;
3. Playwright MCP walkthrough;
4. desktop + mobile rendering;
5. 320px overflow check;
6. keyboard/focus check for changed interactions;
7. console check;
8. `git diff --check`;
9. inspect diff for scope expansion.

Do not use visual redesign tasks as an excuse to alter:

- pricing;
- product taxonomy;
- lead-flow semantics;
- unrelated case internals;
- deployment architecture.

---

# 35. Do / Don't summary

## Typography

**DO**
- use Unbounded sparingly for statements and structure;
- use Golos for content;
- use Mono only for real structured facts.

**DON'T**
- use Mono as decoration;
- make every heading Unbounded;
- invent intermediate weights.

## Color

**DO**
- keep paper/ink dominant;
- use gold rarely;
- use blue for information/selection/link semantics.

**DON'T**
- use gold as generic decoration;
- keep ochre as a competing core accent;
- let project palettes leak into global chrome.

## Spacing

**DO**
- use component scale and scene scale separately;
- let whitespace express semantic distance.

**DON'T**
- add arbitrary local values for visual tweaking;
- add huge whitespace merely to imply premium.

## Layout

**DO**
- align to shared rails;
- use a small set of semantic layouts.

**DON'T**
- default to bento/masonry;
- alternate every section left/right;
- introduce a universal 12-column grid without need.

## Media

**DO**
- choose screenshot/coded UI/diagram based on explanatory power;
- keep proof truthful;
- use AI as editorial framing.

**DON'T**
- fabricate features;
- use device frames without context;
- show placeholders when no strong proof exists.

## Motion

**DO**
- use intent-driven motion;
- preserve one main easing language;
- support reduced motion.

**DON'T**
- animate every paragraph;
- layer parallax + blur + spring + offset;
- add scroll-jacking.

## Actions

**DO**
- use primary/secondary/text/inline roles;
- keep controls square and functional.

**DON'T**
- create pill-heavy control variants;
- decorate buttons with shadows/gradients.

## Responsive

**DO**
- support 320px;
- recompose mobile;
- keep page-level horizontal overflow at zero.

**DON'T**
- shrink everything to make desktop fit;
- simulate hover on touch;
- keep a sidebar after it stops fitting.

## Signature language

**DO**
- develop Proof Window;
- connect rule geometry with proof;
- use plane-to-depth deliberately.

**DON'T**
- add fake technical annotations;
- add decorative 3D clichés;
- add new signatures before validating existing ones.

---

# 36. Frozen v1 decisions

The following decisions are considered approved for v1 unless the owner explicitly reopens them:

- positioning: calm, minimal, technical, editorial boutique studio;
- preserve hero conveyor, refine content later;
- approved homepage section order;
- semantic Ink / Paper / Gold scene model;
- target core palette: Paper / Ink / White / Gold / calmer Cobalt Blue;
- ochre removed from core identity;
- Unbounded used less and only in high-value roles;
- Golos becomes the main content/UI language;
- JetBrains Mono only for truthful facts/data/technical content;
- target type scale defined in this document;
- two-level spacing system;
- 1240px container with fluid 20–48px gutter;
- canonical breakpoints 1120 / 960 / 768 / 640;
- zero page-level horizontal overflow;
- `/products/` stable desktop Proof Window;
- mobile `/products/` remains text-first;
- Works move toward larger 2-column proof presentation;
- content principle: thesis → evidence → detail → action;
- screenshot and coded UI are equal proof formats; choose by explanatory power;
- AI case cover may place real UI in desktop/phone context with generated editorial environment;
- case cover ratio 16:10;
- generative video deferred;
- square-first core geometry;
- core borders 1px / 2px;
- signature depth scales ~6px and 10px;
- primary/secondary/text/inline action hierarchy;
- square 52/56px actions;
- gold action focus, blue form focus;
- restrained motion with one core easing;
- rule-row → proof and plane → depth are approved new signature directions;
- decorative technical documentation aesthetics are explicitly rejected;
- cases remain separate worlds until the dedicated case pass.

---

# 37. Implementation status

At the time of this specification:

- this is a **target contract**;
- the existing production UI has not yet been migrated to it;
- historical case systems remain untouched;
- implementation should proceed incrementally according to Section 33.

Do not treat partial implementation as permission to reinterpret the system.

