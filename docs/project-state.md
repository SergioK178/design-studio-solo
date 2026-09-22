# Project state

What's done, what's happening now, what's next. See `AGENTS.md` for operational rules, `docs/architecture.md` for system shape.

## Done
**Pricing v1** — owner approved a production/effort-based price table (2026-09-20/22, `PRICING_REVIEW.md`). It is live in `site/src/data/products.ts` (`start` 49 000 ₽ fixed, `landing` 100–200k, etc. — full table in `PRICING_REVIEW.md` §0).

**Brief estimator / parity** — `brief-estimator.ts` (site, domain logic) is the single source; `scripts/generate-brief-estimator.ts` turns it + `products.ts` into `api/src/brief/generated-estimator-data.ts` (auto-generated). `scripts/verify-estimate-parity.ts` currently passes: 2290 generic answer sets + 21 SKU contexts + 6 brief formats all match between site and API.

**Lead persistence / idempotency** — `POST /api/lead` dedups on `submissionId` (unique lookup against `leads.submission_id`, returns `{ duplicate: true }` on repeat), supports resuming a `draftId`, and rejects spam via honeypot field + minimum fill time + IP rate limiting.

**Noscript + product/task context recovery** — `/brief/` is a static page and can't read `?product=&task=` per request without JS. The noscript form path recovers `product`/`task` from the `Referer` header server-side in `api/src/routes/lead.ts` (`contextFromReferer`). The proof-CTA (including the Telegram Mini App product surface) was fixed to route through the canonical `briefHref()` helper instead of a stale hardcoded link, so product context isn't lost on the way into the brief.

**Flagship cases shipped** — `guest-house` (`case-olginka`) and `suture` (`case-sutures`) are committed and tracked (commit `429ac22`).

**Shell/homepage on brand** — aligned to 3D Studio naming and design direction (commit `f88bbca`).

**Design tokens** — core palette (paper/ink/gold/blue), text/border alpha levels, and the component spacing scale from `DESIGN-SYSTEM-V1.md` are already implemented in `site/src/styles/global.css`, matching the spec's target values almost exactly.

## Current state
- API is not deployed to a verified/live environment. CI deploy step is `if: false` in `.github/workflows/deploy.yml`; `infra/` (Ansible/Quadlet/Caddy) is code-complete per `infra/DEPLOY.md` but no VPS has actually been provisioned yet.
- `POST /api/draft` and `POST /api/lead` therefore only run locally/in tests, not in a reachable prod.
- Cases remain intentionally bespoke (`case-olginka`, `case-sutures`, `CatalogCase`, `ShowroomCase`); no StandardCase migration in progress.
- Legacy `site/src/data/brief-estimate.ts` (v2) still exists, scoped down to only back the `/price/` e2e spec (`brief-v2.ts` itself was deleted in `9baa633`).

## Known issues
- API deploy path unexercised end-to-end (see *Current state*).
- `scripts/validate-assets.ts` was reported failing in `AUDIT.md` (2026-09-20, asset manifest references missing files) — not reverified this pass.
- `playwright.config.ts` hardcodes a chromium build path (`chromium-1228`); if missing, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. A stale `astro preview` left on `:4321` gets reused (`reuseExistingServer`) and can hang tests — check the port first.
- `/lab` metrics (`/api/metrics/*`) are non-functional; the widget and `Metrics.svelte` were removed but the API endpoints remain.

## Next
- Provision the VPS and flip the CI deploy step on when ready (`infra/DEPLOY.md` has the runbook).

## Frozen decisions (don't re-litigate)
- Brand is 3D Studio; 3K stays internal-only.
- Pricing v1 numbers and delivery terms are owner-approved; only a dedicated pricing pass changes them.
- CTA vocabulary has exactly three meanings: «Пройти бриф» (→ `/brief/`), «Обсудить проект» (Telegram), «Смотреть работу» (→ case). No synonyms.
- Product grouping taxonomy (Сайты / Каталоги и продажи / Приложения и системы / Автоматизация и интеграции / Развитие существующего) is navigation only — the 21 SKUs are not deleted to fit it.
- Target public structure: `/`, `products/`, `products/[slug]/`, `cases/`, `cases/[slug]/`, `brief/`, `legal/`. `/lab` stays outside it (nav removed, article kept as archive). `/price` is migrating toward an "add-ons" role inside products; menu label is currently «Дополнения».
- Cases stay bespoke; no StandardCase migration without explicit request.
