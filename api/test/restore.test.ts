import { expect, test } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDb } from '../src/db.ts';

test('backup restores integrity and preserves rows', async () => {
  const db = openDb(':memory:');

  db.prepare(
    `INSERT INTO leads (kind, price_low, price_high, term_low, term_high, source)
     VALUES ('start', 30000, 30000, 1, 1, 'brief')`,
  ).run();
  db.prepare(
    `INSERT INTO metric_runs (source, url, status, raw_json) VALUES ('manual', 'https://example.com/', 'ok', '{}')`,
  ).run();

  const dir = mkdtempSync(join(tmpdir(), 'restore-test-'));
  const backupPath = join(dir, 'backup.db');

  try {
    await db.backup(backupPath);

    const restored = openDb(backupPath);
    const integrity = restored.pragma('integrity_check', { simple: true });
    expect(integrity).toBe('ok');

    const leads = restored.prepare('SELECT * FROM leads').all();
    const metrics = restored.prepare('SELECT * FROM metric_runs').all();
    expect(leads.length).toBe(1);
    expect(metrics.length).toBe(1);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
