import { expect, test } from 'vitest';
import { openDb } from '../src/db.ts';

test('openDb applies all migrations', () => {
  const db = openDb(':memory:');
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((r: any) => r.name);
  expect(tables).toContain('metric_runs');
  expect(tables).toContain('brief_drafts');
  expect(tables).toContain('leads');
});
