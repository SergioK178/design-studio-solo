<script>
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { expoOut } from 'svelte/easing';
  import matrix from '../../../api/src/brief/brief-matrix.json';
  import { estimate } from '../../../api/src/brief/estimate.ts';
  import { site } from '../data/site';

  const questions = matrix.questions;
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const flyIn = { y: 26, duration: reduced ? 0 : 480, easing: expoOut };

  // Финал брифа — «момент» страницы: числа вилки отсчитываются от нуля,
  // затем золотой маркер подчёркивает оценку.
  function reveal(node) {
    if (!reduced) {
      const finalText = node.textContent;
      const parts = finalText.split(/(\d+)/);
      const started = performance.now();
      const duration = 900;
      const frame = (now) => {
        const p = Math.min((now - started) / duration, 1);
        const eased = 1 - Math.pow(2, -10 * p);
        node.textContent = parts
          .map((part, index) => (index % 2 ? String(Math.round(Number(part) * eased)) : part))
          .join('');
        if (p < 1) requestAnimationFrame(frame);
        else node.textContent = finalText;
      };
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(() => node.classList.add('on'));
  }
  let step = 0;
  let answers = {};
  let copied = false;

  function select(questionId, optionId) {
    answers = { ...answers, [questionId]: optionId };
    copied = false;
  }

  function currentOption(question) {
    return question.options.find((option) => option.id === answers[question.id]);
  }

  function calculate() {
    const project = currentOption(questions[0]) ?? questions[0].options[0];
    const result = estimate(answers);

    return {
      project,
      price: result.priceLabel,
      weeks: result.weeksLabel,
    };
  }

  function draftUrl() {
    if (typeof window === 'undefined') return '';
    const params = new URLSearchParams(answers);
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }

  function restoreFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const restored = {};
    for (const question of questions) {
      const value = params.get(question.id);
      if (value && question.options.some((option) => option.id === value)) {
        restored[question.id] = value;
      }
    }
    if (Object.keys(restored).length > 0) {
      answers = restored;
      const firstEmpty = questions.findIndex((question) => !restored[question.id]);
      step = firstEmpty === -1 ? questions.length : firstEmpty;
    }
  }

  async function copyDraft() {
    await navigator.clipboard.writeText(draftUrl());
    copied = true;
  }

  let draftSaved = false;

  function saveDraft() {
    if (draftSaved) return;
    draftSaved = true;
    fetch('/api/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    }).catch(() => {});
  }

  function telegramHref() {
    const result = calculate();
    const rows = questions.map((question) => {
      const option = currentOption(question);
      return `${question.title} ${option?.label ?? 'не отвечено'}`;
    });
    const text = `Привет. Заполнил бриф 3K Studio.\nОценка: ${result.price}, ${result.weeks}.\n${rows.join('\n')}\nЧерновик: ${draftUrl()}`;
    return `${site.telegramUrl}?text=${encodeURIComponent(text)}`;
  }

  $: question = questions[step];
  $: isDone = step >= questions.length;
  $: canNext = question ? Boolean(answers[question.id]) : false;
  $: result = calculate();
  $: if (isDone) saveDraft();

  onMount(restoreFromUrl);
</script>

<div class="brief" data-testid="brief">
  {#if !isDone}
    <div class="progress">
      <span class="mono">ШАГ {step + 1} / {questions.length}</span>
      <div><i style={`width:${((step + 1) / questions.length) * 100}%`}></i></div>
    </div>
    {#key step}
      <fieldset in:fly={flyIn}>
        <legend>{question.title}</legend>
        <div class="options">
          {#each question.options as option}
            <label class:active={answers[question.id] === option.id}>
              <input type="radio" name={question.id} value={option.id} checked={answers[question.id] === option.id} on:change={() => select(question.id, option.id)} />
              <span>{option.label}</span>
            </label>
          {/each}
        </div>
      </fieldset>
    {/key}
    <div class="controls">
      <button type="button" class="secondary" disabled={step === 0} on:click={() => (step -= 1)}>Назад</button>
      <button type="button" disabled={!canNext} on:click={() => (step += 1)}>{step === questions.length - 1 ? 'Показать вилку' : 'Дальше'}</button>
    </div>
  {:else}
    <section class="result" data-testid="brief-result" in:fly={{ ...flyIn, y: 34 }}>
      <span class="mono">ПРЕДВАРИТЕЛЬНАЯ ОЦЕНКА</span>
      <h2>Похоже на проект <mark use:reveal>{result.price}, {result.weeks}</mark></h2>
      <p>{result.project.summary}. Это ориентир, не оферта: точную цену и срок зафиксируем после проверки задачи.</p>
      <div class="controls">
        <button type="button" class="secondary" on:click={() => (step = questions.length - 1)}>Назад к ответам</button>
        <button type="button" class="secondary" on:click={copyDraft}>{copied ? 'Ссылка скопирована' : 'Скопировать черновик'}</button>
        <a class="primary-link" href={telegramHref()}>Обсудить в Telegram</a>
      </div>
    </section>
  {/if}
</div>

<style>
  .brief {
    background: var(--color-paper);
    color: var(--color-ink);
    padding: 30px;
  }

  .progress {
    display: grid;
    gap: 12px;
    margin-bottom: 30px;
  }

  .progress span {
    color: var(--color-blue);
  }

  .progress div {
    height: 8px;
    background: rgb(23 21 15 / 0.12);
  }

  .progress i {
    display: block;
    height: 100%;
    background: var(--color-gold);
    transition: width 0.6s var(--ease-site);
  }

  mark {
    color: inherit;
    background-image: linear-gradient(var(--color-gold), var(--color-gold));
    background-repeat: no-repeat;
    background-position: 0 68%;
    background-size: 0% 40%;
    transition: background-size 0.8s var(--ease-site) 0.45s;
  }

  :global(mark.on) {
    background-size: 100% 40%;
  }

  fieldset {
    border: 0;
    margin: 0;
    padding: 0;
  }

  legend,
  h2 {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(30px, 4vw, 48px);
    font-weight: 800;
    line-height: 1.12;
  }

  .options {
    display: grid;
    gap: 12px;
    margin-top: 28px;
  }

  label {
    display: flex;
    gap: 14px;
    align-items: center;
    border: 1.5px solid rgb(23 21 15 / 0.22);
    padding: 16px;
    cursor: pointer;
  }

  label.active {
    border-color: var(--color-blue);
    box-shadow: 6px 6px 0 var(--color-gold);
  }

  input {
    accent-color: var(--color-blue);
  }

  .controls {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 30px;
  }

  button,
  .primary-link {
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

  .secondary {
    border: 1.5px solid rgb(23 21 15 / 0.28);
    background: transparent;
    color: var(--color-ink);
  }

  .result p {
    max-width: 620px;
    color: rgb(23 21 15 / 0.72);
    font-size: 17px;
    line-height: 1.6;
  }

  @media (max-width: 520px) {
    .brief {
      padding: 20px;
    }

    button,
    .primary-link {
      width: 100%;
      box-sizing: border-box;
      text-align: center;
    }
  }
</style>
