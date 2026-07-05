<script>
  import { onMount } from 'svelte';
  import { estimateV2 } from '../data/brief-estimate';
  import {
    branchForProduct,
    branchQuestions,
    optionsForBranch,
    productGroups,
    products,
    recommendationQuestions,
    recommendProduct,
  } from '../data/brief-v2';
  import { site } from '../data/site';

  const productMap = {
    start: 'start',
    landing: 'landing',
    quiz: 'quiz',
    company: 'company',
    catalog: 'catalog',
    shop: 'shop',
    tma: 'tma',
    bot: 'bot',
    migration: 'migration',
    automation: 'automation',
    crm: 'crm',
    analytics: 'analytics',
    support: 'support',
  };

  let stage = 'mode';
  let mode = '';
  let product = '';
  let recommendAnswers = {};
  let branchAnswers = {};
  let selectedOptions = [];
  let copied = false;

  const productBySlug = Object.fromEntries(products.map((item) => [item.slug, item]));

  function chooseMode(nextMode) {
    mode = nextMode;
    stage = nextMode === 'known' ? 'product' : 'recommend';
    copied = false;
  }

  function selectProduct(slug) {
    product = slug;
    branchAnswers = {};
    selectedOptions = [];
    stage = 'branch';
    copied = false;
  }

  function answerRecommendation(questionId, value) {
    recommendAnswers = { ...recommendAnswers, [questionId]: value };
    copied = false;
  }

  function answerBranch(questionId, value) {
    branchAnswers = { ...branchAnswers, [questionId]: value };
    copied = false;
  }

  function applyRecommendation() {
    const recommendation = recommendProduct(recommendAnswers);
    product = recommendation.product;
    stage = 'branch';
    copied = false;
  }

  function toggleOption(id) {
    selectedOptions = selectedOptions.includes(id)
      ? selectedOptions.filter((item) => item !== id)
      : [...selectedOptions, id];
    copied = false;
  }

  function draftUrl() {
    if (typeof window === 'undefined') return '';
    const params = new URLSearchParams(payload);
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }

  function estimateText() {
    const itemRows = (result.items ?? []).map((item) => `- ${item.label}: ${item.priceLabel}, ${item.weeksLabel}`);
    return [
      'Смета 3K Studio',
      `Формат: ${currentProduct?.name ?? result.kind}`,
      ...itemRows,
      `Итого: ${result.priceLabel}, ${result.weeksLabel}`,
      'Смета — ориентир. Точную цену и срок фиксируем в договоре.',
      `Черновик: ${draftUrl()}`,
    ].join('\n');
  }

  async function copyEstimate() {
    await navigator.clipboard.writeText(estimateText());
    copied = true;
  }

  function telegramHref() {
    return `${site.telegramUrl}?text=${encodeURIComponent(`Привет. Собрал проект в конструкторе.\n\n${estimateText()}`)}`;
  }

  let draftSaved = false;
  function saveDraft() {
    if (draftSaved) return;
    draftSaved = true;
    fetch('/api/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: payload }),
    }).catch(() => {});
  }

  function restoreFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const version = params.get('version');
    const legacyProject = params.get('product') || params.get('project');
    const restoredProduct = legacyProject ? productMap[legacyProject] : '';

    if (version === 'v2') {
      mode = params.get('mode') || (restoredProduct ? 'known' : '');
      product = restoredProduct || params.get('product') || '';
      const options = params.get('options');
      selectedOptions = options ? options.split(',').filter(Boolean) : [];
      const nextRecommend = {};
      const nextBranch = {};
      for (const [key, value] of params.entries()) {
        if (key.startsWith('recommend_')) nextRecommend[key.replace('recommend_', '')] = value;
        if (key.startsWith('branch_')) nextBranch[key.replace('branch_', '')] = value;
      }
      recommendAnswers = nextRecommend;
      branchAnswers = nextBranch;
      stage = product ? 'result' : mode === 'help' ? 'recommend' : 'product';
      return;
    }

    if (restoredProduct) {
      mode = 'known';
      product = restoredProduct;
      stage = 'branch';
    }
  }

  $: currentProduct = productBySlug[product];
  $: currentBranch = branchForProduct(product || 'unknown');
  $: currentBranchQuestions = branchQuestions[currentBranch] ?? branchQuestions.custom;
  $: currentOptions = optionsForBranch(currentBranch);
  $: recommendation = recommendProduct(recommendAnswers);
  $: recommendationComplete = recommendationQuestions.every((question) => Boolean(recommendAnswers[question.id]));
  $: branchComplete = currentBranchQuestions.every((question) => Boolean(branchAnswers[question.id]));
  $: payload = {
    version: 'v2',
    mode,
    product: product || 'unknown',
    branch: currentBranch,
    options: selectedOptions.join(','),
    ...Object.fromEntries(Object.entries(recommendAnswers).map(([key, value]) => [`recommend_${key}`, value])),
    ...Object.fromEntries(Object.entries(branchAnswers).map(([key, value]) => [`branch_${key}`, value])),
  };
  $: result = estimateV2(payload);
  $: if (stage === 'result') saveDraft();

  onMount(restoreFromUrl);
</script>

<div class="brief" data-testid="brief">
  {#if stage === 'mode'}
    <section class="step">
      <span class="mono">конструктор</span>
      <h2>Как начнём?</h2>
      <div class="mode-grid">
        <button type="button" on:click={() => chooseMode('known')}>
          <b>Знаю, что нужно</b>
          <span>Выберите продукт из полной линейки.</span>
        </button>
        <button type="button" on:click={() => chooseMode('help')}>
          <b>Помогите выбрать</b>
          <span>Ответьте на 3 вопроса — предложим формат.</span>
        </button>
      </div>
    </section>
  {:else if stage === 'product'}
    <section class="step">
      <span class="mono">выбор продукта</span>
      <h2>Что собираем?</h2>
      {#each productGroups as group}
        <div class="product-group">
          <h3>{group.title}</h3>
          <div class="product-list">
            {#each products.filter((item) => item.group === group.id) as item}
              <button type="button" class:active={product === item.slug} on:click={() => selectProduct(item.slug)}>
                <b>{item.name}</b>
                <span>{item.price} · {item.term}</span>
              </button>
            {/each}
          </div>
        </div>
      {/each}
      <div class="controls">
        <button type="button" class="secondary" on:click={() => (stage = 'mode')}>Назад</button>
      </div>
    </section>
  {:else if stage === 'recommend'}
    <section class="step">
      <span class="mono">поможем выбрать</span>
      <h2>Ответьте на 3 вопроса</h2>
      <div class="question-stack">
        {#each recommendationQuestions as question}
          <fieldset>
            <legend>{question.title}</legend>
            <div class="options">
              {#each question.choices as choice}
                <label class:active={recommendAnswers[question.id] === choice.id}>
                  <input type="radio" name={question.id} value={choice.id} checked={recommendAnswers[question.id] === choice.id} on:change={() => answerRecommendation(question.id, choice.id)} />
                  <span>{choice.label}</span>
                </label>
              {/each}
            </div>
          </fieldset>
        {/each}
      </div>
      {#if recommendationComplete}
        <div class="recommendation">
          <span class="mono">рекомендуем</span>
          <b>{productBySlug[recommendation.product]?.name ?? recommendation.product}</b>
          <p>{recommendation.reason}</p>
        </div>
      {/if}
      <div class="controls">
        <button type="button" class="secondary" on:click={() => (stage = 'mode')}>Назад</button>
        <button type="button" disabled={!recommendationComplete} on:click={applyRecommendation}>Продолжить</button>
      </div>
    </section>
  {:else if stage === 'branch'}
    <section class="step">
      <span class="mono">{currentProduct?.name ?? 'проект'}</span>
      <h2>Уточним рамки</h2>
      <div class="question-stack">
        {#each currentBranchQuestions as question}
          <fieldset>
            <legend>{question.title}</legend>
            <div class="options">
              {#each question.choices as choice}
                <label class:active={branchAnswers[question.id] === choice.id}>
                  <input type="radio" name={question.id} value={choice.id} checked={branchAnswers[question.id] === choice.id} on:change={() => answerBranch(question.id, choice.id)} />
                  <span>{choice.label}</span>
                </label>
              {/each}
            </div>
          </fieldset>
        {/each}
      </div>
      <div class="controls">
        <button type="button" class="secondary" on:click={() => (stage = mode === 'help' ? 'recommend' : 'product')}>Назад</button>
        <button type="button" disabled={!branchComplete} on:click={() => (stage = 'options')}>К опциям</button>
      </div>
    </section>
  {:else if stage === 'options'}
    <section class="step">
      <span class="mono">опции</span>
      <h2>Что добавить?</h2>
      <div class="check-grid">
        {#each currentOptions as option}
          <label class:active={selectedOptions.includes(option.id)}>
            <input type="checkbox" checked={selectedOptions.includes(option.id)} on:change={() => toggleOption(option.id)} />
            <b>{option.name}</b>
            <span>{option.price} · {option.term}</span>
          </label>
        {/each}
      </div>
      <div class="controls">
        <button type="button" class="secondary" on:click={() => (stage = 'branch')}>Назад</button>
        <button type="button" on:click={() => (stage = 'result')}>Показать смету</button>
      </div>
    </section>
  {:else}
    <section class="result" data-testid="brief-result" data-product={product} data-branch={currentBranch} data-options={selectedOptions.join(',')}>
      <span class="mono">предварительная смета</span>
      <h2>{result.priceLabel}, {result.weeksLabel}</h2>
      <div class="estimate-list">
        {#each result.items ?? [] as item}
          <article>
            <b>{item.label}</b>
            <span>{item.priceLabel}</span>
            <small>{item.weeksLabel}</small>
          </article>
        {/each}
      </div>
      <p>Смета — ориентир. Точную цену и срок фиксируем в договоре.</p>
      <div class="controls">
        <button type="button" class="secondary" on:click={() => (stage = 'options')}>Назад к ответам</button>
        <button type="button" class="secondary" on:click={copyEstimate}>{copied ? 'Смета скопирована' : 'Скопировать смету'}</button>
        <a class="primary-link" href={telegramHref()}>Обсудить в Telegram</a>
      </div>
    </section>
  {/if}
</div>

<style>
  .brief {
    background: var(--color-paper);
    box-sizing: border-box;
    color: var(--color-ink);
    min-height: 520px;
    padding: 30px;
  }

  .mono {
    color: var(--color-blue);
  }

  h2 {
    margin: 10px 0 0;
    font-family: var(--font-display);
    font-size: clamp(30px, 4vw, 48px);
    font-weight: 800;
    line-height: 1.12;
  }

  .mode-grid,
  .product-list,
  .options,
  .check-grid,
  .estimate-list {
    display: grid;
    gap: 12px;
  }

  .mode-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-top: 28px;
  }

  button,
  .primary-link {
    box-sizing: border-box;
    border: 0;
    background: var(--color-ink);
    color: var(--color-paper);
    padding: 16px 22px;
    font: 600 15px / 1.2 var(--font-text);
    text-decoration: none;
    cursor: pointer;
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  .mode-grid button,
  .product-list button {
    display: grid;
    gap: 8px;
    border: 1.5px solid rgb(23 21 15 / 0.22);
    background: white;
    color: var(--color-ink);
    text-align: left;
  }

  .mode-grid b,
  .product-list b,
  .check-grid b {
    font-size: 16px;
  }

  .mode-grid span,
  .product-list span,
  .check-grid span {
    color: rgb(23 21 15 / 0.62);
    font-size: 13.5px;
    line-height: 1.45;
  }

  .product-group {
    margin-top: 30px;
  }

  h3,
  legend {
    margin: 0;
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 700;
  }

  .product-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-top: 14px;
  }

  fieldset {
    border: 0;
    margin: 0;
    padding: 0;
  }

  .question-stack {
    display: grid;
    gap: 28px;
    margin-top: 30px;
  }

  .options {
    margin-top: 12px;
  }

  label {
    box-sizing: border-box;
    display: flex;
    gap: 14px;
    align-items: center;
    border: 1.5px solid rgb(23 21 15 / 0.22);
    background: white;
    padding: 16px;
    cursor: pointer;
  }

  label.active,
  .product-list button.active {
    border-color: var(--color-blue);
    box-shadow: 6px 6px 0 var(--color-gold);
  }

  input {
    accent-color: var(--color-blue);
  }

  .recommendation {
    margin-top: 26px;
    border: 1.5px solid rgb(23 21 15 / 0.22);
    background: white;
    padding: 20px;
  }

  .recommendation b {
    display: block;
    margin-top: 8px;
    font-family: var(--font-display);
    font-size: 24px;
  }

  .recommendation p,
  .result p {
    color: rgb(23 21 15 / 0.72);
    font-size: 16px;
    line-height: 1.6;
  }

  .check-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-top: 28px;
  }

  .check-grid label {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: start;
  }

  .check-grid span {
    grid-column: 2;
  }

  .controls {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 30px;
  }

  .secondary {
    border: 1.5px solid rgb(23 21 15 / 0.28);
    background: transparent;
    color: var(--color-ink);
  }

  .result h2 {
    color: var(--color-blue);
  }

  .estimate-list {
    margin-top: 28px;
  }

  .estimate-list article {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    gap: 18px;
    align-items: baseline;
    border-top: 1.5px solid rgb(23 21 15 / 0.16);
    padding: 16px 0;
  }

  .estimate-list span {
    color: var(--color-blue);
    font-weight: 700;
  }

  .estimate-list small {
    color: rgb(23 21 15 / 0.52);
    font-family: var(--font-mono);
    font-size: 11px;
    text-transform: uppercase;
  }

  @media (max-width: 720px) {
    .brief {
      min-height: 480px;
      padding: 22px;
    }

    .mode-grid,
    .product-list,
    .check-grid,
    .estimate-list article {
      grid-template-columns: 1fr;
    }

    button,
    .primary-link {
      width: 100%;
      box-sizing: border-box;
      text-align: center;
    }

    .mode-grid button,
    .product-list button {
      text-align: left;
    }
  }
</style>
