<script>
  import { onMount } from 'svelte';

  const endpoint = '/api/metrics/latest';

  let state = 'loading';
  let metrics = null;
  let error = '';

  const scoreLabel = (value) => {
    if (value === null || value === undefined) return 'нет данных';
    return `${Math.round(value * 100)}`;
  };

  const bytesLabel = (value) => {
    if (!value) return 'нет данных';
    if (value < 1024 * 1024) return `${Math.round(value / 1024)} КБ`;
    return `${(value / 1024 / 1024).toFixed(1)} МБ`;
  };

  const dateLabel = (value) => {
    if (!value) return 'дата неизвестна';
    return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  };

  async function loadMetrics() {
    try {
      const response = await fetch(endpoint, { headers: { accept: 'application/json' } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      metrics = await response.json();
      state = metrics?.measured_at ? 'ready' : 'empty';
    } catch (err) {
      error = err instanceof Error ? err.message : 'metrics unavailable';
      state = 'error';
    }
  }

  onMount(loadMetrics);
</script>

<section class="metrics" data-testid="metrics">
  <div class="head">
    <span class="mono">живые метрики</span>
    {#if state === 'ready'}
      <time datetime={metrics.measured_at}>{dateLabel(metrics.measured_at)}</time>
    {/if}
  </div>

  {#if state === 'loading'}
    <p class="muted">Загружаем последний замер.</p>
  {:else if state === 'ready'}
    <div class="grid">
      <article>
        <span>TTFB</span>
        <strong>{metrics.ttfb_ms ?? '—'} мс</strong>
      </article>
      <article>
        <span>Transfer</span>
        <strong>{bytesLabel(metrics.transfer_bytes)}</strong>
      </article>
      <article>
        <span>Lighthouse</span>
        <strong>{scoreLabel(metrics.lighthouse?.performance)}</strong>
      </article>
      <article>
        <span>LCP / CLS</span>
        <strong>{metrics.lcp_ms ?? '—'} мс / {metrics.cls ?? '—'}</strong>
      </article>
    </div>
    <p class="muted">Цифры приходят из мини-API. Если замер проседает, показываем как есть.</p>
  {:else if state === 'empty'}
    <p class="muted">Первого production-замера ещё нет. После деплоя CI запишет сюда реальные TTFB, вес страницы и Lighthouse.</p>
  {:else}
    <p class="muted">Метрики временно недоступны: {error}. Данные не подменяем хардкодом.</p>
  {/if}
</section>

<style>
  .metrics {
    margin-top: 48px;
    border: 2px solid var(--color-gold);
    padding: 22px;
  }

  .head {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }

  .mono {
    color: var(--color-blue);
  }

  time,
  .muted {
    color: rgb(23 21 15 / 0.62);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
    margin-top: 22px;
  }

  article {
    border-top: 1.5px solid rgb(23 21 15 / 0.24);
    padding-top: 14px;
  }

  article span {
    display: block;
    color: rgb(23 21 15 / 0.56);
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  strong {
    display: block;
    margin-top: 8px;
    font-family: var(--font-display);
    font-size: clamp(22px, 3vw, 34px);
    line-height: 1;
  }

  @media (max-width: 760px) {
    .grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 420px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
</style>
