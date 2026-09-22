# Mini API contracts

API принимает только актуальный формат брифа v3. При первом запуске создаётся
SQLite-база по `DB_PATH` (по умолчанию `./data/app.db`). При старте API
последовательно применяет SQL-миграции из `migrations/` и отмечает их в
`schema_migrations`; существующую базу заявок для обычного обновления удалять не нужно.

Phase 4 owns the actual API service. Phase 5 adds the metrics contract below.

## Metrics write

`POST /api/metrics/runs`

Auth: `Authorization: Bearer $METRICS_WRITE_TOKEN`.

Request body:

```json
{
  "source": "deploy",
  "url": "https://example.com/",
  "status": "ok",
  "ttfb_ms": 94,
  "transfer_bytes": 212000,
  "lighthouse": {
    "performance": 0.98,
    "accessibility": 1,
    "best_practices": 1,
    "seo": 1
  },
  "lcp_ms": 950,
  "cls": 0,
  "inp_ms": null,
  "raw": {}
}
```

The API stores the full payload in `metric_runs.raw_json` and flattens common fields for latest reads.

## Metrics latest

`GET /api/metrics/latest`

Response:

```json
{
  "measured_at": "2026-07-04T18:00:00.000Z",
  "source": "deploy",
  "url": "https://example.com/",
  "status": "ok",
  "ttfb_ms": 94,
  "transfer_bytes": 212000,
  "lighthouse": {
    "performance": 0.98,
    "accessibility": 1,
    "best_practices": 1,
    "seo": 1
  },
  "lcp_ms": 950,
  "cls": 0,
  "inp_ms": null
}
```

Cache for 10 minutes. Return the latest row with `status IN ('ok', 'partial')`; do not invent fallback values.
