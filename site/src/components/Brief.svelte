<script>
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { expoOut } from 'svelte/easing';
  import {
    documentLines,
    emptyAnswers,
    estimateV3,
    payloadV3,
    questionById,
    studioSummary,
  } from '../data/brief-v3';
  import { site } from '../data/site';

  /* Экраны: intro → вопросы → result → contact → sent. */
  let screen = 'intro';
  let stepIndex = 0;
  let answers = emptyAnswers();
  let docOpen = false;

  let contactName = '';
  let contactPhone = '';
  let contactComment = '';
  let hp = '';
  let sending = false;
  let sendError = false;
  let leadId = null;

  const mountedAt = Date.now();
  let reduced = false;

  /* Последовательность шагов зависит от первой развилки. */
  $: steps = [
    'task',
    ...(answers.task === 'update' ? ['updateGoal'] : []),
    ...(answers.task === 'other' ? ['otherText'] : []),
    'actions',
    'content',
    'manage',
    'dataflow',
    'have',
    'deadline',
    'budget',
  ];

  $: stepId = steps[Math.min(stepIndex, steps.length - 1)];
  $: question = stepId === 'otherText' ? null : questionById[stepId];
  $: stage = question?.stage ?? 1;
  $: stageName = question?.stageName ?? 'Задача';
  $: lines = documentLines(answers);
  $: result = estimateV3(answers);
  $: needSystems = answers.dataflow.includes('crm') || answers.dataflow.includes('onec');
  $: contactReady = contactName.trim().length > 0 && contactPhone.trim().length > 1;

  $: stepDone =
    stepId === 'otherText'
      ? answers.otherText.trim().length > 0
      : question?.multi
        ? answers[stepId].length > 0
        : Boolean(answers[stepId]);

  const flyIn = (node) => fly(node, { y: 26, duration: reduced ? 0 : 500, delay: reduced ? 0 : 180, easing: expoOut });
  const flyOut = (node) => fly(node, { y: -20, duration: reduced ? 0 : 220, easing: expoOut });
  const lineIn = (node) => fly(node, { y: 12, duration: reduced ? 0 : 450, easing: expoOut });

  function start() {
    screen = 'question';
    stepIndex = 0;
  }

  function next() {
    if (stepIndex < steps.length - 1) stepIndex += 1;
    else showResult();
  }

  function back() {
    if (screen === 'result') {
      screen = 'question';
      stepIndex = steps.length - 1;
      return;
    }
    if (stepIndex > 0) stepIndex -= 1;
    else screen = 'intro';
  }

  let advanceTimer;
  function pickSingle(id, value) {
    answers = { ...answers, [id]: value };
    if (id === 'task') {
      // Смена задачи меняет маршрут — уточнения сбрасываем.
      answers = { ...answers, updateGoal: '', otherText: '' };
    }
    clearTimeout(advanceTimer);
    advanceTimer = setTimeout(next, reduced ? 0 : 420);
  }

  function toggleMulti(id, choice) {
    const current = new Set(answers[id]);
    if (choice.exclusive) {
      answers = { ...answers, [id]: current.has(choice.id) ? [] : [choice.id] };
      return;
    }
    const q = questionById[id];
    const exclusives = new Set(q.choices.filter((c) => c.exclusive).map((c) => c.id));
    for (const ex of exclusives) current.delete(ex);
    if (current.has(choice.id)) current.delete(choice.id);
    else current.add(choice.id);
    answers = { ...answers, [id]: [...current] };
  }

  function showResult() {
    screen = 'result';
    docOpen = false;
    saveDraft();
    syncUrl();
  }

  function editAnswers() {
    screen = 'question';
    stepIndex = 0;
  }

  /* Черновик: ссылка восстанавливает ответы, POST — для сводки студии. */
  let draftSaved = false;
  function saveDraft() {
    if (draftSaved) return;
    draftSaved = true;
    fetch('/api/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: payloadV3(answers) }),
    }).catch(() => {});
  }

  function syncUrl() {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams({ ...payloadV3(answers), stage: 'result' });
    history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
  }

  function restoreFromUrl() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('version') !== 'v3') return;
    const list = (key) => (params.get(key) ?? '').split(',').filter(Boolean);
    answers = {
      task: params.get('task') ?? '',
      updateGoal: params.get('update_goal') ?? '',
      otherText: params.get('other_text') ?? '',
      actions: list('actions'),
      content: list('content'),
      manage: list('manage'),
      dataflow: list('dataflow'),
      systems: params.get('systems') ?? '',
      have: list('have'),
      deadline: params.get('deadline') ?? '',
      budget: params.get('budget') ?? '',
    };
    if (params.get('stage') === 'result' && answers.task) {
      draftSaved = true; // черновик по ссылке не дублируем
      screen = 'result';
    } else if (answers.task) {
      // Переход с карточки продукта: задача предзаполнена, начинаем со следующего шага.
      screen = 'question';
      stepIndex = firstIncompleteStep();
    }
  }

  function firstIncompleteStep() {
    const sequence = [
      'task',
      ...(answers.task === 'update' ? ['updateGoal'] : []),
      ...(answers.task === 'other' ? ['otherText'] : []),
      'actions',
      'content',
      'manage',
      'dataflow',
      'have',
      'deadline',
      'budget',
    ];
    const done = (id) =>
      id === 'otherText'
        ? answers.otherText.trim().length > 0
        : Array.isArray(answers[id])
          ? answers[id].length > 0
          : Boolean(answers[id]);
    const index = sequence.findIndex((id) => !done(id));
    return index === -1 ? sequence.length - 1 : index;
  }

  function telegramText() {
    const number = leadId ? `Бриф №${leadId}.\n` : '';
    return `Привет! Заполнил разбор задачи на сайте.\n${number}\n${studioSummary(answers, result)}\n\nЧерновик: ${draftUrl()}`;
  }

  function draftUrl() {
    if (typeof window === 'undefined') return '';
    const params = new URLSearchParams({ ...payloadV3(answers), stage: 'result' });
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }

  function telegramHref() {
    return `${site.telegramUrl}?text=${encodeURIComponent(telegramText())}`;
  }

  async function submitLead(event) {
    event.preventDefault();
    if (!contactReady || sending) return;
    sending = true;
    sendError = false;
    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: payloadV3(answers),
          contact: { name: contactName.trim(), phone: contactPhone.trim(), comment: contactComment.trim() },
          summary: studioSummary(answers, result),
          hp,
          ts: mountedAt,
        }),
      });
      if (!response.ok) throw new Error('lead failed');
      const data = await response.json();
      leadId = data.id ?? null;
      screen = 'sent';
    } catch {
      sendError = true;
    } finally {
      sending = false;
    }
  }

  onMount(() => {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    restoreFromUrl();
  });

  const planNotes = {
    core: 'В комфортный бюджет помещается основной состав — связи с системами удобнее добавить вторым этапом.',
    staged: 'Чтобы остаться в названном бюджете, предложим поэтапный запуск: сначала ядро, затем расширения.',
    open: 'Состав работ уточним на коротком созвоне — до договора и без обязательств.',
    full: '',
  };
</script>

<div class="brief" data-testid="brief">
  {#if screen === 'intro'}
    <section class="intro" in:flyIn>
      <p class="mono label">бриф · разбор задачи</p>
      <h1>Расскажите, что должно заработать</h1>
      <p class="intro-lead">
        Ответьте на несколько вопросов — предложим подходящий формат, предварительную стоимость и следующий шаг.
      </p>
      <ul class="intro-meta" aria-label="Как устроен бриф">
        <li>3–5 минут</li>
        <li>Без регистрации</li>
        <li>Ответы можно изменить</li>
        <li>Расчёт предварительный</li>
      </ul>
      <div class="intro-actions">
        <button type="button" class="btn-gold" on:click={start}>Начать</button>
        <a class="btn-outline" href={site.telegramUrl}>Написать в Telegram</a>
      </div>
    </section>
  {:else if screen === 'question'}
    <div class="interview">
      <section class="screen" aria-live="polite">
        {#key stepId}
          <div class="screen-inner" in:flyIn out:flyOut>
            <header class="stage-head">
              <span class="stage-number" aria-hidden="true">{String(stage).padStart(2, '0')}</span>
              <span class="mono stage-name">{stageName}</span>
            </header>

            {#if stepId === 'otherText'}
              <h2>Опишите задачу своими словами</h2>
              <p class="hint">Пары предложений достаточно — детали разберём вместе.</p>
              <textarea
                class="free-text"
                rows="5"
                placeholder="Что должно заработать и для кого"
                bind:value={answers.otherText}
              ></textarea>
            {:else}
              <h2>{question.title}</h2>
              {#if question.hint}<p class="hint">{question.hint}</p>{/if}

              <div class="options" role={question.multi ? 'group' : 'radiogroup'} aria-label={question.title}>
                {#each question.choices as choice (choice.id)}
                  {#if question.multi}
                    <button
                      type="button"
                      class="option"
                      role="checkbox"
                      aria-checked={answers[stepId].includes(choice.id)}
                      class:selected={answers[stepId].includes(choice.id)}
                      on:click={() => toggleMulti(stepId, choice)}
                    >
                      <span class="mark mark-square" aria-hidden="true"></span>
                      <span class="option-label">{choice.label}</span>
                    </button>
                  {:else}
                    <button
                      type="button"
                      class="option"
                      role="radio"
                      aria-checked={answers[stepId] === choice.id}
                      class:selected={answers[stepId] === choice.id}
                      on:click={() => pickSingle(stepId, choice.id)}
                    >
                      <span class="mark mark-dot" aria-hidden="true"></span>
                      <span class="option-label">{choice.label}</span>
                    </button>
                  {/if}
                {/each}
              </div>

              {#if stepId === 'dataflow' && needSystems}
                <label class="systems" in:lineIn>
                  <span class="mono">Какие системы уже используются?</span>
                  <input
                    type="text"
                    placeholder="Например: Битрикс24, amoCRM, МойСклад, 1С"
                    bind:value={answers.systems}
                  />
                </label>
              {/if}
            {/if}
          </div>
        {/key}

        <footer class="screen-foot">
          <div class="progress" aria-label={`Этап ${stage} из 6`}>
            <span class="progress-count">{stage} из 6</span>
            <span class="progress-track" aria-hidden="true"><i style={`width:${(stage / 6) * 100}%`}></i></span>
          </div>
          <div class="foot-actions">
            <button type="button" class="ghost" on:click={back}>Назад</button>
            {#if question?.multi || stepId === 'otherText'}
              <button type="button" class="btn-gold small" disabled={!stepDone} on:click={next}>Дальше</button>
            {/if}
          </div>
        </footer>
      </section>

      <aside class="doc" aria-label="Разбор задачи — составляется по вашим ответам">
        <header>
          <span class="mono">разбор задачи</span>
        </header>
        <div class="doc-body">
          {#each lines as line (line)}
            <p in:lineIn>{line}</p>
          {/each}
          <span class="caret" aria-hidden="true"></span>
        </div>
        <footer class="doc-foot">Составляем по вашим ответам — станет основой оценки.</footer>
      </aside>

      <div class="doc-mobile" class:open={docOpen}>
        <button type="button" class="doc-toggle" on:click={() => (docOpen = !docOpen)} aria-expanded={docOpen}>
          <span class="mono">разбор задачи</span>
          <span class="doc-last">{docOpen ? 'Свернуть' : (lines[lines.length - 1] ?? 'Появится после первого ответа')}</span>
        </button>
        {#if docOpen}
          <div class="doc-mobile-body">
            {#each lines as line (line)}
              <p>{line}</p>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  {:else if screen === 'result' || screen === 'contact' || screen === 'sent'}
    <section class="sheet" data-testid="brief-result" data-format={result.format} in:flyIn>
      {#if screen === 'sent'}
        <p class="mono sheet-label">отправлено</p>
        <h2>Проект {leadId ? `№${leadId} ` : ''}у нас</h2>
        <p class="sheet-lead">
          Проверим спорные места и вернёмся с 2–4 уточняющими вопросами. После этого пришлём состав работ,
          фиксированную цену и срок.
        </p>
        <div class="sheet-actions">
          <a class="btn-dark" href={telegramHref()}>Открыть чат в Telegram</a>
        </div>
      {:else}
        <p class="mono sheet-label">заключение студии</p>
        <h2>{result.title}</h2>
        <p class="sheet-lead">{result.lead}</p>

        <dl class="sheet-rows">
          <div class="row">
            <dt>Первый запуск</dt>
            <dd>{result.weeksLabel}</dd>
          </div>
          <div class="row">
            <dt>Ориентир</dt>
            <dd>{result.priceLabel}</dd>
          </div>
          <div class="row">
            <dt>В основе</dt>
            <dd>{result.core.join(', ')}</dd>
          </div>
          {#if result.later.length}
            <div class="row">
              <dt>Можно добавить позже</dt>
              <dd>{result.later.join(', ')}</dd>
            </div>
          {/if}
        </dl>

        <h3>Почему такой формат</h3>
        <p class="sheet-reason">{result.reason}</p>
        {#if planNotes[result.plan]}
          <p class="sheet-reason">{planNotes[result.plan]}</p>
        {/if}

        {#if result.manual.length}
          <div class="manual">
            <p>
              Часть задачи требует короткого разбора: {result.manual.join('; ')}. Мы уточним её до договора и не
              начнём дополнительные работы без согласованной оценки.
            </p>
          </div>
        {/if}

        <p class="sheet-note">Расчёт предварительный — точную цену и срок фиксируем в договоре.</p>

        {#if screen === 'contact'}
          <form class="contact" on:submit={submitLead}>
            <label>
              <span class="mono">Имя</span>
              <input type="text" name="name" autocomplete="name" bind:value={contactName} />
            </label>
            <label>
              <span class="mono">Телефон или Telegram</span>
              <input type="text" name="phone" autocomplete="tel" bind:value={contactPhone} />
            </label>
            <label>
              <span class="mono">Комментарий — по желанию</span>
              <textarea name="comment" rows="3" bind:value={contactComment}></textarea>
            </label>
            <input type="text" name="hp" bind:value={hp} class="hp" tabindex="-1" autocomplete="off" aria-hidden="true" />
            {#if sendError}
              <p class="send-error">Не получилось отправить. Попробуйте ещё раз или напишите в Telegram.</p>
            {/if}
            <div class="sheet-actions">
              <button type="submit" class="btn-dark" disabled={!contactReady || sending}>
                {sending ? 'Отправляем…' : 'Отправить проект'}
              </button>
              <button type="button" class="ghost-dark" on:click={() => (screen = 'result')}>Назад</button>
            </div>
          </form>
        {:else}
          <div class="sheet-actions">
            <button type="button" class="btn-dark" on:click={() => (screen = 'contact')}>Отправить проект в студию</button>
            <a class="ghost-dark" href={telegramHref()}>Обсудить в Telegram</a>
            <button type="button" class="ghost-dark" on:click={editAnswers}>Изменить ответы</button>
          </div>
        {/if}
      {/if}
    </section>
  {/if}
</div>

<style>
  .brief {
    color: var(--color-paper);
    min-height: 560px;
  }

  .mono {
    color: var(--color-gold);
    font-family: var(--font-text);
    font-size: 13px;
    font-weight: 650;
    font-variant-numeric: tabular-nums;
  }

  /* ---------- Интро ---------- */

  .intro {
    max-width: 720px;
    padding: 24px 0 8px;
  }

  h1 {
    margin: 18px 0 0;
    font-family: var(--font-display);
    font-size: clamp(34px, 5vw, 58px);
    font-weight: 800;
    line-height: 1.08;
  }

  .intro-lead {
    margin: 22px 0 0;
    max-width: 560px;
    color: rgb(244 242 236 / 0.78);
    font-size: 17px;
    line-height: 1.6;
  }

  .intro-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 0;
    margin: 30px 0 0;
    padding: 0;
    list-style: none;
    color: rgb(244 242 236 / 0.6);
    font-size: 14px;
  }

  .intro-meta li + li::before {
    content: '·';
    margin: 0 10px;
    color: var(--color-gold);
  }

  .intro-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    margin-top: 40px;
  }

  .btn-gold {
    border: 0;
    cursor: pointer;
    background: var(--color-gold);
    color: var(--color-ink);
    padding: 19px 34px;
    font: 600 15.5px / 1.2 var(--font-text);
  }

  .btn-gold:hover {
    background: var(--color-paper);
  }

  .btn-gold:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }

  .btn-gold.small {
    padding: 14px 26px;
  }

  .btn-outline {
    display: inline-block;
    border: 1.5px solid rgb(244 242 236 / 0.4);
    padding: 17.5px 30px;
    font: 600 15.5px / 1.2 var(--font-text);
    color: rgb(244 242 236 / 0.9);
    text-decoration: none;
  }

  .btn-outline:hover {
    border-color: var(--color-paper);
  }

  /* ---------- Интервью ---------- */

  .interview {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(300px, 380px);
    gap: clamp(48px, 7vw, 96px);
    align-items: start;
  }

  .screen {
    display: grid;
    min-height: 540px;
    grid-template-rows: 1fr auto;
  }

  .screen-inner {
    grid-area: 1 / 1;
  }

  .stage-head {
    display: flex;
    align-items: baseline;
    gap: 16px;
  }

  .stage-number {
    color: rgb(244 242 236 / 0.28);
    font-size: clamp(44px, 5vw, 64px);
    font-weight: 250;
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }

  .stage-name {
    letter-spacing: 0.02em;
  }

  h2 {
    margin: 20px 0 0;
    max-width: 560px;
    font-family: var(--font-display);
    font-size: clamp(24px, 2.8vw, 36px);
    font-weight: 700;
    line-height: 1.16;
  }

  .hint {
    margin: 12px 0 0;
    color: rgb(244 242 236 / 0.55);
    font-size: 14.5px;
    line-height: 1.5;
  }

  .options {
    margin-top: 26px;
    border-top: 1px solid rgb(244 242 236 / 0.16);
  }

  .option {
    display: flex;
    align-items: center;
    gap: 18px;
    width: 100%;
    border: 0;
    border-bottom: 1px solid rgb(244 242 236 / 0.16);
    background: none;
    padding: 13px 4px;
    color: rgb(244 242 236 / 0.82);
    font: 500 16px / 1.35 var(--font-text);
    text-align: left;
    cursor: pointer;
    transition:
      color 0.25s,
      padding-left 0.35s var(--ease-site),
      box-shadow 0.35s var(--ease-site);
  }

  .option:hover {
    color: var(--color-paper);
  }

  .option.selected {
    color: var(--color-gold);
    font-weight: 650;
    padding-left: 14px;
    box-shadow: inset 3px 0 0 var(--color-gold);
  }

  .mark {
    flex: none;
    width: 12px;
    height: 12px;
    border: 1.5px solid rgb(244 242 236 / 0.45);
    transition:
      background 0.25s,
      border-color 0.25s;
  }

  .mark-dot {
    border-radius: 50%;
  }

  .option.selected .mark {
    border-color: var(--color-gold);
    background: var(--color-gold);
  }

  .free-text,
  .systems input {
    box-sizing: border-box;
    width: 100%;
    border: 1px solid rgb(244 242 236 / 0.28);
    background: rgb(244 242 236 / 0.04);
    color: var(--color-paper);
    padding: 16px;
    font: 500 16px / 1.5 var(--font-text);
    resize: vertical;
  }

  .free-text:focus,
  .systems input:focus {
    outline: 2px solid var(--color-gold);
    outline-offset: 2px;
  }

  .free-text {
    margin-top: 28px;
  }

  .free-text::placeholder,
  .systems input::placeholder {
    color: rgb(244 242 236 / 0.4);
  }

  .systems {
    display: grid;
    gap: 10px;
    margin-top: 26px;
    max-width: 480px;
  }

  .screen-foot {
    display: flex;
    flex-wrap: wrap;
    gap: 18px;
    align-items: center;
    justify-content: space-between;
    margin-top: 36px;
    padding-top: 16px;
  }

  .progress {
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 180px;
  }

  .progress-count {
    color: rgb(244 242 236 / 0.6);
    font-size: 13.5px;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .progress-track {
    display: block;
    flex: 1;
    height: 1.5px;
    min-width: 90px;
    background: rgb(244 242 236 / 0.18);
  }

  .progress-track i {
    display: block;
    height: 100%;
    background: var(--color-gold);
    transition: width 0.5s var(--ease-site);
  }

  .foot-actions {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .ghost {
    border: 0;
    background: none;
    color: rgb(244 242 236 / 0.6);
    font: 600 14.5px / 1 var(--font-text);
    padding: 14px 6px;
    cursor: pointer;
  }

  .ghost:hover {
    color: var(--color-paper);
  }

  /* ---------- Живой документ ---------- */

  .doc {
    position: sticky;
    top: 96px;
    display: flex;
    flex-direction: column;
    background: var(--color-paper);
    color: var(--color-ink);
    min-height: 340px;
    padding: 26px 28px 22px;
  }

  .doc header .mono {
    color: var(--color-ochre);
  }

  .doc-body {
    flex: 1;
    margin-top: 18px;
  }

  .doc-body p {
    margin: 0 0 12px;
    font-size: 15px;
    line-height: 1.55;
  }

  .caret {
    display: inline-block;
    width: 9px;
    height: 18px;
    background: var(--color-ochre);
    vertical-align: text-bottom;
    animation: caretBlink 1.1s steps(1) infinite;
  }

  @keyframes caretBlink {
    50% {
      opacity: 0;
    }
  }

  .doc-foot {
    margin-top: 22px;
    padding-top: 14px;
    border-top: 1px solid rgb(23 21 15 / 0.14);
    color: rgb(23 21 15 / 0.55);
    font-size: 12.5px;
    line-height: 1.5;
  }

  .doc-mobile {
    display: none;
  }

  /* ---------- Лист заключения ---------- */

  .sheet {
    box-sizing: border-box;
    max-width: 780px;
    background: var(--color-paper);
    color: var(--color-ink);
    padding: clamp(28px, 5vw, 56px);
  }

  .sheet-label {
    margin: 0;
    color: var(--color-ochre);
  }

  .sheet h2 {
    margin-top: 14px;
    max-width: none;
    font-size: clamp(26px, 3.4vw, 40px);
  }

  .sheet-lead {
    margin: 18px 0 0;
    max-width: 600px;
    color: rgb(23 21 15 / 0.78);
    font-size: 16.5px;
    line-height: 1.6;
  }

  .sheet-rows {
    margin: 34px 0 0;
  }

  .row {
    display: grid;
    grid-template-columns: minmax(150px, 220px) 1fr;
    gap: 20px;
    border-top: 1px solid rgb(23 21 15 / 0.16);
    padding: 14px 0;
  }

  dt {
    color: rgb(23 21 15 / 0.55);
    font-size: 14px;
  }

  dd {
    margin: 0;
    font-weight: 650;
    font-size: 15.5px;
    line-height: 1.5;
    font-variant-numeric: tabular-nums;
  }

  h3 {
    margin: 34px 0 0;
    font-family: var(--font-display);
    font-size: 19px;
    font-weight: 700;
  }

  .sheet-reason {
    margin: 12px 0 0;
    max-width: 620px;
    color: rgb(23 21 15 / 0.75);
    font-size: 15.5px;
    line-height: 1.6;
  }

  .manual {
    margin-top: 26px;
    border-left: 3px solid var(--color-ochre);
    padding: 4px 0 4px 18px;
  }

  .manual p {
    margin: 0;
    color: rgb(23 21 15 / 0.78);
    font-size: 14.5px;
    line-height: 1.6;
  }

  .sheet-note {
    margin: 26px 0 0;
    color: rgb(23 21 15 / 0.5);
    font-size: 13px;
  }

  .sheet-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    align-items: center;
    margin-top: 30px;
  }

  .btn-dark {
    display: inline-block;
    border: 0;
    cursor: pointer;
    background: var(--color-ink);
    color: var(--color-paper);
    padding: 18px 30px;
    font: 600 15.5px / 1.2 var(--font-text);
    text-decoration: none;
  }

  .btn-dark:hover {
    background: var(--color-blue);
  }

  .btn-dark:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  .ghost-dark {
    border: 0;
    background: none;
    color: rgb(23 21 15 / 0.7);
    font: 600 14.5px / 1 var(--font-text);
    padding: 16px 8px;
    text-decoration: underline;
    text-underline-offset: 4px;
    cursor: pointer;
  }

  .ghost-dark:hover {
    color: var(--color-ink);
  }

  /* ---------- Контакт ---------- */

  .contact {
    display: grid;
    gap: 18px;
    margin-top: 34px;
    max-width: 480px;
  }

  .contact label {
    display: grid;
    gap: 8px;
  }

  .contact .mono {
    color: rgb(23 21 15 / 0.6);
    font-size: 12px;
  }

  .contact input,
  .contact textarea {
    box-sizing: border-box;
    width: 100%;
    border: 1px solid rgb(23 21 15 / 0.3);
    background: white;
    color: var(--color-ink);
    padding: 13px 14px;
    font: 500 15px / 1.4 var(--font-text);
    resize: vertical;
  }

  .contact input:focus,
  .contact textarea:focus {
    outline: 2px solid var(--color-blue);
    outline-offset: 1px;
  }

  .hp {
    position: absolute;
    left: -9999px;
  }

  .send-error {
    margin: 0;
    color: var(--color-ochre-dk);
    font-size: 14px;
  }

  /* ---------- Адаптив ---------- */

  @media (max-width: 960px) {
    .interview {
      grid-template-columns: 1fr;
      gap: 0;
    }

    .doc {
      display: none;
    }

    .screen {
      min-height: 480px;
    }

    .doc-mobile {
      display: block;
      margin-top: 26px;
      background: var(--color-paper);
      color: var(--color-ink);
    }

    .doc-toggle {
      display: grid;
      gap: 6px;
      width: 100%;
      border: 0;
      background: none;
      padding: 16px 18px;
      text-align: left;
      cursor: pointer;
    }

    .doc-toggle .mono {
      color: var(--color-ochre);
      font-size: 11px;
    }

    .doc-last {
      overflow: hidden;
      color: rgb(23 21 15 / 0.8);
      font-size: 13.5px;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
    }

    .doc-mobile-body {
      padding: 0 18px 16px;
    }

    .doc-mobile-body p {
      margin: 0 0 10px;
      font-size: 14px;
      line-height: 1.5;
    }
  }

  @media (max-width: 640px) {
    .screen {
      min-height: 440px;
    }

    .option {
      font-size: 15px;
      padding: 14px 2px;
    }

    .screen-foot {
      flex-direction: column-reverse;
      align-items: stretch;
    }

    .foot-actions {
      justify-content: space-between;
    }

    .btn-gold.small {
      flex: 1;
      text-align: center;
    }

    .row {
      grid-template-columns: 1fr;
      gap: 6px;
    }

    .sheet-actions {
      flex-direction: column;
      align-items: stretch;
      text-align: center;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .caret {
      animation: none;
    }
  }
</style>
