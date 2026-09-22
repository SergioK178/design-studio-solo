# 3D Studio — agent entry point

Brand: 3D Studio (previous public name 3K Studio — do not reintroduce; internal legacy identifiers may stay 3K unless migration is explicitly requested).

## Stack & repo shape
- `site/` — Astro 5 static frontend (Svelte 5 islands, Tailwind 4)
- `api/` — Hono API + SQLite (leads, brief drafts, `/admin`)
- `relay/` — Cloudflare Worker, Telegram notifications
- `infra/` — VPS / Caddy / Ansible / Quadlet, deploy runbook (code-complete, no live VPS provisioned yet)
- `scripts/` — pricing model, brief-estimator generator/parity checks, asset validation
- Frontend and API talk only through `/api/*`

## Deployment
- Production target: private VPS (see `infra/DEPLOY.md`). Not provisioned yet — see `docs/project-state.md`.
- Vercel stays for preview/staging and sharing WIP — do not remove its config.
- `/api/*` behavior in prod is verified on the VPS, not on Vercel preview.

## What to read by task type
| Task touches | Read |
|---|---|
| Pricing, brief estimator, products.ts | `docs/project-state.md` (Frozen decisions), this file's Canonical sources |
| API routes, lead/draft flow, relay, deploy | `docs/architecture.md` |
| Visual/UI, tokens, layout, motion | `docs/design.md` |
| "What's already done / in flight / open" | `docs/project-state.md` |
| Deep historical rationale (rare) | `AUDIT.md`, `PRODUCT_AUDIT.md`, `DESIGN_AUDIT.md`, `DESIGN_MEASUREMENTS.md`, `DESIGN_OPPORTUNITIES.md`, `DESIGN-SYSTEM-V1.md`, `PRICING_REVIEW.md` — deep reference only, not default reading |

## Canonical sources
- Products/pricing (public price, term): `site/src/data/products.ts`
- Brief estimator domain logic: `site/src/data/brief-estimator.ts`
- Brief questions/UX copy: `site/src/data/brief-v3.ts`
- Generated API estimator snapshot: `api/src/brief/generated-estimator-data.ts` — **AUTO-GENERATED, do not edit manually**
- Generator: `scripts/generate-brief-estimator.ts` (`bun scripts/generate-brief-estimator.ts`)
- Parity check: `scripts/verify-estimate-parity.ts` — run after any pricing/formula edit
- Design: `docs/design.md` (compact); `DESIGN-SYSTEM-V1.md` is the deep reference, not default reading

## Hard rules
- Pricing values (v1) and delivery terms are owner-approved — do not reprice or adjust formulas without explicit scope; report inconsistencies instead of guessing a fix.
- Cases (`case-olginka`/guest-house, `case-sutures`/suture, `CatalogCase`, `ShowroomCase`) are frozen — do not refactor/migrate without explicit request; no new case-specific design systems.
- No fabricated metrics, testimonials, case results, or client claims.
- No internal agent/production economics (hours, acceleration, cost model) in public copy.
- No AI-slop decorative pseudo-tech: no fake telemetry, dot grids, terminals, coordinates, generic 3D/WebGL spectacle, glassmorphism, gradient mesh (full list: `docs/design.md`).
- `api/src/brief/generated-estimator-data.ts` is generated — edit the source (`brief-estimator.ts`/`products.ts`) and regenerate, never the snapshot.
- Inspect before edit; smallest coherent diff; reuse existing components/data over new abstractions.
- Never discard another agent's dirty/uncommitted work without checking `git status` first.
- Do not commit unless explicitly asked.
- Playwright MCP is the browser/UI verification tool — no ad-hoc Playwright CLI scripts; don't run the full e2e suite unless relevant.

## Commands
- Frontend: `cd site && bun run build`, `bun run test:e2e` (Playwright; hardcoded chromium path — see `docs/project-state.md` known issues)
- API: `cd api && npm test` (vitest), `npm run build`
- Pricing/brief sync: `bun scripts/verify-estimate-parity.ts` (site+api pricing parity), `bun scripts/verify-pricing-parity.ts` (pricing-model vs products.ts)
- Do not run destructive migrations; never delete local `api/data/app.db`

## Git / worktree discipline
- Small, reviewable diffs; no unrelated refactors bundled with a task.
- Before any command that could discard uncommitted work, run `git status` first.
- Confirm before destructive or shared-state actions (force-push, resetting branches, deploying).

## Further reading
- `docs/project-state.md` — done / current / known issues / next / frozen decisions
- `docs/architecture.md` — system shape, data flow, generated-vs-source boundary
- `docs/design.md` — compact design-system-v1 working reference
