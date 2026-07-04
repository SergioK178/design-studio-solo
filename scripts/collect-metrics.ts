import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

type LighthouseScores = {
  performance: number | null;
  accessibility: number | null;
  best_practices: number | null;
  seo: number | null;
};

const siteUrl = mustEnv('SITE_URL');
const apiUrl = mustEnv('METRICS_API_URL');
const token = mustEnv('METRICS_WRITE_TOKEN');
const source = process.env.METRICS_SOURCE || 'manual';
const lighthouseCommand = (process.env.LIGHTHOUSE_BIN || 'lighthouse').split(/\s+/).filter(Boolean);

function mustEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function run(command: string, args: string[]) {
  return spawnSync(command, args, { encoding: 'utf8' });
}

function measureCurl(url: string) {
  const format = '%{time_starttransfer} %{size_download}';
  const result = run('curl', ['-L', '-sS', '-o', '/dev/null', '-w', format, url]);
  if (result.status !== 0) {
    throw new Error(`curl failed: ${result.stderr || result.stdout}`);
  }
  const [ttfbSeconds, transferBytes] = result.stdout.trim().split(/\s+/);
  return {
    ttfb_ms: Math.round(Number(ttfbSeconds) * 1000),
    transfer_bytes: Number(transferBytes),
  };
}

function measureLighthouse(url: string): { scores: LighthouseScores; lcp_ms: number | null; cls: number | null; raw: unknown } {
  const dir = mkdtempSync(join(tmpdir(), 'lh-'));
  const output = join(dir, 'report');
  try {
    const [command, ...prefixArgs] = lighthouseCommand;
    const result = run(command, [
      ...prefixArgs,
      url,
      '--quiet',
      '--chrome-flags=--headless=new --no-sandbox',
      '--output=json',
      `--output-path=${output}.report.json`,
    ]);
    if (result.status !== 0) {
      return {
        scores: { performance: null, accessibility: null, best_practices: null, seo: null },
        lcp_ms: null,
        cls: null,
        raw: { lighthouse_error: result.stderr || result.stdout },
      };
    }
    const raw = JSON.parse(readFileSync(`${output}.report.json`, 'utf8'));
    return {
      scores: {
        performance: raw.categories?.performance?.score ?? null,
        accessibility: raw.categories?.accessibility?.score ?? null,
        best_practices: raw.categories?.['best-practices']?.score ?? null,
        seo: raw.categories?.seo?.score ?? null,
      },
      lcp_ms: raw.audits?.['largest-contentful-paint']?.numericValue ? Math.round(raw.audits['largest-contentful-paint'].numericValue) : null,
      cls: raw.audits?.['cumulative-layout-shift']?.numericValue ?? null,
      raw,
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

async function main() {
  const curl = measureCurl(siteUrl);
  const lighthouse = measureLighthouse(siteUrl);
  const status = lighthouse.scores.performance === null ? 'partial' : 'ok';
  const payload = {
    source,
    url: siteUrl,
    status,
    ...curl,
    lighthouse: lighthouse.scores,
    lcp_ms: lighthouse.lcp_ms,
    cls: lighthouse.cls,
    inp_ms: null,
    raw: lighthouse.raw,
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`metrics POST failed: HTTP ${response.status} ${await response.text()}`);
  }

  console.log(JSON.stringify({ posted: true, status, ttfb_ms: curl.ttfb_ms, transfer_bytes: curl.transfer_bytes }));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
