import { expect, test } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDb } from '../src/db.ts';

test('openDb applies all migrations', () => {
  const db = openDb(':memory:');
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((r: any) => r.name);
  expect(tables).toContain('metric_runs');
  expect(tables).toContain('brief_drafts');
  expect(tables).toContain('leads');
  const columns = db.prepare('PRAGMA table_info(leads)').all().map((row: any) => row.name);
  expect(columns).toEqual(expect.arrayContaining(['price_label', 'delivery_label', 'submission_id']));
});

test('file database applies each migration once across a process restart', () => {
  const dir = mkdtempSync(join(tmpdir(), 'db-migrations-'));
  const path = join(dir, 'app.db');
  try {
    openDb(path).close();
    const db = openDb(path);
    expect(db.prepare('SELECT name FROM schema_migrations ORDER BY name').all()).toEqual([
      { name: '0001_initial.sql' }, { name: '0002_lead_delivery_and_idempotency.sql' },
    ]);
    db.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
