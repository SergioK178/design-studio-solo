import { existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { assetManifest } from '../site/src/data/asset-manifest.ts';

// Release-gate: проверяет, что каждый required-ассет из манифеста реально лежит
// в site/public/assets в одном из разрешённых форматов, не пустой и путь совпадает
// по регистру (content-assets.md §8). Не входит в обычный `astro build` — это
// отдельный шаг production release gate (master-spec.md §7), запускается вручную
// или в CI перед релизом, когда ассеты уже должны быть на месте.

const ASSETS_ROOT = join(import.meta.dirname, '../site/public/assets');

interface Failure {
  id: string;
  reason: string;
}

function findCaseSensitivePath(root: string, relativePath: string): string | null {
  const parts = relativePath.split('/').filter(Boolean);
  let currentDir = root;
  for (let i = 0; i < parts.length; i++) {
    const isLast = i === parts.length - 1;
    if (!existsSync(currentDir)) return null;
    const siblings = readdirSync(currentDir);
    if (isLast) {
      const match = siblings.find((name) => name.startsWith(`${parts[i]}.`));
      return match ? join(currentDir, match) : null;
    }
    const match = siblings.find((name) => name === parts[i]);
    if (!match) return null;
    currentDir = join(currentDir, match);
  }
  return null;
}

const failures: Failure[] = [];
let checkedRequired = 0;
let skippedOptional = 0;

for (const entry of assetManifest) {
  if (!entry.required) {
    skippedOptional += 1;
    continue;
  }
  checkedRequired += 1;

  const found = findCaseSensitivePath(ASSETS_ROOT, entry.id);
  if (!found) {
    failures.push({ id: entry.id, reason: `нет файла в ${dirname(join(ASSETS_ROOT, entry.id))} среди форматов [${entry.formats.join(', ')}]` });
    continue;
  }

  const ext = found.split('.').pop()?.toLowerCase() ?? '';
  if (!entry.formats.includes(ext)) {
    failures.push({ id: entry.id, reason: `формат .${ext} не входит в разрешённые [${entry.formats.join(', ')}]` });
    continue;
  }

  const size = statSync(found).size;
  if (size === 0) {
    failures.push({ id: entry.id, reason: `файл пустой (0 байт): ${found}` });
  }
}

if (failures.length) {
  console.error(`Asset validation failed: ${failures.length} обязательных ассетов не готовы (проверено ${checkedRequired}, пропущено как plan/concept ${skippedOptional}):`);
  for (const failure of failures) console.error(`  - ${failure.id}: ${failure.reason}`);
  process.exit(1);
}

console.log(`OK: ${checkedRequired} обязательных ассетов на месте (пропущено как plan/concept ${skippedOptional}).`);
