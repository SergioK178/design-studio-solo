# Architecture

System shape and data flow. See `AGENTS.md` for canonical file pointers and rules, `docs/project-state.md` for what's actually deployed right now.

## Repo shape
- `site/` — Astro 5 static frontend, Svelte 5 islands for interactive pieces (Brief form, etc.), Tailwind 4.
- `api/` — Hono API on Node, `better-sqlite3` storage, no ORM. Routes: `draft`, `lead`, `admin`, `metrics`.
- `relay/` — Cloudflare Worker. Receives a lead notification from the API and forwards it to Telegram.
- `infra/` — Ansible playbook, Podman/Quadlet units, Caddyfile, API Dockerfile, deploy CI job. Code-complete; no live VPS yet (`docs/project-state.md`).
- `scripts/` — cross-cutting build/verify tooling (brief-estimator generator + parity, pricing-model, asset validation, metrics collection).

Frontend and API only ever talk through `/api/*`; there is no server-side coupling beyond HTTP.

## Frontend/API split reasoning
`site/` builds to static output; `api/`'s deploy artifact is a separate Node/Docker image and its build does **not** have access to `site/src` at build time (different build contexts, different deploy pipelines). Anything the API needs from the site's canonical data has to be materialized into a file the API build can see — hence the generated-snapshot pattern below, rather than importing across the boundary.

## Brief pricing pipeline
Two parallel chains that must stay in sync:

```
site/src/data/products.ts  ──┐
                              ├─▶ site/src/data/brief-estimator.ts ──▶ Brief UI (Svelte, site/src/components/Brief.svelte)
site/src/data/brief-v3.ts  ──┘        (domain logic: ranges, adders,
                                        format recommendation — no UI copy)

site/src/data/brief-estimator.ts ──▶ scripts/generate-brief-estimator.ts ──▶ api/src/brief/generated-estimator-data.ts
        + products.ts                  (bun scripts/generate-brief-estimator.ts)   (AUTO-GENERATED, do not hand-edit)
                                                                                            │
                                                                                            ▼
                                                                              api/src/brief/estimate-v3.ts
                                                                              (adapter: parses flat answers,
                                                                               runs recommendFormatV3, serializes)
                                                                                            │
                                                                                            ▼
                                                                              api/src/brief/estimate.ts
                                                                              (thin wrapper used by routes)
```

Why the generated snapshot exists: `api/`'s build cannot import TypeScript from `site/src` (separate deploy artifact — see above), so `generate-brief-estimator.ts` turns the site's canonical estimator data into a plain-data file the API can import with no cross-package dependency. `scripts/verify-estimate-parity.ts` is the guardrail — it re-derives both sides' answers and diffs them; run it after any change to `brief-estimator.ts`, `brief-v3.ts`, or `products.ts` pricing/formulas.

`site/src/data/brief-estimate.ts` (v2) is legacy, kept only to back the `/price/` e2e spec — not part of the live pipeline (`brief-v2.ts` itself was deleted).

## Lead flow
1. Brief UI posts answers incrementally to `POST /api/draft` (`api/src/routes/draft.ts`), keyed by a client-generated `id`, upserted into `brief_drafts` with a 60-day TTL. Server computes and stores the estimate alongside the answers.
2. On submit, `POST /api/lead` (`api/src/routes/lead.ts`):
   - accepts JSON or form-encoded body (the no-JS fallback form posts `multipart/form-data`);
   - anti-spam: honeypot field, minimum fill time (2s), per-IP rate limit (`rate-limit.ts`) — any trip returns a fake `{ ok: true }` rather than an error, to not tip off bots;
   - validates contact fields, product slug, `draftId`/`submissionId` shape;
   - **idempotency**: if `submissionId` was already seen (`leads.submission_id` lookup), returns the existing lead id with `duplicate: true` instead of inserting again — covers double-submit/retry;
   - noscript path can't carry `product`/`task` as JS-set hidden fields reliably, so it's recovered server-side from the `Referer` URL's query string (`contextFromReferer`) when the form didn't send them.
3. On successful insert, the API calls `relay.ts`, which POSTs to the Cloudflare Worker (`relay/src/index.ts`) with an `X-Relay-Token`; the worker forwards a formatted message to Telegram via the Bot API.
4. `/admin` (`api/src/routes/admin.ts`) reads leads directly from SQLite for review/CSV export, behind Caddy basic auth in prod.

## Generated vs. source files
- Source (edit these): `site/src/data/products.ts`, `site/src/data/brief-estimator.ts`, `site/src/data/brief-v3.ts`.
- Generated (never hand-edit): `api/src/brief/generated-estimator-data.ts`. Regenerate with `bun scripts/generate-brief-estimator.ts`, verify with `bun scripts/verify-estimate-parity.ts`.
- Separately, `scripts/pricing-model/` (Python) is the owner's internal effort/cost model that produced the pricing v1 numbers in `PRICING_REVIEW.md` — it is not wired into the build; it's an offline analysis tool, checked with `scripts/verify-pricing-parity.ts` against `products.ts`.

## Cases
`case-olginka` (guest-house) and `case-sutures` (suture) are bespoke, hand-built Astro component trees under `site/src/components/`, each with its own scoped CSS (`case-olginka.css`, `case-sutures.css`) and local scene components. They intentionally do not share a common case framework with each other or with `CatalogCase`/`ShowroomCase`. Do not attempt to unify case internals into a shared system — that's an explicit non-goal until a StandardCase migration is requested (`AGENTS.md`).

## Deployment separation
- Production target: private VPS, provisioned via `infra/ansible/site.yml`, served by Caddy (static site + `/api/*` + `/admin/*` behind basic auth), API running as a Quadlet/Podman unit. Not yet provisioned — see `docs/project-state.md`.
- Vercel: preview/staging only, kept intentionally for sharing WIP. `/api/*` behavior must be verified on the VPS, not Vercel preview (Vercel doesn't run the real API).
- Relay worker deploys independently via Cloudflare (Wrangler), decoupled from both the site and API deploys.
