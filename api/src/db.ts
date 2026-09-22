import Database from 'better-sqlite3';
import { mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export function openDb(path: string): Database.Database {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  const migrationsDir = fileURLToPath(new URL('../migrations', import.meta.url));
  const files = readdirSync(migrationsDir)
    .filter((name) => name.endsWith('.sql'))
    .sort();

  db.exec('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (strftime(\'%Y-%m-%dT%H:%M:%fZ\', \'now\')))');
  const applied = db.prepare('SELECT 1 FROM schema_migrations WHERE name = ?');
  const markApplied = db.prepare('INSERT INTO schema_migrations (name) VALUES (?)');
  const apply = db.transaction((file: string) => {
    if (applied.get(file)) return;
    db.exec(readFileSync(`${migrationsDir}/${file}`, 'utf8'));
    markApplied.run(file);
  });

  for (const file of files) apply(file);

  return db;
}
